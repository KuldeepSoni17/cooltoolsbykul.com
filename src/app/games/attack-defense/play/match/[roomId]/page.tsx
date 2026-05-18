"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ActionCard,
  EnergyMeter,
  HouseSketch,
  PipTimer,
  PlayerTag,
  RingTimer,
  WBtn,
  houseSketchState,
} from "@/components/attack-defense/wf-primitives";
import { ATTACK_CONFIG, DEFENSE_CONFIG, GAME_UI_CONSTANTS } from "@/lib/attack-defense/gameConstants";
import type { AttackType, DefenseType, House, Player } from "@/lib/attack-defense/gameTypes";
import { useAttackDefenseAuth } from "@/hooks/attack-defense/useAuth";
import { useAttackDefenseGame } from "@/hooks/attack-defense/useGame";

const OPPONENT_COLORS = ["#ffd6cc", "#cce0f0"];

function HouseRow({
  houses,
  targetable,
  onHouseClick,
}: {
  houses: House[];
  targetable?: boolean;
  onHouseClick?: (houseId: string) => void;
}) {
  return (
    <div className="wf-row wf-gap-2 wf-ai-c wf-center" style={{ marginTop: 8 }}>
      {houses.map((house, i) => (
        <HouseSketch
          key={house.id}
          hp={house.hp}
          max={house.maxHp}
          state={houseSketchState(house, targetable && !house.isDestroyed)}
          onClick={targetable && !house.isDestroyed && onHouseClick ? () => onHouseClick(house.id) : undefined}
        />
      ))}
    </div>
  );
}

