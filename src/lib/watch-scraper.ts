import { hashUrl } from "./cache";
import { supabaseAdmin } from "./supabase-server";
import type { DetectionResult } from "./ats-detector";
import { filterPMRoles, scrapeCompany } from "./ats-scrapers";

export async function scrapeAndSaveJobs(detection: DetectionResult, watchedCompanyId: string): Promise<Array<{ id: string; is_new: boolean }>> {
  const rawJobs = await scrapeCompany(detection.ats_platform, detection.ats_slug, detection.company_name);
  const pmJobs = filterPMRoles(rawJobs, 1);
  const savedJobs: Array<{ id: string; is_new: boolean }> = [];
  const activeHashes: string[] = [];

  for (const job of pmJobs) {
    const urlHash = hashUrl(job.url);
    activeHashes.push(urlHash);
    const { data: existing } = await supabaseAdmin.from("jobs").select("id").eq("source_url_hash", urlHash).maybeSingle();

    if (existing?.id) {
      await supabaseAdmin
        .from("jobs")
        .update({ last_seen_at: new Date().toISOString(), is_active: true })
        .eq("id", existing.id);
      savedJobs.push({ id: existing.id, is_new: false });
      continue;
    }

    const { data: inserted } = await supabaseAdmin
      .from("jobs")
      .insert({
        source_url: job.url,
        source_url_hash: urlHash,
        company_name: detection.company_name,
        company_slug: detection.ats_slug || detection.company_name.toLowerCase().replace(/\s+/g, "-"),
        exact_role_title: job.title,
        location: job.location || "",
        ats_platform: detection.ats_platform,
        source_label: `${detection.ats_platform} @ ${detection.company_name}`,
        raw_description: job.description || "",
        watched_company_id: watchedCompanyId,
        first_seen_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
        is_active: true,
        is_new: true,
      })
      .select("id")
      .single();

    if (inserted?.id) savedJobs.push({ id: inserted.id, is_new: true });
  }

  if (activeHashes.length > 0) {
    await supabaseAdmin
      .from("jobs")
      .update({ is_active: false })
      .eq("watched_company_id", watchedCompanyId)
      .not("source_url_hash", "in", `(${activeHashes.map((h) => `'${h}'`).join(",")})`);
  }

  await supabaseAdmin.from("watched_companies").update({ last_checked_at: new Date().toISOString() }).eq("id", watchedCompanyId);
  return savedJobs;
}
