"use client";

import { useEffect, useMemo, useState } from "react";
import { CompressionPanel } from "@/components/italian-coach/CompressionPanel";
import { GrammarEquation } from "@/components/italian-coach/GrammarEquation";
import { InfiniteBuilder } from "@/components/italian-coach/InfiniteBuilder";
import { MemoryBank } from "@/components/italian-coach/MemoryBank";
import { PhraseExplosion } from "@/components/italian-coach/PhraseExplosion";
import { SentenceCraft } from "@/components/italian-coach/SentenceCraft";
import { TranslationCombat } from "@/components/italian-coach/TranslationCombat";
import { WordSandbox } from "@/components/italian-coach/WordSandbox";
import {
  agreementFixerPrompts,
  coachMission,
  coachSentences,
  grammarCards,
  sentenceBuilderPrompts,
} from "@/content/italian-coach/seed";
import { generatePhrases, normalizeSentence } from "@/lib/italian-coach/engine";
import { useCoachStore } from "@/lib/italian-coach/store";

type Tab = "learn" | "build" | "play" | "classic";
type ExerciseResult = { attempts: number; correct: number };

const TABS: { id: Tab; label: string }[] = [
  { id: "learn", label: "Learn" },
  { id: "build", label: "Build" },
  { id: "play", label: "Play" },
  { id: "classic", label: "Grammar" },
];

