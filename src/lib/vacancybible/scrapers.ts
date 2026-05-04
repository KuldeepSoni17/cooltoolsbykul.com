import type { CompanyRecord, RawJobRecord } from "./types";

const ATS_SIGNATURES: Record<string, string[]> = {
  greenhouse: ["boards.greenhouse.io", "boards-api.greenhouse.io"],
  lever: ["jobs.lever.co", "api.lever.co"],
  ashby: ["jobs.ashbyhq.com", "api.ashbyhq.com"],
  workday: ["myworkdayjobs.com", "workday.com/en-us/jobs"],
  smartrecruiters: ["careers.smartrecruiters.com"],
};

function normalizeText(value: unknown): string | undefined {
  if (!value || typeof value !== "string") return undefined;
  return value.replace(/\s+/g, " ").trim();
}

function toRawJob(company: CompanyRecord, payload: Record<string, unknown>): RawJobRecord {
  const title =
    normalizeText(payload.text) ??
    normalizeText(payload.title) ??
    normalizeText(payload.name) ??
    "Unknown role";
  const location =
    normalizeText(payload.location as string) ??
    normalizeText((payload.categories as Record<string, unknown> | undefined)?.location);
  const sourceUrl =
    normalizeText(payload.absolute_url) ??
    normalizeText(payload.hostedUrl) ??
    normalizeText(payload.url) ??
    company.careersPageUrl;

  return {
    companySlug: company.slug,
    companyName: company.name,
    sourceUrl,
    title,
    location,
    description: normalizeText(payload.content) ?? normalizeText(payload.description),
    postedAt: normalizeText(payload.updated_at) ?? normalizeText(payload.postedDate),
    metadata: payload,
  };
}

export async function detectAtsForCompany(url: string): Promise<string> {
  const lowered = url.toLowerCase();
  for (const [platform, signatures] of Object.entries(ATS_SIGNATURES)) {
    if (signatures.some((signature) => lowered.includes(signature))) return platform;
  }
  return "direct";
}

async function scrapeGreenhouse(company: CompanyRecord): Promise<RawJobRecord[]> {
  const slug = company.atsSlug ?? company.slug;
  const endpoint = `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`;
  const res = await fetch(endpoint, { cache: "no-store" });
  if (!res.ok) return [];
  const payload = (await res.json()) as { jobs?: Record<string, unknown>[] };
  return (payload.jobs ?? []).map((job) => toRawJob(company, job));
}

async function scrapeLever(company: CompanyRecord): Promise<RawJobRecord[]> {
  const slug = company.atsSlug ?? company.slug;
  const endpoint = `https://api.lever.co/v0/postings/${slug}?mode=json`;
  const res = await fetch(endpoint, { cache: "no-store" });
  if (!res.ok) return [];
  const payload = (await res.json()) as Record<string, unknown>[];
  return payload.map((job) => toRawJob(company, job));
}

async function scrapeAshby(company: CompanyRecord): Promise<RawJobRecord[]> {
  const slug = company.atsSlug ?? company.slug;
  const endpoint = `https://api.ashbyhq.com/posting-api/job-board/${slug}`;
  const res = await fetch(endpoint, { cache: "no-store" });
  if (!res.ok) return [];
  const payload = (await res.json()) as { jobs?: Record<string, unknown>[] };
  return (payload.jobs ?? []).map((job) => toRawJob(company, job));
}

async function scrapeSmartRecruiters(company: CompanyRecord): Promise<RawJobRecord[]> {
  const slug = company.atsSlug ?? company.slug;
  const endpoint = `https://api.smartrecruiters.com/v1/companies/${slug}/postings`;
  const res = await fetch(endpoint, { cache: "no-store" });
  if (!res.ok) return [];
  const payload = (await res.json()) as { content?: Record<string, unknown>[] };
  return (payload.content ?? []).map((job) => toRawJob(company, job));
}

async function scrapeWorkday(company: CompanyRecord): Promise<RawJobRecord[]> {
  const res = await fetch(company.careersPageUrl, { cache: "no-store" });
  if (!res.ok) return [];
  return [
    {
      companySlug: company.slug,
      companyName: company.name,
      sourceUrl: company.careersPageUrl,
      title: `${company.name} Product Manager`,
      location: "India",
      description: "Fallback record generated from Workday landing page.",
      metadata: { fallback: true, platform: "workday" },
    },
  ];
}

async function scrapeDirect(company: CompanyRecord): Promise<RawJobRecord[]> {
  const res = await fetch(company.careersPageUrl, { cache: "no-store" });
  if (!res.ok) return [];
  const html = await res.text();
  const hasPmKeyword = /product manager|product management/i.test(html);
  if (!hasPmKeyword) return [];
  return [
    {
      companySlug: company.slug,
      companyName: company.name,
      sourceUrl: company.careersPageUrl,
      title: `${company.name} Product Manager (detected)`,
      location: company.hqCity ?? "India",
      description: "Direct portal keyword match from careers page.",
      metadata: { directPortal: true },
    },
  ];
}

export async function scrapeCompany(company: CompanyRecord): Promise<RawJobRecord[]> {
  const platform = company.atsPlatform;
  try {
    switch (platform) {
      case "greenhouse":
        return await scrapeGreenhouse(company);
      case "lever":
        return await scrapeLever(company);
      case "ashby":
        return await scrapeAshby(company);
      case "smartrecruiters":
        return await scrapeSmartRecruiters(company);
      case "workday":
        return await scrapeWorkday(company);
      case "direct":
      default:
        return await scrapeDirect(company);
    }
  } catch {
    return [];
  }
}
