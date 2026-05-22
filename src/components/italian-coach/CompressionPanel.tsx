"use client";

import { useMemo } from "react";
import { computeCompression } from "@/lib/italian-coach/engine";

export function CompressionPanel({ knownWordIds }: { knownWordIds: Set<string> }) {
  const stats = useMemo(() => computeCompression(knownWordIds), [knownWordIds]);

  return (
    <section className="rounded-3xl border border-violet-400/30 bg-gradient-to-br from-violet-950/50 to-zinc-900/60 p-6 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.24em] text-violet-300">Compression Learning</p>
      <p className="mt-2 text-sm text-zinc-300">
        Finite memory × patterns = exponential sentences. You are not memorizing phrases — you are learning the
        generative system.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <StatBlock label="Words Known" value={String(stats.wordsKnown)} />
        <StatBlock label="Patterns Known" value={String(stats.patternsKnown)} />
        <StatBlock
          label="Possible Sentences"
          value={stats.possibleSentences >= 1000 ? `${stats.possibleSentences.toLocaleString()}+` : String(stats.possibleSentences)}
          highlight
        />
      </div>
    </section>
  );
}

function StatBlock({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-2xl border border-zinc-700/70 bg-zinc-950/50 px-4 py-3 text-center">
      <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${highlight ? "text-violet-200" : "text-zinc-50"}`}>{value}</p>
    </div>
  );
}
