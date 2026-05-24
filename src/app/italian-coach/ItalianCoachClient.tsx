"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { CompressionPanel } from "@/components/italian-coach/CompressionPanel";
import { GrammarEquation } from "@/components/italian-coach/GrammarEquation";
import { InfiniteBuilder } from "@/components/italian-coach/InfiniteBuilder";
import { MemoryBank } from "@/components/italian-coach/MemoryBank";
import { MemoryPractice } from "@/components/italian-coach/MemoryPractice";
import { PhraseExplosion } from "@/components/italian-coach/PhraseExplosion";
import { SentenceCraft } from "@/components/italian-coach/SentenceCraft";
import { TranslationCombat } from "@/components/italian-coach/TranslationCombat";
import { WordChip } from "@/components/italian-coach/WordChip";
import {
  generatePhrases,
  validateBuilt,
} from "@/lib/italian-coach/engine";
import { useCoachStore } from "@/lib/italian-coach/store";
import type { BuiltItem, DisplayWord } from "@/lib/italian-coach/types";

type Tab = "memory" | "build" | "practice" | "discover";

const TABS: { id: Tab; label: string; hint: string }[] = [
  { id: "memory", label: "Memorize", hint: "Drill vocab, articles, conjugations." },
  { id: "build", label: "Build", hint: "Compose sentences from your bank." },
  { id: "practice", label: "Practice", hint: "Timed games · combat · combos." },
  { id: "discover", label: "Discover", hint: "Patterns the engine can generate." },
];

let uidCounter = 0;
function nextUid() {
  uidCounter += 1;
  return `b_${uidCounter}_${Date.now()}`;
}