export default function ItalianCoachClient() {
  const [tab, setTab] = useState<Tab>("learn");
  const knownWordIds = useCoachStore((s) => s.knownWordIds);
  const xp = useCoachStore((s) => s.xp);
  const streak = useCoachStore((s) => s.streak);
  const phrasesCreated = useCoachStore((s) => s.phrasesCreated);
  const touchDaily = useCoachStore((s) => s.touchDailyLogin);

  const [builderIndex, setBuilderIndex] = useState(0);
  const [builderInput, setBuilderInput] = useState("");
  const [fixerIndex, setFixerIndex] = useState(0);
  const [fixerInput, setFixerInput] = useState("");
  const [result, setResult] = useState<ExerciseResult>({ attempts: 0, correct: 0 });

  const knownSet = useMemo(() => new Set(knownWordIds), [knownWordIds]);
  const generated = useMemo(() => generatePhrases(knownSet, undefined, 6), [knownSet]);

  useEffect(() => {
    touchDaily();
  }, [touchDaily]);

  const builderCurrent = sentenceBuilderPrompts[builderIndex];
  const fixerCurrent = agreementFixerPrompts[fixerIndex];
  const masteryScore = useMemo(() => {
    if (!result.attempts) return 0;
    return Math.round((result.correct / result.attempts) * 100);
  }, [result]);

  function evaluateBuilder() {
    const ok = normalizeSentence(builderInput) === normalizeSentence(builderCurrent.answer);
    setResult((prev) => ({
      attempts: prev.attempts + 1,
      correct: prev.correct + (ok ? 1 : 0),
    }));
    setBuilderInput("");
    setBuilderIndex((prev) => (prev + 1) % sentenceBuilderPrompts.length);
  }

  function evaluateFixer() {
    const ok = normalizeSentence(fixerInput) === normalizeSentence(fixerCurrent.fixed);
    setResult((prev) => ({
      attempts: prev.attempts + 1,
      correct: prev.correct + (ok ? 1 : 0),
    }));
    setFixerInput("");
    setFixerIndex((prev) => (prev + 1) % agreementFixerPrompts.length);
  }

  return (
    <div className="relative mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 lg:px-16">
      <section className="rounded-3xl border border-zinc-700/70 bg-zinc-900/60 p-6 backdrop-blur-xl sm:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/90">Italian Coach</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Language = Memory + Patterns + Composition
        </h1>
        <p className="mt-5 max-w-3xl text-zinc-200 sm:text-lg">
          Not 5,000 phrases to memorize — <strong className="font-semibold text-white">500 building blocks</strong>{" "}
          to generate millions of sentences. Learn the generative system: compression, pattern slots, and mental
          sentence assembly.
        </p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card label="XP" value={String(xp)} />
        <Card label="Streak" value={`${streak}d`} />
        <Card label="Phrases Built" value={String(phrasesCreated)} />
        <Card label="Review Cards" value={`${coachMission.reviewCards}`} />
        <Card label="Mastery" value={`${masteryScore}%`} hint="Classic drills" />
      </section>

      <CompressionPanel knownWordIds={knownSet} />

      <nav className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === t.id
                ? "border border-cyan-300/60 bg-cyan-400/15 text-cyan-100"
                : "border border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "learn" && (
        <div className="mt-6 space-y-6">
          <MemoryBank />
          <div className="grid gap-5 lg:grid-cols-2">
            <GrammarEquation />
            <PhraseExplosion />
          </div>
          <section className="rounded-3xl border border-zinc-700/60 bg-zinc-900/55 p-6 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Engine Preview</p>
            <p className="mt-1 text-sm text-zinc-400">Phrases generated from your known words right now:</p>
            <ul className="mt-3 space-y-2">
              {generated.map((p) => (
                <li key={p.italian} className="flex justify-between gap-4 rounded-xl border border-zinc-700/60 bg-zinc-950/40 px-3 py-2 text-sm">
                  <span className="text-zinc-100">{p.italian}</span>
                  <span className="text-zinc-500">{p.english}</span>
                </li>
              ))}
            </ul>
          </section>
          <article className="rounded-3xl border border-zinc-700/60 bg-zinc-900/55 p-6 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Context Examples</p>
            <div className="mt-3 space-y-3">
              {coachSentences.map((sentence) => (
                <div key={sentence.italian} className="rounded-2xl border border-zinc-700/70 bg-zinc-950/40 p-4">
                  <p className="font-medium text-zinc-100">{sentence.italian}</p>
                  <p className="mt-1 text-sm text-zinc-300">{sentence.english}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.14em] text-cyan-200">{sentence.difficulty}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      )}

      {tab === "build" && (
        <div className="mt-6 space-y-6">
          <WordSandbox />
        </div>
      )}

      {tab === "play" && (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <SentenceCraft />
          <TranslationCombat />
          <InfiniteBuilder />
        </div>
      )}

      {tab === "classic" && (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <article className="rounded-3xl border border-zinc-700/60 bg-zinc-900/55 p-6 backdrop-blur-xl lg:col-span-2">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Grammar Hero</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {grammarCards.map((card) => (
                <div key={card.title} className="rounded-2xl border border-zinc-700/70 bg-zinc-950/50 p-4">
                  <h2 className="text-lg font-semibold text-white">{card.title}</h2>
                  <p className="mt-1 text-sm text-zinc-300">{card.rule}</p>
                  <p className="mt-2 text-sm text-emerald-200">Examples: {card.examples.join(", ")}</p>
                  <p className="mt-1 text-sm text-amber-200">
                    Mistake {"->"} Fix: {card.commonMistake} {"->"} {card.fix}
                  </p>
                </div>
              ))}
            </div>
          </article>
          <ExerciseCard
            title="Sentence Builder"
            prompt={`Rearrange: ${builderCurrent.scrambled.join(" / ")}`}
            value={builderInput}
            onChange={setBuilderInput}
            onSubmit={evaluateBuilder}
            cta="Check Sentence"
            placeholder="Type full sentence..."
          />
          <ExerciseCard
            title="Agreement Fixer"
            prompt={`Fix: ${fixerCurrent.wrong}`}
            value={fixerInput}
            onChange={setFixerInput}
            onSubmit={evaluateFixer}
            cta="Check Fix"
            placeholder="Type corrected sentence..."
          />
        </div>
      )}

      <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950/40 px-4 py-3 text-center text-xs text-zinc-500">
        Daily flow: 5m memory · 10m generation · 10m games · 5m conversation (coming) — Stage 1: English → Italian
      </section>
    </div>
  );
}

function Card({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-zinc-700/70 bg-zinc-900/70 p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-zinc-50">{value}</p>
      {hint ? <p className="mt-1 text-xs text-zinc-400">{hint}</p> : null}
    </div>
  );
}

function ExerciseCard({
  title,
  prompt,
  value,
  onChange,
  onSubmit,
  cta,
  placeholder,
}: {
  title: string;
  prompt: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  cta: string;
  placeholder: string;
}) {
  return (
    <section className="rounded-3xl border border-zinc-700/60 bg-zinc-900/55 p-5 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">{title}</p>
      <p className="mt-3 rounded-xl border border-zinc-700/70 bg-zinc-950/40 px-3 py-2 text-zinc-200">{prompt}</p>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none ring-cyan-400/70 focus:ring-2"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={onSubmit}
        className="mt-3 rounded-xl border border-cyan-300/50 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-400/20"
      >
        {cta}
      </button>
    </section>
  );
}
