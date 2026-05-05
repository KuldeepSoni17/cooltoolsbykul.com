import crypto from "crypto";
import { supabaseAdmin } from "./supabase-server";

const CACHE_TTL_HOURS = 6;

export function hashQuery(params: Record<string, unknown>): string {
  const normalized = Object.fromEntries(
    Object.entries(params)
      .filter(([, v]) => v !== "" && v !== null && v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => [k, typeof v === "string" ? v.toLowerCase().trim() : v]),
  );
  return crypto.createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
}

export function hashUrl(url: string): string {
  return crypto.createHash("sha256").update(url).digest("hex");
}

export async function getSearchCache(queryHash: string) {
  const { data, error } = await supabaseAdmin
    .from("search_cache")
    .select("*")
    .eq("query_hash", queryHash)
    .gt("expires_at", new Date().toISOString())
    .single();
  if (error || !data) return null;
  return data;
}

export async function getJobsByIds(jobIds: string[]) {
  if (jobIds.length === 0) return [];
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .select("*")
    .in("id", jobIds)
    .eq("is_active", true)
    .order("overall_score", { ascending: false });
  if (error) {
    console.error("[Cache] getJobsByIds failed:", error.message);
    return [];
  }
  return data ?? [];
}

export async function saveSearchCache(
  queryHash: string,
  queryParams: Record<string, unknown>,
  jobIds: string[],
): Promise<void> {
  const expiresAt = new Date(Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString();
  const { error } = await supabaseAdmin.from("search_cache").upsert(
    {
      query_hash: queryHash,
      query_params: queryParams,
      job_ids: jobIds,
      result_count: jobIds.length,
      created_at: new Date().toISOString(),
      expires_at: expiresAt,
    },
    { onConflict: "query_hash" },
  );
  if (error) {
    console.error("[Cache] saveSearchCache failed:", error.message);
  }
}

export async function clearExpiredCache(): Promise<void> {
  const { error } = await supabaseAdmin
    .from("search_cache")
    .delete()
    .lt("expires_at", new Date().toISOString());
  if (error) {
    console.error("[Cache] clearExpiredCache failed:", error.message);
  }
}

export async function getExistingJob(urlHash: string) {
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .select("id,enriched_at,last_seen_at,is_active")
    .eq("source_url_hash", urlHash)
    .single();
  if (error) return null;
  return data;
}

export async function touchJobSeen(jobId: string): Promise<void> {
  await supabaseAdmin
    .from("jobs")
    .update({
      last_seen_at: new Date().toISOString(),
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId);
}

export async function markJobsInactive(companySlugs: string[], activeUrlHashes: string[]): Promise<number> {
  if (companySlugs.length === 0 || activeUrlHashes.length === 0) return 0;
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .in("company_slug", companySlugs)
    .not("source_url_hash", "in", `(${activeUrlHashes.map((h) => `'${h}'`).join(",")})`)
    .eq("is_active", true)
    .select("id");
  if (error) {
    console.error("[Cache] markJobsInactive failed:", error.message);
    return 0;
  }
  return data?.length ?? 0;
}
