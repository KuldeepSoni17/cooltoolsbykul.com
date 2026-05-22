"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { allDictionaryWords } from "@/content/italian-coach/dictionary";
import { WORD_TYPE_COLORS } from "@/lib/italian-coach/colors";
import type { DictionaryWord } from "@/lib/italian-coach/types";

const DEMO_SEQUENCE: { slot: string; wordId: string }[] = [
  { slot: "SUBJECT", wordId: "io" },
  { slot: "VERB", wordId: "voglio" },
  { slot: "OBJECT", wordId: "te" },
];

const ALT_VERB = "bevo";

export function GrammarEquation() {
  const [step, setStep] = useState(0);
  const byId = useMemo(() => Object.fromEntries(allDictionaryWords.map((w) => [w.id, w])), []);
  const slots = DEMO_SEQUENCE.map((s) => ({ ...s, word: byId[s.wordId] as DictionaryWord }));
  const verbWord = step === 1 ? byId[ALT_VERB] : slots[1].word;

  const italian = [slots[0].word.word, verbWord.word, slots[2].word.word].join(" ");
  const english = [slots[0].word.english, verbWord.english, slots[2].word.english].join(" + ");

  return (
    <section className="rounded-3xl border border-zinc-700/60 bg-zinc-900/55 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Grammar as Math</p>
        <button
          type="button"
          onClick={() => setStep((s) => (s + 1) % 2)}
          className="rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100 hover:bg-cyan-400/20"
        >
          Swap verb slot
        </button>
      </div>
      <p className="mt-2 text-sm text-zinc-400">Interchangeable slots — same structure, new meaning.</p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {slots.map((slot, i) => {
          const word = i === 1 ? verbWord : slot.word;
          const c = WORD_TYPE_COLORS[word.type];
          return (
            <span key={slot.slot} className="flex items-center gap-2">
              {i > 0 ? <span className="text-2xl font-light text-zinc-500">+</span> : null}
              <motion.div
                layout
                className={`rounded-2xl border px-4 py-3 ${c.bg} ${c.border}`}
              >
                <p className={`text-lg font-bold ${c.text}`}>{word.word}</p>
                <p className="text-xs text-zinc-400">{slot.slot}</p>
              </motion.div>
            </span>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={italian}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="mt-6 rounded-2xl border border-zinc-700/70 bg-zinc-950/50 p-4 text-center"
        >
          <p className="text-xl font-semibold text-white">{italian}</p>
          <p className="mt-1 text-sm text-zinc-400">{english}</p>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
