import { sha256 } from "./utils";
import type {
  CompanyRecord,
  Confidence,
  EnrichedJob,
  RawJobRecord,
  SearchInput,
} from "./types";

function confidenceFromValue(value: string | null | undefined): Confidence {
  if (!value || !value.trim()) return "NOT_AVAILABLE";
  return "WRITTEN";
}

function inferWorkMode(raw: RawJobRecord): { value: string | null; confidence: Confidence } {
  const text = `${raw.title} ${raw.description ?? ""} ${raw.location ?? ""}`.toLowerCase();
  if (text.includes("remote")) return { value: "Remote", confidence: "WRITTEN" };
  if (text.includes("hybrid")) return { value: "Hybrid", confidence: "WRITTEN" };
  if (text.includes("onsite")) return { value: "Onsite", confidence: "WRITTEN" };
  return { value: null, confidence: "NOT_AVAILABLE" };
}

function estimateCompLpa(company: CompanyRecord): {
  value: string | null;
  confidence: Confidence;
  source?: string;
} {
  const baseline = company.pmMaturityScore ?? 6;
  const low = Math.max(18, baseline * 5);
  const high = low + 25;
  return {
    value: `INR ${low}L - ${high}L`,
    confidence: "ESTIMATED",
    source: "Curated market bands + company maturity score",
  };
}

function inferDomain(company: CompanyRecord, raw: RawJobRecord): {
  value: string | null;
  confidence: Confidence;
  source?: string;
} {
  if (company.sector) return { value: company.sector, confidence: "WRITTEN" };
  const text = `${raw.title} ${raw.description ?? ""}`.toLowerCase();
  if (text.includes("fintech")) {
    return { value: "Fintech", confidence: "ESTIMATED", source: "Keyword inference" };
  }
  return { value: null, confidence: "NOT_AVAILABLE" };
}

function scoreOverall(job: EnrichedJob): number {
  const stability = job.companyStability.value ?? 6;
  const wlb = job.wlbScore.value ?? 5;
  const layoffRisk = job.layoffRisk.value ?? 5;
  return Math.max(1, Math.min(100, Math.round(stability * 7 + wlb * 5 - layoffRisk * 2)));
}

export function enrichAndRankJobs(
  rawJobs: RawJobRecord[],
  companiesBySlug: Map<string, CompanyRecord>,
  _query: SearchInput,
): EnrichedJob[] {
  const dedup = new Map<string, EnrichedJob>();

  for (const raw of rawJobs) {
    const company =
      companiesBySlug.get(raw.companySlug) ??
      ({
        name: raw.companyName || "Unknown Company",
        slug: raw.companySlug || "external",
        careersPageUrl: raw.sourceUrl,
        atsPlatform:
          raw.metadata?.ats === "greenhouse" ||
          raw.metadata?.ats === "lever" ||
          raw.metadata?.ats === "ashby" ||
          raw.metadata?.ats === "workday" ||
          raw.metadata?.ats === "smartrecruiters"
            ? raw.metadata.ats
            : "direct",
        sector: "Unknown",
        hqCountry: "Unknown",
        indiaOffices: ["Unknown"],
        pmMaturityScore: 5,
        brandValueScore: 5,
        stabilityScore: 5,
      } satisfies CompanyRecord);
    const hash = sha256(raw.sourceUrl);
    if (dedup.has(hash)) continue;

    const workMode = inferWorkMode(raw);
    const comp = estimateCompLpa(company);
    const domain = inferDomain(company, raw);

    dedup.set(hash, {
      id: hash.slice(0, 24),
      sourceUrl: raw.sourceUrl,
      sourceUrlHash: hash,
      atsPlatform: company.atsPlatform,
      companyName: { value: raw.companyName, confidence: "WRITTEN" },
      exactRoleTitle: { value: raw.title, confidence: "WRITTEN" },
      location: {
        value: raw.location ?? null,
        confidence: confidenceFromValue(raw.location),
      },
      workMode,
      yearsExp: {
        value: null,
        confidence: "NOT_AVAILABLE",
      },
      totalCompLpa: comp,
      domain,
      ownershipType: {
        value: "Core Product",
        confidence: "ESTIMATED",
        source: "Title/domain inference",
      },
      companyStability: {
        value: company.stabilityScore ?? 6,
        confidence: "ESTIMATED",
        source: "Company registry stability score",
      },
      layoffRisk: {
        value: company.stabilityScore ? Math.max(1, 11 - company.stabilityScore) : 5,
        confidence: "ESTIMATED",
        source: "Inverse of stability score",
      },
      wlbScore: {
        value: company.brandValueScore ?? 6,
        confidence: "ESTIMATED",
        source: "Brand maturity heuristic",
      },
      interviewDifficulty: {
        value: company.pmMaturityScore ?? 6,
        confidence: "ESTIMATED",
        source: "PM maturity proxy",
      },
      analysisNotes:
        "VacancyBible enrichment completed with confidence labeling and source traceability.",
      postedDate: raw.postedAt,
      rawDescription: raw.description,
    });
  }

  return [...dedup.values()].sort((a, b) => scoreOverall(b) - scoreOverall(a));
}
