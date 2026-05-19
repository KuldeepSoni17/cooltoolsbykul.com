"use client";

import type { CSSProperties } from "react";
import { ATTACKS, DEFENSES } from "@/lib/attack-defense/gameConstants";
import { Avatar, Btn, Chip, Energy, HouseRow, Icon, Phase, PipTimer, RingTimer, ActionCard } from "../ui";
import type { ActionDef } from "../ui";
import type { MatchVm, SelectState } from "./matchTypes";

/* ============================================================
 * Mobile / Match — Direction B: Arena curve
 * Tilted opponent cards, dramatic center stage, my base anchored,
 * action drawer at bottom.
 * Handles all four phases via the `phase` prop.
 * ============================================================ */

export function MobileMatch({
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
    <div className="m-match">
      {/* Sticky header */}
      <header className="m-match__head">
        <div className="m-match__head-l">
          <div className="m-match__round">R{M.round}</div>
          <Phase phase={phase}/>
        </div>
        <RingTimer
          value={phaseTimer}
          total={phaseTimerTotal}
          size={44}
          tone={isDecision && phaseTimer <= 5 ? "attack" : (isResolution ? "defense" : "")}
          label={`${phaseTimer}s`}
        />
      </header>

      <div className="m-match__energy">
        <Energy value={M.energy} max={M.energyMax} pending={selecting ? actionCost(selecting) : 0}/>
      </div>

      {/* Opponent zone — tilted */}
      <section className="m-match__opps">
        {M.opps.map((o, idx) => {
          const eliminated = o.houses.every(h => h.state === "destroyed");
          return (
            <article key={o.id} className={`m-match__opp m-match__opp--${o.tag} ${eliminated ? "is-out" : ""}`}>
              <div className="m-match__opp-head">
                <div className="m-match__opp-id">
                  <Avatar name={o.name} variant={o.tag} size="sm" dead={eliminated}/>
                  <div className="m-match__opp-id-text">
                    <div className="m-match__opp-name">
                      {o.name}
                      {o.isBot && <span className="m-match__opp-bot">BOT</span>}
                    </div>
                    {isResolution && o.lastAction && (
                      <div className="m-match__opp-action">picked {o.lastAction.name}</div>
                    )}
                  </div>
                </div>
                <span className="m-match__opp-energy"><Icon name="bolt" size={11} color="var(--energy)"/>{o.energy}</span>
              </div>
              <HouseRow houses={o.houses} size="sm"
                targetableIds={isDecision && !submitted && selecting?.kind === "attack" && selecting?.action.target === "house" ? o.houses.filter(h => h.state !== "destroyed").map(h => h.id) : []}
                onTargetHouse={(id) => onTargetHouse(o.id, id)}
              />
            </article>
          );
        })}
      </section>

      {/* Center stage prompt */}
      <section className="m-match__stage" aria-live="polite">
        {isWaiting && (
          <>
            <div className="m-match__stage-eyebrow"><Icon name="clock" size={14}/> Pregame</div>
            <div className="m-match__stage-title">Match starts in {phaseTimer}s</div>
            <div className="m-match__stage-sub">Take a breath. Scout the board.</div>
          </>
        )}
        {isDecision && !selecting && !submitted && (
          <>
            <div className="m-match__stage-eyebrow"><Icon name="sword" size={14} color="var(--attack)"/> Decision</div>
            <div className="m-match__stage-title">Choose your move</div>
            <div className="m-match__stage-sub">One attack, one defense — your call.</div>
          </>
        )}
        {isDecision && selecting && (
          <>
            <div className="m-match__stage-eyebrow" style={{ color: selecting.kind === "attack" ? "var(--attack)" : "var(--defense)" }}>
              <Icon name={selecting.kind === "attack" ? "sword" : "shield"} size={14} color="currentColor"/>
              {selecting.action.name}
            </div>
            <div className="m-match__stage-title">
              {selecting.kind === "attack"
                ? (selecting.action.target === "player" ? "Pick an opponent" : "Pick an enemy house")
                : "Pick a house to defend"}
            </div>
            <div className="m-match__stage-sub">Tap a target above or below ↑↓</div>
          </>
        )}
        {isDecision && submitted && (
          <>
            <div className="m-match__stage-eyebrow" style={{ color: "var(--ok)" }}>
              <Icon name="shield" size={14} color="var(--ok)"/> Locked in
            </div>
            <div className="m-match__stage-title">Waiting for others…</div>
            <div className="m-match__stage-sub">Resolving when timer ends.</div>
          </>
        )}
        {isResolution && (
          <>
            <div className="m-match__stage-eyebrow" style={{ color: "var(--defense)" }}>
              <Icon name="clock" size={14} color="var(--defense)"/> Resolution
            </div>
            <div className="m-match__stage-title">Round {M.round} resolved</div>
            <ul className="m-match__log">
              {M.log.map((e, i) => (
                <li key={i} className={`m-match__log-line m-match__log-line--${e.kind}`}>
                  <span className="ad-eyebrow">R{e.round}</span>
                  <span>{e.text}</span>
                </li>
              ))}
            </ul>
          </>
        )}
        {isGameOver && (
          <>
            <div className="m-match__stage-eyebrow" style={{ color: "var(--energy)" }}>
              <Icon name="trophy" size={14} color="var(--energy)"/> Game over
            </div>
            <div className="m-match__stage-title" style={{ color: "var(--energy-fg)" }}>You survived.</div>
            <div className="m-match__stage-sub">Tap to see results →</div>
          </>
        )}
      </section>

      {/* My base */}
      <section className="m-match__me">
        <div className="m-match__me-head">
          <div className="m-match__opp-id">
            <Avatar name={M.me.name} variant="you" size="sm"/>
            <div className="m-match__me-name">{M.me.name} <span className="m-match__me-tag">· you</span></div>
          </div>
          <span className="m-match__opp-energy"><Icon name="bolt" size={11} color="var(--energy)"/>{M.me.energy}</span>
        </div>
        <HouseRow
          houses={M.me.houses}
          targetableIds={isDecision && !submitted && selecting?.kind === "defense" ? M.me.houses.filter(h => h.state !== "destroyed").map(h => h.id) : []}
          onTargetHouse={(id) => onTargetHouse(M.me.id, id)}
        />
      </section>

      {/* Bottom: action bar or status */}
      {isDecision && !submitted && !selecting && (
        <nav className="m-match__actions">
          <ActionTab kind="attack" attacks={attacks} defenses={defenses} onSelect={(a) => onSelectAction({ kind: "attack", type: a.type, action: a })} />
          <div className="m-match__actions-divider" />
          <ActionTab kind="defense" attacks={attacks} defenses={defenses} onSelect={(a) => onSelectAction({ kind: "defense", type: a.type, action: a })} />
        </nav>
      )}
      {isDecision && selecting && (
        <div className="m-match__cancel">
          <Btn variant="ghost" size="md" full onClick={() => onCancelSelection()}>
            <Icon name="x" size={14}/> Cancel · {selecting.action.name}
          </Btn>
        </div>
      )}
      {isDecision && submitted && (
        <div className="m-match__cancel">
          <Btn variant="secondary" size="lg" full disabled>
            ✓ Submitted · awaiting round end
          </Btn>
        </div>
      )}
      {isResolution && (
        <div className="m-match__cancel">
          <Btn variant="primary" size="lg" full onClick={onAdvance}>
            Next round <Icon name="arrow" size={14} color="var(--bg)"/>
          </Btn>
        </div>
      )}
      {isWaiting && (
        <div className="m-match__cancel">
          <Btn variant="secondary" size="lg" full onClick={onAdvance}>Skip pregame</Btn>
        </div>
      )}
      {isGameOver && (
        <div className="m-match__cancel">
          <Btn variant="primary" size="xl" full onClick={onAdvance}>
            See results <Icon name="arrow" size={16} color="var(--bg)"/>
          </Btn>
        </div>
      )}

      <style>{`
        .m-match {
          display: flex; flex-direction: column;
          gap: var(--s-2);
          height: 100%;
        }
        .m-match__head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 var(--s-1);
        }
        .m-match__head-l { display: flex; align-items: center; gap: var(--s-2); }
        .m-match__round {
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: var(--t-md);
          font-variant-numeric: tabular-nums;
        }
        .m-match__energy {
          padding: 0 var(--s-1);
        }
        .m-match__opps {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: var(--s-2);
        }
        .m-match__opp {
          background: var(--player-opp1);
          border: 1.5px solid var(--line);
          border-radius: var(--r-2);
          padding: var(--s-2) 6px;
          display: flex; flex-direction: column; gap: 6px;
          transform: rotate(-0.6deg);
          transform-origin: bottom right;
          box-shadow: var(--sh-1);
          min-width: 0;
        }
        .m-match__opp--opp2 {
          background: var(--player-opp2);
          transform: rotate(0.8deg);
          transform-origin: bottom left;
        }
        .m-match__opp.is-out {
          opacity: 0.55;
          background: var(--bg-sunken);
        }
        .m-match__opp-head {
          display: flex; align-items: center; justify-content: space-between;
          gap: var(--s-1);
          min-width: 0;
        }
        .m-match__opp-id {
          display: flex; align-items: center; gap: 6px;
          min-width: 0; flex: 1;
        }
        .m-match__opp-id-text { min-width: 0; flex: 1; }
        .m-match__opp-name {
          font-weight: 700; font-size: var(--t-xs);
          line-height: 1.2;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .m-match__opp-bot {
          color: var(--fg-mute); font-family: var(--font-mono);
          font-size: 9px; margin-left: 4px;
          letter-spacing: var(--track-eyebrow);
        }
        .m-match__opp-action {
          font-family: var(--font-mono); font-size: 10px;
          color: var(--fg-mute); margin-top: 1px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .m-match__opp-energy {
          display: inline-flex; align-items: center; gap: 1px;
          font-family: var(--font-mono); font-weight: 700;
          font-size: var(--t-xs);
          color: var(--energy-fg);
          background: var(--energy-soft);
          padding: 2px 6px;
          border-radius: var(--r-pill);
          flex-shrink: 0;
        }
        .m-match__stage {
          background: var(--bg-raised);
          border: 1.5px solid var(--line);
          border-radius: var(--r-3);
          padding: var(--s-3);
          flex: 1;
          min-height: 0;
          display: flex; flex-direction: column; gap: 4px; justify-content: center;
          box-shadow: var(--sh-2);
          text-align: center;
          overflow: hidden;
        }
        .m-match__stage-eyebrow {
          font-family: var(--font-mono);
          font-size: var(--t-2xs);
          letter-spacing: var(--track-eyebrow);
          text-transform: uppercase;
          color: var(--fg-mute);
          display: inline-flex; align-items: center; gap: 4px; justify-content: center;
        }
        .m-match__stage-title {
          font-size: var(--t-lg); font-weight: 700;
          letter-spacing: var(--track-snug); line-height: var(--lh-tight);
        }
        .m-match__stage-sub { color: var(--fg-mute); font-size: var(--t-xs); }
        .m-match__log {
          list-style: none; margin: var(--s-2) 0 0; padding: 0;
          display: flex; flex-direction: column; gap: 4px;
          text-align: left;
          overflow-y: auto;
          min-height: 0;
        }
        .m-match__log-line {
          display: grid;
          grid-template-columns: 24px 1fr;
          gap: var(--s-1);
          align-items: start;
          font-family: var(--font-mono); font-size: var(--t-2xs);
          color: var(--fg-soft);
          line-height: 1.4;
        }
        .m-match__log-line .ad-eyebrow { padding-top: 2px; }
        .m-match__log-line--attack {
          border-left: 2px solid var(--attack);
          padding: 2px 4px 2px 6px;
          background: var(--attack-soft);
          border-radius: 0 var(--r-1) var(--r-1) 0;
        }
        .m-match__log-line--defense {
          border-left: 2px solid var(--defense);
          padding: 2px 4px 2px 6px;
          background: var(--defense-soft);
          border-radius: 0 var(--r-1) var(--r-1) 0;
        }
        .m-match__me {
          background: var(--player-you);
          border: 1.5px solid var(--line);
          border-radius: var(--r-2);
          padding: var(--s-2) var(--s-3) 10px;
          display: flex; flex-direction: column; gap: 6px;
        }
        .m-match__me-head {
          display: flex; align-items: center; justify-content: space-between;
          gap: var(--s-2);
        }
        .m-match__me-name {
          font-weight: 700; font-size: var(--t-sm);
          white-space: nowrap;
        }
        .m-match__me-tag {
          color: var(--fg-mute); font-family: var(--font-mono);
          font-size: var(--t-2xs); font-weight: 400;
        }
        .m-match__actions {
          display: flex; flex-direction: column; gap: 6px;
          background: var(--bg-raised);
          border: 1.5px solid var(--line);
          border-radius: var(--r-2);
          padding: 8px;
          box-shadow: var(--sh-2);
        }
        .m-match__actions-divider { height: 1px; background: var(--line); margin: 0; }
        .m-match__cancel { }
      `}</style>
    </div>
  );

  function actionCost(sel: SelectState | null) {
    return sel?.action?.cost || 0;
  }
};

