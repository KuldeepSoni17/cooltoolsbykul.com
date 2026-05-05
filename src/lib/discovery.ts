import { supabaseAdmin } from "./supabase-server";

export interface DiscoveredCompany {
  slug: string;
  name: string;
  ats_platform: "greenhouse" | "lever" | "ashby" | "smartrecruiters";
  careers_url: string;
}

function toTitle(slug: string): string {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function discoverGreenhouse(): Promise<DiscoveredCompany[]> {
  const discovered: DiscoveredCompany[] = [];
  const resp = await fetch("https://boards-api.greenhouse.io/v1/boards", {
    headers: { "User-Agent": "VacancyBible/1.0" },
    cache: "no-store",
  });
  if (!resp.ok) return [];
  const data = (await resp.json()) as { boards?: Array<{ token?: string; name?: string }> };
  for (const board of data.boards ?? []) {
    const slug = board.token ?? "";
    if (!slug) continue;
    discovered.push({
      slug,
      name: board.name ?? toTitle(slug),
      ats_platform: "greenhouse",
      careers_url: `https://boards.greenhouse.io/${slug}`,
    });
  }
  return discovered;
}

export async function discoverLever(): Promise<DiscoveredCompany[]> {
  const discovered: DiscoveredCompany[] = [];
  const resp = await fetch("https://jobs.lever.co/sitemap.xml", {
    headers: { "User-Agent": "VacancyBible/1.0" },
    cache: "no-store",
  });
  if (!resp.ok) return [];
  const xml = await resp.text();
  const locMatches = xml.match(/<loc>([^<]+)<\/loc>/g) || [];
  const seen = new Set<string>();
  for (const match of locMatches) {
    const url = match.replace(/<\/?loc>/g, "").trim();
    const slugMatch = url.match(/^https:\/\/jobs\.lever\.co\/([^/?]+)\/?$/);
    if (!slugMatch) continue;
    const slug = slugMatch[1];
    if (seen.has(slug)) continue;
    seen.add(slug);
    discovered.push({
      slug,
      name: toTitle(slug),
      ats_platform: "lever",
      careers_url: `https://jobs.lever.co/${slug}`,
    });
  }
  return discovered;
}

export async function discoverAshby(): Promise<DiscoveredCompany[]> {
  const discovered: DiscoveredCompany[] = [];
  const resp = await fetch("https://jobs.ashbyhq.com/sitemap.xml", {
    headers: { "User-Agent": "VacancyBible/1.0" },
    cache: "no-store",
  });
  if (!resp.ok) return [];
  const xml = await resp.text();
  const locMatches = xml.match(/<loc>([^<]+)<\/loc>/g) || [];
  const seen = new Set<string>();
  for (const match of locMatches) {
    const url = match.replace(/<\/?loc>/g, "").trim();
    const slugMatch = url.match(/^https:\/\/jobs\.ashbyhq\.com\/([^/?]+)\/?$/);
    if (!slugMatch) continue;
    const slug = slugMatch[1];
    if (seen.has(slug)) continue;
    seen.add(slug);
    discovered.push({
      slug,
      name: toTitle(slug),
      ats_platform: "ashby",
      careers_url: `https://jobs.ashbyhq.com/${slug}`,
    });
  }
  return discovered;
}

export async function discoverSmartRecruiters(): Promise<DiscoveredCompany[]> {
  const discovered: DiscoveredCompany[] = [];
  const seen = new Set<string>();
  const searchTerms = [
    "senior product manager",
    "principal product manager",
    "lead product manager",
  ];
  for (const term of searchTerms) {
    const url = new URL("https://api.smartrecruiters.com/v1/postings");
    url.searchParams.set("q", term);
    url.searchParams.set("limit", "100");
    const resp = await fetch(url.toString(), {
      headers: { "User-Agent": "VacancyBible/1.0" },
      cache: "no-store",
    });
    if (!resp.ok) continue;
    const data = (await resp.json()) as {
      content?: Array<{ company?: { identifier?: string; name?: string } }>;
    };
    for (const posting of data.content ?? []) {
      const slug = posting.company?.identifier ?? "";
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      discovered.push({
        slug,
        name: posting.company?.name ?? toTitle(slug),
        ats_platform: "smartrecruiters",
        careers_url: `https://careers.smartrecruiters.com/${slug}`,
      });
    }
  }
  return discovered;
}

export async function saveDiscoveredCompanies(companies: DiscoveredCompany[]): Promise<number> {
  if (companies.length === 0) return 0;
  const { data, error } = await supabaseAdmin
    .from("companies")
    .upsert(
      companies.map((c) => ({
        slug: c.slug,
        name: c.name,
        ats_platform: c.ats_platform,
        careers_url: c.careers_url,
        slug_status: "unknown",
        is_active: true,
      })),
      { onConflict: "slug,ats_platform", ignoreDuplicates: true },
    )
    .select("id");
  if (error) {
    console.error("[Discovery] save failed:", error.message);
    return 0;
  }
  return data?.length ?? 0;
}

export async function runFullDiscovery() {
  const [greenhouse, lever, ashby, smartrecruiters] = await Promise.all([
    discoverGreenhouse(),
    discoverLever(),
    discoverAshby(),
    discoverSmartRecruiters(),
  ]);
  const all = [...greenhouse, ...lever, ...ashby, ...smartrecruiters];
  const newlySaved = await saveDiscoveredCompanies(all);
  return {
    greenhouse: greenhouse.length,
    lever: lever.length,
    ashby: ashby.length,
    smartrecruiters: smartrecruiters.length,
    total_discovered: all.length,
    newly_saved: newlySaved,
  };
}
