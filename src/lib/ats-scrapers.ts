export interface RawJob {
  title: string;
  url: string;
  location: string;
  description: string;
  platform: string;
  companyName: string;
  companySlug: string;
}

async function fetchJson(url: string, init?: RequestInit): Promise<unknown | null> {
  try {
    const resp = await fetch(url, {
      cache: "no-store",
      headers: { "User-Agent": "VacancyBible/1.0", ...(init?.headers ?? {}) },
      ...init,
    });
    if (!resp.ok) {
      console.log(`[ATS] ${url} -> HTTP ${resp.status}`);
      return null;
    }
    return await resp.json();
  } catch (error) {
    console.error(`[ATS] ${url} failed`, error);
    return null;
  }
}

export async function scrapeGreenhouse(slug: string, companyName: string): Promise<RawJob[]> {
  const data = (await fetchJson(
    `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(slug)}/jobs?content=true`,
  )) as { jobs?: Array<{ title?: string; absolute_url?: string; offices?: Array<{ name?: string }>; content?: string }> } | null;
  const jobs = data?.jobs ?? [];
  return jobs
    .filter((j) => Boolean(j.absolute_url))
    .map((j) => ({
      title: j.title ?? "",
      url: j.absolute_url ?? "",
      location: j.offices?.[0]?.name ?? "",
      description: j.content ?? "",
      platform: "greenhouse",
      companyName,
      companySlug: slug,
    }));
}

export async function scrapeLever(slug: string, companyName: string): Promise<RawJob[]> {
  const data = (await fetchJson(
    `https://api.lever.co/v0/postings/${encodeURIComponent(slug)}?mode=json`,
  )) as Array<{ text?: string; hostedUrl?: string; categories?: { location?: string }; descriptionPlain?: string }> | null;
  if (!Array.isArray(data)) return [];
  return data
    .filter((j) => Boolean(j.hostedUrl))
    .map((j) => ({
      title: j.text ?? "",
      url: j.hostedUrl ?? "",
      location: j.categories?.location ?? "",
      description: j.descriptionPlain ?? "",
      platform: "lever",
      companyName,
      companySlug: slug,
    }));
}

export async function scrapeAshby(slug: string, companyName: string): Promise<RawJob[]> {
  const payload = (await fetchJson("https://api.ashbyhq.com/posting-api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `query Jobs($slug: String!) {
        jobBoard: ashbyHQJobBoard(organizationHostedJobsPageName: $slug) {
          jobPostings { title externalLink locationName descriptionSocial }
        }
      }`,
      variables: { slug },
    }),
  })) as {
    errors?: Array<{ message?: string }>;
    data?: { jobBoard?: { jobPostings?: Array<{ title?: string; externalLink?: string; locationName?: string; descriptionSocial?: string }> } };
  } | null;
  if (!payload || payload.errors?.length) return [];
  const jobs = payload.data?.jobBoard?.jobPostings ?? [];
  return jobs
    .filter((j) => Boolean(j.externalLink))
    .map((j) => ({
      title: j.title ?? "",
      url: j.externalLink ?? "",
      location: j.locationName ?? "",
      description: j.descriptionSocial ?? "",
      platform: "ashby",
      companyName,
      companySlug: slug,
    }));
}

export async function scrapeSmartRecruiters(slug: string, companyName: string): Promise<RawJob[]> {
  const data = (await fetchJson(
    `https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(slug)}/postings?limit=100`,
  )) as {
    content?: Array<{ id?: string; name?: string; location?: { city?: string; country?: string }; jobAd?: { sections?: { jobDescription?: { text?: string } } } }>;
  } | null;
  const jobs = data?.content ?? [];
  return jobs
    .filter((j) => Boolean(j.id))
    .map((j) => ({
      title: j.name ?? "",
      url: `https://careers.smartrecruiters.com/${slug}/${j.id}`,
      location: [j.location?.city, j.location?.country].filter(Boolean).join(", "),
      description: j.jobAd?.sections?.jobDescription?.text ?? "",
      platform: "smartrecruiters",
      companyName,
      companySlug: slug,
    }));
}

export async function scrapeCompany(platform: string, slug: string, name: string): Promise<RawJob[]> {
  if (!slug) return [];
  if (platform === "greenhouse") return scrapeGreenhouse(slug, name);
  if (platform === "lever") return scrapeLever(slug, name);
  if (platform === "ashby") return scrapeAshby(slug, name);
  if (platform === "smartrecruiters") return scrapeSmartRecruiters(slug, name);
  return [];
}

const PM_PATTERNS = [
  "senior product manager",
  "senior pm",
  "sr. product manager",
  "sr product manager",
  "lead product manager",
  "lead pm",
  "principal product manager",
  "principal pm",
  "group product manager",
  "group pm",
  "staff product manager",
  "director of product",
  "head of product",
  "vp of product",
  "product lead",
  "associate director",
  "senior associate product",
];

export function isPMRole(title: string): boolean {
  const t = title.toLowerCase();
  return PM_PATTERNS.some((p) => t.includes(p));
}

export function filterPMRoles(jobs: RawJob[], flex = 1): RawJob[] {
  if (flex === 2) {
    return jobs.filter((j) => {
      const t = j.title.toLowerCase();
      return t.includes("product manager") || t.includes(" pm ");
    });
  }
  return jobs.filter((j) => isPMRole(j.title));
}
