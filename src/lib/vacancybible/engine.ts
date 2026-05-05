import { runFullDiscovery } from "@/lib/discovery";
import { loadActiveCompanies } from "@/lib/load-companies";
import { getExistingJob, hashQuery, hashUrl, saveSearchCache, touchJobSeen } from "@/lib/cache";
import { supabaseAdmin } from "@/lib/supabase-server";
import { enrichAndRankJobs } from "./enrichment";
import { scrapeCompany } from "./scrapers";
import { buildSerpapiQueries, searchGoogleJobs } from "./serpapiScraper";
import { scrapeNaukri } from "./naukri";
import {
  getJobs,
  pushProgress,
  saveDiagnostics,
  saveJobs,
  saveSession,
  updateSession,
} from "./store";
import { makeId, shouldMatchText } from "./utils";
import type {
  CompanyRecord,
  RawJobRecord,
  SearchInput,
  SearchProgressEvent,
  SearchSession,
} from "./types";

const companyErrorCounts = new Map<string, number>();
let discoveryPromise: Promise<unknown> | null = null;
let discoveryLastRunMs = 0;

function emit(event: SearchProgressEvent): void {
  pushProgress(event);
}

function nowIso(): string {
  return new Date().toISOString();
}

export function createSession(query: SearchInput): SearchSession {
  const session: SearchSession = {
    id: makeId("session"),
    query,
    status: "running",
    startedAt: nowIso(),
    companiesHit: 0,
    jobsFound: 0,
    jobsNew: 0,
  };
  saveSession(session);
  emit({
    sessionId: session.id,
    stage: "queued",
    message: "Search queued.",
    processedCompanies: 0,
    totalCompanies: 0,
    jobsFound: 0,
    timestamp: nowIso(),
  });
  return session;
}

async function scrapeWithResilience(company: CompanyRecord): Promise<RawJobRecord[]> {
  const currentErrors = companyErrorCounts.get(company.slug) ?? 0;
  if (currentErrors > 5) return [];
  const raw = await scrapeCompany(company);
  if (raw.length === 0) {
    companyErrorCounts.set(company.slug, currentErrors + 1);
  } else {
    companyErrorCounts.set(company.slug, 0);
  }
  return raw;
}

async function safeScrape(company: CompanyRecord): Promise<RawJobRecord[]> {
  try {
    const raw = await scrapeWithResilience(company);
    console.log(`[Runner] ✓ ${company.name} -> ${raw.length} jobs fetched`);
    return raw;
  } catch (error) {
    console.log(
      `[Runner] ✗ ${company.name} -> ${error instanceof Error ? error.name : "Error"}: ${String(error)}`,
    );
    return [];
  }
}

