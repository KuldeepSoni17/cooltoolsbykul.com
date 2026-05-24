"use client";

import { useMemo } from "react";
import { computeCompression } from "@/lib/italian-coach/engine";

export function CompressionPanel({ knownWordIds }: { knownWordIds: Set<string> }) {
  const stats = useMemo(() => computeCompression(knownWordIds), [knownWordIds]);
  const possible =
    stats.possibleSentences >= 1000
      ? `${stats.possibleSentences.toLocaleString()}+`
      : String(stats.possibleSentences);

  return (
    <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2 text-stone-700">
      <Stat label="words" value={String(stats.wordsKnown)} />
      <span className="text-stone-300">×</span>
      <Stat label="patterns" value={String(stats.patternsKnown)} />
      <span className="text-stone-300">=</span>
      <Stat label="sentences possible" value={possible} accent />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <span className="flex items-baseline gap-2">
      <span
        className={`font-serif text-2xl font-medium ${accent ? "text-emerald-700" : "text-stone-900"}`}
      >
        {value}
      </span>
      <span className="text-xs uppercase tracking-wider text-stone-500">{label}</span>
    </span>
  );
}
