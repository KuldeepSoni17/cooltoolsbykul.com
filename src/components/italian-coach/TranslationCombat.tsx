"use client";

import { useState } from "react";
import { combatChallenges } from "@/content/italian-coach/dictionary";
import { almostCorrectFeedback } from "@/lib/italian-coach/engine";
import { useCoachStore } from "@/lib/italian-coach/store";
import { GameCard } from "./SentenceCraft";

export function TranslationCombat() {
  const addXp = useCoachStore((s) => s.addXp);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [hp, setHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [log, setLog] = useState<string | null>(null);

  const challenge = combatChallenges[index % combatChallenges.length];

  function attack() {
    const fb = almostCorrectFeedback(input, challenge.italian, challenge.hint);
    if (fb.ok) {
      const dmg = 35;
      setEnemyHp((e) => Math.max(0, e - dmg));
      addXp(8);
      setLog(`Hit! −${dmg} enemy HP`);
      setIndex((i) => (i + 1) % combatChallenges.length);
      setInput("");
      if (enemyHp - dmg <= 0) {
        setEnemyHp(100);
        setLog("Wave cleared — next.");
      }
    } else {
      setHp((h) => Math.max(0, h - 15));
      setLog(fb.nativeHint ?? fb.message);
    }
  }

  return (
    <GameCard title="Translation Combat" subtitle="English attacks. Italian counters.">
      <div className="flex justify-between gap-4 text-xs text-stone-500">
        <div className="w-full">
          You
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-stone-200">
            <div className="h-full bg-stone-900 transition-all" style={{ width: `${hp}%` }} />
          </div>
        </div>
        <div className="w-full text-right">
          Enemy
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-stone-200">
            <div className="ml-auto h-full bg-rose-500 transition-all" style={{ width: `${enemyHp}%` }} />
          </div>
        </div>
      </div>

      <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 font-serif text-lg text-rose-900">
        « {challenge.english} »
      </p>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="mt-3 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:border-stone-900"
        placeholder="Counter-attack in Italian…"
      />
      <button
        type="button"
        onClick={attack}
        className="mt-3 rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700"
      >
        Strike
      </button>
      {log ? <p className="mt-2 text-sm text-stone-600">{log}</p> : null}
    </GameCard>
  );
}
