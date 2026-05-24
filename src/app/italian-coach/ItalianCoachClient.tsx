"use client";

import { useEffect, useMemo, useState } from "react";
import { CompressionPanel } from "@/components/italian-coach/CompressionPanel";
import { GrammarEquation } from "@/components/italian-coach/GrammarEquation";
import { InfiniteBuilder } from "@/components/italian-coach/InfiniteBuilder";
import { MemoryBank } from "@/components/italian-coach/MemoryBank";
import { PhraseExplosion } from "@/components/italian-coach/PhraseExplosion";
import { SentenceCraft } from "@/components/italian-coach/SentenceCraft";
import { TranslationCombat } from "@/components/italian-coach/TranslationCombat";
import { WordChip } from "@/components/italian-coach/WordChip";
import { allDictionaryWords } from "@/content/italian-coach/dictionary";
import {
  agreementFixerPrompts,
  grammarCards,
  sentenceBuilderPrompts,
} from "@/content/italian-coach/seed";
import {
  generatePhrases,
  normalizeSentence,
  validateAgainstPhrases,
} from "@/lib/italian-coach/engine";
import { useCoachStore } from "@/lib/italian-coach/store";
import type { DictionaryWord } from "@/lib/italian-coach/types";
import { AnimatePresence, motion } from "framer-motion";

type Tab = "build" | "discover" | "practice" | "grammar";
const TABS: { id: Tab; label: string; hint: string }[] = [
  { id: "build", label: "Build", hint: "Assemble sentences from your bank" },
  { id: "discover", label: "Discover", hint: "See what your bank can generate" },
  { id: "practice", label: "Practice", hint: "Timed games · Combat · Combos" },
  { id: "grammar", label: "Grammar", hint: "Articles · agreement · fixes" },
];

