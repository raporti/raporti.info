import { prisma } from "./db";

interface TelegramMessage {
  message_id: number;
  date: number;
  text?: string;
  caption?: string;
  photo?: Array<{ file_id: string; width: number; height: number }>;
  video?: { file_id: string };
  document?: { file_id: string; file_name?: string };
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export function getConfiguredChannels(): string[] {
  const channels = process.env.TELEGRAM_CHANNELS || "ClashReport";
  return channels.split(",").map((c) => c.trim()).filter(Boolean);
}

// Fetch recent messages from a public channel using the Telegram Bot API
// The bot must be added as a member to the channel
export async function fetchChannelMessages(
  channelName: string,
  limit = 20
): Promise<TelegramMessage[]> {
  if (!BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN is not set");
    return [];
  }

  // Use getUpdates won't work for channels directly.
  // Instead, we use the Bot API's forwardMessage approach or
  // the channel's RSS-like approach via t.me/s/ endpoint.
  // For production, we use Telegram Bot API with webhook or polling.
  // Here we'll use the public t.me/s/ HTML scraping as a fallback,
  // and the Bot API getChat + getUpdates when the bot is in the channel.

  try {
    // Scrape the public t.me/s/ page (most reliable for public channels)
    const messages = await scrapePublicChannel(channelName);
    console.log(`[Telegram] Scraped ${messages.length} messages from ${channelName}`);
    return messages;
  } catch (error) {
    console.error(`Error fetching from channel ${channelName}:`, error);
    return [];
  }
}

// Scrape public Telegram channel page as fallback
async function scrapePublicChannel(
  channelName: string
): Promise<TelegramMessage[]> {
  try {
    const url = `https://t.me/s/${channelName}`;
    console.log(`[Telegram] Scraping ${url}`);
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      cache: "no-store",
    });
    const html = await response.text();
    console.log(`[Telegram] Got ${html.length} bytes from ${url}`);

    const messages: TelegramMessage[] = [];
    // Parse message blocks from the HTML
    const messageBlocks = html.split('class="tgme_widget_message_wrap');

    for (const block of messageBlocks.slice(1)) {
      // Extract message ID from data-post attribute
      const postMatch = block.match(/data-post="([^"]+)"/);
      if (!postMatch) continue;

      const postId = postMatch[1]; // e.g., "ClashReport/12345"
      const msgIdStr = postId.split("/")[1];
      const messageId = parseInt(msgIdStr, 10);
      if (isNaN(messageId)) continue;

      // Extract text
      const textMatch = block.match(
        /class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/
      );
      let text = "";
      if (textMatch) {
        text = textMatch[1]
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<[^>]+>/g, "")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim();
      }

      if (!text) continue;

      // Extract date
      const dateMatch = block.match(/datetime="([^"]+)"/);
      const date = dateMatch
        ? Math.floor(new Date(dateMatch[1]).getTime() / 1000)
        : Math.floor(Date.now() / 1000);

      // Check for media
      const hasPhoto = block.includes("tgme_widget_message_photo");
      const hasVideo = block.includes("tgme_widget_message_video");

      // Extract photo URL if present
      const photoMatch = block.match(
        /background-image:url\('([^']+)'\)/
      );

      messages.push({
        message_id: messageId,
        date,
        text,
        photo: hasPhoto && photoMatch
          ? [{ file_id: photoMatch[1], width: 0, height: 0 }]
          : undefined,
        video: hasVideo ? { file_id: "video" } : undefined,
      });
    }

    return messages;
  } catch (error) {
    console.error(`Error scraping channel ${channelName}:`, error);
    return [];
  }
}

// Ingest new posts from all configured channels
export async function ingestNewPosts(): Promise<{
  ingested: number;
  skipped: number;
  errors: string[];
}> {
  const channels = getConfiguredChannels();
  let ingested = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const channelName of channels) {
    // Ensure source exists
    let source = await prisma.source.findUnique({
      where: { channelName },
    });

    if (!source) {
      source = await prisma.source.create({
        data: {
          name: channelName,
          type: "telegram",
          channelName,
          channelUrl: `https://t.me/${channelName}`,
        },
      });
    }

    if (!source.isActive) {
      skipped++;
      continue;
    }

    try {
      const messages = await fetchChannelMessages(channelName);

      for (const msg of messages) {
        const text = msg.text || msg.caption || "";
        if (!text || text.length < 20) {
          skipped++;
          continue;
        }

        // Check duplicate
        const existing = await prisma.telegramPost.findUnique({
          where: {
            channelName_telegramMessageId: {
              channelName,
              telegramMessageId: msg.message_id,
            },
          },
        });

        if (existing) {
          skipped++;
          continue;
        }

        const hasMedia = !!(msg.photo || msg.video || msg.document);
        let mediaType: string | null = null;
        let mediaUrl: string | null = null;

        if (msg.photo) {
          mediaType = "photo";
          // For scraped posts, photo file_id might be the URL
          const photoId = msg.photo[msg.photo.length - 1]?.file_id;
          if (photoId?.startsWith("http")) {
            mediaUrl = photoId;
          }
        } else if (msg.video) {
          mediaType = "video";
        } else if (msg.document) {
          mediaType = "document";
        }

        await prisma.telegramPost.create({
          data: {
            sourceId: source.id,
            channelName,
            telegramMessageId: msg.message_id,
            telegramPostUrl: `https://t.me/${channelName}/${msg.message_id}`,
            originalText: text,
            originalDate: new Date(msg.date * 1000),
            hasMedia,
            mediaType,
            mediaUrl,
            rawPayload: msg as object,
            processed: false,
          },
        });

        ingested++;
      }
    } catch (error) {
      const errMsg = `Error ingesting from ${channelName}: ${error}`;
      console.error(errMsg);
      errors.push(errMsg);
    }
  }

  return { ingested, skipped, errors };
}
