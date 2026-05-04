import { load } from "cheerio";
import type { CompanyRecord, RawJobRecord } from "./types";

const ATS_SIGNATURES: Record<string, string[]> = {
  greenhouse: ["boards.greenhouse.io", "boards-api.greenhouse.io"],
  lever: ["jobs.lever.co", "api.lever.co"],
  ashby: ["jobs.ashbyhq.com", "api.ashbyhq.com"],
  workday: ["myworkdayjobs.com", "workday.com/en-us/jobs"],
  smartrecruiters: ["careers.smartrecruiters.com"],
};

/** Verified Greenhouse board slugs (registry should use these via atsSlug). */
export const VERIFIED_GREENHOUSE_SLUGS: Record<string, string> = {
  freshworks: "freshworks",
  browserstack: "browserstack",
  meesho: "meesho",
  groww: "groww",
  chargebee: "chargebee",
  atlassian: "atlassian",
  stripe: "stripe",
  anthropic: "anthropic",
  notion: "notion",
  figma: "figma",
  vercel: "vercel",
  cohere: "cohere",
  uber: "uber",
  linkedin: "linkedin",
  coinbase: "coinbase",
  airbnb: "airbnb",
  cred: "dreamplug",
  "urban-company": "urbancompany",
  cars24: "cars24",
  acko: "acko",
  ixigo: "ixigo",
  postman: "postman",
  clevertap: "clevertap",
  sprinklr: "sprinklr",
  wise: "wiseuk",
  revolut: "revolut",
  scaleai: "scaleai",
  "scale-ai": "scaleai",
  salesforce: "salesforce",
};

export const VERIFIED_LEVER_SLUGS: Record<string, string> = {
  razorpay: "razorpay",
  swiggy: "swiggy",
  zepto: "zeptonow",
  spinny: "spinny",
  purplle: "purplle",
  mpl: "mpl",
  slice: "sliceit",
  "open-financial": "openfinancial",
};

export const VERIFIED_ASHBY_SLUGS: Record<string, string> = {
  linear: "linear",
  supabase: "supabase",
  retool: "retool",
  ramp: "ramp",
  mercury: "mercury",
  perplexity: "perplexity-ai",
  "dbt-labs": "dbtlabs",
};

function greenhouseJobsUrl(slug: string): string {
  return `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(slug)}/jobs?content=true`;
}

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

async function fetchJson(url: string): Promise<{ ok: boolean; status: number; body: unknown }> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    const body = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, body };
  } catch {
    return { ok: false, status: 0, body: null };
  }
}

export async function validateAtsSlug(
  company: CompanyRecord,
): Promise<{ valid: boolean; jobsFound: number; tried: string[] }> {
  const slugBase = (company.atsSlug ?? company.slug).toLowerCase().trim();
  const slugCandidates = [
    ...new Set([
      slugBase,
      slugBase.replace(/\s+/g, "-"),
      slugBase.replace(/[^a-z0-9-]/g, ""),
      VERIFIED_GREENHOUSE_SLUGS[company.slug],
      VERIFIED_LEVER_SLUGS[company.slug],
      VERIFIED_ASHBY_SLUGS[company.slug],
    ]),
  ].filter(Boolean) as string[];

  const tried: string[] = [];

  if (company.atsPlatform === "greenhouse") {
    for (const slug of slugCandidates) {
      const url = greenhouseJobsUrl(slug);
      tried.push(url);
      const { ok, body } = await fetchJson(url);
      const payload = body as { jobs?: unknown[]; error?: string } | null;
      if (ok && payload && Array.isArray(payload.jobs)) {
        return { valid: true, jobsFound: payload.jobs.length, tried };
      }
    }
    return { valid: false, jobsFound: 0, tried };
  }

  if (company.atsPlatform === "lever") {
    for (const slug of slugCandidates) {
      const url = `https://api.lever.co/v0/postings/${slug}?mode=json`;
      tried.push(url);
      const { ok, body } = await fetchJson(url);
      if (ok && Array.isArray(body)) {
        if (body.length === 0) continue;
        return { valid: true, jobsFound: body.length, tried };
      }
    }
    return { valid: false, jobsFound: 0, tried };
  }

  if (company.atsPlatform === "ashby") {
    for (const slug of slugCandidates) {
      const url = `https://api.ashbyhq.com/posting-api/job-board/${slug}`;
      tried.push(url);
      const { ok, body } = await fetchJson(url);
      const payload = body as { jobs?: unknown[] } | null;
      if (ok && payload?.jobs) return { valid: true, jobsFound: payload.jobs.length, tried };
    }
    return { valid: false, jobsFound: 0, tried };
  }

  return { valid: true, jobsFound: 0, tried: [company.careersPageUrl] };
}

