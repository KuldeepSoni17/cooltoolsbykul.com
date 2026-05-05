import { hashUrl } from "./cache";
import { supabaseAdmin } from "./supabase-server";
import type { DetectionResult } from "./ats-detector";

type RawWatchJob = {
  title: string;
  url: string;
  location: string;
  description: string;
};

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
];

function isPMRole(title: string): boolean {
  const t = title.toLowerCase();
  return PM_PATTERNS.some((p) => t.includes(p));
}

export async function scrapeAndSaveJobs(detection: DetectionResult, watchedCompanyId: string): Promise<Array<{ id: string; is_new: boolean }>> {
  let rawJobs: RawWatchJob[] = [];

  try {
    if (detection.ats_platform === "greenhouse") rawJobs = await scrapeGreenhouse(detection.ats_slug);
    else if (detection.ats_platform === "lever") rawJobs = await scrapeLever(detection.ats_slug);
    else if (detection.ats_platform === "ashby") rawJobs = await scrapeAshby(detection.ats_slug);
    else if (detection.ats_platform === "smartrecruiters") rawJobs = await scrapeSmartRecruiters(detection.ats_slug);
  } catch (e) {
    console.error(`[WatchScraper] scrape failed for ${detection.company_name}`, e);
    return [];
  }

  const pmJobs = rawJobs.filter((j) => isPMRole(j.title));
  const savedJobs: Array<{ id: string; is_new: boolean }> = [];
  const activeHashes: string[] = [];

  for (const job of pmJobs) {
    const urlHash = hashUrl(job.url);
    activeHashes.push(urlHash);
    const { data: existing } = await supabaseAdmin.from("jobs").select("id").eq("source_url_hash", urlHash).maybeSingle();

    if (existing?.id) {
      await supabaseAdmin
        .from("jobs")
        .update({ last_seen_at: new Date().toISOString(), is_active: true })
        .eq("id", existing.id);
      savedJobs.push({ id: existing.id, is_new: false });
      continue;
    }

    const { data: inserted } = await supabaseAdmin
      .from("jobs")
      .insert({
        source_url: job.url,
        source_url_hash: urlHash,
        company_name: detection.company_name,
        company_slug: detection.ats_slug || detection.company_name.toLowerCase().replace(/\s+/g, "-"),
        exact_role_title: job.title,
        location: job.location || "",
        ats_platform: detection.ats_platform,
        source_label: `${detection.ats_platform} @ ${detection.company_name}`,
        raw_description: job.description || "",
        watched_company_id: watchedCompanyId,
        first_seen_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
        is_active: true,
        is_new: true,
      })
      .select("id")
      .single();

    if (inserted?.id) savedJobs.push({ id: inserted.id, is_new: true });
  }

  if (activeHashes.length > 0) {
    await supabaseAdmin
      .from("jobs")
      .update({ is_active: false })
      .eq("watched_company_id", watchedCompanyId)
      .not("source_url_hash", "in", `(${activeHashes.map((h) => `'${h}'`).join(",")})`);
  }

  await supabaseAdmin.from("watched_companies").update({ last_checked_at: new Date().toISOString() }).eq("id", watchedCompanyId);
  return savedJobs;
}

async function scrapeGreenhouse(slug: string): Promise<RawWatchJob[]> {
  const resp = await fetch(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`, {
    headers: { "User-Agent": "VacancyBible/1.0" },
  });
  if (!resp.ok) return [];
  const data = (await resp.json()) as { jobs?: Array<{ title?: string; absolute_url?: string; offices?: Array<{ name?: string }>; content?: string }> };
  return (data.jobs ?? [])
    .filter((j) => Boolean(j.absolute_url))
    .map((j) => ({
      title: j.title ?? "",
      url: j.absolute_url ?? "",
      location: j.offices?.[0]?.name ?? "",
      description: j.content ?? "",
    }));
}

async function scrapeLever(slug: string): Promise<RawWatchJob[]> {
  const resp = await fetch(`https://api.lever.co/v0/postings/${slug}?mode=json`, {
    headers: { "User-Agent": "VacancyBible/1.0" },
  });
  if (!resp.ok) return [];
  const jobs = (await resp.json()) as Array<{ text?: string; hostedUrl?: string; categories?: { location?: string }; descriptionPlain?: string }>;
  if (!Array.isArray(jobs)) return [];
  return jobs
    .filter((j) => Boolean(j.hostedUrl))
    .map((j) => ({
      title: j.text ?? "",
      url: j.hostedUrl ?? "",
      location: j.categories?.location ?? "",
      description: j.descriptionPlain ?? "",
    }));
}

async function scrapeAshby(slug: string): Promise<RawWatchJob[]> {
  const resp = await fetch("https://api.ashbyhq.com/posting-api/graphql", {
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
  });
  if (!resp.ok) return [];
  const data = (await resp.json()) as {
    data?: { jobBoard?: { jobPostings?: Array<{ title?: string; externalLink?: string; locationName?: string; descriptionSocial?: string }> } };
  };
  return (data.data?.jobBoard?.jobPostings ?? [])
    .filter((j) => Boolean(j.externalLink))
    .map((j) => ({
      title: j.title ?? "",
      url: j.externalLink ?? "",
      location: j.locationName ?? "",
      description: j.descriptionSocial ?? "",
    }));
}

async function scrapeSmartRecruiters(slug: string): Promise<RawWatchJob[]> {
  const resp = await fetch(`https://api.smartrecruiters.com/v1/companies/${slug}/postings?limit=100`, {
    headers: { "User-Agent": "VacancyBible/1.0" },
  });
  if (!resp.ok) return [];
  const data = (await resp.json()) as {
    content?: Array<{ id?: string; name?: string; location?: { city?: string; country?: string }; jobAd?: { sections?: { jobDescription?: { text?: string } } } }>;
  };
  return (data.content ?? [])
    .filter((j) => Boolean(j.id))
    .map((j) => ({
      title: j.name ?? "",
      url: `https://careers.smartrecruiters.com/${slug}/${j.id}`,
      location: [j.location?.city, j.location?.country].filter(Boolean).join(", "),
      description: j.jobAd?.sections?.jobDescription?.text ?? "",
    }));
}
