"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ATTACK_CONFIG, DEFENSE_CONFIG, GAME_UI_CONSTANTS } from "@/lib/attack-defense/gameConstants";
import type { AttackType, DefenseType } from "@/lib/attack-defense/gameTypes";
import { useAttackDefenseAuth } from "@/hooks/attack-defense/useAuth";
import { useAttackDefenseGame } from "@/hooks/attack-defense/useGame";

function HousePill({ label, hp, active, onClick }: { label: string; hp: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-2 py-2 text-xs ${active ? "border-lime-400 bg-lime-500/20" : "border-zinc-700 bg-zinc-900/80"}`}
    >
      <div>{label}</div>
      <div className="text-zinc-300">{hp}</div>
    </button>
  );
}

export default function AttackDefenseMatchPage() {
  const router = useRouter();
  const params = useParams<{ roomId: string }>();
  const { user } = useAttackDefenseAuth();
  const { room, secondsLeft, pending, selecting, activeTab, committed, latestRoundEvents, latestRoundSummaries, setActiveTab, selectActionType, cancelSelection, addAttack, addDefense, submitActions } =
    useAttackDefenseGame();

  const me = useMemo(() => room?.players.find((p) => p.userId === user?.id || p.id === user?.id), [room, user?.id]);
  const opponents = useMemo(() => room?.players.filter((p) => p.id !== me?.id) ?? [], [room, me?.id]);

  if (!room || !me) return <main className="p-6 text-zinc-100">Waiting for room...</main>;
  if (room.phase === "game_over") router.push("/games/attack-defense/play/results");

  const canAct = room.phase === "decision" && !committed && !me.actionsSubmitted;
  const selectedAttack = selecting?.kind === "attack" ? (selecting.type as AttackType) : null;
  const selectedDefense = selecting?.kind === "defense" ? (selecting.type as DefenseType) : null;
  const totalSeconds =
    room.phase === "waiting"
      ? GAME_UI_CONSTANTS.ROUND_INITIAL_BREATHER_SECONDS
      : room.phase === "resolution"
        ? GAME_UI_CONSTANTS.ROUND_RESOLUTION_SECONDS
        : GAME_UI_CONSTANTS.ROUND_DECISION_SECONDS;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 px-6 py-6 pb-28 text-zinc-100">
      <section className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Round {room.round}</h1>
          <span className="rounded bg-zinc-800 px-2 py-1 text-xs uppercase">{room.phase === "waiting" ? "pregame" : room.phase}</span>
        </div>
        <div className="mt-2 text-sm text-zinc-300">
          Timer: {secondsLeft}s / {totalSeconds}s · Energy: {me.energy}/20
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {opponents.map((player) => (
          <section key={player.id} className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-3">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">{player.displayName}</h2>
              <span className="text-xs text-zinc-300">{player.energy} energy</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {player.houses.map((house, idx) => {
                const active = Boolean(canAct && selectedAttack && ATTACK_CONFIG[selectedAttack].target === "house" && !house.isDestroyed);
                return (
                  <HousePill
                    key={house.id}
                    label={`House ${idx + 1}`}
                    hp={`${house.hp}/${house.maxHp}`}
                    active={active}
                    onClick={
                      active
                        ? () => {
                            if (!selectedAttack) return;
                            addAttack(selectedAttack, player.id, house.id);
                          }
                        : undefined
                    }
                  />
                );
              })}
            </div>
            {canAct && selectedAttack && ATTACK_CONFIG[selectedAttack].target === "player" ? (
              <button className="mt-2 h-9 w-full rounded-lg bg-lime-500/80 text-sm font-semibold text-zinc-900" onClick={() => addAttack(selectedAttack, player.id)}>
                Target {player.displayName}
              </button>
            ) : null}
          </section>
        ))}
      </div>

      <section className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">Your Base</h2>
          <span className="text-xs text-zinc-300">{me.actionsSubmitted || committed ? "Locked" : "Planning"}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {me.houses.map((house, idx) => {
            const active = Boolean(canAct && selectedDefense && !house.isDestroyed);
            return (
              <HousePill
                key={house.id}
                label={`House ${idx + 1}`}
                hp={`${house.hp}/${house.maxHp}`}
                active={active}
                onClick={active ? () => addDefense(selectedDefense!, house.id) : undefined}
              />
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-3">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-300">Round Breakdown</h2>
        {latestRoundSummaries.length ? (
          <div className="space-y-2">
            {latestRoundSummaries.map((summary) => (
              <div key={summary.playerId} className="rounded bg-zinc-800/80 px-2 py-2 text-xs">
                <div className="font-semibold">{summary.displayName}</div>
                <div>{summary.decisions.length ? summary.decisions.join(" | ") : "⏸️ No action"}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-zinc-400">Round recap appears after timer ends.</div>
        )}
        {latestRoundEvents.length ? (
          <ul className="mt-3 space-y-1 text-sm">
            {latestRoundEvents.map((event, idx) => (
              <li key={`${event.type}-${idx}`} className="rounded bg-zinc-800/80 px-2 py-1">
                {event.message}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {room.phase === "decision" ? (
        <section className="fixed bottom-0 left-0 right-0 border-t border-zinc-700 bg-zinc-950/95 p-4 backdrop-blur">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-2">
            <div className="text-xs text-zinc-300">Step 1: pick attack/defense. Step 2: choose target house/player. Step 3: lock action.</div>
            <div className="grid grid-cols-2 gap-2">
              <button className={`h-10 rounded ${activeTab === "attack" ? "bg-indigo-500" : "bg-zinc-800"}`} onClick={() => setActiveTab("attack")}>
                Attack
              </button>
              <button className={`h-10 rounded ${activeTab === "defense" ? "bg-indigo-500" : "bg-zinc-800"}`} onClick={() => setActiveTab("defense")}>
                Defense
              </button>
            </div>
            <div className="grid gap-2 md:grid-cols-3">
              {activeTab === "attack"
                ? (Object.keys(ATTACK_CONFIG) as AttackType[]).map((type) => (
                    <button key={type} className="rounded border border-zinc-700 bg-zinc-900 p-2 text-left" onClick={() => selectActionType("attack", type)}>
                      <div className="font-medium">{ATTACK_CONFIG[type].name}</div>
                      <div className="text-xs text-zinc-400">{ATTACK_CONFIG[type].description}</div>
                    </button>
                  ))
                : (Object.keys(DEFENSE_CONFIG) as DefenseType[]).map((type) => (
                    <button key={type} className="rounded border border-zinc-700 bg-zinc-900 p-2 text-left" onClick={() => selectActionType("defense", type)}>
                      <div className="font-medium">{DEFENSE_CONFIG[type].name}</div>
                      <div className="text-xs text-zinc-400">{DEFENSE_CONFIG[type].description}</div>
                    </button>
                  ))}
            </div>
            <div className="flex gap-2">
              <button className="h-10 rounded-lg bg-zinc-800 px-4 text-sm" onClick={cancelSelection}>
                Clear pick
              </button>
              <button
                className="h-10 flex-1 rounded-lg bg-lime-400 font-semibold text-zinc-900"
                onClick={() => submitActions(params.roomId, { playerId: me.id, attacks: pending.attacks, defenses: pending.defenses })}
              >
                Lock round action
              </button>
            </div>
          </div>
        </section>
      ) : (
        <div className="fixed bottom-0 left-0 right-0 border-t border-zinc-700 bg-zinc-950/95 p-4 text-center text-sm text-zinc-200">
          {room.phase === "waiting"
            ? `Match starts in ${secondsLeft}s. Plan round 1.`
            : `Breather ${secondsLeft}s: review what everyone selected and what happened.`}
        </div>
      )}
    </main>
  );
}
