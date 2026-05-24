"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { CompressionPanel } from "@/components/italian-coach/CompressionPanel";
import { GrammarEquation } from "@/components/italian-coach/GrammarEquation";
import { InfiniteBuilder } from "@/components/italian-coach/InfiniteBuilder";
import { LevelProgress } from "@/components/italian-coach/LevelProgress";
import { MemoryBank } from "@/components/italian-coach/MemoryBank";
import { MemoryPractice } from "@/components/italian-coach/MemoryPractice";
import { MobileTabBar, type CoachTab } from "@/components/italian-coach/MobileTabBar";
import { PhraseExplosion } from "@/components/italian-coach/PhraseExplosion";
import { SentenceCraft } from "@/components/italian-coach/SentenceCraft";
import { TranslationCombat } from "@/components/italian-coach/TranslationCombat";
import { WordChip } from "@/components/italian-coach/WordChip";
import { vocabStats } from "@/content/italian-coach/vocab";
import { generatePhrases, validateBuilt } from "@/lib/italian-coach/engine";
import { useCoachStore } from "@/lib/italian-coach/store";
import type { BuiltItem, DisplayWord } from "@/lib/italian-coach/types";

const TABS: { id: CoachTab; label: string; hint: string }[] = [
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
  const [tab, setTab] = useState<CoachTab>("memory");
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
      w.type === "pronoun"
        ? (meta.pronounId ?? w.id)
        : w.type === "verb"
          ? (meta.verbId ?? w.id)
          : w.type === "noun"
            ? (meta.nounId ?? w.id)
            : w.type === "adjective"
              ? (meta.adjectiveId ?? w.id)
              : w.id;
    setBuilt((prev) => [
      ...prev,
      {
        uid: nextUid(),
        kind: w.type,
        refId,
        surface: w.word,
        english: w.english,
      },
    ]);
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
    <>
      <div className="relative mx-auto w-full max-w-5xl px-4 pb-28 pt-4 sm:px-8 sm:pb-24 sm:pt-6 md:pb-24">
        <section className="mt-2 sm:mt-4">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-stone-500">italian coach</p>
          <h1 className="mt-2 font-serif text-3xl leading-[1.08] tracking-tight text-stone-900 sm:text-5xl md:text-6xl">
            Memorize the atoms.
            <br />
            <span className="text-stone-500">Compose the language.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-stone-600 sm:mt-5 sm:text-lg">
            {vocabStats.verbs} verbs · {vocabStats.nouns} nouns · {vocabStats.adjectives} adjectives ·{" "}
            {vocabStats.verbForms}+ conjugated forms in the bank.
          </p>
        </section>

        <section className="mt-8 flex flex-col gap-4 border-y border-stone-300 py-4 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-6 sm:py-5">
          <CompressionPanel knownWordIds={knownSet} />
          <div className="flex items-baseline gap-6">
            <span className="flex items-baseline gap-2">
              <span className="font-serif text-xl text-stone-900 sm:text-2xl">{xp}</span>
              <span className="text-xs uppercase tracking-wider text-stone-500">xp</span>
            </span>
            <span className="flex items-baseline gap-2">
              <span className="font-serif text-xl text-stone-900 sm:text-2xl">{streak}</span>
              <span className="text-xs uppercase tracking-wider text-stone-500">streak</span>
            </span>
          </div>
        </section>

        {/* Desktop tab bar */}
        <nav className="mt-6 hidden flex-wrap gap-1 rounded-full border border-stone-200 bg-white/60 p-1 backdrop-blur md:flex md:w-fit">
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
                  layoutId="desktop-tab-pill"
                  className="absolute inset-0 rounded-full bg-stone-900"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              ) : null}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </nav>
        <p className="mt-2 hidden text-xs text-stone-500 md:block">
          {TABS.find((t) => t.id === tab)?.hint}
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="mt-8 sm:mt-10"
          >
            {tab === "memory" && (
              <div className="space-y-10 sm:space-y-12">
                <LevelProgress />
                <MemoryPractice />
                <MemoryBank onPick={addWord} />
              </div>
            )}

            {tab === "build" && (
              <div className="space-y-8 sm:space-y-10">
                <section className="rounded-2xl border border-stone-200 bg-white/80 p-4 shadow-sm backdrop-blur sm:rounded-3xl sm:p-8 md:p-10">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
                      Sentence builder
                    </p>
                    {built.length > 0 ? (
                      <button
                        type="button"
                        onClick={clearBuilt}
                        className="min-h-[44px] px-2 text-xs font-medium text-stone-400 hover:text-stone-900"
                      >
                        Clear
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-4 min-h-[5rem] border-b border-dashed border-stone-300 pb-4 sm:mt-5 sm:min-h-[6rem] sm:pb-5">
                    {built.length === 0 ? (
                      <p className="font-serif text-2xl text-stone-300 sm:text-4xl">
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
                    <p className="font-serif text-sm italic text-stone-500 sm:text-base">
                      {englishPreview ? `↪ ${englishPreview}` : "Subject · verb · object."}
                    </p>
                    <button
                      type="button"
                      onClick={validate}
                      disabled={built.length < 2}
                      className="min-h-[44px] w-full rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-stone-700 disabled:opacity-30 sm:w-auto"
                    >
                      Validate
                    </button>
                  </div>

                  {italianPreview ? (
                    <p className="mt-4 font-serif text-xl text-stone-900 sm:mt-5 sm:text-3xl">
                      {italianPreview}
                    </p>
                  ) : null}

                  {feedback ? (
                    <div
                      className={`mt-4 rounded-xl border px-4 py-3 text-sm sm:mt-5 ${
                        feedback.ok
                          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                          : "border-amber-300 bg-amber-50 text-amber-800"
                      }`}
                    >
                      {feedback.ok ? (
                        <p>Perfetto — agreement and conjugation look correct.</p>
                      ) : (
                        <ul className="list-disc space-y-1 pl-4">
                          {feedback.issues.map((issue, idx) => (
                            <li key={idx}>{issue}</li>
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
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <SentenceCraft />
                <TranslationCombat />
                <div className="md:col-span-2 lg:col-span-1">
                  <InfiniteBuilder />
                </div>
              </div>
            )}

            {tab === "discover" && (
              <div className="space-y-8 sm:space-y-10">
                <GrammarEquation />
                <PhraseExplosion />
                <section>
                  <h2 className="font-serif text-xl text-stone-900 sm:text-2xl">Engine sample</h2>
                  <p className="mt-1 text-sm text-stone-500">
                    Phrases conjugated and agreed from your bank.
                  </p>
                  <ul className="mt-4 divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white/60">
                    {phrases.map((p) => (
                      <li
                        key={p.italian}
                        className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-3"
                      >
                        <span className="font-serif text-base text-stone-900 sm:text-lg">{p.italian}</span>
                        <span className="text-sm text-stone-500">{p.english}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <footer className="mt-12 border-t border-stone-300 pt-6 text-xs text-stone-500 sm:mt-16">
          Memorize → Build → Practice → Discover · {vocabStats.nouns} nouns · {vocabStats.verbs} verbs
        </footer>
      </div>

      <MobileTabBar tab={tab} onTab={setTab} />
    </>
  );
}
