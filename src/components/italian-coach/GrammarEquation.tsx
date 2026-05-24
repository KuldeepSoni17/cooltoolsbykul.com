"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { allDictionaryWords } from "@/content/italian-coach/dictionary";
import { WORD_TYPE_COLORS } from "@/lib/italian-coach/colors";
import type { DictionaryWord } from "@/lib/italian-coach/types";

const DEMO: { slot: string; wordIds: string[] }[] = [
  { slot: "subject", wordIds: ["io", "noi", "loro"] },
  { slot: "verb", wordIds: ["voglio", "bevo", "mangio"] },
  { slot: "object", wordIds: ["te", "caffe", "acqua"] },
];

export function GrammarEquation() {
  const byId = useMemo(() => Object.fromEntries(allDictionaryWords.map((w) => [w.id, w])), []);
  const [picks, setPicks] = useState<number[]>([0, 0, 0]);

  const words: DictionaryWord[] = DEMO.map((d, i) => byId[d.wordIds[picks[i]]] as DictionaryWord);
  const italian = capitalize(words.map((w) => w.word).join(" "));
  const english = words.map((w) => w.english).join(" + ");

  return (
    <section>
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-stone-900">Grammar as math</h2>
          <p className="mt-0.5 text-sm text-stone-500">Slots are interchangeable. Same structure, infinite meaning.</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-stone-200 bg-white/70 p-6">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {DEMO.map((d, i) => {
            const w = words[i];
            const c = WORD_TYPE_COLORS[w.type];
            return (
              <div key={d.slot} className="flex items-center gap-3">
                {i > 0 ? <span className="text-2xl font-light text-stone-300">+</span> : null}
                <button
                  type="button"
                  onClick={() => setPicks((prev) => prev.map((p, idx) => (idx === i ? (p + 1) % d.wordIds.length : p)))}
                  className={`rounded-xl border ${c.chip} px-4 py-3 text-center transition ${c.chipHover}`}
                >
                  <div className="text-lg font-medium">{w.word}</div>
                  <div className="mt-0.5 text-[10px] uppercase tracking-wider opacity-70">{d.slot}</div>
                </button>
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={italian}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-6 text-center"
          >
            <p className="font-serif text-3xl text-stone-900">{italian}</p>
            <p className="mt-1 text-sm text-stone-500">{english}</p>
          </motion.div>
        </AnimatePresence>
        <p className="mt-4 text-center text-xs text-stone-400">Tap any slot to cycle.</p>
      </div>
    </section>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
