import OpenAI from "openai";
import { prisma } from "./db";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function getModel() {
  return process.env.OPENAI_MODEL || "gpt-4o";
}

// ─── STEP A: Fact Extraction ─────────────────────────────────────────────────

const FACT_EXTRACTION_PROMPT = `You are a professional news analyst. Given a social media post, extract ONLY the factual claims into structured JSON. Do NOT preserve the original wording. Identify and summarize facts independently.

Output ONLY valid JSON with this structure:
{
  "who": "person/entity involved (or null)",
  "what": "what happened / what is being claimed",
  "where": "location if mentioned (or null)",
  "when": "time/date if mentioned (or null)",
  "why": "reason/cause if mentioned (or null)",
  "key_claims": ["list of distinct factual claims"],
  "confidence": "high | medium | low",
  "missing_context": "what information is missing or unclear",
  "category": "one of: botë, politikë, konflikt, ekonomi, teknologji, sport, shëndetësi, shkencë, kulturë",
  "urgency": "one of: breaking, update, analysis"
}

Rules:
- Extract facts, not opinions unless attributed
- Note uncertainty when present
- Do not add information not in the source
- Do not copy phrases from the original text
- If the post is about a conflict, use category "konflikt"
- If unclear category, default to "botë"`;

export interface ExtractedFacts {
  who: string | null;
  what: string;
  where: string | null;
  when: string | null;
  why: string | null;
  key_claims: string[];
  confidence: string;
  missing_context: string;
  category: string;
  urgency: string;
}

export async function extractFacts(
  originalText: string
): Promise<ExtractedFacts> {
  const response = await getOpenAI().chat.completions.create({
    model: getModel(),
    messages: [
      { role: "system", content: FACT_EXTRACTION_PROMPT },
      { role: "user", content: originalText },
    ],
    temperature: 0.1,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI for fact extraction");

  return JSON.parse(content) as ExtractedFacts;
}

// ─── STEP B+C: Albanian Article Generation ───────────────────────────────────

const ARTICLE_GENERATION_PROMPT = `Ti je një redaktor i lajmeve dixhitale profesionist shqiptar. Bazuar VETËM nga faktet e dhëna më poshtë, shkruaj një artikull origjinal lajmesh në gjuhën shqipe.

RREGULLA TË RREPTA:
- Shkruaj artikullin PLOTËSISHT nga e para — NUK kopjon, NUK përkthe, NUK parafrazon materialin burimor
- Përdor gjuhë të pastër dhe natyrore shqipe
- Stili: profesional, i qartë, konciz, informues
- Mos përmend se artikulli bazohet në një postim në Telegram ose ndonjë burim tjetër brenda trupit të artikullit
- Nëse faktet janë të paplota, thuaje me kujdes (p.sh. "Detaje të mëtejshme nuk janë konfirmuar ende")
- Mos shto fakte që nuk ekzistojnë në të dhënat e mëposhtme
- Mos përdor fjalë të tepruara sensacionale pa arsye faktike

Output ONLY valid JSON:
{
  "title": "Titulli kryesor në shqip (max 100 karaktere)",
  "subtitle": "Nëntitulli në shqip (max 150 karaktere)",
  "summary": "Përmbledhje e shkurtër 1-2 fjali",
  "body": "Trupi i plotë i artikullit në shqip, 3-6 paragrafë. Përdor \\n\\n për paragrafë të re.",
  "seo_title": "Titull SEO (max 60 karaktere)",
  "seo_description": "Përshkrim SEO (max 155 karaktere)",
  "slug": "slug-ne-shqip-pa-germa-speciale",
  "why_it_matters": "Pse ka rëndësi - 1-2 fjali (ose null nëse nuk aplikohet)"
}`;

export interface GeneratedArticle {
  title: string;
  subtitle: string;
  summary: string;
  body: string;
  seo_title: string;
  seo_description: string;
  slug: string;
  why_it_matters: string | null;
}

export async function generateArticle(
  facts: ExtractedFacts,
  sourceName: string
): Promise<GeneratedArticle> {
  const factsText = `FAKTET E NXJERRA:
- Kush: ${facts.who || "E panjohur"}
- Çfarë: ${facts.what}
- Ku: ${facts.where || "E paspecifikuar"}
- Kur: ${facts.when || "E paspecifikuar"}
- Pse: ${facts.why || "E paspecifikuar"}
- Pretendime kryesore: ${facts.key_claims.join("; ")}
- Besueshmëria: ${facts.confidence}
- Konteksti që mungon: ${facts.missing_context}
- Kategoria: ${facts.category}
- Urgjenca: ${facts.urgency}
- Burimi: ${sourceName}`;

  const response = await getOpenAI().chat.completions.create({
    model: getModel(),
    messages: [
      { role: "system", content: ARTICLE_GENERATION_PROMPT },
      { role: "user", content: factsText },
    ],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI for article generation");

  return JSON.parse(content) as GeneratedArticle;
}

// ─── Full Pipeline ───────────────────────────────────────────────────────────

export async function processPost(telegramPostId: string) {
  const post = await prisma.telegramPost.findUnique({
    where: { id: telegramPostId },
    include: { source: true },
  });

  if (!post) throw new Error(`Post ${telegramPostId} not found`);
  if (post.processed) throw new Error(`Post ${telegramPostId} already processed`);

  // Step A: Extract facts
  const facts = await extractFacts(post.originalText);

  // Step B+C: Generate article
  const sourceName = post.source.name;
  const article = await generateArticle(facts, sourceName);

  // Ensure unique slug
  let slug = article.slug;
  const existingSlug = await prisma.article.findUnique({ where: { slug } });
  if (existingSlug) {
    slug = `${slug}-${Date.now()}`;
  }

  // Get settings for publish mode and image mode
  const publishModeSetting = await prisma.settings.findUnique({
    where: { key: "publish_mode" },
  });
  const imageModeSetting = await prisma.settings.findUnique({
    where: { key: "image_mode" },
  });

  const publishMode = publishModeSetting?.value || "manual";
  const imageMode = imageModeSetting?.value || "generated";

  const status = publishMode === "auto" ? "published" : "draft";
  const publishedAt = publishMode === "auto" ? new Date() : null;

  // Create article
  const createdArticle = await prisma.article.create({
    data: {
      telegramPostId: post.id,
      titleSq: article.title,
      subtitleSq: article.subtitle,
      summarySq: article.summary,
      bodySq: article.body,
      slug,
      seoTitle: article.seo_title,
      seoDescription: article.seo_description,
      category: facts.category,
      urgency: facts.urgency,
      sourceName: post.source.name,
      sourceUrl: post.telegramPostUrl,
      imageMode,
      whyItMatters: article.why_it_matters,
      extractedFacts: facts as object,
      status,
      publishedAt,
    },
  });

  // Mark post as processed
  await prisma.telegramPost.update({
    where: { id: post.id },
    data: { processed: true },
  });

  return createdArticle;
}

// Process all unprocessed posts
export async function processAllUnprocessed(): Promise<{
  processed: number;
  errors: string[];
}> {
  const unprocessed = await prisma.telegramPost.findMany({
    where: { processed: false },
    orderBy: { originalDate: "asc" },
    take: 10,
  });

  let processed = 0;
  const errors: string[] = [];

  for (const post of unprocessed) {
    try {
      await processPost(post.id);
      processed++;
    } catch (error) {
      const errMsg = `Error processing post ${post.id}: ${error}`;
      console.error(errMsg);
      errors.push(errMsg);
    }
  }

  return { processed, errors };
}
