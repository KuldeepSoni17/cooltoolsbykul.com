"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MIRROR_FAMILY } from "@/features/mirror-engine/registry";
import { loadResultHistory } from "@/features/mirror-engine/history";
import type { AssessmentResults } from "@/features/mirror-engine/types";

type Entry = {
  mirrorTitle: string;
  href: string;
  results: AssessmentResults;
  savedAt: string;
};

export default function CarryingPage() {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    const list: Entry[] = [];
    for (const m of MIRROR_FAMILY) {
      if (!m.href || m.status === "coming_soon") continue;
      const key = m.storageKey;
      const history = loadResultHistory(key);
      const latest = history[0];
      if (latest) {
        list.push({
          mirrorTitle: m.title,
          href: m.href.replace(/\/$/, "") + "/results",
          results: latest.results,
          savedAt: latest.savedAt,
        });
      }
    }
    setEntries(list);
  }, []);

  return (
    <main className="mirror-root mirror-grain min-h-screen px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/before-you-decide" className="text-sm text-[var(--mirror-accent)]">
          ← Before You Decide
        </Link>
        <h1 className="mt-8 text-3xl font-bold">What I&apos;m carrying</h1>
        <p className="mt-2 text-sm text-[var(--mirror-text-secondary)]">
          Completed mirrors on this device only. Nothing is sent to a server.
        </p>
        {entries.length === 0 ? (
          <p className="mt-10 text-[var(--mirror-text-muted)]">
            No completed mirrors yet. Finish an assessment to see it here.
          </p>
        ) : (
          <ul className="mt-10 space-y-4">
            {entries.map((e) => (
              <li
                key={e.mirrorTitle + e.savedAt}
                className="rounded-xl border border-[var(--mirror-border)] bg-[var(--mirror-surface)] p-5"
              >
                <p className="font-semibold">{e.mirrorTitle}</p>
                <p className="mt-1 text-sm text-[var(--mirror-accent)]">
                  {e.results.profile.name} — {e.results.profile.oneLiner}
                </p>
                <p className="mt-2 text-xs text-[var(--mirror-text-muted)]">
                  {new Date(e.savedAt).toLocaleString()}
                </p>
                <Link
                  href={e.href}
                  className="mt-3 inline-block text-sm font-medium text-[var(--mirror-accent)]"
                >
                  View results →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