export default function AttackDefenseMatchPage() {
  const router = useRouter();
  const params = useParams<{ roomId: string }>();
  const { user } = useAttackDefenseAuth();
  const {
    room,
    secondsLeft,
    pending,
    selecting,
    activeTab,
    committed,
    latestRoundEvents,
    latestRoundSummaries,
    setActiveTab,
    selectActionType,
    cancelSelection,
    addAttack,
    addDefense,
    submitActions,
  } = useAttackDefenseGame();

  const me = useMemo(() => room?.players.find((p) => p.userId === user?.id || p.id === user?.id), [room, user?.id]);
  const opponents = useMemo(() => room?.players.filter((p) => p.id !== me?.id) ?? [], [room, me?.id]);

  useEffect(() => {
    if (!room || room.phase !== "game_over") return;
    try {
      sessionStorage.setItem(
        "ad_last_result",
        JSON.stringify({
          winnerId: room.winnerId,
          round: room.round,
          meName: me?.displayName,
          won: room.winnerId === me?.id,
        })
      );
    } catch {
      /* ignore */
    }
    router.push("/games/attack-defense/play/results");
  }, [room, me?.id, me?.displayName, router]);

  if (!room || !me) {
    return (
      <main className="wf-container wf-pad-3">
        <p className="scribble">Waiting for room...</p>
      </main>
    );
  }

  const phase = room.phase;
  const canAct = phase === "decision" && !committed && !me.actionsSubmitted;
  const selectedAttack = selecting?.kind === "attack" ? (selecting.type as AttackType) : null;
  const selectedDefense = selecting?.kind === "defense" ? (selecting.type as DefenseType) : null;
  const totalSeconds =
    phase === "waiting"
      ? GAME_UI_CONSTANTS.ROUND_INITIAL_BREATHER_SECONDS
      : phase === "resolution"
        ? GAME_UI_CONSTANTS.ROUND_RESOLUTION_SECONDS
        : GAME_UI_CONSTANTS.ROUND_DECISION_SECONDS;
  const timerPct = Math.max(0, Math.min(1, secondsLeft / totalSeconds));
  const pipFilled = Math.ceil(timerPct * 15);
  const pendingEnergy =
    pending.attacks.reduce((s, a) => s + ATTACK_CONFIG[a.type].energyCost, 0) +
    pending.defenses.reduce((s, d) => s + DEFENSE_CONFIG[d.type].energyCost, 0);

  const attackCost = pending.attacks[0] ? ATTACK_CONFIG[pending.attacks[0].type].energyCost : 0;
  const defenseCost = pending.defenses[0] ? DEFENSE_CONFIG[pending.defenses[0].type].energyCost : 0;
  const lockCost = attackCost + defenseCost;

  const renderOpponent = (player: Player, index: number, tilted?: boolean) => {
    const houseTargetable = Boolean(canAct && selectedAttack && ATTACK_CONFIG[selectedAttack].target === "house");
    const playerTargetable = Boolean(canAct && selectedAttack && ATTACK_CONFIG[selectedAttack].target === "player");

    return (
      <div
        key={player.id}
        className={`sketchy-thin wf-pad-2 wf-col wf-gap-1 ${player.isEliminated ? "dashed" : ""} ${tilted ? (index === 0 ? "rotate-3" : "rotate-2") : ""}`}
        style={{
          background: OPPONENT_COLORS[index] ?? "var(--paper)",
          opacity: player.isEliminated ? 0.5 : 1,
          flex: tilted ? 1 : undefined,
        }}
      >
        <div className="wf-row wf-between wf-ai-c">
          <PlayerTag name={player.displayName} eliminated={player.isEliminated} color={OPPONENT_COLORS[index]} />
          <span className="chip energy">⚡{player.energy}</span>
        </div>
        <HouseRow
          houses={player.houses}
          targetable={houseTargetable}
          onHouseClick={(houseId) => selectedAttack && addAttack(selectedAttack, player.id, houseId)}
        />
        {playerTargetable ? (
          <WBtn sm variant="attack" onClick={() => selectedAttack && addAttack(selectedAttack, player.id)}>
            Target {player.displayName}
          </WBtn>
        ) : null}
        {phase === "resolution" && latestRoundSummaries.find((s) => s.playerId === player.id) ? (
          <div className="wf-xs wf-muted wf-center-text">
            {latestRoundSummaries.find((s) => s.playerId === player.id)?.decisions.join(" · ") || "no action"}
          </div>
        ) : null}
      </div>
    );
  };

  const actionButtons = phase === "decision" && (
    <div className="wf-row wf-gap-1 wf-mt-1" style={{ flexWrap: "wrap" }}>
      {(Object.keys(ATTACK_CONFIG) as AttackType[]).map((type) => (
        <WBtn
          key={type}
          sm
          variant="attack"
          disabled={!canAct}
          onClick={() => {
            setActiveTab("attack");
            selectActionType("attack", type);
          }}
        >
          ⚔ {ATTACK_CONFIG[type].name.toLowerCase()}
        </WBtn>
      ))}
      {(Object.keys(DEFENSE_CONFIG) as DefenseType[]).map((type) => (
        <WBtn
          key={type}
          sm
          variant="defense"
          disabled={!canAct}
          onClick={() => {
            setActiveTab("defense");
            selectActionType("defense", type);
          }}
        >
          {type === "SHIELD" ? "🛡" : "⚠"} {DEFENSE_CONFIG[type].name.toLowerCase()}
        </WBtn>
      ))}
      <WBtn
        sm
        variant="primary"
        disabled={!canAct || (pending.attacks.length === 0 && pending.defenses.length === 0)}
        onClick={() => submitActions(params.roomId, { playerId: me.id, attacks: pending.attacks, defenses: pending.defenses })}
      >
        submit{lockCost ? ` (${lockCost}⚡)` : ""}
      </WBtn>
    </div>
  );

  return (
    <main className="wf-container" style={{ paddingBottom: phase === "decision" ? "1rem" : "2rem" }}>
      {/* Mobile — Direction B (arena curve) */}
      <section className="md:hidden wf-col wf-grow" style={{ minHeight: "85vh", gap: 4 }}>
        <div className="wf-row wf-between wf-ai-c wf-pad-2">
          <span className="hand wf-b">round {room.round}</span>
          <RingTimer pct={timerPct} label={`${secondsLeft}s`} size={48} />
          <span className="chip energy">⚡{me.energy}</span>
        </div>

        <div className="wf-row wf-between" style={{ padding: 4 }}>
          {opponents.map((o, i) => renderOpponent(o, i, true))}
        </div>

        <div className="wf-grow wf-center">
          {phase === "decision" ? (
            <div className="sketchy wf-pad-2 wf-col wf-ai-c wf-center-text" style={{ background: "var(--paper-2)" }}>
              <div className="hand wf-lg">choose your move</div>
              <div className="wf-row wf-gap-1 wf-mt-1">
                <span className={`chip ${activeTab === "attack" ? "attack" : ""}`}>⚔ attack</span>
                <span className={`chip ${activeTab === "defense" ? "defense" : ""}`}>🛡 defense</span>
              </div>
              {selecting ? <div className="wf-xs wf-muted wf-mt-1">tap a house to target →</div> : null}
            </div>
          ) : phase === "resolution" ? (
            <div className="sketchy wf-pad-2 wf-center-text" style={{ background: "#ffe6c4" }}>
              <div className="hand wf-lg">resolving…</div>
              <div className="wf-xs">{latestRoundEvents.length} events this round</div>
            </div>
          ) : phase === "waiting" ? (
            <div className="sketchy wf-pad-2 wf-center-text">
              <div className="hand wf-lg">starts in {secondsLeft}s</div>
            </div>
          ) : null}
        </div>

        <div className="sketchy wf-pad-2" style={{ background: "var(--paper-2)" }}>
          <div className="wf-row wf-between wf-ai-c">
            <PlayerTag name={me.displayName} you color="var(--accent-3)" />
            <span className="wf-xs wf-muted">your base</span>
          </div>
          <HouseRow
            houses={me.houses}
            targetable={Boolean(canAct && selectedDefense)}
            onHouseClick={(houseId) => selectedDefense && addDefense(selectedDefense, houseId)}
          />
        </div>

        {actionButtons}

        {phase === "resolution" && latestRoundSummaries.length > 0 ? (
          <div className="sketchy-thin wf-pad-2 wf-col wf-gap-1">
            <div className="wf-xs wf-upper wf-muted">what happened</div>
            {latestRoundSummaries.map((s) => (
              <div key={s.playerId} className="wf-xs">
                · {s.displayName}: {s.decisions.length ? s.decisions.join(", ") : "no action"}
              </div>
            ))}
            {latestRoundEvents.map((e, i) => (
              <div key={i} className="wf-xs">
                · {e.message}
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {/* Desktop — Direction D (top-down map) */}
      <section className="hidden md:flex md:flex-col wf-gap-2 wf-grow" style={{ minHeight: "85vh" }}>
        <div className="sketchy-thin wf-pad-2 wf-row wf-between wf-ai-c">
          <span className="hand wf-xl">
            round {room.round} · {phase}
          </span>
          <PipTimer filled={pipFilled} total={15} label={`${secondsLeft}s`} />
          <div style={{ width: 200 }}>
            <EnergyMeter value={me.energy} pending={pendingEnergy} />
          </div>
        </div>

        <div className="sketchy wf-grow wf-col" style={{ background: "var(--paper-2)", padding: 12, position: "relative", minHeight: 360 }}>
          <div className="wf-row wf-between">
            {opponents.map((o, i) => (
              <div key={o.id} className="wf-col wf-ai-c wf-gap-1" style={{ opacity: o.isEliminated ? 0.5 : 1 }}>
                <div className="wf-xs wf-b">{o.displayName}</div>
                <HouseRow
                  houses={o.houses}
                  targetable={Boolean(canAct && selectedAttack && ATTACK_CONFIG[selectedAttack].target === "house")}
                  onHouseClick={(houseId) => selectedAttack && addAttack(selectedAttack, o.id, houseId)}
                />
                <span className="chip energy">⚡{o.energy}</span>
              </div>
            ))}
          </div>

          <div className="wf-grow wf-center wf-col">
            {phase === "waiting" ? (
              <div className="hand wf-xl">match starts in {secondsLeft}s</div>
            ) : phase === "resolution" ? (
              <>
                <div className="hand wf-muted">resolving…</div>
                <div className="wf-small wf-muted wf-mt-2 wf-center-text">
                  {latestRoundEvents.slice(0, 3).map((e) => e.message).join(" · ")}
                </div>
              </>
            ) : (
              <div className="hand wf-muted">↕ tap to target</div>
            )}
          </div>

          <div className="wf-col wf-ai-c wf-gap-1">
            <span className="chip">
              ⚡{me.energy}
              {pendingEnergy ? ` (-${pendingEnergy})` : ""}
            </span>
            <HouseRow
              houses={me.houses}
              targetable={Boolean(canAct && selectedDefense)}
              onHouseClick={(houseId) => selectedDefense && addDefense(selectedDefense, houseId)}
            />
            <PlayerTag name={me.displayName} you />
          </div>
        </div>

        {phase === "decision" ? (
          <div className="sketchy-thin wf-pad-2 wf-row wf-gap-2 wf-between wf-ai-c" style={{ flexWrap: "wrap" }}>
            <div className="wf-row wf-gap-1" style={{ flexWrap: "wrap", flex: 1 }}>
              {(Object.keys(ATTACK_CONFIG) as AttackType[]).map((type) => (
                <ActionCard
                  key={type}
                  kind="attack"
                  name={ATTACK_CONFIG[type].name.toLowerCase()}
                  cost={ATTACK_CONFIG[type].energyCost}
                  desc={ATTACK_CONFIG[type].description}
                  sm
                  selected={pending.attacks[0]?.type === type}
                  disabled={!canAct}
                  onClick={() => {
                    setActiveTab("attack");
                    selectActionType("attack", type);
                  }}
                />
              ))}
              {(Object.keys(DEFENSE_CONFIG) as DefenseType[]).map((type) => (
                <ActionCard
                  key={type}
                  kind="defense"
                  name={DEFENSE_CONFIG[type].name.toLowerCase()}
                  cost={DEFENSE_CONFIG[type].energyCost}
                  desc={DEFENSE_CONFIG[type].description}
                  sm
                  selected={pending.defenses[0]?.type === type}
                  disabled={!canAct}
                  onClick={() => {
                    setActiveTab("defense");
                    selectActionType("defense", type);
                  }}
                />
              ))}
            </div>
            <WBtn
              variant="primary"
              disabled={!canAct || (pending.attacks.length === 0 && pending.defenses.length === 0)}
              onClick={() => submitActions(params.roomId, { playerId: me.id, attacks: pending.attacks, defenses: pending.defenses })}
            >
              submit (1 · {lockCost || 0}⚡) →
            </WBtn>
            <WBtn sm onClick={cancelSelection}>
              clear
            </WBtn>
          </div>
        ) : (
          <div className="sketchy-thin wf-pad-2 wf-center-text wf-small">
            {phase === "waiting"
              ? `Pregame · plan round 1 · ${secondsLeft}s left`
              : `Breather · next round in ${secondsLeft}s`}
          </div>
        )}

        {phase === "resolution" && latestRoundSummaries.length > 0 ? (
          <div className="sketchy-thin wf-pad-2">
            <div className="wf-xs wf-upper wf-muted wf-mb-1">round log</div>
            {latestRoundSummaries.map((s) => (
              <div className="wf-xs" key={s.playerId}>
                · {s.displayName}: {s.decisions.join(" | ") || "no action"}
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
