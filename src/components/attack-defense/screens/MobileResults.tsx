"use client";

import { useState, useEffect } from "react";
import { Avatar, Btn, Chip, Energy, HouseRow, Icon, Phase, PipTimer, RingTimer, ActionCard } from "../ui";
import type { HouseData } from "../ui";
import type { ActionDef } from "../ui";

/* ============================================================
 * Mobile / Results — Direction C: Podium + MVP
 * Celebratory podium, MVP move card, two CTAs.
 * ============================================================ */

export function MobileResults({ vm, onRematch, onLobby }: { vm: import("@/lib/attack-defense/buildResultsVm").ResultsVm; onRematch: () => void; onLobby: () => void }) {
  
  const heading = vm.outcome === "win" ? `${vm.myName} standing.`
                : vm.outcome === "loss" ? `${vm.myName} fell.`
                : "stalemate.";
  const stampLabel = vm.outcome === "win" ? "Victory" : vm.outcome === "loss" ? "Defeat" : "Draw";
  const stampTone = vm.outcome === "win" ? "var(--energy)" : vm.outcome === "loss" ? "var(--attack)" : "var(--fg-mute)";

  return (
    <div className="m-results">
      <header className="m-results__head">
        <span className="m-results__stamp" style={{ color: stampTone, borderColor: stampTone }}>{stampLabel}</span>
      </header>

      <h1 className="m-results__title">{heading}</h1>
      <p className="m-results__sub">
        Round {vm.rounds} · {vm.durationLabel}
      </p>

      {/* Podium */}
      <section className="m-results__podium" aria-label="Final standings">
        <PodiumStep height={86} rank={2} player={vm.standings[1]} bg="var(--bg-sunken)"/>
        <PodiumStep height={130} rank={1} player={vm.standings[0]} bg="var(--energy)" textOnFill/>
        <PodiumStep height={60} rank={3} player={vm.standings[2]} bg="var(--bg-sunken)"/>
      </section>

      {/* MVP card */}
      <section className="m-results__mvp">
        <div className="ad-eyebrow" style={{ color: "var(--attack-fg)" }}>MVP move</div>
        <div className="m-results__mvp-title">Round {vm.mvp.round} · Area blast</div>
        <div className="m-results__mvp-text">{vm.mvp.text}</div>
        <div className="m-results__mvp-foot">
          <Chip tone="attack">3 houses hit</Chip>
          <Chip tone="energy">+{vm.xp} XP</Chip>
        </div>
      </section>

      {/* Stats row */}
      <section className="m-results__stats">
        <StatCell value="17" label="damage"/>
        <StatCell value="5"  label="houses ✗"/>
        <StatCell value="3"  label="shields"/>
        <StatCell value={`+${vm.xp}`} label="xp" highlight/>
      </section>

      <div className="m-results__cta">
        <Btn variant="primary" size="xl" full onClick={onRematch}>
          <Icon name="play" size={16} color="var(--bg)"/>
          Rematch
        </Btn>
        <Btn variant="ghost" size="lg" full onClick={onLobby}>
          Back to lobby
        </Btn>
      </div>

      <style>{`
        .m-results {
          display: flex; flex-direction: column; gap: var(--s-3);
          height: 100%;
        }
        .m-results__head { display: flex; justify-content: center; }
        .m-results__stamp {
          display: inline-block;
          padding: 3px 12px;
          border: 2px double currentColor;
          border-radius: 4px;
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: var(--t-2xs);
          letter-spacing: var(--track-eyebrow);
          text-transform: uppercase;
          transform: rotate(-2deg);
        }
        .m-results__title {
          margin: 0;
          font-size: var(--t-2xl);
          font-weight: 800;
          letter-spacing: var(--track-tight);
          line-height: var(--lh-tight);
          text-align: center;
        }
        .m-results__sub {
          margin: 0; text-align: center;
          color: var(--fg-mute);
          font-family: var(--font-mono);
          font-size: var(--t-xs);
        }
        .m-results__podium {
          display: grid; grid-template-columns: 1fr 1fr 1fr;
          align-items: stretch;
          gap: var(--s-2);
          min-height: 230px;
        }
        .m-results__mvp {
          background: var(--bg-raised);
          border: 1.5px solid var(--line);
          border-radius: var(--r-2);
          padding: var(--s-3);
          display: flex; flex-direction: column; gap: 2px;
          box-shadow: var(--sh-1);
        }
        .m-results__mvp-title {
          font-size: var(--t-base); font-weight: 700;
          letter-spacing: var(--track-snug); line-height: var(--lh-snug);
        }
        .m-results__mvp-text { color: var(--fg-soft); font-size: var(--t-xs); line-height: 1.4; }
        .m-results__mvp-foot { display: flex; gap: 4px; margin-top: 4px; flex-wrap: wrap; }
        .m-results__stats {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 6px;
        }
        .m-results__cta {
          display: flex; flex-direction: column; gap: var(--s-2);
        }
      `}</style>
    </div>
  );
};

