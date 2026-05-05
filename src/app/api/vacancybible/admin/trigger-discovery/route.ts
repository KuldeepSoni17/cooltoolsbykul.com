import { NextResponse } from "next/server";
import { runFullDiscovery } from "@/lib/vacancybible/discovery";

function isAuthorized(req: Request): boolean {
  const secret = process.env.ADMIN_SECRET_KEY;
  if (!secret) return true;
  const incoming = req.headers.get("x-admin-secret") ?? req.headers.get("x-admin-key");
  return incoming === secret;
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  void runFullDiscovery()
    .then((result) => {
      console.log("[Admin] Discovery complete:", result);
    })
    .catch((error) => {
      console.error("[Admin] Discovery failed:", error);
    });
  return NextResponse.json({
    ok: true,
    status: "discovery started",
    message: "Running in background. Check logs.",
  });
}
