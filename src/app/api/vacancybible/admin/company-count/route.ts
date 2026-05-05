import { NextResponse } from "next/server";
import { getRegistryCounts } from "@/lib/vacancybible/companyRegistry";

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
  return NextResponse.json(getRegistryCounts());
}
