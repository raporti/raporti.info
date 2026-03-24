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
    const articles = await prisma.article.findMany();

    let updated = 0;
    for (const article of articles) {
      try {
        // Always generate a local thumbnail — external URLs (Telegram CDN) expire
        const featuredImage = await generateThumbnail(
          article.titleSq,
          article.category,
          article.urgency,
          article.createdAt,
          article.slug
        );

        if (featuredImage) {
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
