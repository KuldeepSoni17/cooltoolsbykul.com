import { getCompanyRegistry } from "./companyRegistry";
import { enrichAndRankJobs } from "./enrichment";
import { scrapeCompany } from "./scrapers";
import { getJobs, pushProgress, saveJobs, saveSession, updateSession } from "./store";
import { makeId } from "./utils";
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

export async function runSearch(sessionId: string): Promise<void> {
  const session = updateSession(sessionId, {});
  if (!session) return;

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

  const rawJobs: RawJobRecord[] = [];
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
    const jobs = await scrapeWithResilience(company);
    rawJobs.push(...jobs);
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
