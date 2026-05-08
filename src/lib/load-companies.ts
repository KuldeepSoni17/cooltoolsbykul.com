import { hasSupabaseAdminConfig, supabaseAdmin } from "./supabase-server";
import { seedCompanies } from "./seed-companies";
import type { CompanyRecord } from "@/lib/vacancybible/types";

const MIN_COMPANY_TARGET = 1000;
let autoSeedPromise: Promise<void> | null = null;

async function queryActiveCompanies() {
  return supabaseAdmin
    .from("companies")
    .select("slug,name,ats_platform,careers_url,slug_status")
    .eq("is_active", true)
    .neq("slug_status", "invalid")
    .order("created_at", { ascending: true });
}

export async function loadActiveCompanies(): Promise<CompanyRecord[]> {
  if (!hasSupabaseAdminConfig()) {
    throw new Error(
      "[LoadCompanies] Missing Supabase config: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.",
    );
  }
  const initial = await queryActiveCompanies();
  let { data } = initial;
  const { error } = initial;

  if (error) {
    throw new Error(`[LoadCompanies] Supabase query failed: ${error.message}`);
  }

  const rows = (data ?? []) as Array<{
    slug: string;
    name: string;
    ats_platform: CompanyRecord["atsPlatform"];
    careers_url: string;
  }>;

  // Auto-seed once when production table looks uninitialized/small.
  if (rows.length < MIN_COMPANY_TARGET) {
    if (!autoSeedPromise) {
      autoSeedPromise = (async () => {
        try {
          console.log(`[LoadCompanies] Auto-seeding because company count=${rows.length}`);
          const seeded = await seedCompanies();
          console.log("[LoadCompanies] Auto-seed complete", seeded);
        } catch (seedError) {
          console.error("[LoadCompanies] Auto-seed failed:", seedError);
        } finally {
          autoSeedPromise = null;
        }
      })();
    }
    await autoSeedPromise;
    const refreshed = await queryActiveCompanies();
    if (!refreshed.error) {
      data = refreshed.data;
    }
  }

  const finalRows = ((data ?? []) as Array<{
    slug: string;
    name: string;
    ats_platform: CompanyRecord["atsPlatform"];
    careers_url: string;
  }>).filter((r) => Boolean(r.slug) && Boolean(r.name) && Boolean(r.careers_url));

  if (finalRows.length === 0) {
    throw new Error("[LoadCompanies] No active companies available after seeding.");
  }

  return finalRows.map((row) => ({
    slug: row.slug,
    name: row.name,
    atsPlatform: row.ats_platform,
    careersPageUrl: row.careers_url,
    atsSlug: row.slug,
    sector: "Unknown",
    hqCountry: "Unknown",
    indiaOffices: ["Unknown"],
    pmMaturityScore: 5,
    brandValueScore: 5,
    stabilityScore: 5,
  }));
}
