import { NextRequest, NextResponse } from "next/server";
import { detectATS } from "@/lib/ats-detector";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { url?: string };
  const url = body?.url;

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL. Please include https://" }, { status: 400 });
  }

  try {
    const result = await detectATS(url);
    if (!result) {
      return NextResponse.json(
        { error: "Could not detect a job listings page at this URL. Try the direct jobs search URL." },
        { status: 422 },
      );
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("[API/watch/detect]", error);
    return NextResponse.json(
      { error: "Failed to read that URL. It may require a login or block automated access." },
      { status: 500 },
    );
  }
}
