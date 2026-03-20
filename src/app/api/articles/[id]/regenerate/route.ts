import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { extractFacts, generateArticle } from "@/lib/ai-pipeline";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    include: { telegramPost: { include: { source: true } } },
  });

  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Save current version
  await prisma.articleVersion.create({
    data: {
      articleId: id,
      titleSq: article.titleSq,
      bodySq: article.bodySq,
      reason: "Before regeneration",
    },
  });

  // Re-extract facts and regenerate
  const facts = await extractFacts(article.telegramPost.originalText);
  const generated = await generateArticle(facts, article.telegramPost.source.name);

  const updated = await prisma.article.update({
    where: { id },
    data: {
      titleSq: generated.title,
      subtitleSq: generated.subtitle,
      summarySq: generated.summary,
      bodySq: generated.body,
      seoTitle: generated.seo_title,
      seoDescription: generated.seo_description,
      whyItMatters: generated.why_it_matters,
      extractedFacts: facts as object,
      category: facts.category,
      urgency: facts.urgency,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.id,
      action: "regenerate",
      entity: "article",
      entityId: id,
    },
  });

  return NextResponse.json(updated);
}
