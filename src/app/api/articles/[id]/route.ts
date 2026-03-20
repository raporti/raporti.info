import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      telegramPost: { include: { source: true } },
      versions: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(article);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Save version before updating
  if (body.titleSq || body.bodySq) {
    await prisma.articleVersion.create({
      data: {
        articleId: id,
        titleSq: article.titleSq,
        bodySq: article.bodySq,
        reason: body.versionReason || "Manual edit",
      },
    });
  }

  const updateData: Record<string, unknown> = {};
  const allowedFields = [
    "titleSq", "subtitleSq", "summarySq", "bodySq", "slug",
    "seoTitle", "seoDescription", "category", "urgency",
    "imageMode", "featuredImage", "editorNote", "whyItMatters", "status",
  ];

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  // Handle publish
  if (body.status === "published" && !article.publishedAt) {
    updateData.publishedAt = new Date();
  }

  const updated = await prisma.article.update({
    where: { id },
    data: updateData,
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: session.id,
      action: "update",
      entity: "article",
      entityId: id,
      details: { fields: Object.keys(updateData) },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.articleVersion.deleteMany({ where: { articleId: id } });
  await prisma.article.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      userId: session.id,
      action: "delete",
      entity: "article",
      entityId: id,
    },
  });

  return NextResponse.json({ success: true });
}
