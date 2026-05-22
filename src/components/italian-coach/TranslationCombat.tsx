"use client";

import { useState } from "react";
import { combatChallenges } from "@/content/italian-coach/dictionary";
import { almostCorrectFeedback } from "@/lib/italian-coach/engine";
import { useCoachStore } from "@/lib/italian-coach/store";

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
      setLog(`Critical hit! −${dmg} enemy HP`);
      setIndex((i) => (i + 1) % combatChallenges.length);
      setInput("");
      if (enemyHp - dmg <= 0) {
        setEnemyHp(100);
        setLog("Enemy defeated — next wave!");
      }
    } else {
      setHp((h) => Math.max(0, h - 15));
      setLog(fb.nativeHint ?? fb.message);
    }
  }

  return (
    <section className="rounded-3xl border border-red-900/40 bg-gradient-to-b from-red-950/30 to-zinc-900/55 p-5 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.24em] text-red-300/90">Translation Combat</p>
      <p className="mt-1 text-sm text-zinc-500">Enemy attacks in English. Assemble Italian fast for attack power.</p>

      <div className="mt-4 flex justify-between gap-4 text-sm">
        <div>
          <span className="text-zinc-500">You</span>
          <div className="mt-1 h-2 w-32 overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full bg-cyan-400 transition-all" style={{ width: `${hp}%` }} />
          </div>
        </div>
        <div className="text-right">
          <span className="text-zinc-500">Enemy</span>
          <div className="mt-1 h-2 w-32 overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full bg-red-400 transition-all" style={{ width: `${enemyHp}%` }} />
          </div>
        </div>
      </div>

      <p className="mt-4 rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-lg text-red-100">
        « {challenge.english} »
      </p>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="mt-3 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none ring-red-400/50 focus:ring-2"
        placeholder="Counter-attack in Italian…"
      />
      <button
        type="button"
        onClick={attack}
        className="mt-3 rounded-xl border border-red-400/50 bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-100 hover:bg-red-500/25"
      >
        Strike
      </button>
      {log ? <p className="mt-2 text-sm text-amber-200">{log}</p> : null}
    </section>
  );
}
