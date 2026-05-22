"use client";

import { useMemo, useState } from "react";
import { infiniteBuilderSets } from "@/content/italian-coach/dictionary";
import { scoreInfiniteBuilder } from "@/lib/italian-coach/engine";
import { useCoachStore } from "@/lib/italian-coach/store";

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
    <section className="rounded-3xl border border-zinc-700/60 bg-zinc-900/55 p-5 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Infinite Builder</p>
      <p className="mt-1 text-sm text-zinc-500">Use only these 5 words. Create maximum valid phrases.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {current.words.map((w) => (
          <span key={w} className="rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-1 text-sm text-zinc-100">
            {w}
          </span>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none ring-cyan-400/70 focus:ring-2"
          placeholder="One phrase per line…"
        />
        <button type="button" onClick={addLine} className="rounded-xl border border-zinc-600 px-3 py-2 text-sm text-zinc-200 hover:border-zinc-500">
          Add
        </button>
      </div>
      {lines.length > 0 ? (
        <ul className="mt-2 text-sm text-zinc-400">
          {lines.map((l, i) => (
            <li key={i}>· {l}</li>
          ))}
        </ul>
      ) : null}
      <button type="button" onClick={score} className="mt-3 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-400/20">
        Score phrases
      </button>
      {result ? (
        <p className="mt-2 text-sm text-emerald-200">
          {result.count} valid phrase{result.count === 1 ? "" : "s"}
          {result.count >= current.minValid ? " — strong combo!" : ` — aim for ${current.minValid}+`}
        </p>
      ) : null}
    </section>
  );
}