/* Tab of action options for a kind */
const ACTION_SHORT: Record<string, string> = {
  DIRECT_STRIKE: "Strike",
  AREA_BLAST: "Blast",
  SNEAK_ATTACK: "Sneak",
  SHIELD: "Shield",
  TRAP: "Trap",
};

function ActionTab({
  kind,
  attacks,
  defenses,
  onSelect,
}: {
  kind: "attack" | "defense";
  attacks: ActionDef[];
  defenses: ActionDef[];
  onSelect: (a: ActionDef) => void;
}) {
  const items = kind === "attack" ? attacks : defenses;
  return (
    <div>
      <div className="ad-eyebrow" style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4, color: kind === "attack" ? "var(--attack-fg)" : "var(--defense-fg)", fontSize: "var(--t-2xs)" }}>
        <Icon name={kind === "attack" ? "sword" : "shield"} size={11} color="currentColor"/>
        {kind}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: kind === "attack" ? "1fr 1fr 1fr" : "1fr 1fr", gap: 6 }}>
        {items.map((a) => (
          <CompactActionCard key={a.type} action={{ ...a, displayName: ACTION_SHORT[a.type] || a.name }} kind={kind} onClick={() => onSelect(a)}/>
        ))}
      </div>
    </div>
  );
};

/* Compact action card for the mobile drawer */
function CompactActionCard({
  action,
  kind,
  onClick,
}: {
  action: ActionDef & { displayName?: string };
  kind: "attack" | "defense";
  onClick: () => void;
}) {
  const accent = kind === "attack" ? "var(--attack)" : "var(--defense)";
  return (
    <button type="button" onClick={onClick}
            className="m-cact"
            style={{ ["--_a" as string]: accent } as CSSProperties}>
      <span className="m-cact__name">{action.displayName || action.name}</span>
      <span className="m-cact__cost"><Icon name="bolt" size={9} color="var(--energy-fg)"/>{action.cost}</span>
      <style>{`
        .m-cact {
          appearance: none;
          background: var(--bg-raised);
          border: 1.5px solid var(--line);
          border-radius: var(--r-1);
          padding: 6px 8px;
          display: flex; align-items: center; justify-content: space-between;
          cursor: pointer;
          text-align: left;
          transition: border-color var(--d-fast) var(--ease-out), background var(--d-fast) var(--ease-out);
          color: var(--fg);
          gap: 4px;
          min-height: 32px;
        }
        .m-cact:hover { border-color: var(--_a); }
        .m-cact:active { background: var(--_a); color: var(--fg-on-accent); }
        .m-cact__name {
          font-weight: 600;
          font-size: var(--t-xs);
          line-height: 1.2;
          letter-spacing: -0.01em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .m-cact__cost {
          font-family: var(--font-mono);
          font-size: var(--t-2xs);
          color: var(--energy-fg);
          background: var(--energy-soft);
          padding: 1px 5px;
          border-radius: var(--r-pill);
          display: inline-flex; align-items: center; gap: 1px;
          flex-shrink: 0;
        }
      `}</style>
    </button>
  );
};

