"use client";

import { ATTACKS, DEFENSES } from "@/lib/attack-defense/gameConstants";
import { Avatar, Btn, Chip, Energy, HouseRow, Icon, Phase, PipTimer, RingTimer, ActionCard } from "../ui";
import type { ActionDef } from "../ui";
import type { MatchVm, SelectState } from "./matchTypes";

/* ============================================================
 * Desktop / Match — Direction D: Top-down map
 * Triangular battlefield (opp1 top-left, opp2 top-right, me bottom).
 * Right sidebar with action picker. Resolution shows arrow overlays.
 * ============================================================ */

export function DesktopMatch({
  vm,
  phase = "decision",
  phaseTimer = 8,
  attacks,
  defenses,
  selecting,
  submitted,
  onSelectAction,
  onTargetHouse,
  onTargetPlayer,
  onCancelSelection,
  onLockIn,
  onAdvance,
}: {
  vm: MatchVm;
  phase?: "waiting" | "decision" | "resolution" | "game_over";
  phaseTimer?: number;
  attacks: ActionDef[];
  defenses: ActionDef[];
  selecting: SelectState | null;
  submitted: boolean;
  onSelectAction: (sel: SelectState) => void;
  onTargetHouse: (playerId: string, houseId: string) => void;
  onTargetPlayer?: (playerId: string) => void;
  onCancelSelection: () => void;
  onLockIn: () => void;
  onAdvance?: () => void;
}) {
  const M = vm;

  const isDecision   = phase === "decision";
  const isWaiting    = phase === "waiting";
  const isResolution = phase === "resolution";
  const isGameOver   = phase === "game_over";

  const phaseTimerTotal = isWaiting ? 30 : isResolution ? 45 : 15;

  return (
    <main className="d-match">
      {/* Sticky header */}
      <header className="d-match__head">
        <div className="d-match__head-l">
          <div className="d-match__round">
            <span className="ad-eyebrow">Round</span>
            <span className="d-match__round-n">{String(M.round).padStart(2, "0")}</span>
          </div>
          <Phase phase={phase}/>
        </div>
        <div className="d-match__head-c">
          <div className="d-match__timer">
            <PipTimer value={phaseTimer} total={phaseTimerTotal} tone={isDecision && phaseTimer <= 5 ? "warn" : ""}/>
            <span className="d-match__timer-val">{phaseTimer}<span className="d-match__timer-unit">s</span></span>
          </div>
        </div>
        <div className="d-match__head-r">
          <div style={{ width: 320 }}>
            <Energy value={M.energy} max={M.energyMax} pending={selecting ? selecting.action.cost : 0}/>
          </div>
          <Avatar name={M.me.name} variant="you" size="sm"/>
        </div>
      </header>

      <div className="d-match__body">
        {/* Battlefield */}
        <section className="d-match__field">
          <div className="d-match__field-inner">
            {/* opp1 top-left */}
            <PlayerZone player={M.opps[0]} corner="top-left"
              targetableHouseIds={isDecision && !submitted && selecting?.kind === "attack" && selecting?.action.target === "house" ? M.opps[0].houses.filter(h => h.state !== "destroyed").map(h => h.id) : []}
              targetablePlayer={isDecision && !submitted && selecting?.kind === "attack" && selecting?.action.target === "player"}
              onTargetHouse={(houseId) => onTargetHouse(M.opps[0].id, houseId)}
              onTargetPlayer={() => onTargetPlayer?.(M.opps[0].id)}
              showAction={isResolution}
            />

            {/* opp2 top-right */}
            <PlayerZone player={M.opps[1]} corner="top-right"
              targetableHouseIds={isDecision && !submitted && selecting?.kind === "attack" && selecting?.action.target === "house" ? M.opps[1].houses.filter(h => h.state !== "destroyed").map(h => h.id) : []}
              targetablePlayer={isDecision && !submitted && selecting?.kind === "attack" && selecting?.action.target === "player"}
              onTargetHouse={(houseId) => onTargetHouse(M.opps[1].id, houseId)}
              onTargetPlayer={() => onTargetPlayer?.(M.opps[1].id)}
              showAction={isResolution}
            />

            {/* compass / phase center */}
            <div className="d-match__compass">
              {isWaiting && (
                <div className="d-match__compass-inner">
                  <Icon name="clock" size={20} color="var(--energy-fg)"/>
                  <div className="d-match__compass-title">Pregame</div>
                  <div className="d-match__compass-sub">Match begins in {phaseTimer}s</div>
                </div>
              )}
              {isDecision && !submitted && (
                <div className="d-match__compass-inner">
                  <Icon name="sword" size={20} color="var(--attack)"/>
                  <div className="d-match__compass-title">Decide</div>
                  <div className="d-match__compass-sub">
                    {selecting
                      ? (selecting.kind === "attack"
                          ? (selecting.action.target === "player" ? "Pick an opponent" : "Pick an enemy house")
                          : "Pick a house to defend")
                      : "Choose action ➜"}
                  </div>
                </div>
              )}
              {isDecision && submitted && (
                <div className="d-match__compass-inner">
                  <Icon name="shield" size={20} color="var(--ok)"/>
                  <div className="d-match__compass-title">Locked in</div>
                  <div className="d-match__compass-sub">Resolving in {phaseTimer}s</div>
                </div>
              )}
              {isResolution && (
                <div className="d-match__compass-inner">
                  <Icon name="bolt" size={20} color="var(--defense)"/>
                  <div className="d-match__compass-title">Round {M.round}</div>
                  <div className="d-match__compass-sub">Resolved · next in {phaseTimer}s</div>
                </div>
              )}
              {isGameOver && (
                <div className="d-match__compass-inner">
                  <Icon name="trophy" size={20} color="var(--energy)"/>
                  <div className="d-match__compass-title" style={{ color: "var(--energy-fg)" }}>kul wins</div>
                  <div className="d-match__compass-sub">Last base standing</div>
                </div>
              )}
            </div>

            {/* my base bottom-center */}
            <PlayerZone player={M.me} corner="bottom" isYou
              targetableHouseIds={isDecision && !submitted && selecting?.kind === "defense" ? M.me.houses.filter(h => h.state !== "destroyed").map(h => h.id) : []}
              onTargetHouse={(houseId) => onTargetHouse(M.me.id, houseId)}
            />

            {/* Arrow overlay on resolution */}
            {isResolution && (
              <svg className="d-match__arrows" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <marker id="ah-attack" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto">
                    <path d="M0,0 L10,5 L0,10 Z" fill="var(--attack)"/>
                  </marker>
                  <marker id="ah-defense" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto">
                    <path d="M0,0 L10,5 L0,10 Z" fill="var(--defense)"/>
                  </marker>
                </defs>
                {/* you → opp1.H1 (sneak) */}
                <path d="M 500 470 Q 360 320 220 170"
                      stroke="var(--attack)" strokeWidth="3" fill="none"
                      strokeDasharray="8 5" markerEnd="url(#ah-attack)"
                      className="d-arrow"/>
                {/* opp1 → you.H2 (strike) */}
                <path d="M 220 170 Q 360 360 500 470"
                      stroke="var(--attack)" strokeWidth="3" fill="none"
                      strokeDasharray="8 5" markerEnd="url(#ah-attack)"
                      className="d-arrow"
                      style={{ animationDelay: "120ms" }}/>
                {/* opp2 trap reflex */}
                <path d="M 800 200 Q 800 270 760 250"
                      stroke="var(--defense)" strokeWidth="3" fill="none"
                      strokeDasharray="4 4" markerEnd="url(#ah-defense)"
                      className="d-arrow"
                      style={{ animationDelay: "240ms" }}/>
              </svg>
            )}
          </div>
        </section>

        {/* Right column: action picker + submit + log */}
        <aside className="d-match__side">
          <section className="d-match__pickers">
            <div className="d-match__picker">
              <div className="ad-eyebrow" style={{ color: "var(--attack-fg)" }}>
                <Icon name="sword" size={11} color="var(--attack)"/> Attack
              </div>
              <div className="d-match__picker-grid">
                {attacks.map((a) => (
                  <ActionCard key={a.type} action={a} kind="attack"
                    selected={selecting?.action?.type === a.type}
                    costAffordable={a.cost <= M.energy}
                    onClick={() => onSelectAction({ kind: "attack", type: a.type, action: a })}
                  />
                ))}
              </div>
            </div>

            <div className="d-match__picker">
              <div className="ad-eyebrow" style={{ color: "var(--defense-fg)" }}>
                <Icon name="shield" size={11} color="var(--defense)"/> Defense
              </div>
              <div className="d-match__picker-grid">
                {defenses.map((a) => (
                  <ActionCard key={a.type} action={a} kind="defense"
                    selected={selecting?.action?.type === a.type}
                    costAffordable={a.cost <= M.energy}
                    onClick={() => onSelectAction({ kind: "defense", type: a.type, action: a })}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="d-match__submit">
            {isDecision && !submitted && (
              <>
                {selecting ? (
                  <>
                    <Btn variant="energy" size="xl" full
                      onClick={() => { onLockIn(); }}>
                      Lock in · {selecting.action.cost}<Icon name="bolt" size={14} color="currentColor"/>
                    </Btn>
                    <Btn variant="ghost" size="sm" full onClick={() => onCancelSelection()}>
                      Cancel selection
                    </Btn>
                  </>
                ) : (
                  <Btn variant="primary" size="xl" full disabled>
                    Pick an action above ↑
                  </Btn>
                )}
              </>
            )}
            {isDecision && submitted && (
              <Btn variant="secondary" size="xl" full disabled>
                ✓ Submitted · awaiting round end
              </Btn>
            )}
            {isResolution && (
              <Btn variant="primary" size="xl" full onClick={onAdvance}>
                Next round <Icon name="arrow" size={14} color="var(--bg)"/>
              </Btn>
            )}
            {isWaiting && (
              <Btn variant="secondary" size="xl" full onClick={onAdvance}>
                Skip pregame
              </Btn>
            )}
            {isGameOver && (
              <Btn variant="primary" size="xl" full onClick={onAdvance}>
                See results <Icon name="arrow" size={14} color="var(--bg)"/>
              </Btn>
            )}
            <div className="d-match__shortcut">
              <span className="ad-eyebrow">shortcuts</span>
              <span className="d-match__keys">1 strike · 2 blast · 3 sneak · 4 shield · 5 trap · ⏎ lock</span>
            </div>
          </section>

          <section className="d-match__log">
            <div className="ad-eyebrow">Round log</div>
            <ul>
              {M.log.map((e, i) => (
                <li key={i} className={`d-match__log-line d-match__log-line--${e.kind}`}>
                  <span className="d-match__log-r">R{e.round}</span>
                  <span>{e.text}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <style>{`
        .d-match {
          display: flex; flex-direction: column;
          min-height: 100%;
          background: var(--bg);
        }
        .d-match__head {
          display: flex; align-items: center; justify-content: space-between;
          gap: var(--s-4);
          padding: var(--s-4) var(--s-6);
          background: var(--bg);
          border-bottom: 1px solid var(--line);
          position: sticky; top: 0; z-index: var(--z-sticky);
        }
        .d-match__head-l { display: flex; align-items: center; gap: var(--s-4); }
        .d-match__round {
          display: flex; flex-direction: column; gap: 2px;
        }
        .d-match__round-n {
          font-family: var(--font-mono); font-weight: 800;
          font-size: var(--t-2xl);
          letter-spacing: var(--track-snug);
          line-height: 1;
        }
        .d-match__head-c { display: flex; align-items: center; gap: var(--s-3); }
        .d-match__timer {
          display: flex; align-items: center; gap: var(--s-3);
          padding: var(--s-2) var(--s-3);
          background: var(--bg-sunken);
          border-radius: var(--r-2);
        }
        .d-match__timer-val {
          font-family: var(--font-mono); font-weight: 800;
          font-size: var(--t-xl);
          font-variant-numeric: tabular-nums;
        }
        .d-match__timer-unit { color: var(--fg-mute); font-size: var(--t-base); margin-left: 1px; }
        .d-match__head-r { display: flex; align-items: center; gap: var(--s-3); }

        .d-match__body {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          gap: var(--s-5);
          padding: var(--s-5) var(--s-6);
          flex: 1;
        }

        .d-match__field {
          background: var(--bg-sunken);
          border: 1.5px solid var(--line);
          border-radius: var(--r-4);
          padding: var(--s-6);
          min-height: 540px;
          position: relative;
          overflow: hidden;
        }
        .d-match__field-inner {
          position: relative;
          height: 100%;
          min-height: 500px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: auto 1fr auto;
          gap: var(--s-5);
          align-items: start;
        }

        .d-match__compass {
          grid-column: 1 / -1;
          grid-row: 2;
          justify-self: center;
          align-self: center;
          z-index: 4;
        }
        .d-match__compass-inner {
          background: var(--bg-raised);
          border: 1.5px solid var(--line-strong);
          border-radius: var(--r-pill);
          padding: var(--s-3) var(--s-5);
          display: flex; align-items: center; gap: var(--s-2);
          box-shadow: var(--sh-2);
        }
        .d-match__compass-title {
          font-family: var(--font-display); font-weight: 700;
          font-size: var(--t-md); letter-spacing: var(--track-snug);
        }
        .d-match__compass-sub {
          color: var(--fg-mute); font-size: var(--t-sm);
          font-family: var(--font-mono);
        }

        .d-match__arrows {
          position: absolute; inset: 0;
          pointer-events: none;
          width: 100%; height: 100%;
          z-index: 3;
        }
        .d-arrow {
          opacity: 0;
          stroke-dashoffset: 100;
          animation: arrow-in 480ms var(--ease-out) forwards;
        }
        @keyframes arrow-in {
          to { opacity: 1; stroke-dashoffset: 0; }
        }

        .d-match__side {
          display: flex; flex-direction: column; gap: var(--s-3);
        }
        .d-match__pickers {
          background: var(--bg-raised);
          border: 1px solid var(--line);
          border-radius: var(--r-3);
          padding: var(--s-4);
          display: flex; flex-direction: column; gap: var(--s-4);
        }
        .d-match__picker { display: flex; flex-direction: column; gap: var(--s-2); }
        .d-match__picker .ad-eyebrow { display: flex; align-items: center; gap: 4px; }
        .d-match__picker-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-2);
        }

        .d-match__submit {
          background: var(--bg-raised);
          border: 1px solid var(--line);
          border-radius: var(--r-3);
          padding: var(--s-3) var(--s-4);
          display: flex; flex-direction: column; gap: var(--s-2);
        }
        .d-match__shortcut {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: var(--s-2);
          border-top: 1px dashed var(--line);
          color: var(--fg-mute);
          font-size: var(--t-xs);
        }
        .d-match__keys {
          font-family: var(--font-mono);
          font-size: var(--t-xs);
        }

        .d-match__log {
          background: var(--bg-raised);
          border: 1px solid var(--line);
          border-radius: var(--r-3);
          padding: var(--s-3) var(--s-4);
        }
        .d-match__log ul { list-style: none; margin: var(--s-2) 0 0; padding: 0; display: flex; flex-direction: column; gap: var(--s-1); }
        .d-match__log-line {
          display: grid;
          grid-template-columns: 28px 1fr;
          gap: var(--s-2);
          align-items: start;
          font-family: var(--font-mono); font-size: var(--t-xs);
          color: var(--fg-soft);
          padding: 6px 8px;
          border-radius: var(--r-1);
          line-height: 1.4;
        }
        .d-match__log-line--attack { background: var(--attack-soft); color: var(--attack-fg); }
        .d-match__log-line--defense { background: var(--defense-soft); color: var(--defense-fg); }
        .d-match__log-r {
          font-weight: 700;
        }
      `}</style>
    </main>
  );
};

function PlayerZone({
  player,
  corner,
  isYou,
  targetableHouseIds,
  targetablePlayer,
  onTargetHouse,
  onTargetPlayer,
  showAction,
}: {
  player: MatchVm["opps"][0] | (MatchVm["me"] & { tag?: string; isBot?: boolean; lastAction?: MatchVm["opps"][0]["lastAction"] });
  corner: string;
  isYou?: boolean;
  targetableHouseIds?: string[];
  targetablePlayer?: boolean;
  onTargetHouse?: (houseId: string) => void;
  onTargetPlayer?: () => void;
  showAction?: boolean;
}) {
  const eliminated = player.houses.every(h => h.state === "destroyed");
  const variant = isYou ? "you" : (player.tag === "opp1" ? "opp1" : "opp2");
  const cls = ["d-zone", `d-zone--${corner}`];
  if (eliminated) cls.push("d-zone--out");
  if (targetablePlayer) cls.push("d-zone--target");
  return (
    <div className={cls.join(" ")} onClick={() => targetablePlayer && onTargetPlayer && onTargetPlayer()}>
      <div className="d-zone__head">
        <div className="ad-row" style={{ gap: 10 }}>
          <Avatar name={player.name} variant={variant} dead={eliminated}/>
          <div>
            <div className="d-zone__name">
              {player.name}
              {isYou && <span className="d-zone__you-tag"> · you</span>}
              {player.isBot && <span className="d-zone__bot-tag"> BOT</span>}
            </div>
            {showAction && player.lastAction && (
              <div className="ad-eyebrow" style={{ color: player.lastAction.kind === "attack" ? "var(--attack-fg)" : "var(--defense-fg)" }}>
                {player.lastAction.name} → {player.lastAction.target}
              </div>
            )}
            {isYou && !showAction && (
              <div className="ad-eyebrow">your base</div>
            )}
          </div>
        </div>
        <Chip tone="energy"><Icon name="bolt" size={11} color="var(--energy)"/>{player.energy}</Chip>
      </div>
      <div className="d-zone__houses">
        <HouseRow houses={player.houses} size="lg"
          targetableIds={targetableHouseIds}
          onTargetHouse={onTargetHouse}/>
      </div>
      <style>{`
        .d-zone {
          background: var(--bg-raised);
          border: 1.5px solid var(--line);
          border-radius: var(--r-3);
          padding: var(--s-4);
          display: flex; flex-direction: column; gap: var(--s-3);
          z-index: 1;
          position: relative;
        }
        .d-zone--top-left  { grid-column: 1; grid-row: 1; transform: rotate(-1deg); transform-origin: bottom right; }
        .d-zone--top-right { grid-column: 2; grid-row: 1; transform: rotate(1deg);  transform-origin: bottom left;  }
        .d-zone--bottom    { grid-column: 1 / -1; grid-row: 3; max-width: 540px; justify-self: center; width: 100%; background: var(--player-you); }
        .d-zone--out { opacity: 0.6; background: var(--bg-sunken); }
        .d-zone--target {
          border-color: var(--attack);
          box-shadow: 0 0 0 3px var(--bg-sunken), 0 0 0 5px var(--attack);
          cursor: pointer;
        }
        .d-zone__head {
          display: flex; align-items: center; justify-content: space-between;
          gap: var(--s-2);
        }
        .d-zone__name {
          font-weight: 700;
          font-size: var(--t-base);
        }
        .d-zone__you-tag { color: var(--fg-mute); font-family: var(--font-mono); font-size: var(--t-xs); font-weight: 400; }
        .d-zone__bot-tag {
          color: var(--fg-mute); font-family: var(--font-mono); font-size: var(--t-2xs);
          letter-spacing: var(--track-eyebrow);
          margin-left: 4px;
        }
        .d-zone__houses { display: flex; justify-content: center; }
      `}</style>
    </div>
  );
};

