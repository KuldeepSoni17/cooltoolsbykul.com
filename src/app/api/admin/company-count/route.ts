import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

function authorized(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  return req.headers.get("x-admin-key") === secret;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { data, error } = await supabaseAdmin
    .from("companies")
    .select("ats_platform,slug_status,is_active");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const byPlatform: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  for (const row of data ?? []) {
    const platform = row.ats_platform ?? "unknown";
    const status = row.slug_status ?? "unknown";
    byPlatform[platform] = (byPlatform[platform] ?? 0) + 1;
    byStatus[status] = (byStatus[status] ?? 0) + 1;
  }
  return NextResponse.json({ total: data?.length ?? 0, by_platform: byPlatform, by_status: byStatus });
}