function PodiumStep({
  height,
  rank,
  player,
  bg,
  textOnFill,
}: {
  height: number;
  rank: number;
  player?: { name: string; subtitle: string; you?: boolean };
  bg: string;
  textOnFill?: boolean;
}) {
  if (!player) return null;
  const textColor = textOnFill ? "var(--energy-on)" : "var(--fg)";
  return (
    <div className="m-podium-col">
      <div className="m-podium__info">
        <Avatar name={player.name} variant={rank === 1 ? "you" : (rank === 2 ? "opp1" : "opp2")} size="sm"/>
        <div className="m-podium__name">{player.name}{player.you && <span className="m-podium__you"> · you</span>}</div>
        <div className="m-podium__sub">{player.subtitle}</div>
      </div>
      <div className="m-podium__step" style={{ height, background: bg, color: textColor }}>
        <span className="m-podium__rank">{rank}</span>
        {rank === 1 && <Icon name="trophy" size={18} color="currentColor"/>}
      </div>
      <style>{`
        .m-podium-col {
          display: flex; flex-direction: column;
          align-items: stretch;
          gap: var(--s-1);
        }
        .m-podium__info {
          flex: 1;
          display: flex; flex-direction: column; align-items: center;
          gap: 4px;
          justify-content: flex-end;
          text-align: center;
          padding-bottom: 6px;
        }
        .m-podium__name {
          font-weight: 700; font-size: var(--t-xs);
          letter-spacing: var(--track-snug);
        }
        .m-podium__you {
          color: var(--fg-mute);
          font-family: var(--font-mono);
          font-weight: 400;
        }
        .m-podium__sub {
          color: var(--fg-mute);
          font-size: var(--t-2xs);
          line-height: 1.3;
          font-family: var(--font-mono);
        }
        .m-podium__step {
          width: 100%;
          border: 1.5px solid var(--line-strong);
          border-bottom: none;
          border-radius: var(--r-2) var(--r-2) 0 0;
          display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
          padding: var(--s-3) 0;
          gap: 4px;
        }
        .m-podium__rank {
          font-family: var(--font-mono); font-weight: 800; font-size: var(--t-xl);
        }
      `}</style>
    </div>
  );
};

const StatCell = ({ value, label, highlight }: { value: string; label: string; highlight?: boolean }) => (
  <div className="m-stat">
    <div className="m-stat__val" style={{ color: highlight ? "var(--energy-fg)" : "var(--fg)" }}>{value}</div>
    <div className="m-stat__label">{label}</div>
    <style>{`
      .m-stat {
        background: var(--bg-sunken);
        border: 1px solid var(--line);
        border-radius: var(--r-2);
        padding: var(--s-2) var(--s-1);
        display: flex; flex-direction: column; align-items: center;
        gap: 2px;
      }
      .m-stat__val {
        font-family: var(--font-mono); font-weight: 700;
        font-size: var(--t-lg);
        font-variant-numeric: tabular-nums;
      }
      .m-stat__label {
        font-family: var(--font-mono);
        font-size: var(--t-2xs);
        letter-spacing: var(--track-eyebrow);
        text-transform: uppercase;
        color: var(--fg-mute);
      }
    `}</style>
  </div>
);

