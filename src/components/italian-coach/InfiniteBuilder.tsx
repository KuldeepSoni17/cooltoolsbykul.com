"use client";

import { useMemo, useState } from "react";
import { infiniteBuilderSets } from "@/content/italian-coach/dictionary";
import { scoreInfiniteBuilder } from "@/lib/italian-coach/engine";
import { useCoachStore } from "@/lib/italian-coach/store";
import { GameCard } from "./SentenceCraft";

export function InfiniteBuilder() {
  const knownWordIds = useCoachStore((s) => s.knownWordIds);
  const addXp = useCoachStore((s) => s.addXp);
  const [setIndex] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ valid: string[]; count: number } | null>(null);

  const current = infiniteBuilderSets[setIndex % infiniteBuilderSets.length];
  const knownSet = useMemo(() => new Set(knownWordIds), [knownWordIds]);

  function addLine() {
    if (!input.trim()) return;
    setLines((prev) => [...prev, input.trim()]);
    setInput("");
  }

  function score() {
    const scored = scoreInfiniteBuilder(lines, current.words, knownSet);
    addXp(scored.xp);
    setResult({ valid: scored.valid, count: scored.count });
  }

  return (
    <GameCard title="Infinite Builder" subtitle="Use only these 5 words. Make max phrases.">
      <div className="flex flex-wrap gap-1.5">
        {current.words.map((w) => (
          <span key={w} className="rounded-md border border-stone-300 bg-white px-2.5 py-0.5 text-sm text-stone-700">
            {w}
          </span>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addLine();
          }}
          className="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:border-stone-900"
          placeholder="One phrase per line…"
        />
        <button
          type="button"
          onClick={addLine}
          className="rounded-full border border-stone-300 px-3 py-2 text-sm text-stone-700 hover:border-stone-900"
        >
          Add
        </button>
      </div>
      {lines.length > 0 ? (
        <ul className="mt-2 text-sm text-stone-600">
          {lines.map((l, i) => (
            <li key={i}>· {l}</li>
          ))}
        </ul>
      ) : null}
      <button
        type="button"
        onClick={score}
        className="mt-3 rounded-full bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800"
      >
        Score phrases
      </button>
      {result ? (
        <p className="mt-2 text-sm text-emerald-700">
          {result.count} valid
          {result.count >= current.minValid ? " — strong combo!" : ` — aim for ${current.minValid}+`}
        </p>
      ) : null}
    </GameCard>
  );
}
