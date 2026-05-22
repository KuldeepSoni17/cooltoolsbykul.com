"use client";

import { allDictionaryWords } from "@/content/italian-coach/dictionary";
import { WORD_TYPE_COLORS } from "@/lib/italian-coach/colors";
import { useCoachStore } from "@/lib/italian-coach/store";
import { WordChip } from "./WordChip";

export function MemoryBank() {
  const knownWordIds = useCoachStore((s) => s.knownWordIds);
  const unlockWord = useCoachStore((s) => s.unlockWord);
  const known = new Set(knownWordIds);
  const locked = allDictionaryWords.filter((w) => !known.has(w.id)).slice(0, 8);

  return (
    <section className="rounded-3xl border border-zinc-700/60 bg-zinc-900/55 p-5 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Memory Layer</p>
      <p className="mt-1 text-sm text-zinc-400">Atomic units — nouns, verbs, connectors, time.</p>

      <div className="mt-3 flex flex-wrap gap-3 text-xs">
        {(Object.keys(WORD_TYPE_COLORS) as (keyof typeof WORD_TYPE_COLORS)[]).map((type) => (
          <span key={type} className={`rounded-md border px-2 py-0.5 ${WORD_TYPE_COLORS[type].bg} ${WORD_TYPE_COLORS[type].border} ${WORD_TYPE_COLORS[type].text}`}>
            {WORD_TYPE_COLORS[type].label}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {allDictionaryWords
          .filter((w) => known.has(w.id))
          .map((w) => (
            <WordChip key={w.id} word={w} size="sm" />
          ))}
      </div>

      {locked.length > 0 ? (
        <>
          <p className="mt-5 text-xs uppercase tracking-[0.14em] text-zinc-500">Unlock next</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {locked.map((w) => (
              <WordChip key={w.id} word={w} size="sm" onClick={() => unlockWord(w.id)} />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
