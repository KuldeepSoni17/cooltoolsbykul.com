export interface DetectionResult {
  company_name: string;
  canonical_url: string;
  ats_platform: "greenhouse" | "lever" | "ashby" | "smartrecruiters" | "workday" | "custom";
  ats_slug: string;
  api_url: string;
  api_method: "GET" | "POST";
  api_payload?: Record<string, unknown>;
  total_jobs_found: number;
  pm_roles_found: number;
  sample_roles: string[];
  confidence: "high" | "medium" | "low";
  notes?: string;
}

const PM_PATTERNS = [
  "senior product manager",
  "senior pm",
  "lead product manager",
  "lead pm",
  "principal product manager",
  "principal pm",
  "group product manager",
  "group pm",
  "staff product manager",
  "director of product",
  "head of product",
  "product lead",
  "associate director",
  "vp of product",
  "sr. product manager",
  "sr product manager",
];

function isPMRole(title: string): boolean {
  const t = title.toLowerCase();
  return PM_PATTERNS.some((p) => t.includes(p));
}

function normalizeCompanyName(slug: string): string {
  return slug
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function fetchGreenhouseJobs(slug: string): Promise<{ total: number; pmRoles: string[] }> {
  const resp = await fetch(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`, {
    headers: { "User-Agent": "VacancyBible/1.0" },
  });
  if (!resp.ok) throw new Error(`Greenhouse returned ${resp.status}`);
  const data = (await resp.json()) as { jobs?: Array<{ title?: string }> };
  const jobs = data.jobs ?? [];
  const titles = jobs.map((j) => j.title ?? "").filter(Boolean);
  return { total: titles.length, pmRoles: titles.filter(isPMRole) };
}

async function fetchLeverJobs(slug: string): Promise<{ total: number; pmRoles: string[] }> {
  const resp = await fetch(`https://api.lever.co/v0/postings/${slug}?mode=json`, {
    headers: { "User-Agent": "VacancyBible/1.0" },
  });
  if (!resp.ok) throw new Error(`Lever returned ${resp.status}`);
  const jobs = (await resp.json()) as Array<{ text?: string }>;
  if (!Array.isArray(jobs)) throw new Error("Lever returned non-array");
  const titles = jobs.map((j) => j.text ?? "").filter(Boolean);
  return { total: titles.length, pmRoles: titles.filter(isPMRole) };
}

async function fetchAshbyJobs(slug: string): Promise<{ total: number; pmRoles: string[] }> {
  const resp = await fetch("https://api.ashbyhq.com/posting-api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "VacancyBible/1.0" },
    body: JSON.stringify({
      query: `query Jobs($slug: String!) {
        jobBoard: ashbyHQJobBoard(organizationHostedJobsPageName: $slug) {
          jobPostings { title }
        }
      }`,
      variables: { slug },
    }),
  });
  const data = (await resp.json()) as {
    errors?: Array<{ message?: string }>;
    data?: { jobBoard?: { jobPostings?: Array<{ title?: string }> } };
  };
  if (data.errors?.length) throw new Error(data.errors[0]?.message || "Ashby request failed");
  const titles = (data.data?.jobBoard?.jobPostings ?? []).map((j) => j.title ?? "").filter(Boolean);
  return { total: titles.length, pmRoles: titles.filter(isPMRole) };
}

async function fetchSmartRecruitersJobs(slug: string): Promise<{ total: number; pmRoles: string[] }> {
  const resp = await fetch(`https://api.smartrecruiters.com/v1/companies/${slug}/postings?limit=100`, {
    headers: { "User-Agent": "VacancyBible/1.0" },
  });
  if (!resp.ok) throw new Error(`SmartRecruiters returned ${resp.status}`);
  const data = (await resp.json()) as { totalFound?: number; content?: Array<{ name?: string }> };
  const titles = (data.content ?? []).map((j) => j.name ?? "").filter(Boolean);
  return { total: data.totalFound ?? titles.length, pmRoles: titles.filter(isPMRole) };
}

export async function detectATS(inputUrl: string): Promise<DetectionResult | null> {
  const url = inputUrl.trim();
  const greenhouse = url.match(/boards\.greenhouse\.io\/([^/?#]+)/i);
  const lever = url.match(/jobs\.lever\.co\/([^/?#]+)/i);
  const ashby = url.match(/jobs\.ashbyhq\.com\/([^/?#]+)/i);
  const smart = url.match(/careers\.smartrecruiters\.com\/([^/?#]+)/i);

  const run = async (
    platform: DetectionResult["ats_platform"],
    slug: string,
    apiUrl: string,
    method: "GET" | "POST",
  ): Promise<DetectionResult> => {
    try {
      const result =
        platform === "greenhouse"
          ? await fetchGreenhouseJobs(slug)
          : platform === "lever"
            ? await fetchLeverJobs(slug)
            : platform === "ashby"
              ? await fetchAshbyJobs(slug)
              : await fetchSmartRecruitersJobs(slug);
      return {
        company_name: normalizeCompanyName(slug),
        canonical_url: url,
        ats_platform: platform,
        ats_slug: slug,
        api_url: apiUrl,
        api_method: method,
        total_jobs_found: result.total,
        pm_roles_found: result.pmRoles.length,
        sample_roles: result.pmRoles.slice(0, 5),
        confidence: "high",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown detection error";
      return {
        company_name: normalizeCompanyName(slug),
        canonical_url: url,
        ats_platform: platform,
        ats_slug: slug,
        api_url: apiUrl,
        api_method: method,
        total_jobs_found: 0,
        pm_roles_found: 0,
        sample_roles: [],
        confidence: "low",
        notes: message,
      };
    }
  };

  if (greenhouse?.[1]) {
    const slug = greenhouse[1];
    return run("greenhouse", slug, `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`, "GET");
  }
  if (lever?.[1]) {
    const slug = lever[1];
    return run("lever", slug, `https://api.lever.co/v0/postings/${slug}?mode=json`, "GET");
  }
  if (ashby?.[1]) {
    const slug = ashby[1];
    return run("ashby", slug, "https://api.ashbyhq.com/posting-api/graphql", "POST");
  }
  if (smart?.[1]) {
    const slug = smart[1];
    return run("smartrecruiters", slug, `https://api.smartrecruiters.com/v1/companies/${slug}/postings?limit=100`, "GET");
  }

  return {
    company_name: extractCompanyNameFromUrl(url),
    canonical_url: url,
    ats_platform: "custom",
    ats_slug: "",
    api_url: url,
    api_method: "GET",
    total_jobs_found: 0,
    pm_roles_found: 0,
    sample_roles: [],
    confidence: "low",
    notes: "Custom career portal. We'll do our best to scan it.",
  };
}

function extractCompanyNameFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname
      .replace(/^(www|careers|jobs|work)\./i, "")
      .replace(/\.(com|io|co|net|org|in)(\..*)?$/i, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return "Unknown Company";
  }
}
