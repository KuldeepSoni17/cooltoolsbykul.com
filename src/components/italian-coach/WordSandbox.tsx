"use client";

import { useMemo, useState } from "react";
import { allDictionaryWords } from "@/content/italian-coach/dictionary";
import { generatePhrases, normalizeSentence, validateAgainstPhrases } from "@/lib/italian-coach/engine";
import { useCoachStore } from "@/lib/italian-coach/store";
import { WordChip } from "./WordChip";

export function WordSandbox() {
  const knownWordIds = useCoachStore((s) => s.knownWordIds);
  const addXp = useCoachStore((s) => s.addXp);
  const recordPhrase = useCoachStore((s) => s.recordPhraseCreated);
  const knownSet = useMemo(() => new Set(knownWordIds), [knownWordIds]);
  const bank = useMemo(
    () => allDictionaryWords.filter((w) => knownSet.has(w.id)),
    [knownSet],
  );
  const validPhrases = useMemo(() => generatePhrases(knownSet, undefined, 80), [knownSet]);

  const [built, setBuilt] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const builtWords = built
    .map((id) => bank.find((w) => w.id === id))
    .filter(Boolean) as typeof bank;
  const italianPreview = builtWords.map((w) => w.word).join(" ");
  const englishPreview = builtWords.map((w) => w.english).join(" · ");

  function addWord(id: string) {
    setBuilt((prev) => [...prev, id]);
    setFeedback(null);
  }

  function clear() {
    setBuilt([]);
    setFeedback(null);
  }

  function check() {
    const sentence = builtWords.map((w) => w.word).join(" ");
    const result = validateAgainstPhrases(sentence, validPhrases);
    if (result.ok) {
      addXp(10);
      recordPhrase();
      setFeedback(`Valid structure: ${result.match?.italian ?? sentence}`);
      setBuilt([]);
    } else {
      const partial = validPhrases.find((p) =>
        normalizeSentence(p.italian).includes(normalizeSentence(sentence)),
      );
      setFeedback(
        partial
          ? `Almost — try: ${partial.italian}`
          : "Not a known pattern yet. Unlock more words or try Subject + Verb + Object.",
      );
    }
  }

  return (
    <section className="rounded-3xl border border-zinc-700/60 bg-zinc-900/55 p-5 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Language Sandbox</p>
      <p className="mt-1 text-sm text-zinc-400">Click words to assemble. Structure beats memorization.</p>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-700/70 bg-zinc-950/40 p-3">
          <p className="mb-2 text-xs font-semibold uppercase text-zinc-500">Memory Bank</p>
          <div className="flex flex-wrap gap-2">
            {bank.map((w) => (
              <WordChip key={w.id} word={w} size="sm" onClick={() => addWord(w.id)} />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-500/30 bg-zinc-950/50 p-3">
          <p className="mb-2 text-xs font-semibold uppercase text-cyan-300/80">Sentence Builder</p>
          <div className="min-h-[4rem] flex flex-wrap gap-2 items-center">
            {builtWords.length === 0 ? (
              <span className="text-sm text-zinc-500">Tap words to build…</span>
            ) : (
              builtWords.map((w, i) => (
                <WordChip
                  key={`${w.id}-${i}`}
                  word={w}
                  size="sm"
                  onClick={() => setBuilt((prev) => prev.filter((_, j) => j !== i))}
                  selected
                />
              ))
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={check}
              disabled={built.length < 2}
              className="rounded-xl border border-cyan-300/50 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 disabled:opacity-40 hover:bg-cyan-400/20"
            >
              Validate
            </button>
            <button
              type="button"
              onClick={clear}
              className="rounded-xl border border-zinc-600 px-3 py-1.5 text-xs text-zinc-300 hover:border-zinc-500"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/25 bg-zinc-950/40 p-3">
          <p className="mb-2 text-xs font-semibold uppercase text-emerald-300/80">Meaning Preview</p>
          <p className="text-lg font-medium text-white">{italianPreview || "—"}</p>
          <p className="mt-1 text-sm text-zinc-400">{englishPreview || "Build a phrase to see meaning."}</p>
          {feedback ? <p className="mt-3 text-sm text-amber-200">{feedback}</p> : null}
        </div>
      </div>
    </section>
  );
}
