"use client";

import { useState } from "react";
import { infiniteBuilderSets } from "@/content/italian-coach/dictionary";
import { normalizeSentence } from "@/lib/italian-coach/engine";
import { useCoachStore } from "@/lib/italian-coach/store";
import { GameCard } from "./SentenceCraft";

export function InfiniteBuilder() {
  const addXp = useCoachStore((s) => s.addXp);
  const [setIdx, setSetIdx] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ valid: string[]; rejected: string[] } | null>(null);

  const current = infiniteBuilderSets[setIdx % infiniteBuilderSets.length];

  function addLine() {
    if (!input.trim()) return;
    setLines((prev) => [...prev, input.trim()]);
    setInput("");
  }

  function score() {
    const seen = new Set<string>();
    const valid: string[] = [];
    const rejected: string[] = [];
    for (const l of lines) {
      const words = normalizeSentence(l).split(" ");
      const allowed = current.words.map((w) => normalizeSentence(w));
      const onlyAllowed = words.every((w) => allowed.includes(w));
      if (!onlyAllowed) {
        rejected.push(`${l} (uses words not in set)`);
        continue;
      }
      // accept any sequence using allowed words (assume natural Italian order — light validation)
      const key = normalizeSentence(l);
      if (seen.has(key)) continue;
      seen.add(key);
      valid.push(l);
    }
    addXp(valid.length * 10);
    setResult({ valid, rejected });
  }

  function shuffleSet() {
    setLines([]);
    setResult(null);
    setSetIdx((i) => (i + 1) % infiniteBuilderSets.length);
  }

  return (
    <GameCard title="Infinite Builder" subtitle="Use only these 5 words. Make as many phrases as you can.">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {current.words.map((w) => (
            <span key={w} className="rounded-md border border-stone-300 bg-white px-2.5 py-0.5 text-sm text-stone-700">
              {w}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={shuffleSet}
          className="text-xs text-stone-500 hover:text-stone-900"
        >
          New set
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addLine();
          }}
          className="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:border-stone-900"
          placeholder="A phrase…"
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
        disabled={lines.length === 0}
        className="mt-3 rounded-full bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:opacity-40"
      >
        Score phrases
      </button>
      {result ? (
        <div className="mt-3 space-y-1 text-sm">
          <p className="text-emerald-700">
            {result.valid.length} valid · +{result.valid.length * 10} XP
            {result.valid.length >= current.minValid ? " · strong combo!" : ` · aim for ${current.minValid}+`}
          </p>
          {result.rejected.length ? (
            <ul className="text-stone-500">
              {result.rejected.map((r, i) => (
                <li key={i}>× {r}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </GameCard>
  );
}
