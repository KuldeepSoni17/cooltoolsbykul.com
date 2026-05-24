"use client";

import { useMemo } from "react";
import { generatePhrases } from "@/lib/italian-coach/engine";
import { useCoachStore } from "@/lib/italian-coach/store";

export function PhraseExplosion() {
  const knownWordIds = useCoachStore((s) => s.knownWordIds);
  const knownSet = useMemo(() => new Set(knownWordIds), [knownWordIds]);
  const phrases = useMemo(() => generatePhrases(knownSet, undefined, 12), [knownSet]);

  return (
    <section>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-serif text-2xl text-stone-900">Generated from your bank</h2>
        <span className="text-xs text-stone-500">live · combinatorial</span>
      </div>
      <ul className="mt-4 divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white/60">
        {phrases.map((p) => (
          <li key={p.italian} className="flex flex-wrap items-baseline justify-between gap-3 px-4 py-3">
            <span className="font-serif text-lg text-stone-900">{p.italian}</span>
            <span className="text-sm text-stone-500">{p.english}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
