import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    totalPosts,
    unprocessedPosts,
    totalArticles,
    publishedArticles,
    draftArticles,
    rejectedArticles,
    activeSources,
  ] = await Promise.all([
    prisma.telegramPost.count(),
    prisma.telegramPost.count({ where: { processed: false } }),
    prisma.article.count(),
    prisma.article.count({ where: { status: "published" } }),
    prisma.article.count({ where: { status: "draft" } }),
    prisma.article.count({ where: { status: "rejected" } }),
    prisma.source.count({ where: { isActive: true } }),
  ]);

  return NextResponse.json({
    totalPosts,
    unprocessedPosts,
    totalArticles,
    publishedArticles,
    draftArticles,
    rejectedArticles,
    activeSources,
  });
}
