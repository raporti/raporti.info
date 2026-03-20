import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateThumbnail } from "@/lib/thumbnail";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  try {
    const thumbnailPath = await generateThumbnail(
      article.titleSq,
      article.category,
      article.urgency,
      article.createdAt,
      article.slug
    );

    await prisma.article.update({
      where: { id: article.id },
      data: { featuredImage: thumbnailPath },
    });

    return NextResponse.json({ success: true, path: thumbnailPath });
  } catch (error) {
    return NextResponse.json(
      { error: "Thumbnail generation failed", details: String(error) },
      { status: 500 }
    );
  }
}
