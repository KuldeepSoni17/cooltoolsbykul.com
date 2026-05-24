"use client";

import { useMemo, useState } from "react";
import {
  adjectives,
  nouns,
  pronouns,
  timeWords,
  verbs,
} from "@/content/italian-coach/vocab";
import {
  PERSONS,
  adjUid,
  nounUid,
  personLabel,
  pronounUid,
  verbFormUid,
} from "@/lib/italian-coach/engine";
import { definiteArticle, normalize } from "@/lib/italian-coach/grammar";
import { useCoachStore } from "@/lib/italian-coach/store";
import type { Person } from "@/lib/italian-coach/types";

type Mode = "recall" | "active" | "article" | "conjugation" | "gender";

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: "recall", label: "Italian → English", hint: "See the word, recall the meaning." },
  { id: "active", label: "English → Italian", hint: "Type the Italian word from memory." },
  { id: "article", label: "Articles", hint: "Pick il / lo / la / l\u2019 for each noun." },
  { id: "conjugation", label: "Conjugation", hint: "Type the right verb form for each subject." },
  { id: "gender", label: "Gender", hint: "Is the noun masculine or feminine?" },
];

export function MemoryPractice() {
  const [mode, setMode] = useState<Mode>("recall");

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-serif text-3xl text-stone-900">Memory drills</h2>
        <p className="mt-1 text-sm text-stone-500">Active recall on what you have learned. 30–60 seconds per drill.</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              mode === m.id
                ? "border-stone-900 bg-stone-900 text-white"
                : "border-stone-300 bg-white/70 text-stone-600 hover:border-stone-900"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-stone-500">{MODES.find((m) => m.id === mode)?.hint}</p>

      <div className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm sm:p-10">
        {mode === "recall" ? <RecallDrill /> : null}
        {mode === "active" ? <ActiveRecallDrill /> : null}
        {mode === "article" ? <ArticleDrill /> : null}
        {mode === "conjugation" ? <ConjugationDrill /> : null}
        {mode === "gender" ? <GenderDrill /> : null}
      </div>
    </div>
  );
}

/* ----------------------- Helpers ----------------------- */

function useKnown() {
  return useCoachStore((s) => s.knownWordIds);
}

function useReview() {
  return useCoachStore((s) => s.recordReview);
}

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function ScoreBar({ correct, attempts, streak }: { correct: number; attempts: number; streak: number }) {
  const pct = attempts ? Math.round((correct / attempts) * 100) : 0;
  return (
    <div className="flex items-baseline justify-between text-xs text-stone-500">
      <span>
        {correct} / {attempts} correct · <span className="text-stone-900">{pct}%</span>
      </span>
      <span>streak {streak}</span>
    </div>
  );
}

/* ----------------------- Drills ----------------------- */

type AnyItem = {
  id: string;
  italian: string;
  english: string;
  hint?: string;
};

function buildAllKnownItems(known: Set<string>): AnyItem[] {
  const items: AnyItem[] = [];
  pronouns.forEach((p) => {
    if (known.has(pronounUid(p.id))) items.push({ id: pronounUid(p.id), italian: p.word, english: p.english });
  });
  verbs.forEach((v) => {
    PERSONS.forEach((person) => {
      if (known.has(verbFormUid(v.id, person)))
        items.push({
          id: verbFormUid(v.id, person),
          italian: v.present[person],
          english: `${v.english.replace(/^to /, "")} (${personLabel(person)})`,
          hint: `from ${v.infinitive}`,
        });
    });
  });
  nouns.forEach((n) => {
    if (known.has(nounUid(n.id)))
      items.push({ id: nounUid(n.id), italian: n.singular, english: n.english, hint: `${n.gender === "m" ? "m" : "f"} · pl. ${n.plural}` });
  });
  adjectives.forEach((a) => {
    if (known.has(adjUid(a.id))) items.push({ id: adjUid(a.id), italian: a.m_sg, english: a.english });
  });
  timeWords.forEach((t) => {
    if (known.has(t.id)) items.push({ id: t.id, italian: t.word, english: t.english });
  });
  return items;
}

