import { NextResponse } from "next/server";
import { createSession, runSearch } from "@/lib/vacancybible/engine";
import { getJobsByIds, getSearchCache, hashQuery } from "@/lib/cache";
import { saveJobs, updateSession } from "@/lib/vacancybible/store";
import type { CompanyRecord, EnrichedJob, SearchInput } from "@/lib/vacancybible/types";

function normalizeSearchInput(payload: Partial<SearchInput>): SearchInput {
  return {
    title: payload.title?.trim() || "Product Manager",
    location: payload.location?.trim() || "India",
    experienceMin: payload.experienceMin ?? 0,
    experienceMax: payload.experienceMax ?? 30,
    packageLpaMin: payload.packageLpaMin ?? 0,
    domain: payload.domain?.trim(),
    flexibility: {
      title: payload.flexibility?.title ?? "FLEXIBLE",
      location: payload.flexibility?.location ?? "FLEXIBLE",
      experience: payload.flexibility?.experience ?? "FLEXIBLE",
      package: payload.flexibility?.package ?? "FLEXIBLE",
      domain: payload.flexibility?.domain ?? "FLEXIBLE",
    },
  };
}

function normalizeAtsPlatform(value: unknown): CompanyRecord["atsPlatform"] {
  const v = typeof value === "string" ? value : "direct";
  if (
    v === "greenhouse" ||
    v === "lever" ||
    v === "ashby" ||
    v === "workday" ||
    v === "smartrecruiters" ||
    v === "direct"
  ) {
    return v;
  }
  return "direct";
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<SearchInput> & { force_refresh?: boolean };
  const input = normalizeSearchInput(body);
  const queryParams = {
    title: input.title,
    location: input.location,
    experienceMin: input.experienceMin,
    experienceMax: input.experienceMax,
    packageLpaMin: input.packageLpaMin,
    domain: input.domain,
    flexibility: input.flexibility,
  };
  const queryHash = hashQuery(queryParams);

  if (!body.force_refresh) {
    const cached = await getSearchCache(queryHash);
    if (cached) {
      const cachedJobs = await getJobsByIds(cached.job_ids ?? []);
      const mapped: EnrichedJob[] = (cachedJobs ?? []).map((row: Record<string, unknown>) => ({
        id: String(row.id ?? ""),
        sourceUrl: String(row.source_url ?? ""),
        sourceUrlHash: String(row.source_url_hash ?? ""),
        atsPlatform: normalizeAtsPlatform(row.ats_platform),
        companyName: { value: row.company_name as string, confidence: "WRITTEN" as const },
        exactRoleTitle: { value: row.exact_role_title as string, confidence: "WRITTEN" as const },
        location: {
          value: (row.location as string) ?? null,
          confidence: ((row.location_conf as string) ?? "NOT_AVAILABLE") as EnrichedJob["location"]["confidence"],
        },
        workMode: {
          value: (row.work_mode as string) ?? null,
          confidence: ((row.work_mode_conf as string) ?? "NOT_AVAILABLE") as EnrichedJob["workMode"]["confidence"],
        },
        yearsExp: { value: null, confidence: "NOT_AVAILABLE" },
        totalCompLpa: {
          value:
            row.comp_total_min !== null && row.comp_total_max !== null
              ? `INR ${String(row.comp_total_min)}L - ${String(row.comp_total_max)}L`
              : null,
          confidence: ((row.comp_total_conf as string) ?? "NOT_AVAILABLE") as EnrichedJob["totalCompLpa"]["confidence"],
        },
        domain: { value: (row.domain as string) ?? null, confidence: "ESTIMATED" as const },
        ownershipType: { value: (row.pm_ownership_type as string) ?? null, confidence: "ESTIMATED" as const },
        companyStability: { value: (row.stability_score as number) ?? null, confidence: "ESTIMATED" as const },
        layoffRisk: { value: (row.layoff_risk_score as number) ?? null, confidence: "ESTIMATED" as const },
        wlbScore: { value: (row.wlb_score as number) ?? null, confidence: "ESTIMATED" as const },
        interviewDifficulty: { value: null, confidence: "NOT_AVAILABLE" },
        analysisNotes: (row.analysis_notes as string) ?? "Loaded from cache",
        postedDate: (row.posted_date as string) ?? undefined,
        rawDescription: (row.raw_description as string) ?? undefined,
      }));
      const session = createSession(input);
      saveJobs(session.id, mapped);
      updateSession(session.id, {
        status: "completed",
        completedAt: new Date().toISOString(),
        companiesHit: 0,
        jobsFound: mapped.length,
        jobsNew: 0,
        durationMs: 1,
      });
      return NextResponse.json({
        ok: true,
        sessionId: session.id,
        status: "completed",
        startedAt: session.startedAt,
        from_cache: true,
        cached_at: cached.created_at,
        expires_at: cached.expires_at,
      });
    }
  }

  const session = createSession(input);
  void runSearch(session.id);

  return NextResponse.json({
    ok: true,
    sessionId: session.id,
    status: session.status,
    startedAt: session.startedAt,
    from_cache: false,
  });
}
