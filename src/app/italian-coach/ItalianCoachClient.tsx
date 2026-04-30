"use client";

import { useMemo, useState } from "react";
import {
  agreementFixerPrompts,
  coachMission,
  coachSentences,
  coachWords,
  grammarCards,
  sentenceBuilderPrompts,
} from "@/content/italian-coach/seed";

type ExerciseResult = {
  attempts: number;
  correct: number;
};

export default function ItalianCoachClient() {
  const [builderIndex, setBuilderIndex] = useState(0);
  const [builderInput, setBuilderInput] = useState("");
  const [fixerIndex, setFixerIndex] = useState(0);
  const [fixerInput, setFixerInput] = useState("");
  const [result, setResult] = useState<ExerciseResult>({ attempts: 0, correct: 0 });

  const builderCurrent = sentenceBuilderPrompts[builderIndex];
  const fixerCurrent = agreementFixerPrompts[fixerIndex];
  const masteryScore = useMemo(() => {
    if (!result.attempts) return 0;
    return Math.round((result.correct / result.attempts) * 100);
  }, [result]);

  function normalize(text: string) {
    return text.trim().toLowerCase().replace(/[.!?]/g, "");
  }

  function evaluateBuilder() {
    const ok = normalize(builderInput) === normalize(builderCurrent.answer);
    setResult((prev) => ({
      attempts: prev.attempts + 1,
      correct: prev.correct + (ok ? 1 : 0),
    }));
    setBuilderInput("");
    setBuilderIndex((prev) => (prev + 1) % sentenceBuilderPrompts.length);
  }

  function evaluateFixer() {
    const ok = normalize(fixerInput) === normalize(fixerCurrent.fixed);
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
        <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Italian Coach MVP</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-6xl">
          Learn - Practice - Recall - Track
        </h1>
        <p className="mt-5 max-w-4xl text-zinc-200 sm:text-lg">
          Grammar-first learning with active recall. This first release focuses on article agreement, sentence
          construction, and visible mastery tracking.
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-4">
        <Card label="Review Cards" value={`${coachMission.reviewCards}`} />
        <Card label="Grammar Lesson" value="1" hint={coachMission.grammarLesson} />
        <Card label="Exercises" value={`${coachMission.exercises}`} />
        <Card label="Mastery Score" value={`${masteryScore}%`} />
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <article className="rounded-3xl border border-zinc-700/60 bg-zinc-900/55 p-6 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Grammar Hero</p>
          <div className="mt-4 space-y-3">
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

        <aside className="space-y-5">
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
        </aside>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
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
        <article className="rounded-3xl border border-zinc-700/60 bg-zinc-900/55 p-6 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Core Vocabulary</p>
          <div className="mt-3 divide-y divide-zinc-800 rounded-2xl border border-zinc-700/70 bg-zinc-950/40">
            {coachWords.map((word) => (
              <div key={word.word} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-medium text-zinc-100">{word.word}</p>
                  <p className="text-xs text-zinc-400">Rank #{word.frequencyRank}</p>
                </div>
                <p className="text-sm text-emerald-200">{word.translation}</p>
              </div>
            ))}
          </div>
        </article>
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
