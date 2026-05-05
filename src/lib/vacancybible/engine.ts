import { getCompanyRegistry } from "./companyRegistry";
import { enrichAndRankJobs } from "./enrichment";
import { scrapeCompany } from "./scrapers";
import { buildSerpapiQueries, searchGoogleJobs } from "./serpapiScraper";
import { scrapeNaukri } from "./naukri";
import { getJobs, pushProgress, saveJobs, saveSession, updateSession } from "./store";
import { makeId, shouldMatchText } from "./utils";
import type {
  CompanyRecord,
  RawJobRecord,
  SearchInput,
  SearchProgressEvent,
  SearchSession,
} from "./types";

const companyErrorCounts = new Map<string, number>();

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
  const companies = getCompanyRegistry(true);
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

  const tasks = companies.map(async (company, i) => {
    emit({
      sessionId,
      stage: "scraping_company",
      message: `Scraping ${company.name}`,
      processedCompanies: i,
      totalCompanies: companies.length,
      jobsFound: 0,
      timestamp: nowIso(),
    });
    const jobs = await safeScrape(company);
    const matchedJobs = jobs.filter((job) => shouldMatchText(`${job.title} ${job.location ?? ""}`, session.query));
    console.log(
      `[${company.atsPlatform} @ ${company.name}] Fetched ${jobs.length} total jobs, ${matchedJobs.length} matched title filter -> returning ${matchedJobs.length}`,
    );
    return matchedJobs;
  });

  const rawJobs: RawJobRecord[] = [];
  const taskResults = await Promise.allSettled(tasks);
  for (let i = 0; i < taskResults.length; i += 1) {
    const batch = taskResults[i];
    if (batch.status === "rejected") {
      console.log(
        `[Runner] Scraper task ${i} failed: ${batch.reason instanceof Error ? batch.reason.name : "Error"}: ${String(batch.reason)}`,
      );
      continue;
    }
    if (!Array.isArray(batch.value)) {
      console.log(`[Runner] Scraper task ${i} returned unexpected type: ${typeof batch.value}`);
      continue;
    }
    rawJobs.push(...batch.value);
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
  for (const q of serpQueries) {
    const googleResults = await searchGoogleJobs(q.query, q.location, q.datePosted, 2);
    rawJobs.push(...googleResults.filter((job) => shouldMatchText(`${job.title} ${job.location ?? ""}`, session.query)));
  }

  const locationLower = (session.query.location ?? "").toLowerCase();
  if (!session.query.location || locationLower.includes("india")) {
    const naukriResults = await scrapeNaukri(2);
    rawJobs.push(...naukriResults.filter((job) => shouldMatchText(`${job.title} ${job.location ?? ""}`, session.query)));
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

  const enriched = enrichAndRankJobs(rawJobs, companiesBySlug, session.query);
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