/** Logs Greenhouse slug checks (console). Optional utility for diagnostics. */
export async function validateAllGreenhouseSlugs(
  entries: Array<{ key: string; slug: string }>,
): Promise<void> {
  for (const { key, slug } of entries) {
    const url = greenhouseJobsUrl(slug);
    const { ok, status, body } = await fetchJson(url);
    const jobs = (body as { jobs?: unknown[] } | null)?.jobs;
    const count = Array.isArray(jobs) ? jobs.length : 0;
    const label = ok && Array.isArray(jobs) ? "VALID" : "INVALID";
    console.log(`  [${label}] Greenhouse — ${key} (slug: ${slug}) — HTTP ${status} — ${count} jobs — ${url}`);
  }
}

/** Logs Lever slug checks (console). */
export async function validateAllLeverSlugs(
  entries: Array<{ key: string; slug: string }>,
): Promise<void> {
  for (const { key, slug } of entries) {
    const url = `https://api.lever.co/v0/postings/${slug}?mode=json`;
    const { ok, status, body } = await fetchJson(url);
    const arr = Array.isArray(body) ? body : null;
    const count = arr?.length ?? 0;
    const label =
      ok && arr && arr.length > 0 ? "VALID" : ok && arr?.length === 0 ? "EMPTY (slug may be invalid)" : "INVALID";
    console.log(`  [${label}] Lever — ${key} (slug: ${slug}) — HTTP ${status} — ${count} jobs — ${url}`);
  }
}

function resolvedGhSlug(company: CompanyRecord): string {
  return VERIFIED_GREENHOUSE_SLUGS[company.slug] ?? company.atsSlug ?? company.slug;
}

function resolvedLeverSlug(company: CompanyRecord): string {
  return VERIFIED_LEVER_SLUGS[company.slug] ?? company.atsSlug ?? company.slug;
}

function resolvedAshbySlug(company: CompanyRecord): string {
  return VERIFIED_ASHBY_SLUGS[company.slug] ?? company.atsSlug ?? company.slug;
}

async function scrapeGreenhouse(company: CompanyRecord): Promise<RawJobRecord[]> {
  const slug = resolvedGhSlug(company);
  const endpoint = greenhouseJobsUrl(slug);
  console.log(`[Greenhouse @ ${company.name}] Starting scrape → ${endpoint}`);
  try {
    const res = await fetch(endpoint, { cache: "no-store" });
    const rawText = await res.text();
    let payload: { jobs?: Record<string, unknown>[]; error?: string };
    try {
      payload = JSON.parse(rawText) as typeof payload;
    } catch {
      console.warn(`[Greenhouse @ ${company.name}] FAILED — invalid JSON — HTTP ${res.status}`);
      return [];
    }
    const jobs = payload.jobs ?? [];
    console.log(`[Greenhouse @ ${company.name}] HTTP ${res.status} — ${jobs.length} jobs in response`);
    if (!res.ok) {
      console.warn(`[Greenhouse @ ${company.name}] Response error: ${payload.error ?? rawText.slice(0, 120)}`);
      return [];
    }
    return jobs.map((job) => toRawJob(company, job));
  } catch (e) {
    console.warn(`[Greenhouse @ ${company.name}] FAILED — ${e instanceof Error ? e.name : "Error"}: ${String(e)}`);
    return [];
  }
}

