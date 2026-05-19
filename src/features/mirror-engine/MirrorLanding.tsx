"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadProgress } from "./persistence";
import type { AssessmentConfig } from "./types";

type Props = {
  config: AssessmentConfig;
  assessmentPath: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  decorativeNumber?: number;
  panels: { title: string; body: string }[];
  extraCta?: { label: string; href: string };
};

export function MirrorLanding({
  config,
  assessmentPath,
  eyebrow,
  headline,
  subheadline,
  decorativeNumber,
  panels,
  extraCta,
}: Props) {
  const [hasProgress, setHasProgress] = useState(false);
  const accent = config.theme?.accent ?? "#c8a97e";

  useEffect(() => {
    const p = loadProgress(`${config.storageKey}-progress`);
    setHasProgress(Boolean(p && p.stepIndex > 0));
  }, [config.storageKey]);

  return (
    <main
      className="mirror-root mirror-grain min-h-screen"
      style={
        {
          "--mirror-accent": accent,
          "--mirror-accent-light": accent,
        } as React.CSSProperties
      }
    >
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-12 sm:px-10 lg:px-16">
        <header className="mb-14 flex flex-wrap justify-between gap-4">
          <Link href="/before-you-decide" className="text-sm" style={{ color: accent }}>
            ← Before You Decide
          </Link>
          <Link href="/" className="text-sm text-[var(--mirror-text-muted)]">
            Home
          </Link>
        </header>
        <section className="relative max-w-4xl">
          <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--mirror-text-muted)]">
            {eyebrow}
          </p>
          <h1
            className="mt-4 text-balance text-[clamp(2.75rem,8vw,4.5rem)] leading-[1.1] italic"
            style={{ fontFamily: "var(--mirror-font-display)" }}
          >
            {headline}
          </h1>
          <p className="mt-8 max-w-md text-xl font-light text-[var(--mirror-text-secondary)]">
            {subheadline}
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link
              href={hasProgress ? assessmentPath : assessmentPath}
              className="rounded-full px-9 py-[18px] text-base font-semibold text-[#0e0e0e]"
              style={{ background: accent }}
            >
              {hasProgress ? "Resume assessment" : "Start assessment"}
            </Link>
            {hasProgress && (
              <Link
                href={`${assessmentPath}?fresh=1`}
                className="text-sm text-[var(--mirror-text-muted)]"
              >
                Start fresh
              </Link>
            )}
            {extraCta && (
              <Link href={extraCta.href} className="text-sm font-medium" style={{ color: accent }}>
                {extraCta.label}
              </Link>
            )}
          </div>
          {decorativeNumber && (
            <div
              className="pointer-events-none absolute -right-4 top-1/2 hidden -translate-y-1/2 select-none text-[clamp(10rem,35vw,22rem)] font-bold leading-none opacity-[0.05] sm:block"
              style={{ fontFamily: "var(--mirror-font-display)", color: accent }}
              aria-hidden
            >
              {decorativeNumber}
            </div>
          )}
        </section>
        <section className="mt-20 grid gap-4 md:grid-cols-3">
          {panels.map((p) => (
            <article
              key={p.title}
              className="rounded-2xl border border-[var(--mirror-border)] bg-[var(--mirror-surface)] p-6"
            >
              <h2 className="text-xl font-semibold">{p.title}</h2>
              <p className="mt-3 font-light leading-7 text-[var(--mirror-text-secondary)]">
                {p.body}
              </p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

