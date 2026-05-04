"use client";

import { useMemo, useState } from "react";
import { fetchJobs, startSearch, subscribeProgress } from "@/lib/vacancybible/client";
import type { EnrichedJob, FlexMode, SearchInput, SearchProgressEvent } from "@/lib/vacancybible/types";

type UiFormState = {
  title: string;
  location: string;
  experience: string;
  packageText: string;
  domain: string;
  flexibility: SearchInput["flexibility"];
};

const defaultInput: UiFormState = {
  title: "Senior Product Manager",
  location: "Bengaluru, Remote India",
  experience: "5-9 years",
  packageText: "40L+",
  domain: "Any",
  flexibility: {
    title: "FLEXIBLE",
    location: "FLEXIBLE",
    experience: "FLEXIBLE",
    package: "OPEN",
    domain: "OPEN",
  },
};

const domains = [
  "Any",
  "AI",
  "Fintech",
  "SaaS",
  "Consumer",
  "Platform",
  "Infra",
  "Growth",
  "Healthcare",
  "Edtech",
];

function FlexToggle({
  value,
  onChange,
}: {
  value: FlexMode;
  onChange: (value: FlexMode) => void;
}) {
  const options: Array<{ id: FlexMode; label: string; activeClass: string }> = [
    { id: "STRICT", label: "Strict", activeClass: "bg-[var(--written-bg)] text-[var(--written)]" },
    { id: "FLEXIBLE", label: "Flexible", activeClass: "bg-[var(--accent-dim)] text-[var(--accent)]" },
    { id: "OPEN", label: "Open", activeClass: "bg-[var(--estimated-bg)] text-[var(--estimated)]" },
  ];
  return (
    <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[10px] uppercase tracking-wider font-[family-name:var(--font-ibm-plex-mono)]">
      {options.map((option) => (
        <button
          key={option.id}
          className={`px-3 py-2 transition ${value === option.id ? option.activeClass : "text-[var(--text-dim)]"}`}
          onClick={() => onChange(option.id)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ConfidencePill({
  confidence,
  source,
}: {
  confidence: EnrichedJob["domain"]["confidence"];
  source?: string;
}) {
  if (confidence === "WRITTEN") {
    return (
      <span className="rounded-full border border-[var(--written-border)] bg-[var(--written-bg)] px-2 py-1 text-[10px] font-[family-name:var(--font-ibm-plex-mono)] text-[var(--written)]">
        WRITTEN
      </span>
    );
  }
  if (confidence === "ESTIMATED") {
    return (
      <span
        className="rounded-full border border-[var(--estimated-border)] bg-[var(--estimated-bg)] px-2 py-1 text-[10px] font-[family-name:var(--font-ibm-plex-mono)] text-[var(--estimated)]"
        title={source}
      >
        ESTIMATED
      </span>
    );
  }
  return <span className="text-[10px] text-[var(--text-dim)] font-[family-name:var(--font-ibm-plex-mono)]">NOT_AVAILABLE</span>;
}

export default function VacancyBibleClient() {
  const [input, setInput] = useState<UiFormState>(defaultInput);
  const [events, setEvents] = useState<SearchProgressEvent[]>([]);
  const [jobs, setJobs] = useState<EnrichedJob[]>([]);
  const [status, setStatus] = useState<"idle" | "running" | "completed" | "failed">("idle");
  const [error, setError] = useState<string | null>(null);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    tier: "All Tiers",
    location: "All Locations",
    domain: "All Domains",
    remoteOnly: false,
    sort: "Score",
  });

  const latestEvent = events.at(-1);
  const progressPct = useMemo(() => {
    if (!latestEvent || latestEvent.totalCompanies === 0) return 0;
    return Math.min(100, Math.round((latestEvent.processedCompanies / latestEvent.totalCompanies) * 100));
  }, [latestEvent]);

  const toSearchInput = (): SearchInput => {
    const experienceValues = (input.experience.match(/\d+/g) ?? []).map(Number);
    const packageCandidate = Number.parseInt(input.packageText.replace(/[^\d]/g, ""), 10);
    return {
      title: input.title,
      location: input.location,
      experienceMin: experienceValues[0],
      experienceMax: experienceValues[1] ?? experienceValues[0],
      packageLpaMin: Number.isFinite(packageCandidate) ? packageCandidate : undefined,
      domain: input.domain === "Any" ? undefined : input.domain,
      flexibility: input.flexibility,
    };
  };

  const handleSearch = async () => {
    setStatus("running");
    setEvents([]);
    setJobs([]);
    setError(null);
    setExpandedJobId(null);
    try {
      const started = await startSearch(toSearchInput());
      console.log("[VacancyBible] session:", started.sessionId);
      const unsubscribe = subscribeProgress(started.sessionId, async (event) => {
        if ("done" in event) {
          const result = await fetchJobs(started.sessionId);
          setJobs(result.jobs);
          setStatus(event.status === "completed" ? "completed" : "failed");
          unsubscribe();
          return;
        }
        setEvents((current) => [...current, event]);
      });
    } catch (err) {
      setStatus("failed");
      setError(err instanceof Error ? err.message : "Search failed");
    }
  };

  const filteredJobs = useMemo(() => {
    const withFilters = jobs.filter((job) => {
      if (filters.remoteOnly && job.workMode.value !== "Remote") return false;
      if (filters.location !== "All Locations" && job.location.value !== filters.location) return false;
      if (filters.domain !== "All Domains" && job.domain.value !== filters.domain) return false;
      if (filters.tier !== "All Tiers") {
        const score = (job.companyStability.value ?? 0) * 10 + (job.wlbScore.value ?? 0);
        const tier = score >= 85 ? "Tier 1" : score >= 70 ? "Tier 2" : score >= 55 ? "Tier 3" : "Tier 4";
        if (tier !== filters.tier) return false;
      }
      return true;
    });
    return withFilters.sort((a, b) => {
      const scoreA = (a.companyStability.value ?? 0) * 10 + (a.wlbScore.value ?? 0);
      const scoreB = (b.companyStability.value ?? 0) * 10 + (b.wlbScore.value ?? 0);
      return filters.sort === "Score" ? scoreB - scoreA : a.companyName.value.localeCompare(b.companyName.value);
    });
  }, [jobs, filters]);

  const filterOptions = useMemo(() => {
    const uniqueLocations = [...new Set(jobs.map((job) => job.location.value).filter(Boolean))] as string[];
    const uniqueDomains = [...new Set(jobs.map((job) => job.domain.value).filter(Boolean))] as string[];
    return { uniqueLocations, uniqueDomains };
  }, [jobs]);

  const exportFilteredCsv = () => {
    const rows = [
      ["Company", "Role", "Location", "Mode", "Package", "Domain", "Score", "Source"].join(","),
      ...filteredJobs.map((job) => {
        const score = (job.companyStability.value ?? 0) * 10 + (job.wlbScore.value ?? 0);
        return [
          job.companyName.value,
          job.exactRoleTitle.value,
          job.location.value ?? "",
          job.workMode.value ?? "",
          job.totalCompLpa.value ?? "",
          job.domain.value ?? "",
          String(score),
          job.sourceUrl,
        ]
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(",");
      }),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "vacancybible-filtered-results.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] px-6 py-10 text-[var(--text)]">
      <style jsx global>{`
        :root {
          --bg: #0c0c0f;
          --surface: #141418;
          --surface-2: #1a1a22;
          --border: #1e1e26;
          --border-hover: #2e2e3e;
          --text: #f5f0e8;
          --text-muted: #7a7a8c;
          --text-dim: #4b5563;
          --accent: #5b6ef5;
          --accent-dim: #1e2456;
          --written: #4caf7d;
          --written-bg: #1a3d2b;
          --written-border: #2a5e42;
          --estimated: #d4924a;
          --estimated-bg: #3d2a14;
          --estimated-border: #5e4220;
        }
      `}</style>
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <header className="flex items-center justify-between text-[var(--text-muted)] font-[family-name:var(--font-dm-sans)]">
          <p className="text-2xl font-[family-name:var(--font-dm-serif-display)]">VacancyBible</p>
          <nav className="flex items-center gap-5 text-sm">
            <a href="#how-it-works">How it works</a>
            <a href="#companies">Companies</a>
          </nav>
        </header>

        <section className="py-24 text-center" id="how-it-works">
          <h1 className="text-[52px] leading-tight font-[family-name:var(--font-dm-serif-display)]">
            Find the role.
            <br />
            <em className="text-[var(--text-muted)]">Cut the noise.</em>
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-[var(--text-muted)] font-[family-name:var(--font-dm-sans)]">
            We scan company career pages directly - not job boards. Every result links to the original source.
          </p>
        </section>

        <section className="mx-auto w-full max-w-[680px] space-y-3">
          {(
            [
              ["Role Title", "title", "e.g. Senior Product Manager", "text", input.flexibility.title],
              ["Location", "location", "e.g. Bengaluru, Remote India", "text", input.flexibility.location],
              ["Experience", "experience", "e.g. 5-9 years", "text", input.flexibility.experience],
              ["Package", "packageText", "e.g. 40L+ total comp", "text", input.flexibility.package],
            ] as const
          ).map(([label, key, placeholder, type, flex]) => (
            <div
              key={key}
              className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-[var(--border-hover)] md:grid-cols-[1fr_auto]"
            >
              <label className="space-y-1">
                <span className="block text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)] font-[family-name:var(--font-ibm-plex-mono)]">
                  {label}
                </span>
                <input
                  className="w-full bg-transparent text-sm outline-none font-[family-name:var(--font-dm-sans)]"
                  placeholder={placeholder}
                  type={type}
                  value={String(input[key as keyof UiFormState] ?? "")}
                  onChange={(event) =>
                    setInput((curr) => ({
                      ...curr,
                      [key]: event.target.value,
                    }))
                  }
                />
              </label>
              <FlexToggle
                value={flex}
                onChange={(value) =>
                  setInput((curr) => ({
                    ...curr,
                    flexibility: { ...curr.flexibility, [key === "title" ? "title" : key === "location" ? "location" : key === "experience" ? "experience" : "package"]: value },
                  }))
                }
              />
            </div>
          ))}

          <div className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-[var(--border-hover)] md:grid-cols-[1fr_auto]">
            <label className="space-y-1">
              <span className="block text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)] font-[family-name:var(--font-ibm-plex-mono)]">
                Domain
              </span>
              <select
                className="w-full bg-transparent text-sm outline-none font-[family-name:var(--font-dm-sans)]"
                value={input.domain}
                onChange={(event) => setInput((curr) => ({ ...curr, domain: event.target.value }))}
              >
                {domains.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
            </label>
            <FlexToggle
              value={input.flexibility.domain}
              onChange={(value) =>
                setInput((curr) => ({ ...curr, flexibility: { ...curr.flexibility, domain: value } }))
              }
            />
          </div>
          <button
            className="h-[52px] w-full rounded-xl bg-[var(--accent)] px-4 py-2 font-medium text-white transition hover:brightness-90 font-[family-name:var(--font-dm-sans)]"
            onClick={handleSearch}
            type="button"
          >
            {status === "running" ? (
              <span className="font-[family-name:var(--font-ibm-plex-mono)]">Scanning career pages...</span>
            ) : (
              "Search VacancyBible ->"
            )}
          </button>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          {status === "running" && latestEvent ? (
            <div className="space-y-2">
              <p className="animate-pulse text-sm text-[var(--text-muted)] font-[family-name:var(--font-ibm-plex-mono)]">
                Scanning {latestEvent.message.replace("Scraping ", "")}...
              </p>
              <div className="h-[2px] bg-[var(--border)]">
                <div className="h-full bg-[var(--accent)] transition-all" style={{ width: `${progressPct}%` }} />
              </div>
              <p className="text-xs text-[var(--text-dim)] font-[family-name:var(--font-ibm-plex-mono)]">
                {latestEvent.processedCompanies} / {latestEvent.totalCompanies} companies · {latestEvent.jobsFound} jobs found
              </p>
            </div>
          ) : null}
          {status === "completed" ? (
            <p className="text-sm text-[var(--text-muted)] font-[family-name:var(--font-ibm-plex-mono)]">
              Search complete. Found {jobs.length} jobs across {latestEvent?.totalCompanies ?? 0} companies.
            </p>
          ) : null}
          {status === "idle" ? (
            <p className="text-sm text-[var(--text-muted)] font-[family-name:var(--font-dm-sans)]">
              Results will appear here after you run a search.
            </p>
          ) : null}
          {error ? <p className="mt-2 text-sm text-rose-300 font-[family-name:var(--font-dm-sans)]">{error}</p> : null}
        </section>

        {status === "completed" && jobs.length > 0 ? (
          <section className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm font-[family-name:var(--font-ibm-plex-mono)]">
            <select className="rounded border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1" value={filters.tier} onChange={(event) => setFilters((f) => ({ ...f, tier: event.target.value }))}>
              {["All Tiers", "Tier 1", "Tier 2", "Tier 3", "Tier 4"].map((opt) => <option key={opt}>{opt}</option>)}
            </select>
            <select className="rounded border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1" value={filters.location} onChange={(event) => setFilters((f) => ({ ...f, location: event.target.value }))}>
              <option>All Locations</option>
              {filterOptions.uniqueLocations.map((location) => <option key={location}>{location}</option>)}
            </select>
            <select className="rounded border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1" value={filters.domain} onChange={(event) => setFilters((f) => ({ ...f, domain: event.target.value }))}>
              <option>All Domains</option>
              {filterOptions.uniqueDomains.map((domain) => <option key={domain}>{domain}</option>)}
            </select>
            <label className="flex items-center gap-2">
              <input checked={filters.remoteOnly} onChange={(event) => setFilters((f) => ({ ...f, remoteOnly: event.target.checked }))} type="checkbox" />
              Remote Only
            </label>
            <select className="rounded border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1" value={filters.sort} onChange={(event) => setFilters((f) => ({ ...f, sort: event.target.value }))}>
              <option>Score</option>
              <option>Company</option>
            </select>
            <button className="ml-auto rounded border border-[var(--accent)] px-3 py-1 text-[var(--accent)]" onClick={exportFilteredCsv} type="button">
              Export CSV
            </button>
          </section>
        ) : null}

        <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]" id="companies">
          <table className="w-full text-left text-sm font-[family-name:var(--font-dm-sans)]">
            <thead className="bg-[var(--surface-2)] text-[10px] uppercase tracking-[0.08em] text-[var(--text-dim)] font-[family-name:var(--font-ibm-plex-mono)]">
              <tr>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">Package</th>
                <th className="px-4 py-3">Domain</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Source</th>
              </tr>
            </thead>
            <tbody>
              {status === "running"
                ? Array.from({ length: 4 }).map((_, idx) => (
                    <tr key={`sk-${idx}`} className="border-b border-[color:var(--border)]/40">
                      <td className="px-4 py-4" colSpan={8}>
                        <div className="h-4 w-full animate-pulse rounded bg-[var(--surface-2)]" />
                      </td>
                    </tr>
                  ))
                : null}
              {filteredJobs.flatMap((job, index) => {
                const score = (job.companyStability.value ?? 0) * 10 + (job.wlbScore.value ?? 0);
                const mainRow = (
                  <tr
                    key={job.id}
                    className="cursor-pointer border-b border-[color:var(--border)]/40 transition hover:bg-[var(--surface-2)]"
                    onClick={() => setExpandedJobId((curr) => (curr === job.id ? null : job.id))}
                    style={{ animation: `fadeIn 250ms ease ${index * 25}ms both` }}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{job.companyName.value}</div>
                      <ConfidencePill confidence={job.companyName.confidence} />
                    </td>
                    <td className="px-4 py-3">
                      <div>{job.exactRoleTitle.value}</div>
                      <ConfidencePill confidence={job.exactRoleTitle.confidence} />
                    </td>
                    <td className="px-4 py-3">
                      <div>{job.location.value ?? "—"}</div>
                      <ConfidencePill confidence={job.location.confidence} />
                    </td>
                    <td className="px-4 py-3">{job.workMode.value ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div>{job.totalCompLpa.value ?? "—"}</div>
                      <ConfidencePill confidence={job.totalCompLpa.confidence} source={job.totalCompLpa.source} />
                    </td>
                    <td className="px-4 py-3">
                      <div>{job.domain.value ?? "—"}</div>
                      <ConfidencePill confidence={job.domain.confidence} source={job.domain.source} />
                    </td>
                    <td className="px-4 py-3 font-[family-name:var(--font-ibm-plex-mono)]">{score}</td>
                    <td className="px-4 py-3">
                      <a
                        className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2 py-1 text-xs text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                        href={job.sourceUrl}
                        rel="noreferrer"
                        target="_blank"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {job.atsPlatform} @ {job.companyName.value} ↗
                      </a>
                    </td>
                  </tr>
                );
                if (expandedJobId !== job.id) return [mainRow];
                return [
                  mainRow,
                  <tr key={`${job.id}-detail`} className="border-b border-[color:var(--border)]/40 bg-[var(--surface-2)]">
                    <td className="px-4 py-3 text-sm text-[var(--text-muted)] font-[family-name:var(--font-dm-sans)]" colSpan={8}>
                      {job.analysisNotes}
                    </td>
                  </tr>,
                ];
              })}
              {status === "completed" && filteredJobs.length === 0 ? (
                <tr>
                  <td className="px-3 py-10 text-center text-[var(--text-muted)]" colSpan={8}>
                    <div className="mx-auto mb-3 h-8 w-8 rounded-full border border-[var(--border)]" />
                    <p className="font-[family-name:var(--font-dm-sans)]">No roles found matching your search.</p>
                    <p className="mt-1 text-xs font-[family-name:var(--font-dm-sans)]">
                      Try making your flexibility settings more Open, or broadening your location.
                    </p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </section>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
