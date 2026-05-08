import { load } from "cheerio";
import { scrapeCompany as scrapeSharedCompany } from "@/lib/ats-scrapers";
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
  const jobs = await scrapeSharedCompany("greenhouse", slug, company.name);
  return jobs.map((job) => ({
    companySlug: company.slug,
    companyName: company.name,
    sourceUrl: job.url || company.careersPageUrl,
    title: job.title || "Unknown role",
    location: job.location || undefined,
    description: job.description || undefined,
    metadata: { sharedScraper: true, platform: "greenhouse" },
  }));
}

async function scrapeLever(company: CompanyRecord): Promise<RawJobRecord[]> {
  const slug = resolvedLeverSlug(company);
  const jobs = await scrapeSharedCompany("lever", slug, company.name);
  return jobs.map((job) => ({
    companySlug: company.slug,
    companyName: company.name,
    sourceUrl: job.url || company.careersPageUrl,
    title: job.title || "Unknown role",
    location: job.location || undefined,
    description: job.description || undefined,
    metadata: { sharedScraper: true, platform: "lever" },
  }));
}

async function scrapeAshby(company: CompanyRecord): Promise<RawJobRecord[]> {
  const slug = resolvedAshbySlug(company);
  const jobs = await scrapeSharedCompany("ashby", slug, company.name);
  return jobs.map((job) => ({
    companySlug: company.slug,
    companyName: company.name,
    sourceUrl: job.url || company.careersPageUrl,
    title: job.title || "Unknown role",
    location: job.location || undefined,
    description: job.description || undefined,
    metadata: { sharedScraper: true, platform: "ashby" },
  }));
}

async function scrapeSmartRecruiters(company: CompanyRecord): Promise<RawJobRecord[]> {
  const slug = company.atsSlug ?? company.slug;
  const jobs = await scrapeSharedCompany("smartrecruiters", slug, company.name);
  return jobs.map((job) => ({
    companySlug: company.slug,
    companyName: company.name,
    sourceUrl: job.url || company.careersPageUrl,
    title: job.title || "Unknown role",
    location: job.location || undefined,
    description: job.description || undefined,
    metadata: { sharedScraper: true, platform: "smartrecruiters" },
  }));
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
