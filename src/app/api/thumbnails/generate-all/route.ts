import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateThumbnail } from "@/lib/thumbnail";

export async function POST(_request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all articles and their telegram posts
    const articles = await prisma.article.findMany({
      include: { telegramPost: true },
    });

    let updated = 0;
    for (const article of articles) {
      try {
        let featuredImage: string | null = null;

        // Prefer Telegram photo
        if (article.telegramPost?.mediaUrl && article.telegramPost?.mediaType === "photo") {
          featuredImage = article.telegramPost.mediaUrl;
        } else {
          // Fall back to generated thumbnail
          featuredImage = await generateThumbnail(
            article.titleSq,
            article.category,
            article.urgency,
            article.createdAt,
            article.slug
          );
        }

        if (featuredImage && featuredImage !== article.featuredImage) {
          await prisma.article.update({
            where: { id: article.id },
            data: { featuredImage },
          });
          updated++;
        }
      } catch (err) {
        console.error(`Image failed for ${article.slug}:`, err);
      }
    }

    return NextResponse.json({ success: true, updated, total: articles.length });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed", details: String(error) },
      { status: 500 }
    );
  }
}
