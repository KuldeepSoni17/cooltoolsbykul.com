"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MIRROR_FAMILY } from "@/features/mirror-engine/registry";
import {
  loadPartnerResults,
  loadResults,
  savePartnerResults,
} from "@/features/mirror-engine/persistence";
import type { AssessmentResults } from "@/features/mirror-engine/types";
import { bandColor } from "@/features/mirror-engine/score";

function CompareContent() {
  const params = useSearchParams();
  const mirrorKey = params.get("mirror") ?? "mirror-marriage";
  const mirror = MIRROR_FAMILY.find((m) => m.storageKey === mirrorKey);
  const [a, setA] = useState<AssessmentResults | null>(null);
  const [b, setB] = useState<AssessmentResults | null>(null);

  useEffect(() => {
    setA(loadPartnerResults(mirrorKey));
    setB(loadResults(`${mirrorKey}-results`));
  }, [mirrorKey]);

  const swapRoles = () => {
    if (!a || !b) return;
    savePartnerResults(mirrorKey, b);
    setA(b);
    setB(a);
  };

  return (
    <main className="mirror-root mirror-grain min-h-screen px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/before-you-decide" className="text-sm text-[var(--mirror-accent)]">
          ← Before You Decide
        </Link>
        <h1 className="mt-8 text-3xl font-bold">Couple compare</h1>
        <p className="mt-2 text-sm text-[var(--mirror-text-secondary)]">
          {mirror?.title ?? "Mirror"} — Partner A saved from results, Partner B is your
          latest completion on this device.
        </p>

        {!a || !b ? (
          <div className="mt-10 rounded-xl border border-[var(--mirror-border)] bg-[var(--mirror-surface)] p-6 text-sm">
            <p>Need two result sets on this device:</p>
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              <li>Partner A completes the assessment and taps &quot;Save as Partner A&quot; on results.</li>
              <li>Partner B completes (or retakes) on the same browser profile.</li>
              <li>Return here to compare domain by domain.</li>
            </ol>
            {mirror?.href && (
              <Link
                href={mirror.href}
                className="mt-6 inline-block text-[var(--mirror-accent)] underline"
              >
                Open {mirror.title} →
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--mirror-border)] p-4">
                <p className="text-xs uppercase text-[var(--mirror-text-muted)]">Partner A</p>
                <p className="mt-1 font-semibold">{a.profile.name}</p>
              </div>
              <div className="rounded-xl border border-[var(--mirror-border)] p-4">
                <p className="text-xs uppercase text-[var(--mirror-text-muted)]">Partner B</p>
                <p className="mt-1 font-semibold">{b.profile.name}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={swapRoles}
              className="mt-4 text-sm text-[var(--mirror-accent)]"
            >
              Swap A ↔ B
            </button>
            <ul className="mt-8 space-y-3">
              {a.domains.map((da) => {
                const db = b.domains.find((x) => x.domainId === da.domainId);
                const gap = db ? Math.abs(da.percent - db.percent) : 0;
                return (
                  <li
                    key={da.domainId}
                    className="rounded-lg border border-[var(--mirror-border)] bg-[var(--mirror-surface)] p-4"
                  >
                    <p className="font-medium">{da.domainName}</p>
                    <p className="mt-2 text-sm">
                      A:{" "}
                      <span style={{ color: bandColor(da.label) }}>
                        {da.percent}% ({da.label})
                      </span>
                      {" · "}
                      B:{" "}
                      <span
                        style={{
                          color: db?.label ? bandColor(db.label) : "var(--mirror-text-muted)",
                        }}
                      >
                        {db?.percent ?? "—"}% ({db?.label ?? "—"})
                      </span>
                    </p>
                    {gap >= 25 && (
                      <p className="mt-2 text-xs text-[#c97e7e]">
                        Large gap ({gap} pts) — worth a dedicated conversation.
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </main>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <main className="mirror-root flex min-h-screen items-center justify-center">
          <p className="text-[var(--mirror-text-secondary)]">Loading…</p>
        </main>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
