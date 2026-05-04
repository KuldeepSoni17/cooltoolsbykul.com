"use client";

import { useMemo, useState } from "react";
import { fetchJobs, startSearch, subscribeProgress } from "@/lib/vacancybible/client";
import type { EnrichedJob, FlexMode, SearchInput, SearchProgressEvent } from "@/lib/vacancybible/types";

const defaultInput: SearchInput = {
  title: "Senior Product Manager",
  location: "India",
  experienceMin: 5,
  experienceMax: 12,
  packageLpaMin: 40,
  domain: "Fintech",
  flexibility: {
    title: "FLEXIBLE",
    location: "FLEXIBLE",
    experience: "FLEXIBLE",
    package: "FLEXIBLE",
    domain: "FLEXIBLE",
  },
};

function FlexSelect({
  value,
  onChange,
}: {
  value: FlexMode;
  onChange: (value: FlexMode) => void;
}) {
  return (
    <select
      className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
      value={value}
      onChange={(event) => onChange(event.target.value as FlexMode)}
    >
      <option value="STRICT">Strict</option>
      <option value="FLEXIBLE">Flexible</option>
      <option value="OPEN">Open</option>
    </select>
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
    return <span className="rounded-full bg-emerald-600/90 px-2 py-1 text-xs">Written</span>;
  }
  if (confidence === "ESTIMATED") {
    return (
      <span className="rounded-full border border-amber-400 px-2 py-1 text-xs text-amber-300" title={source}>
        Estimated
      </span>
    );
  }
  return <span className="text-xs text-zinc-400">Not available</span>;
}

export default function VacancyBibleClient() {
  const [input, setInput] = useState<SearchInput>(defaultInput);
  const [events, setEvents] = useState<SearchProgressEvent[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<EnrichedJob[]>([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState<string | null>(null);

  const latestEvent = events.at(-1);
  const progressPct = useMemo(() => {
    if (!latestEvent || latestEvent.totalCompanies === 0) return 0;
    return Math.min(100, Math.round((latestEvent.processedCompanies / latestEvent.totalCompanies) * 100));
  }, [latestEvent]);

  const handleSearch = async () => {
    setStatus("starting");
    setEvents([]);
    setJobs([]);
    setError(null);
    try {
      const started = await startSearch(input);
      setSessionId(started.sessionId);
      setStatus("running");
      const unsubscribe = subscribeProgress(started.sessionId, async (event) => {
        if ("done" in event) {
          const result = await fetchJobs(started.sessionId);
          setJobs(result.jobs);
          setStatus(event.status);
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

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-100">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <header>
          <p className="inline-flex rounded-full border border-cyan-500/60 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-300">
            VacancyBible
          </p>
          <h1 className="mt-3 text-4xl font-bold">Search PM jobs directly from company career pages.</h1>
          <p className="mt-2 max-w-3xl text-zinc-300">
            Live ATS scraping, source-first output, and confidence labels on every important field.
          </p>
        </header>

        <section className="grid gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm text-zinc-300">Role title</span>
            <input
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
              value={input.title}
              onChange={(event) => setInput((curr) => ({ ...curr, title: event.target.value }))}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-zinc-300">Location</span>
            <input
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
              value={input.location ?? ""}
              onChange={(event) => setInput((curr) => ({ ...curr, location: event.target.value }))}
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <span className="w-full text-sm text-zinc-300">Title flexibility</span>
            <FlexSelect
              value={input.flexibility.title}
              onChange={(value) =>
                setInput((curr) => ({ ...curr, flexibility: { ...curr.flexibility, title: value } }))
              }
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-full text-sm text-zinc-300">Location flexibility</span>
            <FlexSelect
              value={input.flexibility.location}
              onChange={(value) =>
                setInput((curr) => ({ ...curr, flexibility: { ...curr.flexibility, location: value } }))
              }
            />
          </div>

          <button
            className="rounded-md bg-cyan-500 px-4 py-2 font-semibold text-zinc-950 transition hover:bg-cyan-400"
            onClick={handleSearch}
            type="button"
          >
            {status === "running" || status === "starting" ? "Searching..." : "Search"}
          </button>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
          <p className="text-sm text-zinc-300">Status: {status}</p>
          {sessionId ? <p className="mt-1 text-xs text-zinc-500">Session: {sessionId}</p> : null}
          {latestEvent ? (
            <>
              <p className="mt-3 text-sm text-zinc-200">{latestEvent.message}</p>
              <div className="mt-2 h-2 rounded-full bg-zinc-800">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progressPct}%` }} />
              </div>
              <p className="mt-2 text-xs text-zinc-400">
                {latestEvent.processedCompanies}/{latestEvent.totalCompanies} companies • {latestEvent.jobsFound} jobs
              </p>
            </>
          ) : null}
          {error ? <p className="mt-2 text-sm text-rose-300">{error}</p> : null}
        </section>

        <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-800/70 text-zinc-300">
              <tr>
                <th className="px-3 py-2">Company</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Location</th>
                <th className="px-3 py-2">Comp</th>
                <th className="px-3 py-2">Domain</th>
                <th className="px-3 py-2">Source</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-t border-zinc-800 align-top">
                  <td className="px-3 py-3">
                    <div className="font-medium">{job.companyName.value}</div>
                    <ConfidencePill confidence={job.companyName.confidence} />
                  </td>
                  <td className="px-3 py-3">
                    <div>{job.exactRoleTitle.value}</div>
                    <ConfidencePill confidence={job.exactRoleTitle.confidence} />
                  </td>
                  <td className="px-3 py-3">
                    <div>{job.location.value ?? "—"}</div>
                    <ConfidencePill confidence={job.location.confidence} />
                  </td>
                  <td className="px-3 py-3">
                    <div>{job.totalCompLpa.value ?? "—"}</div>
                    <ConfidencePill confidence={job.totalCompLpa.confidence} source={job.totalCompLpa.source} />
                  </td>
                  <td className="px-3 py-3">
                    <div>{job.domain.value ?? "—"}</div>
                    <ConfidencePill confidence={job.domain.confidence} source={job.domain.source} />
                  </td>
                  <td className="px-3 py-3">
                    <a className="text-cyan-300 hover:text-cyan-200" href={job.sourceUrl} rel="noreferrer" target="_blank">
                      View Original
                    </a>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-zinc-400" colSpan={6}>
                    No results yet. Run a search to fetch live listings.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
