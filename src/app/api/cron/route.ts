import { NextRequest, NextResponse } from "next/server";
import { ingestNewPosts } from "@/lib/telegram";
import { processAllUnprocessed } from "@/lib/ai-pipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Step 1: Ingest new posts from Telegram
    const ingestResult = await ingestNewPosts();

    // Step 2: Process unprocessed posts through AI pipeline
    const processResult = await processAllUnprocessed();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ingest: ingestResult,
      process: processResult,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Cron job failed", details: String(error) },
      { status: 500 }
    );
  }
}