export default function ItalianCoachClient() {
  const [tab, setTab] = useState<Tab>("build");
  const knownWordIds = useCoachStore((s) => s.knownWordIds);
  const xp = useCoachStore((s) => s.xp);
  const streak = useCoachStore((s) => s.streak);
  const addXp = useCoachStore((s) => s.addXp);
  const recordPhrase = useCoachStore((s) => s.recordPhraseCreated);
  const touchDaily = useCoachStore((s) => s.touchDailyLogin);

  const knownSet = useMemo(() => new Set(knownWordIds), [knownWordIds]);
  const bank = useMemo(
    () => allDictionaryWords.filter((w) => knownSet.has(w.id)),
    [knownSet],
  );
  const validPhrases = useMemo(() => generatePhrases(knownSet, undefined, 300), [knownSet]);

  // builder state lifted here so palette can push to it
  const [built, setBuilt] = useState<DictionaryWord[]>([]);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    touchDaily();
  }, [touchDaily]);

  function addWord(w: DictionaryWord) {
    setBuilt((prev) => [...prev, w]);
    setFeedback(null);
  }

  function clearBuilt() {
    setBuilt([]);
    setFeedback(null);
  }

  function validate() {
    const sentence = built.map((w) => w.word).join(" ");
    const result = validateAgainstPhrases(sentence, validPhrases);
    if (result.ok) {
      addXp(10);
      recordPhrase();
      setFeedback({
        ok: true,
        message: result.close ? `Valid · ${result.close}` : "Perfetto — valid structure.",
      });
    } else {
      const partial = validPhrases.find((p) =>
        normalizeSentence(p.italian).includes(normalizeSentence(sentence)),
      );
      setFeedback({
        ok: false,
        message: partial
          ? `Almost — try: ${partial.italian}`
          : "Not a known pattern. Try Subject → Verb → Object.",
      });
    }
  }

  const italianPreview = built.map((w) => w.word).join(" ");
  const englishPreview = built.map((w) => w.english).join(" · ");

  return (
    <div className="relative mx-auto w-full max-w-5xl px-6 pb-24 pt-8 sm:px-8">
      {/* HERO */}
      <section className="mt-6">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-stone-500">italian coach</p>
        <h1 className="mt-2 font-serif text-5xl leading-[1.05] tracking-tight text-stone-900 sm:text-6xl">
          Language is not a list.
          <br />
          <span className="text-stone-500">It is a machine.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base text-stone-600 sm:text-lg">
          Learn 500 building blocks · generate 5,000,000 sentences. This is your workbench for memory, patterns,
          and composition.
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
            <span className="text-xs uppercase tracking-wider text-stone-500">day streak</span>
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
          {tab === "build" && (
            <div className="space-y-10">
              {/* WORKBENCH */}
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
                      Tap words below…
                    </p>
                  ) : (
                    <div className="flex flex-wrap items-baseline gap-2">
                      <AnimatePresence initial={false}>
                        {built.map((w, i) => (
                          <motion.span
                            key={`${w.id}-${i}`}
                            layout
                            initial={{ opacity: 0, y: 12, scale: 0.92 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ type: "spring", stiffness: 420, damping: 28 }}
                          >
                            <WordChip
                              word={w}
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
                    {feedback ? (
                      <span
                        className={`text-sm ${feedback.ok ? "text-emerald-700" : "text-amber-700"}`}
                      >
                        {feedback.message}
                      </span>
                    ) : null}
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
                  <p className="mt-5 font-serif text-2xl text-stone-900 sm:text-3xl">
                    {italianPreview}
                  </p>
                ) : null}
              </section>

              <MemoryBank onPick={addWord} />
            </div>
          )}

          {tab === "discover" && (
            <div className="grid gap-10 lg:grid-cols-2">
              <GrammarEquation />
              <PhraseExplosion />
              <section className="lg:col-span-2">
                <h2 className="font-serif text-2xl text-stone-900">Your vocabulary</h2>
                <p className="mt-1 text-sm text-stone-500">
                  Hover for translation · {bank.length} words active.
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {bank.map((w) => (
                    <WordChip key={w.id} word={w} size="sm" showMeaning />
                  ))}
                </div>
              </section>
            </div>
          )}

          {tab === "practice" && (
            <div className="grid gap-6 lg:grid-cols-3">
              <SentenceCraft />
              <TranslationCombat />
              <InfiniteBuilder />
            </div>
          )}

          {tab === "grammar" && (
            <GrammarTab
              sentenceBuilder={sentenceBuilderPrompts}
              agreementFixer={agreementFixerPrompts}
              grammarCards={grammarCards}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <footer className="mt-16 border-t border-stone-300 pt-6 text-xs text-stone-500">
        Memory + Patterns + Composition · v0.2 · daily flow: 5m memory · 10m generation · 10m games
      </footer>
    </div>
  );
}

function GrammarTab({
  sentenceBuilder,
  agreementFixer,
  grammarCards,
}: {
  sentenceBuilder: typeof sentenceBuilderPrompts;
  agreementFixer: typeof agreementFixerPrompts;
  grammarCards: typeof import("@/content/italian-coach/seed").grammarCards;
}) {
  const [bi, setBi] = useState(0);
  const [bInput, setBInput] = useState("");
  const [fi, setFi] = useState(0);
  const [fInput, setFInput] = useState("");
  const [result, setResult] = useState({ attempts: 0, correct: 0 });

  const b = sentenceBuilder[bi];
  const f = agreementFixer[fi];

  function eval1() {
    const ok = normalizeSentence(bInput) === normalizeSentence(b.answer);
    setResult((r) => ({ attempts: r.attempts + 1, correct: r.correct + (ok ? 1 : 0) }));
    setBInput("");
    setBi((i) => (i + 1) % sentenceBuilder.length);
  }

  function eval2() {
    const ok = normalizeSentence(fInput) === normalizeSentence(f.fixed);
    setResult((r) => ({ attempts: r.attempts + 1, correct: r.correct + (ok ? 1 : 0) }));
    setFInput("");
    setFi((i) => (i + 1) % agreementFixer.length);
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        {grammarCards.map((card) => (
          <article key={card.title} className="rounded-2xl border border-stone-200 bg-white/70 p-5">
            <h3 className="font-serif text-xl text-stone-900">{card.title}</h3>
            <p className="mt-2 text-sm text-stone-600">{card.rule}</p>
            <p className="mt-3 text-sm text-emerald-700">{card.examples.join(", ")}</p>
            <p className="mt-1 text-sm text-amber-700">
              {card.commonMistake} → {card.fix}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Drill
          label="Sentence Builder"
          prompt={`Rearrange: ${b.scrambled.join(" / ")}`}
          value={bInput}
          onChange={setBInput}
          onSubmit={eval1}
          cta="Check"
        />
        <Drill
          label="Agreement Fixer"
          prompt={`Fix: ${f.wrong}`}
          value={fInput}
          onChange={setFInput}
          onSubmit={eval2}
          cta="Check"
        />
      </section>

      <p className="text-sm text-stone-500">
        Mastery (this session): {result.attempts ? Math.round((result.correct / result.attempts) * 100) : 0}%
      </p>
    </div>
  );
}

function Drill({
  label,
  prompt,
  value,
  onChange,
  onSubmit,
  cta,
}: {
  label: string;
  prompt: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  cta: string;
}) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white/70 p-5">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <p className="mt-3 font-serif text-lg text-stone-900">{prompt}</p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-3 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:border-stone-900"
        placeholder="Type the corrected sentence…"
      />
      <button
        type="button"
        onClick={onSubmit}
        className="mt-3 rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
      >
        {cta}
      </button>
    </section>
  );
}
