"use client";

import { useEffect, useRef, useState } from "react";
import { craftChallenges } from "@/content/italian-coach/dictionary";
import { almostCorrectFeedback } from "@/lib/italian-coach/engine";
import { useCoachStore } from "@/lib/italian-coach/store";

const TIMER_SEC = 25;

export function SentenceCraft() {
  const addXp = useCoachStore((s) => s.addXp);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(TIMER_SEC);
  const [running, setRunning] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [combo, setCombo] = useState(0);
  const remainingRef = useRef(TIMER_SEC);

  const challenge = craftChallenges[index % craftChallenges.length];

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      remainingRef.current -= 1;
      if (remainingRef.current <= 0) {
        clearInterval(id);
        setTimeLeft(0);
        setRunning(false);
        setMsg("Time! Streak reset.");
        setCombo(0);
      } else {
        setTimeLeft(remainingRef.current);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  function start() {
    remainingRef.current = TIMER_SEC;
    setRunning(true);
    setTimeLeft(TIMER_SEC);
    setMsg(null);
    setInput("");
  }

  function submit() {
    const fb = almostCorrectFeedback(input, challenge.answer);
    if (fb.ok) {
      const bonus = timeLeft > 15 ? 3 : 0;
      addXp(5 + bonus + (combo >= 2 ? 20 : 0));
      setCombo((c) => c + 1);
      setMsg(`+${5 + bonus} XP${combo >= 2 ? " · Perfect streak!" : ""}`);
      setIndex((i) => (i + 1) % craftChallenges.length);
      setInput("");
      remainingRef.current = TIMER_SEC;
      setTimeLeft(TIMER_SEC);
    } else {
      setCombo(0);
      setMsg(fb.nativeHint ? `${fb.message} ${fb.nativeHint}` : fb.message);
    }
  }

  return (
    <GameShell title="Sentence Craft" subtitle="Build the sentence before the timer ends.">
      <p className="text-sm text-zinc-300">English: {challenge.english}</p>
      <p className="mt-2 rounded-xl border border-zinc-700/70 bg-zinc-950/40 px-3 py-2 text-zinc-200">
        Words: {challenge.scrambled.join(" / ")}
      </p>
      <div className="mt-3 flex items-center gap-3">
        <span className={`text-2xl font-bold tabular-nums ${timeLeft <= 5 && running ? "text-red-300" : "text-cyan-200"}`}>
          {running ? timeLeft : TIMER_SEC}s
        </span>
        {combo > 0 ? <span className="text-sm text-amber-200">Combo ×{combo}</span> : null}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={!running}
        className="mt-3 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none ring-cyan-400/70 focus:ring-2 disabled:opacity-50"
        placeholder="Type Italian sentence…"
      />
      <div className="mt-3 flex gap-2">
        {!running ? (
          <button type="button" onClick={start} className={gameBtn}>
            Start Round
          </button>
        ) : (
          <button type="button" onClick={submit} className={gameBtn}>
            Check
          </button>
        )}
      </div>
      {msg ? <p className="mt-2 text-sm text-amber-200">{msg}</p> : null}
    </GameShell>
  );
}

const gameBtn =
  "rounded-xl border border-cyan-300/50 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-400/20";

function GameShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-zinc-700/60 bg-zinc-900/55 p-5 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">{title}</p>
      <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}
