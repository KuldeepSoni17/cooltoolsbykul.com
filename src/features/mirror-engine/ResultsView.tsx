"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AssessmentConfig, AssessmentResults } from "./types";
import { bandColor } from "./score";
import { loadResults } from "./persistence";
import { RadarChart } from "./RadarChart";

type Props = {
  config: AssessmentConfig;
  assessmentPath: string;
  landingPath: string;
};

export function ResultsView({
  config,
  assessmentPath,
  landingPath,
}: Props) {
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [hardTruths, setHardTruths] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read client-only results once on mount
    setResults(loadResults(`${config.storageKey}-results`));
  }, [config.storageKey]);

  if (!results) {
    return (
      <div className="mirror-root flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="text-[var(--mirror-text-secondary)]">
          No results found. Complete the assessment first.
        </p>
        <Link
          href={assessmentPath}
          className="mt-6 rounded-full bg-[var(--mirror-accent)] px-6 py-3 text-sm font-semibold text-[#0e0e0e]"
        >
          Start assessment
        </Link>
      </div>
    );
  }

  const strengths = [...results.domains]
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 3);
  const growth = [...results.domains]
    .sort((a, b) => a.percent - b.percent)
    .slice(0, 3);

  return (
    <div className="mirror-root mirror-grain min-h-screen px-6 py-12 sm:px-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href={landingPath}
          className="text-sm text-[var(--mirror-accent)] hover:text-[var(--mirror-accent-light)]"
        >
          ← Back
        </Link>

        <div className="mt-10 flex flex-col items-center text-center">
          <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full border-2 border-[var(--mirror-accent)] bg-[radial-gradient(circle,var(--mirror-accent-dim),var(--mirror-bg))]">
            <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--mirror-text-muted)]">
              Your profile
            </p>
            <p
              className="mt-2 text-xl italic"
              style={{ fontFamily: "var(--mirror-font-display)" }}
            >
              {results.profile.name}
            </p>
          </div>
          <p className="mt-6 max-w-md text-lg text-[var(--mirror-text-secondary)]">
            {results.profile.oneLiner}
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--mirror-text-muted)]">
            {results.profile.guidance}
          </p>
        </div>

        <div className="mt-14">
          <RadarChart domains={results.domains} />
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {results.domains.map((d) => (
            <article
              key={d.domainId}
              className="rounded-2xl border border-[var(--mirror-border)] bg-[var(--mirror-surface)] p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold">{d.domainName}</p>
                <p
                  className="font-mono text-sm"
                  style={{ color: bandColor(d.label) }}
                >
                  {d.percent}%
                </p>
              </div>
              <p
                className="mt-1 text-xs font-medium uppercase tracking-wider"
                style={{ color: bandColor(d.label) }}
              >
                {d.label}
              </p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded bg-white/5">
                <div
                  className="h-full rounded transition-all duration-700"
                  style={{
                    width: `${d.percent}%`,
                    backgroundColor: bandColor(d.label),
                  }}
                />
              </div>
            </article>
          ))}
        </div>

        {results.leverage.length > 0 && (
          <section className="mt-14">
            <h2 className="text-2xl font-bold">If you do nothing else</h2>
            <p className="mt-2 text-sm text-[var(--mirror-text-secondary)]">
              Three areas where a small shift could change the picture most.
            </p>
            <ol className="mt-6 space-y-4">
              {results.leverage.map((m, i) => (
                <li
                  key={m.questionId}
                  className="rounded-xl border border-[var(--mirror-border)] bg-[var(--mirror-surface)] p-5"
                >
                  <p className="font-mono text-xs text-[var(--mirror-accent)]">
                    {i + 1}. {m.domainName}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--mirror-text-secondary)]">
                    {m.prompt}
                  </p>
                  <p className="mt-2 text-sm text-[var(--mirror-text)]">
                    {m.suggestion}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className="mt-14 grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold text-[var(--mirror-success)]">
              Your strengths
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-[var(--mirror-text-secondary)]">
              {strengths.map((d) => (
                <li key={d.domainId}>
                  {d.domainName} — {d.label} ({d.percent}%)
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--mirror-accent)]">
              Growth areas
            </h3>
            <ul className="mt-4 space-y-4">
              {growth.map((d) => {
                const research = config.research.find(
                  (r) => r.domainId === d.domainId,
                );
                const open = expanded === d.domainId;
                return (
                  <li key={d.domainId}>
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded(open ? null : d.domainId)
                      }
                      className="text-left text-sm font-medium text-[var(--mirror-accent)]"
                    >
                      {d.domainName} — Why this matters {open ? "↑" : "↓"}
                    </button>
                    {open && research && (
                      <div className="mt-2 text-sm leading-7 text-[var(--mirror-text-secondary)]">
                        {research.paragraphs.map((p) => (
                          <p key={p.slice(0, 24)} className="mt-2">
                            {p}
                          </p>
                        ))}
                        <p className="mt-3 font-medium text-[var(--mirror-text)]">
                          Next step: {research.action}
                        </p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {Object.keys(results.reflections).length > 0 && (
          <section className="mt-14 rounded-2xl border border-[var(--mirror-border)] bg-[var(--mirror-surface)] p-6">
            <h3 className="text-lg font-semibold">Your reflections</h3>
            <p className="mt-2 text-xs italic text-[var(--mirror-text-muted)]">
              Shown back to you only. Stored on this device. We never see these.
            </p>
            {Object.entries(results.reflections).map(([id, text]) => (
              <blockquote
                key={id}
                className="mt-4 border-l-2 border-[var(--mirror-accent)] pl-4 text-sm italic text-[var(--mirror-text-secondary)]"
              >
                {text}
              </blockquote>
            ))}
          </section>
        )}

        {results.flags.includes("motivation-audit-low") && (
          <p className="mt-8 rounded-xl border border-[var(--mirror-danger)]/40 bg-[var(--mirror-danger)]/10 p-4 text-sm text-[var(--mirror-text-secondary)]">
            Your motivation audit suggests exploring underlying needs with a therapist before conception — not as a gate, but as preparation.
          </p>
        )}

        <section className="mt-10">
          <button
            type="button"
            onClick={() => setHardTruths((v) => !v)}
            className="text-sm font-medium text-[var(--mirror-accent)]"
          >
            {hardTruths
              ? "Hide harder reflection ↑"
              : "Show me the harder reflection →"}
          </button>
          {hardTruths && (
            <div className="mt-4 rounded-xl border border-[var(--mirror-border)] bg-[var(--mirror-surface)] p-6 text-sm leading-7 text-[var(--mirror-text-secondary)]">
              <p>
                This is not a diagnosis. It is a mirror. If anything here resonates, explore it with a therapist — not because you are broken, but because the investment you make in yourself before your child arrives is the most direct investment you can make in them.
              </p>
              <p className="mt-4">
                Based on your answers: consider whether an attachment pattern of high variance suggests rushing; ACE awareness is worth naming with a professional if childhood scores were low; the parenting pattern most at risk is repeating unexamined intergenerational habits.
              </p>
            </div>
          )}
        </section>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href={assessmentPath}
            className="rounded-full border border-[var(--mirror-border)] px-6 py-3 text-sm font-semibold text-[var(--mirror-text-secondary)] hover:border-[var(--mirror-accent)]"
          >
            Retake assessment
          </Link>
          <Link
            href="/"
            className="rounded-full bg-[var(--mirror-accent)] px-6 py-3 text-sm font-semibold text-[#0e0e0e]"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