export async function runSearch(sessionId: string): Promise<void> {
  const session = updateSession(sessionId, {});
  if (!session) return;

  console.log(`[Search] Query received: ${JSON.stringify(session.query)}`);

  const startedAtMs = Date.now();
  const notes: string[] = [];
  const nowMs = Date.now();
  if (!discoveryPromise && nowMs - discoveryLastRunMs > 1000 * 60 * 60 * 6) {
    notes.push("Auto discovery started before search.");
    discoveryPromise = runFullDiscovery()
      .then((result) => {
        notes.push(`Auto discovery finished. New companies added: ${result.newly_saved}`);
        discoveryLastRunMs = Date.now();
      })
      .catch((error) => {
        notes.push(`Auto discovery failed: ${String(error)}`);
      })
      .finally(() => {
        discoveryPromise = null;
      });
  }

  if (discoveryPromise) {
    emit({
      sessionId,
      stage: "running",
      message: "Updating company registry from ATS discovery feeds",
      processedCompanies: 0,
      totalCompanies: 0,
      jobsFound: 0,
      timestamp: nowIso(),
    });
    await discoveryPromise;
  }

  const companies = await loadActiveCompanies();
  const companiesBySlug = new Map(companies.map((company) => [company.slug, company]));
  emit({
    sessionId,
    stage: "running",
    message: `Running search across ${companies.length} companies.`,
    processedCompanies: 0,
    totalCompanies: companies.length,
    jobsFound: 0,
    timestamp: nowIso(),
  });

  const rawJobs: RawJobRecord[] = [];
  const sourceCounts: Record<string, number> = {
    atsDirect: 0,
    serpapi: 0,
    naukri: 0,
  };
  for (let i = 0; i < companies.length; i += 1) {
    const company = companies[i];
    emit({
      sessionId,
      stage: "scraping_company",
      message: `Scraping ${company.name}`,
      processedCompanies: i,
      totalCompanies: companies.length,
      jobsFound: rawJobs.length,
      timestamp: nowIso(),
    });
    const jobs = await safeScrape(company);
    const matchedJobs = jobs.filter((job) => shouldMatchText(`${job.title} ${job.location ?? ""}`, session.query));
    console.log(
      `[${company.atsPlatform} @ ${company.name}] Fetched ${jobs.length} total jobs, ${matchedJobs.length} matched title filter -> returning ${matchedJobs.length}`,
    );
    rawJobs.push(...matchedJobs);
    sourceCounts.atsDirect += matchedJobs.length;
    emit({
      sessionId,
      stage: "scraping_company",
      message: `Completed ${company.name}`,
      processedCompanies: i + 1,
      totalCompanies: companies.length,
      jobsFound: rawJobs.length,
      timestamp: nowIso(),
    });
  }

  console.log(`[Runner] Total raw records collected from ATS/direct: ${rawJobs.length}`);

  const titleFlex = session.query.flexibility.title === "OPEN" ? 2 : session.query.flexibility.title === "FLEXIBLE" ? 1 : 0;
  const locationFlex =
    session.query.flexibility.location === "OPEN"
      ? 2
      : session.query.flexibility.location === "FLEXIBLE"
        ? 1
        : 0;
  const serpQueries = buildSerpapiQueries({
    title: session.query.title,
    location: session.query.location,
    titleFlex,
    locationFlex,
  });
  for (let i = 0; i < serpQueries.length; i += 1) {
    const q = serpQueries[i];
    emit({
      sessionId,
      stage: "running",
      message: `Searching Google Jobs (${i + 1}/${serpQueries.length}): ${q.query} in ${q.location}`,
      processedCompanies: companies.length,
      totalCompanies: companies.length,
      jobsFound: rawJobs.length,
      timestamp: nowIso(),
    });
    const googleResults = await searchGoogleJobs(q.query, q.location, q.datePosted, 2);
    const matchedGoogle = googleResults.filter((job) =>
      shouldMatchText(`${job.title} ${job.location ?? ""}`, session.query),
    );
    console.log(
      `[Runner/SerpAPI] Query ${i + 1}/${serpQueries.length} returned ${googleResults.length}, matched ${matchedGoogle.length}`,
    );
    rawJobs.push(...matchedGoogle);
    sourceCounts.serpapi += matchedGoogle.length;
  }

  const locationLower = (session.query.location ?? "").toLowerCase();
  if (!session.query.location || locationLower.includes("india")) {
    emit({
      sessionId,
      stage: "running",
      message: "Scanning Naukri India listings",
      processedCompanies: companies.length,
      totalCompanies: companies.length,
      jobsFound: rawJobs.length,
      timestamp: nowIso(),
    });
    const naukriResults = await scrapeNaukri(2);
    const matchedNaukri = naukriResults.filter((job) =>
      shouldMatchText(`${job.title} ${job.location ?? ""}`, session.query),
    );
    console.log(
      `[Runner/Naukri] Returned ${naukriResults.length}, matched ${matchedNaukri.length}`,
    );
    rawJobs.push(...matchedNaukri);
    sourceCounts.naukri += matchedNaukri.length;
  }

  emit({
    sessionId,
    stage: "enriching",
    message: "Applying enrichment and confidence labels.",
    processedCompanies: companies.length,
    totalCompanies: companies.length,
    jobsFound: rawJobs.length,
    timestamp: nowIso(),
  });

  const enriched = enrichAndRankJobs(rawJobs, companiesBySlug);
  const savedJobIds: string[] = [];
  for (const job of enriched) {
    const sourceUrlHash = hashUrl(job.sourceUrl);
    const existing = await getExistingJob(sourceUrlHash);
    if (existing?.id) {
      await touchJobSeen(existing.id);
      savedJobIds.push(existing.id);
      continue;
    }
    const { data, error } = await supabaseAdmin
      .from("jobs")
      .insert({
        source_url: job.sourceUrl,
        source_url_hash: sourceUrlHash,
        company_slug: job.companyName.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        company_name: job.companyName.value,
        ats_platform: job.atsPlatform,
        source_label: `${job.atsPlatform} @ ${job.companyName.value}`,
        exact_role_title: job.exactRoleTitle.value,
        location: job.location.value,
        work_mode: job.workMode.value,
        domain: job.domain.value,
        overall_score: (job.companyStability.value ?? 5) * 10 + (job.wlbScore.value ?? 5),
        brand_value_score: job.wlbScore.value,
        stability_score: job.companyStability.value,
        wlb_score: job.wlbScore.value,
        layoff_risk_score: job.layoffRisk.value,
        analysis_notes: job.analysisNotes,
        raw_description: job.rawDescription,
        first_seen_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
        enriched_at: new Date().toISOString(),
        is_active: true,
      })
      .select("id")
      .single();
    if (!error && data?.id) savedJobIds.push(data.id);
  }
  const queryParams = {
    title: session.query.title,
    location: session.query.location,
    experienceMin: session.query.experienceMin,
    experienceMax: session.query.experienceMax,
    packageLpaMin: session.query.packageLpaMin,
    domain: session.query.domain,
    flexibility: session.query.flexibility,
  };
  const queryHash = hashQuery(queryParams);
  await saveSearchCache(queryHash, queryParams, savedJobIds);
  if (rawJobs.length > 0 && enriched.length === 0) {
    notes.push("Raw jobs existed but enrichment produced zero results.");
  }
  if (sourceCounts.atsDirect === 0) {
    notes.push("ATS/direct source returned zero matched jobs.");
  }
  console.log("[Runner] Source summary", {
    sessionId,
    companyCount: companies.length,
    sourceCounts,
    rawJobsBeforeEnrichment: rawJobs.length,
    enrichedJobs: enriched.length,
    notes,
  });
  saveJobs(sessionId, enriched);
  const durationMs = Date.now() - startedAtMs;

  updateSession(sessionId, {
    status: "completed",
    completedAt: nowIso(),
    companiesHit: companies.length,
    jobsFound: enriched.length,
    jobsNew: enriched.length,
    durationMs,
  });

  saveDiagnostics(sessionId, {
    startedAt: new Date(startedAtMs).toISOString(),
    companyCountAtStart: companies.length,
    sourceCounts,
    rawJobsBeforeEnrichment: rawJobs.length,
    enrichedJobs: enriched.length,
    notes,
  });

  emit({
    sessionId,
    stage: "completed",
    message: "Search complete.",
    processedCompanies: companies.length,
    totalCompanies: companies.length,
    jobsFound: getJobs(sessionId).length,
    timestamp: nowIso(),
  });
}

export function resetCompanyCircuitBreaker(slug: string): boolean {
  if (!companyErrorCounts.has(slug)) return false;
  companyErrorCounts.set(slug, 0);
  return true;
}