function RecallDrill() {
  const knownIds = useKnown();
  const review = useReview();
  const known = useMemo(() => new Set(knownIds), [knownIds]);
  const pool = useMemo(() => buildAllKnownItems(known), [known]);
  const deck = useMemo(() => shuffle(pool), [pool]);

  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [streak, setStreak] = useState(0);

  const card = deck.length ? deck[idx % deck.length] : null;
  if (!card) return <Empty />;

  function next(ok: boolean) {
    if (!card) return;
    review(card.id, ok);
    setAttempts((a) => a + 1);
    setCorrect((c) => c + (ok ? 1 : 0));
    setStreak((s) => (ok ? s + 1 : 0));
    setRevealed(false);
    setIdx((i) => i + 1);
  }

  return (
    <div className="space-y-6">
      <ScoreBar correct={correct} attempts={attempts} streak={streak} />
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-8 text-center">
        <p className="text-xs uppercase tracking-wider text-stone-500">What does this mean?</p>
        <p className="mt-3 font-serif text-4xl text-stone-900 sm:text-5xl">{card.italian}</p>
        {card.hint ? <p className="mt-2 text-xs text-stone-500">{card.hint}</p> : null}
      </div>

      {revealed ? (
        <div className="text-center">
          <p className="font-serif text-2xl text-emerald-700">{card.english}</p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => next(false)}
              className="rounded-full border border-stone-300 px-5 py-2 text-sm font-medium text-stone-600 hover:border-stone-900"
            >
              I forgot
            </button>
            <button
              type="button"
              onClick={() => next(true)}
              className="rounded-full bg-stone-900 px-5 py-2 text-sm font-medium text-white hover:bg-stone-700"
            >
              I knew it
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="rounded-full bg-stone-900 px-6 py-2 text-sm font-medium text-white hover:bg-stone-700"
          >
            Reveal
          </button>
        </div>
      )}
    </div>
  );
}

function ActiveRecallDrill() {
  const knownIds = useKnown();
  const review = useReview();
  const known = useMemo(() => new Set(knownIds), [knownIds]);
  const pool = useMemo<AnyItem[]>(() => {
    const items: AnyItem[] = [];
    pronouns.forEach((p) => {
      if (known.has(pronounUid(p.id))) items.push({ id: pronounUid(p.id), italian: p.word, english: p.english });
    });
    nouns.forEach((n) => {
      if (known.has(nounUid(n.id))) items.push({ id: nounUid(n.id), italian: n.singular, english: n.english });
    });
    adjectives.forEach((a) => {
      if (known.has(adjUid(a.id))) items.push({ id: adjUid(a.id), italian: a.m_sg, english: a.english });
    });
    timeWords.forEach((t) => {
      if (known.has(t.id)) items.push({ id: t.id, italian: t.word, english: t.english });
    });
    return items;
  }, [known]);
  const deck = useMemo(() => shuffle(pool), [pool]);

  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [correct, setCorrect] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [streak, setStreak] = useState(0);

  const card = deck.length ? deck[idx % deck.length] : null;
  if (!card) return <Empty />;

  function check() {
    if (!card) return;
    const ok = normalize(input) === normalize(card.italian);
    review(card.id, ok);
    setAttempts((a) => a + 1);
    setCorrect((c) => c + (ok ? 1 : 0));
    setStreak((s) => (ok ? s + 1 : 0));
    setFeedback(ok ? { ok: true, message: "Correct." } : { ok: false, message: `Answer: ${card.italian}` });
  }

  function nextCard() {
    setInput("");
    setFeedback(null);
    setIdx((i) => i + 1);
  }

  return (
    <div className="space-y-6">
      <ScoreBar correct={correct} attempts={attempts} streak={streak} />
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-8 text-center">
        <p className="text-xs uppercase tracking-wider text-stone-500">Type in Italian:</p>
        <p className="mt-3 font-serif text-2xl text-stone-900 sm:text-4xl">{card.english}</p>
      </div>
      <input
        autoFocus
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !feedback) check();
          else if (e.key === "Enter" && feedback) nextCard();
        }}
        disabled={!!feedback}
        className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-center font-serif text-2xl text-stone-900 outline-none focus:border-stone-900 disabled:opacity-70"
        placeholder="Italian…"
      />
      {feedback ? (
        <div className="text-center">
          <p className={`text-sm ${feedback.ok ? "text-emerald-700" : "text-amber-700"}`}>{feedback.message}</p>
          <button
            type="button"
            onClick={nextCard}
            className="mt-3 rounded-full bg-stone-900 px-6 py-2 text-sm font-medium text-white hover:bg-stone-700"
          >
            Next
          </button>
        </div>
      ) : (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={check}
            className="rounded-full bg-stone-900 px-6 py-2 text-sm font-medium text-white hover:bg-stone-700"
          >
            Check
          </button>
        </div>
      )}
    </div>
  );
}