async function scrapeLever(company: CompanyRecord): Promise<RawJobRecord[]> {
  const slug = resolvedLeverSlug(company);
  const endpoint = `https://api.lever.co/v0/postings/${slug}?mode=json`;
  console.log(`[Lever @ ${company.name}] Starting scrape → ${endpoint}`);
  try {
    const res = await fetch(endpoint, { cache: "no-store" });
    const rawText = await res.text();
    let payload: Record<string, unknown>[];
    try {
      payload = JSON.parse(rawText) as Record<string, unknown>[];
    } catch {
      console.warn(`[Lever @ ${company.name}] FAILED — invalid JSON — HTTP ${res.status}`);
      return [];
    }
    if (!Array.isArray(payload)) {
      console.warn(`[Lever @ ${company.name}] FAILED — unexpected payload — HTTP ${res.status}`);
      return [];
    }
    console.log(`[Lever @ ${company.name}] HTTP ${res.status} — ${payload.length} jobs in response`);
    if (res.ok && payload.length === 0) {
      console.warn(`[Lever @ ${company.name}] HTTP 200 — empty array [] — slug may be invalid`);
    }
    if (!res.ok) return [];
    return payload.map((job) => toRawJob(company, job));
  } catch (e) {
    console.warn(`[Lever @ ${company.name}] FAILED — ${e instanceof Error ? e.name : "Error"}: ${String(e)}`);
    return [];
  }
}

async function scrapeAshby(company: CompanyRecord): Promise<RawJobRecord[]> {
  const slug = resolvedAshbySlug(company);
  const endpoint = `https://api.ashbyhq.com/posting-api/job-board/${slug}`;
  console.log(`[Ashby @ ${company.name}] Starting scrape → ${endpoint}`);
  try {
    const res = await fetch(endpoint, { cache: "no-store" });
    const payload = (await res.json()) as { jobs?: Record<string, unknown>[] };
    const jobs = payload.jobs ?? [];
    console.log(`[Ashby @ ${company.name}] HTTP ${res.status} — ${jobs.length} jobs in response`);
    if (!res.ok) return [];
    return jobs.map((job) => toRawJob(company, job));
  } catch (e) {
    console.warn(`[Ashby @ ${company.name}] FAILED — ${e instanceof Error ? e.name : "Error"}: ${String(e)}`);
    return [];
  }
}

async function scrapeSmartRecruiters(company: CompanyRecord): Promise<RawJobRecord[]> {
  const slug = company.atsSlug ?? company.slug;
  const endpoint = `https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(slug)}/postings`;
  console.log(`[SmartRecruiters @ ${company.name}] Starting scrape → ${endpoint}`);
  try {
    const res = await fetch(endpoint, { cache: "no-store" });
    const payload = (await res.json()) as { content?: Record<string, unknown>[]; totalFound?: number };
    const jobs = payload.content ?? [];
    console.log(
      `[SmartRecruiters @ ${company.name}] HTTP ${res.status} — ${jobs.length} jobs in response (totalFound=${payload.totalFound ?? "n/a"})`,
    );
    if (!res.ok) return [];
    return jobs.map((job) => toRawJob(company, job));
  } catch (e) {
    console.warn(
      `[SmartRecruiters @ ${company.name}] FAILED — ${e instanceof Error ? e.name : "Error"}: ${String(e)}`,
    );
    return [];
  }
}

async function scrapeWorkday(company: CompanyRecord): Promise<RawJobRecord[]> {
  const base = (company.workdayUrl ?? company.careersPageUrl).replace(/\/$/, "");
  const searchUrl = `${base}/jobs?q=product+manager&workerSubType=Regular`;
  console.log(`[Workday @ ${company.name}] Starting scrape → ${searchUrl}`);
  try {
    const res = await fetch(searchUrl, {
      cache: "no-store",
      headers: { "User-Agent": "VacancyBible/1.0 (job search)" },
    });
    const html = await res.text();
    console.log(`[Workday @ ${company.name}] HTTP ${res.status} — HTML ${html.length} bytes`);
    if (!res.ok) return [];

    const $ = load(html);
    const results: RawJobRecord[] = [];
    const origin = new URL(base).origin;

    $("[data-automation-id='compositeContainer'], [data-automation-id='jobItem']").each((_, el) => {
      const card = $(el);
      const titleEl = card.find("[data-automation-id='jobTitle']").first();
      const title = titleEl.text().trim();
      if (!title) return;
      const link = card.find("a[href]").first();
      let href = link.attr("href") ?? "";
      if (href.startsWith("/")) href = `${origin}${href}`;
      else if (href && !href.startsWith("http")) href = `${origin}/${href}`;
      const loc = card.find("[data-automation-id='locations']").first().text().trim();
      results.push({
        companySlug: company.slug,
        companyName: company.name,
        sourceUrl: href || searchUrl,
        title,
        location: loc || undefined,
        description: undefined,
        metadata: { workday: true },
      });
    });

    if (results.length === 0) {
      console.warn(`[Workday @ ${company.name}] Parsed 0 job cards — page structure may have changed`);
    } else {
      console.log(`[Workday @ ${company.name}] Parsed ${results.length} job cards from HTML`);
    }
    return results;
  } catch (e) {
    console.warn(`[Workday @ ${company.name}] FAILED — ${e instanceof Error ? e.name : "Error"}: ${String(e)}`);
    return [];
  }
}

