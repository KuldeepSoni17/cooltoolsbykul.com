import { NextResponse } from "next/server";
import { getDiagnostics, getSession } from "@/lib/vacancybible/store";

function isAuthorized(req: Request): boolean {
  const secret = process.env.ADMIN_SECRET_KEY;
  if (!secret) return true;
  const incoming = req.headers.get("x-admin-secret") ?? req.headers.get("x-admin-key");
  return incoming === secret;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json(
      { ok: false, error: "sessionId query param is required." },
      { status: 400 },
    );
  }

  const session = getSession(sessionId);
  const diagnostics = getDiagnostics(sessionId);
  return NextResponse.json({
    ok: true,
    session,
    diagnostics,
  });
}
