import { NextRequest, NextResponse } from "next/server";
import { runFullDiscovery } from "@/lib/discovery";

function authorized(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  return req.headers.get("x-admin-key") === secret;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const result = await runFullDiscovery();
  return NextResponse.json(result);
}
