import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { processAllUnprocessed } from "@/lib/ai-pipeline";

export const maxDuration = 60;

export async function POST(_request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processAllUnprocessed();
    console.log("[Process] Result:", JSON.stringify(result));
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[Process] Failed:", error);
    return NextResponse.json(
      { error: "Processing failed", details: String(error) },
      { status: 500 }
    );
  }
}
