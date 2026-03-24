import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { ingestNewPosts } from "@/lib/telegram";

export async function POST(_request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await ingestNewPosts();
    console.log("[Ingest] Result:", JSON.stringify(result));
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[Ingest] Failed:", error);
    return NextResponse.json(
      { error: "Ingestion failed", details: String(error) },
      { status: 500 }
    );
  }
}