async function scrapeMicrosoftCareersApi(company: CompanyRecord): Promise<RawJobRecord[]> {
  const api =
    "https://gcsservices.careers.microsoft.com/search/api/v1/search?q=product+manager&lc=India&l=en_us&pg=1&pgSz=50&o=Relevance&flt=true";
  console.log(`[Direct/Microsoft API @ ${company.name}] Starting scrape → ${api}`);
  try {
    const res = await fetch(api, { cache: "no-store" });
    const json = (await res.json()) as Record<string, unknown>;
    const data = json.data as Record<string, unknown> | undefined;
    const jobs =
      (data?.jobs as unknown[]) ??
      (json.value as unknown[]) ??
      (json.results as unknown[]) ??
      [];
    const list = Array.isArray(jobs) ? jobs : [];
    console.log(`[Direct/Microsoft API @ ${company.name}] HTTP ${res.status} — ${list.length} jobs in response`);
    return list.map((j, i) => {
      const job = j as {
        title?: string;
        jobTitle?: string;
        properties?: { url?: string; locations?: string[] };
        externalUrl?: string;
      };
      const title = job.title ?? job.jobTitle ?? "Role";
      const url = job.properties?.url ?? job.externalUrl ?? `https://jobs.careers.microsoft.com/?idx=${i}`;
      const location = job.properties?.locations?.join(", ");
      return {
        companySlug: company.slug,
        companyName: company.name,
        sourceUrl: url,
        title,
        location,
        metadata: { microsoftApi: true },
      };
    });
  } catch (e) {
    console.warn(`[Direct/Microsoft API @ ${company.name}] FAILED — ${String(e)}`);
    return [];
  }
}

async function scrapeDirect(company: CompanyRecord): Promise<RawJobRecord[]> {
  if (company.slug === "microsoft") {
    const apiJobs = await scrapeMicrosoftCareersApi(company);
    if (apiJobs.length > 0) return apiJobs;
  }

  const url = company.careersPageUrl;
  console.log(`[Direct @ ${company.name}] Starting scrape → ${url}`);
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "User-Agent": "VacancyBible/1.0 (job search)" },
    });
    const html = await res.text();
    console.log(`[Direct @ ${company.name}] HTTP ${res.status} — HTML ${html.length} bytes`);
    if (!res.ok) return [];

    if (company.slug === "google") {
      const $ = load(html);
      const results: RawJobRecord[] = [];
      $("li").each((_, el) => {
        const li = $(el);
        const title = li.find("h3").first().text().trim();
        const link = li.find("a[href*='jobs']").first().attr("href") ?? li.find("a").first().attr("href");
        if (!title || !link) return;
        const abs = link.startsWith("http") ? link : `https://careers.google.com${link}`;
        results.push({
          companySlug: company.slug,
          companyName: company.name,
          sourceUrl: abs,
          title,
          location: li.find("span").first().text().trim() || undefined,
          metadata: { googleHtml: true },
        });
      });
      console.log(`[Direct @ ${company.name}] Heuristic parse — ${results.length} rows`);
      if (results.length > 0) return results;
    }

    const hasPmKeyword = /product manager|product management|product owner|\/job/i.test(html);
    if (!hasPmKeyword) {
      console.warn(`[Direct @ ${company.name}] No PM-related keywords in HTML — returning 0`);
      return [];
    }
    return [
      {
        companySlug: company.slug,
        companyName: company.name,
        sourceUrl: url,
        title: `${company.name} — Product / PM roles (page match)`,
        location: company.hqCity ?? "India",
        description: "Keyword match on careers HTML (generic fallback).",
        metadata: { directPortal: true },
      },
    ];
  } catch (e) {
    console.warn(`[Direct @ ${company.name}] FAILED — ${e instanceof Error ? e.name : "Error"}: ${String(e)}`);
    return [];
  }
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
  } catch (error) {
    console.error(`[${company.atsPlatform} @ ${company.name}] Request failed:`, error);
    return [];
  }
}
