"use client";

import { useMemo } from "react";
import { expandPhraseExplosion } from "@/lib/italian-coach/engine";
import { useCoachStore } from "@/lib/italian-coach/store";

const SEED_IDS = ["io", "voglio", "mangiare", "pizza"];

export function PhraseExplosion() {
  const knownWordIds = useCoachStore((s) => s.knownWordIds);
  const base = useMemo(() => {
    const ids = [...new Set([...SEED_IDS, ...knownWordIds])];
    return expandPhraseExplosion(ids);
  }, [knownWordIds]);

  return (
    <section className="rounded-3xl border border-zinc-700/60 bg-zinc-900/55 p-5 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Phrase Explosion</p>
      <p className="mt-1 text-sm text-zinc-400">
        From <span className="text-cyan-200">io · voglio · mangiare · pizza</span> the engine expands combinatorially:
      </p>
      <ul className="mt-4 space-y-2">
        {base.slice(0, 8).map((p) => (
          <li key={p.italian} className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-zinc-700/60 bg-zinc-950/40 px-3 py-2">
            <span className="font-medium text-zinc-100">{p.italian}</span>
            <span className="text-sm text-zinc-400">{p.english}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
