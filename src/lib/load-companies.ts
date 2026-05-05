import { supabaseAdmin } from "./supabase-server";
import { REGISTRY_COMPANIES } from "@/lib/vacancybible/registryData";
import type { CompanyRecord } from "@/lib/vacancybible/types";

export async function loadActiveCompanies(): Promise<CompanyRecord[]> {
  const { data, error } = await supabaseAdmin
    .from("companies")
    .select("slug,name,ats_platform,careers_url,slug_status")
    .eq("is_active", true)
    .neq("slug_status", "invalid")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[LoadCompanies] Supabase error; fallback registry:", error.message);
    return REGISTRY_COMPANIES;
  }

  const rows = (data ?? []) as Array<{
    slug: string;
    name: string;
    ats_platform: CompanyRecord["atsPlatform"];
    careers_url: string;
  }>;

  if (rows.length === 0) return REGISTRY_COMPANIES;

  return rows.map((row) => ({
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
