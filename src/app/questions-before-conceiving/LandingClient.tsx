"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadProgress } from "@/features/mirror-engine/persistence";
import { CONCEIVING_ASSESSMENT } from "./content";

export function LandingClient() {
  const [hasProgress, setHasProgress] = useState(false);

  useEffect(() => {
    const p = loadProgress(`${CONCEIVING_ASSESSMENT.storageKey}-progress`);
    setHasProgress(Boolean(p && p.stepIndex > 0));
  }, []);

  return (
    <main className="mirror-root mirror-grain relative min-h-screen overflow-hidden">
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col px-6 py-12 sm:px-10 lg:px-16">
        <header className="mb-14 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[11px] font-light uppercase tracking-[0.35em] text-[var(--mirror-text-muted)]">
            A READINESS ASSESSMENT
          </p>
          <Link
            href="/"
            className="text-sm text-[var(--mirror-accent)] hover:text-[var(--mirror-accent-light)]"
          >
            Back to home
          </Link>
        </header>

        <section className="relative max-w-4xl">
          <h1
            className="text-balance text-[clamp(2.75rem,8vw,4.5rem)] leading-[1.1] italic"
            style={{ fontFamily: "var(--mirror-font-display)" }}
          >
            Before you decide
            <br />
            to bring a child
            <br />
            into the world —
          </h1>
          <p className="mt-8 max-w-md text-xl font-light text-[var(--mirror-text-secondary)]">
            Do you actually know where you stand? Not just financially. Not just
            medically. All of it.
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-4">
            {hasProgress ? (
              <>
                <Link
                  href="/questions-before-conceiving/assessment"
                  className="rounded-full bg-[var(--mirror-accent)] px-9 py-[18px] text-base font-semibold text-[#0e0e0e] transition hover:-translate-y-0.5 hover:bg-[var(--mirror-accent-light)]"
                >
                  Resume where you left off
                </Link>
                <Link
                  href="/questions-before-conceiving/assessment?fresh=1"
                  className="text-sm text-[var(--mirror-text-muted)] hover:text-[var(--mirror-text-secondary)]"
                >
                  Start fresh
                </Link>
              </>
            ) : (
              <Link
                href="/questions-before-conceiving/assessment"
                className="rounded-full bg-[var(--mirror-accent)] px-9 py-[18px] text-base font-semibold text-[#0e0e0e] transition hover:-translate-y-0.5 hover:bg-[var(--mirror-accent-light)]"
              >
                Find out where you are
              </Link>
            )}
            <p className="text-sm font-light text-[var(--mirror-text-muted)]">
              32 questions. 10–15 minutes. No fluff.
            </p>
          </div>
          <div
            className="pointer-events-none absolute -right-4 top-1/2 hidden -translate-y-1/2 select-none text-[clamp(12rem,38vw,25rem)] font-bold leading-none text-[#c8a97e]/5 sm:block"
            style={{ fontFamily: "var(--mirror-font-display)" }}
            aria-hidden
          >
            32
          </div>
        </section>

        <section className="mt-20 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Not what you think it is",
              body: "This is not a fertility quiz or a medical checklist. It is a readiness mirror across the eight dimensions that actually determine how prepared you are.",
            },
            {
              title: "Designed for honesty",
              body: "Every question is written so there is no obvious right answer. We are not here to validate you. We are here to show you where you actually stand.",
            },
            {
              title: "You get a profile, not a score",
              body: "At the end, you will see a detailed breakdown across eight domains — where you are strong, where you need work, and what to do about it.",
            },
          ].map((panel) => (
            <article
              key={panel.title}
              className="rounded-2xl border border-[var(--mirror-border)] bg-[var(--mirror-surface)] p-6"
            >
              <h2 className="text-xl font-semibold">{panel.title}</h2>
              <p className="mt-3 leading-7 font-light text-[var(--mirror-text-secondary)]">
                {panel.body}
              </p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
