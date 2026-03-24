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
    const articles = await prisma.article.findMany({
      where: { featuredImage: null },
    });

    let generated = 0;
    for (const article of articles) {
      try {
        const thumbPath = await generateThumbnail(
          article.titleSq,
          article.category,
          article.urgency,
          article.createdAt,
          article.slug
        );
        await prisma.article.update({
          where: { id: article.id },
          data: { featuredImage: thumbPath },
        });
        generated++;
      } catch (err) {
        console.error(`Thumbnail failed for ${article.slug}:`, err);
      }
    }

    return NextResponse.json({ success: true, generated, total: articles.length });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed", details: String(error) },
      { status: 500 }
    );
  }
}
