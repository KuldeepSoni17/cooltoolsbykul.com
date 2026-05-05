import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { scrapeAndSaveJobs } from "@/lib/watch-scraper";
import type { DetectionResult } from "@/lib/ats-detector";

export async function POST(req: NextRequest) {
  const { detection } = (await req.json()) as { detection?: DetectionResult };

  if (!detection?.canonical_url) {
    return NextResponse.json({ error: "Invalid detection data" }, { status: 400 });
  }

  const payload = {
    canonical_url: detection.canonical_url,
    company_name: detection.company_name,
    ats_platform: detection.ats_platform,
    ats_slug: detection.ats_slug,
    api_url: detection.api_url,
    api_method: detection.api_method,
    is_active: true,
    last_checked_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  const { data: company, error } = await supabaseAdmin
    .from("watched_companies")
    .upsert(payload, { onConflict: "canonical_url" })
    .select("id")
    .single();

  if (error || !company?.id) {
    console.error("[API/watch/add] save failed", error);
    return NextResponse.json({ error: "Failed to save company to watchlist" }, { status: 500 });
  }

  const jobs = await scrapeAndSaveJobs(detection, company.id);
  return NextResponse.json({ success: true, company_id: company.id, jobs_found: jobs.length });
}
