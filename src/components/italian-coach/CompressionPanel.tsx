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
    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-stone-700 sm:flex sm:flex-wrap sm:items-baseline sm:gap-x-6">
      <Stat label="words" value={String(stats.wordsKnown)} />
      <Stat label="patterns" value={String(stats.patternsKnown)} />
      <div className="col-span-2 flex items-baseline gap-2 sm:col-span-1">
        <span className="hidden text-stone-300 sm:inline">=</span>
        <Stat label="sentences" value={possible} accent />
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <span className="flex items-baseline gap-2">
      <span
        className={`font-serif text-xl font-medium sm:text-2xl ${accent ? "text-emerald-700" : "text-stone-900"}`}
      >
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-stone-500 sm:text-xs">{label}</span>
    </span>
  );
}