export default function ItalianCoachClient() {
  const [tab, setTab] = useState<Tab>("memory");
  const knownWordIds = useCoachStore((s) => s.knownWordIds);
  const xp = useCoachStore((s) => s.xp);
  const streak = useCoachStore((s) => s.streak);
  const addXp = useCoachStore((s) => s.addXp);
  const recordPhrase = useCoachStore((s) => s.recordPhraseCreated);
  const touchDaily = useCoachStore((s) => s.touchDailyLogin);

  const knownSet = useMemo(() => new Set(knownWordIds), [knownWordIds]);

  const [built, setBuilt] = useState<BuiltItem[]>([]);
  const [feedback, setFeedback] = useState<{ ok: boolean; issues: string[] } | null>(null);

  useEffect(() => {
    touchDaily();
  }, [touchDaily]);

  function addWord(w: DisplayWord) {
    const meta = w.meta ?? {};
    const refId =
      w.type === "pronoun" ? (meta.pronounId ?? w.id)
      : w.type === "verb" ? (meta.verbId ?? w.id)
      : w.type === "noun" ? (meta.nounId ?? w.id)
      : w.type === "adjective" ? (meta.adjectiveId ?? w.id)
      : w.id;
    const newItem: BuiltItem = {
      uid: nextUid(),
      kind: w.type,
      refId,
      surface: w.word,
      english: w.english,
    };
    setBuilt((prev) => [...prev, newItem]);
    setFeedback(null);
    if (tab !== "build") setTab("build");
  }

  function clearBuilt() {
    setBuilt([]);
    setFeedback(null);
  }

  function validate() {
    const result = validateBuilt(built);
    setFeedback({ ok: result.ok, issues: result.issues });
    if (result.ok) {
      addXp(10);
      recordPhrase();
    }
  }

  const italianPreview = built.map((b) => b.surface).join(" ");
  const englishPreview = built.map((b) => b.english).join(" · ");
  const phrases = useMemo(() => generatePhrases(knownSet, 14), [knownSet]);

  return (
    <div className="relative mx-auto w-full max-w-5xl px-6 pb-24 pt-8 sm:px-8">
      {/* HERO */}
      <section className="mt-6">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-stone-500">italian coach</p>
        <h1 className="mt-2 font-serif text-5xl leading-[1.05] tracking-tight text-stone-900 sm:text-6xl">
          Memorize the atoms.
          <br />
          <span className="text-stone-500">Compose the language.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base text-stone-600 sm:text-lg">
          Build a memory bank of pronouns, verbs, nouns, articles, adjectives. Then practice composing —
          every verb conjugated, every article agreed, every sentence yours.
        </p>
      </section>

      {/* STATUS STRIP */}
      <section className="mt-10 flex flex-wrap items-center justify-between gap-6 border-y border-stone-300 py-5">
        <CompressionPanel knownWordIds={knownSet} />
        <div className="flex items-baseline gap-6">
          <span className="flex items-baseline gap-2">
            <span className="font-serif text-2xl text-stone-900">{xp}</span>
            <span className="text-xs uppercase tracking-wider text-stone-500">xp</span>
          </span>
          <span className="flex items-baseline gap-2">
            <span className="font-serif text-2xl text-stone-900">{streak}</span>
            <span className="text-xs uppercase tracking-wider text-stone-500">streak</span>
          </span>
        </div>
      </section>

      {/* TAB BAR */}
      <nav className="mt-8 flex flex-wrap gap-1 rounded-full border border-stone-200 bg-white/60 p-1 backdrop-blur sm:w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition ${
              tab === t.id ? "text-white" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {tab === t.id ? (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 rounded-full bg-stone-900"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            ) : null}
            <span className="relative">{t.label}</span>
          </button>
        ))}
      </nav>
      <p className="mt-2 text-xs text-stone-500">{TABS.find((t) => t.id === tab)?.hint}</p>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="mt-10"
        >
          {tab === "memory" && (
            <div className="space-y-12">
              <MemoryPractice />
              <MemoryBank />
            </div>
          )}

          {tab === "build" && (
            <div className="space-y-10">
              <section className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-10">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
                    Sentence builder
                  </p>
                  {built.length > 0 ? (
                    <button
                      type="button"
                      onClick={clearBuilt}
                      className="text-xs font-medium text-stone-400 hover:text-stone-900"
                    >
                      Clear
                    </button>
                  ) : null}
                </div>

                <div className="mt-5 min-h-[6rem] border-b border-dashed border-stone-300 pb-5">
                  {built.length === 0 ? (
                    <p className="font-serif text-3xl text-stone-300 sm:text-4xl">
                      Tap words from your palette below…
                    </p>
                  ) : (
                    <div className="flex flex-wrap items-baseline gap-2">
                      <AnimatePresence initial={false}>
                        {built.map((b, i) => (
                          <motion.span
                            key={b.uid}
                            layout
                            initial={{ opacity: 0, y: 12, scale: 0.92 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ type: "spring", stiffness: 420, damping: 28 }}
                          >
                            <WordChip
                              word={{
                                id: b.uid,
                                word: b.surface,
                                english: b.english,
                                type: b.kind,
                              }}
                              size="lg"
                              selected
                              onClick={() => setBuilt((prev) => prev.filter((_, j) => j !== i))}
                            />
                          </motion.span>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-serif text-base italic text-stone-500">
                    {englishPreview ? `↪ ${englishPreview}` : "Subject · verb · object."}
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={validate}
                      disabled={built.length < 2}
                      className="rounded-full bg-stone-900 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-stone-700 disabled:opacity-30"
                    >
                      Validate
                    </button>
                  </div>
                </div>

                {italianPreview ? (
                  <p className="mt-5 font-serif text-2xl text-stone-900 sm:text-3xl">{italianPreview}</p>
                ) : null}

                {feedback ? (
                  <div
                    className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
                      feedback.ok ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-amber-300 bg-amber-50 text-amber-800"
                    }`}
                  >
                    {feedback.ok ? (
                      <p>Perfetto — agreement and conjugation look correct.</p>
                    ) : (
                      <ul className="list-disc space-y-1 pl-4">
                        {feedback.issues.map((i, idx) => (
                          <li key={idx}>{i}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : null}
              </section>

              <MemoryBank onPick={addWord} />
            </div>
          )}

          {tab === "practice" && (
            <div className="grid gap-6 lg:grid-cols-3">
              <SentenceCraft />
              <TranslationCombat />
              <InfiniteBuilder />
            </div>
          )}

          {tab === "discover" && (
            <div className="space-y-10">
              <GrammarEquation />
              <PhraseExplosion />
              <section>
                <h2 className="font-serif text-2xl text-stone-900">Engine sample</h2>
                <p className="mt-1 text-sm text-stone-500">
                  Every phrase is conjugated and agreed from your bank — none are hardcoded.
                </p>
                <ul className="mt-4 divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white/60">
                  {phrases.map((p) => (
                    <li key={p.italian} className="flex flex-wrap items-baseline justify-between gap-3 px-4 py-3">
                      <span className="font-serif text-lg text-stone-900">{p.italian}</span>
                      <span className="text-sm text-stone-500">{p.english}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <footer className="mt-16 border-t border-stone-300 pt-6 text-xs text-stone-500">
        Memorize → Build → Practice → Discover · v0.3
      </footer>
    </div>
  );
}
