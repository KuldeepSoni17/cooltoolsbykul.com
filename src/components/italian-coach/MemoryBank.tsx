"use client";

import { useMemo, useState } from "react";
import { allDictionaryWords } from "@/content/italian-coach/dictionary";
import { WORD_TYPE_COLORS, WORD_TYPE_ORDER } from "@/lib/italian-coach/colors";
import { useCoachStore } from "@/lib/italian-coach/store";
import type { DictionaryWord, WordType } from "@/lib/italian-coach/types";
import { WordChip } from "./WordChip";

export function MemoryBank({ onPick }: { onPick?: (w: DictionaryWord) => void }) {
  const knownWordIds = useCoachStore((s) => s.knownWordIds);
  const unlockWord = useCoachStore((s) => s.unlockWord);
  const knownSet = useMemo(() => new Set(knownWordIds), [knownWordIds]);
  const [showLocked, setShowLocked] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<WordType, { known: DictionaryWord[]; locked: DictionaryWord[] }>();
    for (const w of allDictionaryWords) {
      const bucket = map.get(w.type) ?? { known: [], locked: [] };
      if (knownSet.has(w.id)) bucket.known.push(w);
      else bucket.locked.push(w);
      map.set(w.type, bucket);
    }
    return map;
  }, [knownSet]);

  return (
    <section>
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-stone-900">Palette</h2>
          <p className="mt-0.5 text-sm text-stone-500">
            Your atomic units. Tap to {onPick ? "add to the builder" : "review"}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowLocked((s) => !s)}
          className="text-xs font-medium text-stone-500 hover:text-stone-900"
        >
          {showLocked ? "Hide locked" : "Show locked"}
        </button>
      </div>

      <div className="mt-5 space-y-4">
        {WORD_TYPE_ORDER.map((type) => {
          const bucket = grouped.get(type);
          if (!bucket || (bucket.known.length === 0 && !showLocked)) return null;
          const meta = WORD_TYPE_COLORS[type];
          return (
            <div key={type} className="grid grid-cols-[6.5rem_1fr] items-start gap-3">
              <div className="flex items-center gap-2 pt-1.5">
                <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                <span className="text-xs font-medium uppercase tracking-wider text-stone-500">
                  {meta.group}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {bucket.known.map((w) => (
                  <WordChip key={w.id} word={w} size="sm" onClick={onPick ? () => onPick(w) : undefined} />
                ))}
                {showLocked
                  ? bucket.locked.map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => unlockWord(w.id)}
                        className="rounded-lg border border-dashed border-stone-300 bg-white/40 px-2.5 py-1 text-sm text-stone-400 transition hover:border-stone-500 hover:text-stone-700"
                        title={`Unlock: ${w.english}`}
                      >
                        + {w.word}
                      </button>
                    ))
                  : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
