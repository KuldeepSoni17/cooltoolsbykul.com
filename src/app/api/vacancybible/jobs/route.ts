import { NextResponse } from "next/server";
import { getJobs, getSession } from "@/lib/vacancybible/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json(
      { ok: false, error: "sessionId query param is required." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    session: getSession(sessionId),
    jobs: getJobs(sessionId),
  });
}
