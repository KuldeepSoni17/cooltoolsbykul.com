"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { BackLink } from "@/components/telepath/BackLink";
import { ContainerOrb } from "@/components/telepath/ContainerOrb";
import { PowerIcon } from "@/components/telepath/PowerIcon";
import { TelepathBackdrop } from "@/components/telepath/TelepathBackdrop";
import { POWERS, TELEPATH_COLORS } from "@/components/telepath/tokens";
import {
  colorLabel,
  commitRound,
  createInitialMatch,
} from "@/lib/telepath/engine";
import type {
  Container,
  FeatureId,
  MatchState,
  PlayerColor,
  TransferSubmission,
} from "@/lib/telepath/types";
import { FEATURE_NAMES } from "@/lib/telepath/types";

const COLORS: PlayerColor[] = ["red", "blue", "green"];

type Phase = "plan" | "reveal";

function MatchInner() {
  const params = useSearchParams();
  const name = params.get("name") ?? "Player";
  const humanColor = (params.get("color") as PlayerColor) ?? "red";

  const [state, setState] = useState<MatchState | null>(() =>
    COLORS.includes(humanColor) ? createInitialMatch(humanColor, name) : null
  );
  const [phase, setPhase] = useState<Phase>("plan");
  const [pendingReveal, setPendingReveal] = useState<MatchState | null>(null);
  const [toA, setToA] = useState(0);
  const [toB, setToB] = useState(0);
  const [feature, setFeature] = useState<FeatureId | null>(null);

  const opponents = useMemo(
    () =>
      COLORS.filter((c) => c !== humanColor) as [PlayerColor, PlayerColor],
    [humanColor]
  );

  if (!state) {
    return (
      <main className="relative min-h-screen p-8 text-zinc-100">
        <TelepathBackdrop />
        <p className="relative">Loading match…</p>
      </main>
    );
  }

  if (!COLORS.includes(humanColor)) {
    return (
      <main className="relative min-h-screen p-8 text-zinc-100">
        <TelepathBackdrop />
        <p className="relative">Invalid color.</p>
        <Link href="/games/telepath/play" className="relative text-violet-300">
          Go back
        </Link>
      </main>
    );
  }

  const displayState = phase === "reveal" && pendingReveal ? pendingReveal : state;
  const unitDisplay = (color: PlayerColor) => {
    if (phase === "reveal" && pendingReveal) {
      const d = pendingReveal.lastRoundDeltas.find((x) => x.color === color);
      return d?.before ?? pendingReveal.containers[color].units;
    }
    return state.containers[color].units;
  };

  const myContainer = state.containers[humanColor];
  const maxSend = myContainer.units;
  const totalSend = toA + toB;
  const overSend = totalSend > maxSend;
  const youToken = TELEPATH_COLORS[humanColor];
  const youWin = state.winner === humanColor;
  const underPressure =
    state.pressureStreak >= 2 &&
    state.containers[humanColor].units <=
      Math.max(...opponents.map((o) => state.containers[o].units));

  const applyPreset = (mode: "even" | "focus" | "rush") => {
    if (maxSend <= 0) return;
    const [o1, o2] = opponents;
    const u1 = state.containers[o1].units;
    const u2 = state.containers[o2].units;

    if (mode === "even") {
      const half = Math.floor(maxSend / 2);
      setToA(half);
      setToB(maxSend - half);
      return;
    }

    const focus = mode === "focus" ? (u1 <= u2 ? o1 : o2) : u1 >= u2 ? o1 : o2;
    const spend = mode === "rush" ? maxSend : Math.max(1, Math.floor(maxSend * 0.7));
    const primaryAmt = Math.min(spend, Math.ceil(spend * 0.75));
    const secondaryAmt = spend - primaryAmt;
    if (focus === o1) {
      setToA(primaryAmt);
      setToB(secondaryAmt);
    } else {
      setToB(primaryAmt);
      setToA(secondaryAmt);
    }
  };

  const submitRound = () => {
    if (phase !== "plan" || state.winner || overSend) return;

    const submission: TransferSubmission = {
      toRed: 0,
      toGreen: 0,
      toBlue: 0,
      feature,
    };
    const setForOpp = (opp: PlayerColor, amt: number) => {
      if (opp === "red") submission.toRed = amt;
      else if (opp === "green") submission.toGreen = amt;
      else submission.toBlue = amt;
    };
    setForOpp(opponents[0], toA);
    setForOpp(opponents[1], toB);

    const next = commitRound(state, submission);
    setPendingReveal(next);
    setPhase("reveal");
  };

  const finishReveal = () => {
    if (!pendingReveal) return;
    setState(pendingReveal);
    setPendingReveal(null);
    setPhase("plan");
    setToA(0);
    setToB(0);
    setFeature(null);
  };

  return (
    <main className="relative min-h-screen px-4 py-8 text-zinc-100 sm:px-8">
      <TelepathBackdrop />

      <div className="relative mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BackLink href="/games/telepath" label="Telepath" />
            <span
              className="hidden rounded-full border px-3 py-1 text-xs font-semibold sm:inline-flex"
              style={{
                borderColor: `${youToken.hex}55`,
                background: youToken.soft,
                color: youToken.hex,
              }}
            >
              You · {youToken.label}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300 backdrop-blur">
              Round{" "}
              <span className="ml-1 tabular-nums text-white">
                {phase === "reveal" ? state.round : displayState.round}
              </span>
            </div>
            {state.winner && (
              <div
                className="rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em]"
                style={{
                  borderColor: youWin ? youToken.hex : "rgba(255,255,255,0.2)",
                  background: youWin ? youToken.soft : "rgba(255,255,255,0.06)",
                  color: youWin ? youToken.hex : "#e4e4e7",
                  boxShadow: youWin ? `0 0 32px ${youToken.soft}` : undefined,
                }}
              >
                {youWin ? "You win" : `${colorLabel(state.winner)} wins`}
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 px-1 text-sm">
          <span className="text-zinc-400">
            Playing as <span className="text-white">{name}</span>
          </span>
          {underPressure && !state.winner && phase === "plan" && (
            <span className="rounded-full border border-[#ff5577]/40 bg-[#ff5577]/10 px-3 py-0.5 text-xs font-semibold text-[#ff8da3]">
              Under pressure — strike now
            </span>
          )}
        </div>

        {/* Containers */}
        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {COLORS.map((c) => {
            const box = displayState.containers[c];
            const shownUnits = unitDisplay(c);
            const isYou = c === humanColor;
            const t = TELEPATH_COLORS[c];
            const dead = shownUnits <= 0;
            const delta =
              phase === "reveal" && pendingReveal
                ? pendingReveal.lastRoundDeltas.find((d) => d.color === c)
                : null;

            return (
              <article
                key={c}
                className="relative overflow-hidden rounded-2xl border bg-white/[0.03] p-5 backdrop-blur-xl transition-all duration-500"
                style={{
                  borderColor: isYou ? `${t.hex}88` : "rgba(255,255,255,0.08)",
                  boxShadow: isYou
                    ? `0 0 38px ${t.soft}, inset 0 0 0 1px ${t.hex}33`
                    : undefined,
                  opacity: dead ? 0.45 : 1,
                }}
              >
                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl"
                  style={{ background: t.hex, opacity: 0.18 }}
                />
                <div className="relative flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-bold uppercase tracking-[0.18em]"
                        style={{ color: t.hex }}
                      >
                        {t.label}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {displayState.displayNames[c]}
                      </span>
                      {isYou && (
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                          You
                        </span>
                      )}
                    </div>
                    <p
                      className="mt-4 text-5xl font-bold tabular-nums text-white transition-all"
                      style={{
                        textShadow: dead ? "none" : `0 0 24px ${t.soft}`,
                      }}
                    >
                      {shownUnits}
                    </p>
                    {delta && delta.after !== delta.before && (
                      <p
                        className="mt-1 text-sm font-semibold tabular-nums"
                        style={{
                          color: delta.after > delta.before ? "#39d98a" : "#ff5577",
                        }}
                      >
                        {delta.after > delta.before ? "+" : ""}
                        {delta.after - delta.before} → {delta.after}
                      </p>
                    )}
                    <p className="mt-1 text-[11px] uppercase tracking-wider text-zinc-500">
                      Units remaining
                    </p>
                  </div>
                  <ContainerOrb
                    color={c}
                    size="md"
                    active={!dead}
                    pulse={isYou && !dead && !state.winner && phase === "plan"}
                  />
                </div>

                <div className="relative mt-5 flex flex-wrap gap-1.5">
                  {POWERS.map((p) => {
                    const status = box[p.containerField];
                    const isUsed = status === "used";
                    const isActive = status === "active";
                    return (
                      <span
                        key={p.key}
                        title={`${p.name} · ${status}`}
                        className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wider"
                        style={{
                          borderColor: isActive
                            ? t.hex
                            : isUsed
                              ? "rgba(255,255,255,0.04)"
                              : "rgba(255,255,255,0.12)",
                          background: isActive
                            ? t.soft
                            : isUsed
                              ? "rgba(255,255,255,0.02)"
                              : "rgba(255,255,255,0.04)",
                          color: isActive
                            ? t.hex
                            : isUsed
                              ? "#52525b"
                              : "#a1a1aa",
                          textDecoration: isUsed ? "line-through" : "none",
                        }}
                      >
                        <PowerIcon power={p.key} className="h-3 w-3" />
                        {p.short}
                      </span>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </section>

        {/* Reveal panel */}
        {phase === "reveal" && pendingReveal && (
          <section className="mt-6 rounded-2xl border border-violet-500/30 bg-violet-500/10 p-6 backdrop-blur-xl">
            <h3 className="text-lg font-semibold text-white">Round revealed</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Everyone committed simultaneously. Here&apos;s what hit the board.
            </p>
            <ul className="mt-4 space-y-2">
              {pendingReveal.lastRoundMoves.map((move) => {
                const t = TELEPATH_COLORS[move.color];
                const lines: string[] = [];
                for (const target of COLORS) {
                  if (target === move.color) continue;
                  const amt =
                    target === "red"
                      ? move.toRed
                      : target === "green"
                        ? move.toGreen
                        : move.toBlue;
                  if (amt > 0) {
                    lines.push(
                      `${amt} → ${move.hiddenSender ? "?" : colorLabel(target)}`
                    );
                  }
                }
                return (
                  <li
                    key={move.color}
                    className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm"
                  >
                    <span
                      className="font-semibold"
                      style={{ color: t.hex }}
                    >
                      {move.displayName}
                    </span>
                    <span className="text-zinc-300">
                      {lines.length ? lines.join(" · ") : "held"}
                    </span>
                    {move.feature !== null && (
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-zinc-300">
                        {FEATURE_NAMES[move.feature]}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={finishReveal}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950"
            >
              {state.winner ? "See final standings" : "Next round"}
            </button>
          </section>
        )}

        {/* Transfer panel */}
        {!state.winner && phase === "plan" && (
          <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">Your transfer</h3>
              <p className="text-xs text-zinc-400">
                Distribute up to{" "}
                <span className="text-white">{maxSend}</span> units — sending
                costs you; unblocked hits hurt them.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <PresetButton label="Split even" onClick={() => applyPreset("even")} />
              <PresetButton
                label={`Finish ${colorLabel(opponents.find((o) => state.containers[o].units <= 2) ?? opponents[0])}`}
                onClick={() => applyPreset("focus")}
              />
              <PresetButton label="All-in rush" onClick={() => applyPreset("rush")} />
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <TransferSlider
                color={opponents[0]}
                value={toA}
                max={maxSend}
                onChange={setToA}
                rivalUnits={state.containers[opponents[0]].units}
              />
              <TransferSlider
                color={opponents[1]}
                value={toB}
                max={maxSend}
                onChange={setToB}
                rivalUnits={state.containers[opponents[1]].units}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs">
              <p className="text-zinc-400">
                Send{" "}
                <span style={{ color: TELEPATH_COLORS[opponents[0]].hex }}>
                  {toA}
                </span>{" "}
                → {colorLabel(opponents[0])},{" "}
                <span style={{ color: TELEPATH_COLORS[opponents[1]].hex }}>
                  {toB}
                </span>{" "}
                → {colorLabel(opponents[1])} ·{" "}
                <span className="text-zinc-300">
                  {totalSend}/{maxSend}
                </span>
              </p>
              {overSend && (
                <p className="font-semibold text-[#ff5577]">
                  You only have {maxSend} units.
                </p>
              )}
            </div>

            <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Optional power (one use each)
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {POWERS.map((p) => {
                const status =
                  myContainer[p.containerField] as Container[typeof p.containerField];
                const used = status !== "unused";
                const selected = feature === p.id;
                return (
                  <button
                    key={p.key}
                    type="button"
                    disabled={used}
                    onClick={() => setFeature(selected ? null : p.id)}
                    className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed"
                    style={{
                      borderColor: selected
                        ? youToken.hex
                        : used
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(255,255,255,0.14)",
                      background: selected
                        ? youToken.soft
                        : "rgba(255,255,255,0.03)",
                      color: selected
                        ? youToken.hex
                        : used
                          ? "#52525b"
                          : "#d4d4d8",
                      boxShadow: selected
                        ? `0 0 24px ${youToken.soft}`
                        : undefined,
                    }}
                  >
                    <PowerIcon power={p.key} className="h-3.5 w-3.5" />
                    {p.name}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={submitRound}
              disabled={overSend}
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              style={{
                background: overSend ? "rgba(255,255,255,0.08)" : youToken.hex,
                color: overSend ? "#71717a" : "#0a0a0a",
                boxShadow: overSend ? undefined : `0 0 28px ${youToken.soft}`,
              }}
            >
              Lock in & reveal
            </button>
          </section>
        )}

        {/* Round log */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(57,217,138,0.7)]" />
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
              Battle log
            </h3>
          </div>
          <ul className="telepath-mono mt-3 max-h-48 space-y-1 overflow-y-auto text-xs leading-6 text-zinc-300">
            {(phase === "reveal" && pendingReveal
              ? pendingReveal.lastRoundLog
              : state.lastRoundLog
            ).map((line, i) => (
              <li key={`${displayState.round}-${i}-${line}`}>
                <span className="text-zinc-600">{`>`} </span>
                {line}
              </li>
            ))}
          </ul>
        </section>

        {state.winner && phase === "plan" && (
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/games/telepath/play"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_28px_rgba(255,255,255,0.18)]"
            >
              Play again
            </Link>
            <Link
              href="/games/telepath"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-medium text-zinc-200"
            >
              Back to overview
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

function PresetButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
    >
      {label}
    </button>
  );
}

function TransferSlider({
  color,
  value,
  max,
  onChange,
  rivalUnits,
}: {
  color: PlayerColor;
  value: number;
  max: number;
  onChange: (n: number) => void;
  rivalUnits: number;
}) {
  const t = TELEPATH_COLORS[color];
  return (
    <label className="block">
      <div className="flex items-baseline justify-between">
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: t.hex }}
        >
          To {t.label}
          {rivalUnits <= 2 && (
            <span className="ml-2 text-[#ff5577]">· vulnerable</span>
          )}
        </span>
        <span className="text-2xl font-bold tabular-nums text-white">{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`mt-2 w-full ${t.sliderTrack}`}
        style={{ accentColor: t.hex }}
      />
      <div className="mt-1 flex justify-between text-[10px] text-zinc-500">
        <span>0</span>
        <span>{max}</span>
      </div>
    </label>
  );
}

export default function TelepathMatchPage() {
  return (
    <Suspense
      fallback={
        <main className="relative min-h-screen p-8 text-zinc-100">
          <TelepathBackdrop />
          <p className="relative">Loading match…</p>
        </main>
      }
    >
      <MatchInner />
    </Suspense>
  );
}
