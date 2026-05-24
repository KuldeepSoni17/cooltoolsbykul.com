"use client";

import { useEffect, useRef, useState } from "react";
import { craftChallenges } from "@/content/italian-coach/dictionary";
import { permutationMatch, almostCorrectFeedback } from "@/lib/italian-coach/engine";
import { useCoachStore } from "@/lib/italian-coach/store";

const TIMER_SEC = 30;

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
    // Accept any valid permutation of the same words
    const ok = permutationMatch(input, challenge.scrambled);
    if (ok) {
      const bonus = timeLeft > 18 ? 5 : timeLeft > 8 ? 2 : 0;
      const earned = 5 + bonus + (combo >= 2 ? 20 : 0);
      addXp(earned);
      setCombo((c) => c + 1);
      const orderHint =
        input.trim().toLowerCase() !== challenge.answer.toLowerCase()
          ? ` Most natural: ${challenge.answer}.`
          : "";
      setMsg(`+${earned} XP${combo >= 2 ? " · perfect streak!" : ""}${orderHint}`);
      setIndex((i) => (i + 1) % craftChallenges.length);
      setInput("");
      remainingRef.current = TIMER_SEC;
      setTimeLeft(TIMER_SEC);
    } else {
      const fb = almostCorrectFeedback(input, challenge.answer);
      setCombo(0);
      setMsg(fb.nativeHint ?? fb.message);
    }
  }

  return (
    <GameCard title="Sentence Craft" subtitle="Build a valid sentence from these words. Any natural order accepted.">
      <p className="text-sm text-stone-500">{challenge.english}</p>
      <p className="mt-2 font-serif text-xl text-stone-900">{challenge.scrambled.join(" · ")}</p>
      <div className="mt-3 flex items-center gap-3">
        <span
          className={`font-serif text-2xl tabular-nums ${
            timeLeft <= 5 && running ? "text-rose-600" : "text-stone-900"
          }`}
        >
          {running ? timeLeft : TIMER_SEC}s
        </span>
        {combo > 0 ? <span className="text-sm text-amber-600">Combo ×{combo}</span> : null}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && running) submit();
        }}
        disabled={!running}
        className="mt-3 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:border-stone-900 disabled:opacity-50"
        placeholder="Type Italian sentence…"
      />
      <div className="mt-3">
        {!running ? (
          <button type="button" onClick={start} className={primaryBtn}>
            Start round
          </button>
        ) : (
          <button type="button" onClick={submit} className={primaryBtn}>
            Check
          </button>
        )}
      </div>
      {msg ? <p className="mt-2 text-sm text-stone-600">{msg}</p> : null}
    </GameCard>
  );
}

const primaryBtn =
  "rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700";

export function GameCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white/70 p-5">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">{title}</p>
      <p className="mt-1 text-sm text-stone-500">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}