function ArticleDrill() {
  const knownIds = useKnown();
  const review = useReview();
  const known = useMemo(() => new Set(knownIds), [knownIds]);
  const pool = useMemo(() => nouns.filter((n) => known.has(nounUid(n.id))), [known]);
  const deck = useMemo(() => shuffle(pool), [pool]);

  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [streak, setStreak] = useState(0);

  const noun = deck.length ? deck[idx % deck.length] : null;
  if (!noun) return <Empty />;

  const expected = definiteArticle(noun);
  const choices = ["il", "lo", "la", "l'"];

  function pick(choice: string) {
    if (picked || !noun) return;
    setPicked(choice);
    const ok = choice === expected;
    setCorrect((c) => c + (ok ? 1 : 0));
    setAttempts((a) => a + 1);
    setStreak((s) => (ok ? s + 1 : 0));
    review(nounUid(noun.id), ok);
  }

  function next() {
    setPicked(null);
    setIdx((i) => i + 1);
  }

  return (
    <div className="space-y-6">
      <ScoreBar correct={correct} attempts={attempts} streak={streak} />
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-8 text-center">
        <p className="text-xs uppercase tracking-wider text-stone-500">Which article?</p>
        <p className="mt-3 font-serif text-5xl text-stone-900">___ {noun.singular}</p>
        <p className="mt-2 text-sm text-stone-500">
          {noun.english} · {noun.gender === "m" ? "masculine" : "feminine"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {choices.map((c) => {
          const isExpected = c === expected;
          const showCorrect = picked && isExpected;
          const showWrong = picked === c && !isExpected;
          return (
            <button
              key={c}
              type="button"
              onClick={() => pick(c)}
              disabled={!!picked}
              className={`rounded-xl border px-4 py-4 font-serif text-2xl transition ${
                showCorrect
                  ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                  : showWrong
                    ? "border-rose-400 bg-rose-50 text-rose-900"
                    : "border-stone-300 bg-white hover:border-stone-900"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {picked ? (
        <div className="text-center">
          <p className={picked === expected ? "text-emerald-700" : "text-amber-700"}>
            {picked === expected
              ? `${expected === "l'" ? "l'" : `${expected} `}${noun.singular} ✓`
              : `Answer: ${expected === "l'" ? "l'" : `${expected} `}${noun.singular}`}
          </p>
          <button
            type="button"
            onClick={next}
            className="mt-3 rounded-full bg-stone-900 px-6 py-2 text-sm font-medium text-white hover:bg-stone-700"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ConjugationDrill() {
  const knownIds = useKnown();
  const review = useReview();
  const known = useMemo(() => new Set(knownIds), [knownIds]);
  const pool = useMemo(() => {
    const out: { verbId: string; person: Person }[] = [];
    verbs.forEach((v) => {
      PERSONS.forEach((p) => {
        if (known.has(verbFormUid(v.id, p))) out.push({ verbId: v.id, person: p });
      });
    });
    return out;
  }, [known]);
  const deck = useMemo(() => shuffle(pool), [pool]);

  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [correct, setCorrect] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [streak, setStreak] = useState(0);

  const card = deck.length ? deck[idx % deck.length] : null;
  if (!card) return <Empty />;

  const verb = verbs.find((v) => v.id === card.verbId);
  if (!verb) return <Empty />;
  const expected = verb.present[card.person];
  const pronounWord = pronouns.find((p) => p.person === card.person)?.word ?? card.person;

  function check() {
    if (!card || !verb) return;
    const ok = normalize(input) === normalize(expected);
    review(verbFormUid(card.verbId, card.person), ok);
    setAttempts((a) => a + 1);
    setCorrect((c) => c + (ok ? 1 : 0));
    setStreak((s) => (ok ? s + 1 : 0));
    setFeedback(
      ok
        ? { ok: true, message: `${pronounWord} ${expected} ✓` }
        : { ok: false, message: `Answer: ${pronounWord} ${expected}` },
    );
  }

  function next() {
    setInput("");
    setFeedback(null);
    setIdx((i) => i + 1);
  }

  return (
    <div className="space-y-6">
      <ScoreBar correct={correct} attempts={attempts} streak={streak} />
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-8 text-center">
        <p className="text-xs uppercase tracking-wider text-stone-500">Conjugate</p>
        <p className="mt-3 font-serif text-4xl text-stone-900">
          {pronounWord} <span className="text-stone-300">___</span>
        </p>
        <p className="mt-2 text-sm text-stone-500">
          ({verb.infinitive} — {verb.english})
        </p>
      </div>
      <input
        autoFocus
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !feedback) check();
          else if (e.key === "Enter" && feedback) next();
        }}
        disabled={!!feedback}
        className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-center font-serif text-2xl text-stone-900 outline-none focus:border-stone-900 disabled:opacity-70"
        placeholder="form…"
      />
      {feedback ? (
        <div className="text-center">
          <p className={feedback.ok ? "text-emerald-700" : "text-amber-700"}>{feedback.message}</p>
          <button
            type="button"
            onClick={next}
            className="mt-3 rounded-full bg-stone-900 px-6 py-2 text-sm font-medium text-white hover:bg-stone-700"
          >
            Next
          </button>
        </div>
      ) : (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={check}
            className="rounded-full bg-stone-900 px-6 py-2 text-sm font-medium text-white hover:bg-stone-700"
          >
            Check
          </button>
        </div>
      )}
    </div>
  );
}

function GenderDrill() {
  const knownIds = useKnown();
  const review = useReview();
  const known = useMemo(() => new Set(knownIds), [knownIds]);
  const pool = useMemo(() => nouns.filter((n) => known.has(nounUid(n.id))), [known]);
  const deck = useMemo(() => shuffle(pool), [pool]);

  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<"m" | "f" | null>(null);
  const [correct, setCorrect] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [streak, setStreak] = useState(0);

  const noun = deck.length ? deck[idx % deck.length] : null;
  if (!noun) return <Empty />;

  function pick(g: "m" | "f") {
    if (picked || !noun) return;
    setPicked(g);
    const ok = g === noun.gender;
    setCorrect((c) => c + (ok ? 1 : 0));
    setAttempts((a) => a + 1);
    setStreak((s) => (ok ? s + 1 : 0));
    review(nounUid(noun.id), ok);
  }

  function next() {
    setPicked(null);
    setIdx((i) => i + 1);
  }

  return (
    <div className="space-y-6">
      <ScoreBar correct={correct} attempts={attempts} streak={streak} />
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-8 text-center">
        <p className="text-xs uppercase tracking-wider text-stone-500">Masculine or feminine?</p>
        <p className="mt-3 font-serif text-5xl text-stone-900">{noun.singular}</p>
        <p className="mt-2 text-sm text-stone-500">{noun.english}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {(["m", "f"] as const).map((g) => {
          const isCorrect = g === noun.gender;
          const show = picked === g;
          return (
            <button
              key={g}
              type="button"
              onClick={() => pick(g)}
              disabled={!!picked}
              className={`rounded-xl border px-4 py-4 font-serif text-2xl transition ${
                show && isCorrect
                  ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                  : show && !isCorrect
                    ? "border-rose-400 bg-rose-50 text-rose-900"
                    : picked && isCorrect
                      ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                      : "border-stone-300 bg-white hover:border-stone-900"
              }`}
            >
              {g === "m" ? "masculine" : "feminine"}
            </button>
          );
        })}
      </div>
      {picked ? (
        <div className="text-center">
          <button
            type="button"
            onClick={next}
            className="mt-3 rounded-full bg-stone-900 px-6 py-2 text-sm font-medium text-white hover:bg-stone-700"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Empty() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-12 text-center text-stone-500">
      Unlock more vocabulary in the Palette to start drilling.
    </div>
  );
}
