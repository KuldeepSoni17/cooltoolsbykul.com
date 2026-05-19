"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import {
  applySubmission,
  botSubmission,
  colorLabel,
  createInitialMatch,
  resolveRound,
} from "@/lib/telepath/engine";
import { FEATURE_NAMES } from "@/lib/telepath/types";
import type { FeatureId, MatchState, PlayerColor, TransferSubmission } from "@/lib/telepath/types";

const COLORS: PlayerColor[] = ["red", "blue", "green"];

const COLOR_STYLES: Record<PlayerColor, string> = {
  red: "border-red-500/70 bg-red-950/40",
  blue: "border-blue-500/70 bg-blue-950/40",
  green: "border-emerald-500/70 bg-emerald-950/40",
};

function MatchInner() {
  const params = useSearchParams();
  const name = params.get("name") ?? "Player";
  const humanColor = (params.get("color") as PlayerColor) ?? "red";

  const [state, setState] = useState<MatchState>(() => createInitialMatch(humanColor));
  const [toA, setToA] = useState(0);
  const [toB, setToB] = useState(0);
  const [feature, setFeature] = useState<FeatureId | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const opponents = useMemo(() => COLORS.filter((c) => c !== humanColor), [humanColor]);
  const myContainer = state.containers[humanColor];
  const maxSend = myContainer.units;
  const totalSend = toA + toB;

  const submitRound = () => {
    if (submitted || state.winner || totalSend > maxSend) return;

    const submission: TransferSubmission = {
      toRed: 0,
      toGreen: 0,
      toBlue: 0,
      feature,
    };
    if (opponents[0] === "red") submission.toRed = toA;
    else if (opponents[0] === "green") submission.toGreen = toA;
    else submission.toBlue = toA;

    if (opponents[1] === "red") submission.toRed = toB;
    else if (opponents[1] === "green") submission.toGreen = toB;
    else submission.toBlue = toB;

    let next = applySubmission(state, humanColor, submission);
    for (const bot of opponents) {
      next = applySubmission(next, bot, botSubmission(bot, next.containers));
    }
    next = resolveRound(next);
    setState(next);
    setSubmitted(true);
    setToA(0);
    setToB(0);
    setFeature(null);
  };

  const nextRound = () => {
    setSubmitted(false);
  };

  if (!COLORS.includes(humanColor)) {
    return (
      <main className="min-h-screen bg-zinc-950 p-8 text-zinc-100">
        <p>Invalid color. </p>
        <Link href="/games/telepath/play" className="text-violet-300">
          Go back
        </Link>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(167,139,250,0.12),transparent_45%)]" />

      <div className="relative mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link href="/games/telepath" className="text-sm text-violet-300 hover:text-violet-200">
              Telepath
            </Link>
            <h1 className="mt-1 text-2xl font-bold">
              {name} · <span className="capitalize text-violet-300">{humanColor}</span>
            </h1>
            <p className="text-sm text-zinc-400">Round {state.round}</p>
          </div>
          {state.winner && (
            <div className="rounded-xl border border-violet-500/50 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-200">
              {state.winner === humanColor ? "You win!" : `${colorLabel(state.winner)} wins`}
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {COLORS.map((c) => {
            const box = state.containers[c];
            const isYou = c === humanColor;
            return (
              <article
                key={c}
                className={`rounded-2xl border p-4 ${COLOR_STYLES[c]} ${isYou ? "ring-2 ring-violet-400/50" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold capitalize">{c}</h2>
                  {isYou && <span className="text-xs text-violet-300">you</span>}
                  {!isYou && <span className="text-xs text-zinc-500">bot</span>}
                </div>
                <p className="mt-3 text-4xl font-bold tabular-nums">{box.units}</p>
                <p className="mt-1 text-xs text-zinc-400">units remaining</p>
                <ul className="mt-3 space-y-1 text-xs text-zinc-400">
                  {(["blockTransfer", "anonTransfer", "mutualIncrease", "reversal"] as const).map((k, i) => (
                    <li key={k}>
                      {FEATURE_NAMES[i as FeatureId]}: {box[k]}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
          <h3 className="font-semibold">Round log</h3>
          <ul className="mt-2 space-y-1 text-sm text-zinc-300">
            {state.lastRoundLog.map((line, i) => (
              <li key={`${state.round}-${i}-${line}`}>{line}</li>
            ))}
          </ul>
        </section>

        {!state.winner && (
          <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
            <h3 className="font-semibold">Your transfer</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Distribute up to {maxSend} units between {colorLabel(opponents[0]!)} and{" "}
              {colorLabel(opponents[1]!)} (total: {totalSend}/{maxSend})
            </p>

            {!submitted ? (
              <>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs uppercase text-zinc-500">To {opponents[0]}</span>
                    <input
                      type="range"
                      min={0}
                      max={maxSend}
                      value={toA}
                      onChange={(e) => setToA(Number(e.target.value))}
                      className="mt-2 w-full"
                    />
                    <span className="text-lg font-semibold">{toA}</span>
                  </label>
                  <label className="block">
                    <span className="text-xs uppercase text-zinc-500">To {opponents[1]}</span>
                    <input
                      type="range"
                      min={0}
                      max={maxSend}
                      value={toB}
                      onChange={(e) => setToB(Number(e.target.value))}
                      className="mt-2 w-full"
                    />
                    <span className="text-lg font-semibold">{toB}</span>
                  </label>
                </div>

                <p className="mt-6 text-xs font-semibold uppercase text-zinc-500">Optional power (one use each)</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {([0, 1, 2, 3] as FeatureId[]).map((id) => {
                    const key = ["blockTransfer", "anonTransfer", "mutualIncrease", "reversal"][id] as keyof typeof myContainer;
                    const used = myContainer[key] !== "unused";
                    return (
                      <button
                        key={id}
                        type="button"
                        disabled={used}
                        onClick={() => setFeature(feature === id ? null : id)}
                        className={`rounded-lg border px-3 py-2 text-xs ${
                          feature === id
                            ? "border-violet-500 bg-violet-500/20"
                            : used
                              ? "border-zinc-800 text-zinc-600"
                              : "border-zinc-600 hover:border-zinc-400"
                        }`}
                      >
                        {FEATURE_NAMES[id]}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={submitRound}
                  disabled={totalSend > maxSend}
                  className="mt-6 rounded-xl bg-violet-400 px-6 py-3 font-semibold text-zinc-950 disabled:opacity-40 hover:bg-violet-300"
                >
                  Commit round
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={nextRound}
                className="mt-4 rounded-xl border border-violet-500/50 px-6 py-3 font-semibold text-violet-200 hover:bg-violet-500/10"
              >
                Next round
              </button>
            )}
          </section>
        )}

        {state.winner && (
          <div className="mt-8 flex gap-3">
            <Link
              href="/games/telepath/play"
              className="rounded-xl bg-violet-400 px-5 py-2 font-semibold text-zinc-950 hover:bg-violet-300"
            >
              Play again
            </Link>
            <Link
              href="/games/telepath"
              className="rounded-xl border border-zinc-600 px-5 py-2 text-zinc-200 hover:border-zinc-400"
            >
              Back to overview
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default function TelepathMatchPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-zinc-950 p-8 text-zinc-100">
          <p>Loading match…</p>
        </main>
      }
    >
      <MatchInner />
    </Suspense>
  );
}
