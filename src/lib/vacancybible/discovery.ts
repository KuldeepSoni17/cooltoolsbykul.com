import { addDiscoveredCompanies } from "./companyRegistry";
import type { CompanyRecord } from "./types";

function titleFromSlug(slug: string): string {
  return slug
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function parseSitemapLocs(xml: string): string[] {
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)];
  return matches.map((m) => m[1]).filter(Boolean);
}

async function discoverGreenhouseCompanies(): Promise<CompanyRecord[]> {
  const discovered: CompanyRecord[] = [];
  for (let page = 1; page <= 30; page += 1) {
    const url = `https://boards-api.greenhouse.io/v1/boards?page=${page}&per_page=100`;
    try {
      const resp = await fetch(url, { cache: "no-store" });
      if (!resp.ok) break;
      const data = (await resp.json()) as { boards?: Array<{ token?: string; slug?: string; name?: string }> };
      const boards = data.boards ?? [];
      if (boards.length === 0) break;
      for (const board of boards) {
        const atsSlug = board.token ?? board.slug ?? "";
        if (!atsSlug) continue;
        discovered.push({
          name: board.name ?? titleFromSlug(atsSlug),
          slug: atsSlug,
          careersPageUrl: `https://boards.greenhouse.io/${atsSlug}`,
          atsPlatform: "greenhouse",
          atsSlug,
          sector: "Unknown",
          hqCountry: "Unknown",
          indiaOffices: ["Unknown"],
          pmMaturityScore: 5,
          brandValueScore: 5,
          stabilityScore: 5,
        });
      }
      if (boards.length < 100) break;
    } catch {
      break;
    }
  }
  return discovered;
}

async function discoverLeverCompanies(): Promise<CompanyRecord[]> {
  try {
    const resp = await fetch("https://jobs.lever.co/sitemap.xml", { cache: "no-store" });
    if (!resp.ok) return [];
    const xml = await resp.text();
    const locs = parseSitemapLocs(xml);
    const slugs = new Set<string>();
    for (const loc of locs) {
      const match = loc.match(/^https:\/\/jobs\.lever\.co\/([^/]+)\/?$/);
      if (match?.[1]) slugs.add(match[1]);
    }
    return [...slugs].map((atsSlug) => ({
      name: titleFromSlug(atsSlug),
      slug: atsSlug,
      careersPageUrl: `https://jobs.lever.co/${atsSlug}`,
      atsPlatform: "lever",
      atsSlug,
      sector: "Unknown",
      hqCountry: "Unknown",
      indiaOffices: ["Unknown"],
      pmMaturityScore: 5,
      brandValueScore: 5,
      stabilityScore: 5,
    }));
  } catch {
    return [];
  }
}

async function discoverAshbyCompanies(): Promise<CompanyRecord[]> {
  try {
    const resp = await fetch("https://jobs.ashbyhq.com/sitemap.xml", { cache: "no-store" });
    if (!resp.ok) return [];
    const xml = await resp.text();
    const locs = parseSitemapLocs(xml);
    const slugs = new Set<string>();
    for (const loc of locs) {
      const match = loc.match(/^https:\/\/jobs\.ashbyhq\.com\/([^/]+)\/?$/);
      if (match?.[1]) slugs.add(match[1]);
    }
    return [...slugs].map((atsSlug) => ({
      name: titleFromSlug(atsSlug),
      slug: atsSlug,
      careersPageUrl: `https://jobs.ashbyhq.com/${atsSlug}`,
      atsPlatform: "ashby",
      atsSlug,
      sector: "Unknown",
      hqCountry: "Unknown",
      indiaOffices: ["Unknown"],
      pmMaturityScore: 5,
      brandValueScore: 5,
      stabilityScore: 5,
    }));
  } catch {
    return [];
  }
}

async function discoverSmartRecruitersCompanies(): Promise<CompanyRecord[]> {
  const discovered: CompanyRecord[] = [];
  const seen = new Set<string>();
  for (const q of ["product manager", "senior product manager"]) {
    try {
      const url = `https://api.smartrecruiters.com/v1/postings?q=${encodeURIComponent(q)}&limit=100`;
      const resp = await fetch(url, { cache: "no-store" });
      if (!resp.ok) continue;
      const data = (await resp.json()) as {
        content?: Array<{ company?: { identifier?: string; name?: string } }>;
      };
      for (const item of data.content ?? []) {
        const identifier = item.company?.identifier ?? "";
        const name = item.company?.name ?? "";
        if (!identifier || seen.has(identifier)) continue;
        seen.add(identifier);
        discovered.push({
          name: name || titleFromSlug(identifier),
          slug: identifier.toLowerCase(),
          careersPageUrl: `https://careers.smartrecruiters.com/${identifier}`,
          atsPlatform: "smartrecruiters",
          atsSlug: identifier,
          sector: "Unknown",
          hqCountry: "Unknown",
          indiaOffices: ["Unknown"],
          pmMaturityScore: 5,
          brandValueScore: 5,
          stabilityScore: 5,
        });
      }
    } catch {
      continue;
    }
  }
  return discovered;
}

export async function runFullDiscovery() {
  const [greenhouse, lever, ashby, smartrecruiters] = await Promise.all([
    discoverGreenhouseCompanies(),
    discoverLeverCompanies(),
    discoverAshbyCompanies(),
    discoverSmartRecruitersCompanies(),
  ]);
  const allDiscovered = [...greenhouse, ...lever, ...ashby, ...smartrecruiters];
  const newAdded = addDiscoveredCompanies(allDiscovered);
  return {
    greenhouse: greenhouse.length,
    lever: lever.length,
    ashby: ashby.length,
    smartrecruiters: smartrecruiters.length,
    totalDiscovered: allDiscovered.length,
    newAdded,
  };
}
