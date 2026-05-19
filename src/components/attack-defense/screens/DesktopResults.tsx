"use client";

import { useState, useEffect } from "react";
import { Avatar, Btn, Chip, Energy, HouseRow, Icon, Phase, PipTimer, RingTimer, ActionCard } from "../ui";
import type { HouseData } from "../ui";
import type { ActionDef } from "../ui";

/* ============================================================
 * Desktop / Results — Direction B: Round-by-round timeline
 * Large bar chart of HP per round, key moments, XP plaque.
 * ============================================================ */

export function DesktopResults({ vm, onRematch, onLobby }: { vm: import("@/lib/attack-defense/buildResultsVm").ResultsVm; onRematch: () => void; onLobby: () => void }) {
  
  const heading = vm.outcome === "win" ? `${vm.myName} wins.`
                : vm.outcome === "loss" ? `${vm.myName} fell.`
                : "Stalemate.";
  const maxHp =
    Math.max(
      ...vm.timeline.flatMap((t) => vm.playerKeys.map((pk) => (typeof t[pk.id] === "number" ? (t[pk.id] as number) : 0)))
    ) || 18;
  const winnerColor = vm.outcome === "win" ? "var(--energy-fg)" : vm.outcome === "loss" ? "var(--attack-fg)" : "var(--fg)";

  return (
    <main className="d-results">
      <header className="d-results__head">
        <div>
          <span className="ad-eyebrow">Match results</span>
          <h1 className="d-results__title">
            <Icon name="trophy" size={36} color={winnerColor}/>
            <span style={{ color: winnerColor }}>{heading}</span>
          </h1>
          <div className="d-results__sub">
            <span className="ad-eyebrow">Round {vm.rounds}</span>
            <span className="d-results__sep">·</span>
            <span className="ad-eyebrow">{vm.durationLabel}</span>
            <span className="d-results__sep">·</span>
            <span className="ad-eyebrow">3-player public</span>
          </div>
        </div>
        <div className="d-results__head-actions">
          <Btn variant="primary" size="xl" onClick={onRematch}>
            <Icon name="play" size={16} color="var(--bg)"/>
            Rematch
          </Btn>
          <Btn variant="secondary" size="xl" onClick={onLobby}>Back to lobby</Btn>
        </div>
      </header>

      <div className="d-results__grid">
        {/* Timeline chart */}
        <section className="d-results__chart">
          <div className="d-results__chart-head">
            <div>
              <span className="ad-eyebrow" style={{ color: "var(--fg-mute)" }}>How it played</span>
              <h2 className="d-results__chart-title">HP across the match</h2>
            </div>
            <div className="d-results__legend">
              {vm.playerKeys.map((pk) => (
                <LegendItem key={pk.id} color={pk.color} name={pk.name} />
              ))}
            </div>
          </div>

          <div className="d-results__bars">
            {vm.timeline.map((row) => (
              <div key={row.r} className="d-results__col">
                <div className="d-results__col-bars">
                  {vm.playerKeys.map((pk) => {
                    const val = (row[pk.id] as number) ?? 0;
                    return <BarSeg key={pk.id} pct={val / maxHp} color={pk.color} value={val} />;
                  })}
                </div>
                <div className="d-results__col-label">R{row.r}</div>
              </div>
            ))}
          </div>

          <div className="d-results__y-axis">
            <span>{maxHp} HP</span>
            <span>0</span>
          </div>
        </section>

        {/* Right sidebar */}
        <aside className="d-results__side">
          <section className="d-results__xp">
            <span className="ad-eyebrow">XP earned</span>
            <div className="d-results__xp-big">+{vm.xp}</div>
            <div className="d-results__xp-meta">
              <span className="ad-eyebrow">level 4 · 14W · 9L</span>
            </div>
            <div className="d-results__xp-bar">
              <div className="d-results__xp-bar-fill" style={{ width: "72%" }}/>
            </div>
            <div className="ad-eyebrow" style={{ color: "var(--fg-mute)" }}>72 / 100 to level 5</div>
          </section>

          <section className="d-results__standings">
            <span className="ad-eyebrow">Standings</span>
            {vm.standings.map((s) => (
              <div key={s.rank} className={`d-results__rank ${s.you ? "is-you" : ""}`}>
                <span className="d-results__rank-n">{s.rank}.</span>
                <span className="d-results__rank-name">{s.name}{s.you && " · you"}</span>
                <span className="d-results__rank-sub">{s.subtitle}</span>
              </div>
            ))}
          </section>
        </aside>
      </div>

      <section className="d-results__moments">
        <div className="d-results__moments-head">
          <span className="ad-eyebrow">Key moments</span>
          <span className="d-results__mvp-tag">
            <Icon name="trophy" size={11} color="var(--energy)"/>
            MVP: round {vm.mvp.round}
          </span>
        </div>
        <div className="d-results__moments-grid">
          <ol className="d-results__moments-list">
            {vm.moments.map((m, i) => (
              <li key={i}>
                <span className="d-results__moments-i">{String(i+1).padStart(2,"0")}</span>
                <span>{m}</span>
              </li>
            ))}
          </ol>
          <div className="d-results__mvp">
            <span className="ad-eyebrow" style={{ color: "var(--attack-fg)" }}>MVP move</span>
            <div className="d-results__mvp-title">Round {vm.mvp.round} · Area blast</div>
            <p className="d-results__mvp-text">{vm.mvp.text}</p>
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <Chip tone="attack">3 houses hit</Chip>
              <Chip tone="energy">5 ⚡</Chip>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .d-results {
          padding: var(--s-7) var(--s-8);
          display: flex; flex-direction: column; gap: var(--s-5);
        }
        .d-results__head {
          display: flex; align-items: flex-end; justify-content: space-between;
          gap: var(--s-4); flex-wrap: wrap;
        }
        .d-results__title {
          margin: 6px 0 0;
          display: flex; align-items: center; gap: var(--s-3);
          font-family: var(--font-display);
          font-weight: 800;
          font-size: var(--t-4xl);
          line-height: var(--lh-tight);
          letter-spacing: var(--track-tight);
        }
        .d-results__sub {
          display: flex; align-items: center; gap: var(--s-2);
          margin-top: var(--s-2);
          color: var(--fg-mute);
        }
        .d-results__sep { color: var(--fg-faint); }
        .d-results__head-actions { display: flex; gap: var(--s-2); align-items: center; }

        .d-results__grid {
          display: grid; grid-template-columns: minmax(0, 1fr) 280px;
          gap: var(--s-5);
        }

        .d-results__chart {
          background: var(--bg-raised);
          border: 1.5px solid var(--line);
          border-radius: var(--r-4);
          padding: var(--s-5) var(--s-6);
          box-shadow: var(--sh-1);
          position: relative;
        }
        .d-results__chart-head {
          display: flex; align-items: flex-end; justify-content: space-between;
          margin-bottom: var(--s-5);
          gap: var(--s-3); flex-wrap: wrap;
        }
        .d-results__chart-title {
          margin: 4px 0 0;
          font-size: var(--t-xl);
          font-weight: 700;
          letter-spacing: var(--track-snug);
        }
        .d-results__legend {
          display: flex; gap: var(--s-3); flex-wrap: wrap;
        }
        .d-results__bars {
          display: grid;
          grid-template-columns: repeat(${vm.timeline.length}, 1fr);
          gap: var(--s-3);
          height: 280px;
          align-items: end;
          padding-bottom: var(--s-3);
          border-bottom: 1.5px solid var(--line);
        }
        .d-results__col {
          display: flex; flex-direction: column; align-items: center; gap: var(--s-2);
          height: 100%;
        }
        .d-results__col-bars {
          display: flex; align-items: end; justify-content: center;
          gap: 4px;
          width: 100%; flex: 1;
        }
        .d-results__col-label {
          font-family: var(--font-mono);
          font-size: var(--t-xs);
          color: var(--fg-mute);
        }
        .d-results__y-axis {
          position: absolute;
          right: var(--s-3); top: 110px; bottom: 50px;
          display: flex; flex-direction: column; justify-content: space-between;
          font-family: var(--font-mono); font-size: var(--t-2xs);
          color: var(--fg-faint);
          pointer-events: none;
        }

        .d-results__side { display: flex; flex-direction: column; gap: var(--s-3); }

        .d-results__xp {
          background: var(--bg-raised);
          border: 2px solid var(--fg);
          border-radius: var(--r-3);
          padding: var(--s-4);
          box-shadow: var(--sh-stamp);
          display: flex; flex-direction: column; gap: 6px;
        }
        .d-results__xp-big {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: var(--t-4xl);
          letter-spacing: var(--track-tight);
          line-height: 1;
          color: var(--energy-fg);
        }
        .d-results__xp-bar {
          height: 6px; background: var(--bg-sunken);
          border-radius: var(--r-pill); overflow: hidden;
          margin-top: var(--s-1);
        }
        .d-results__xp-bar-fill { height: 100%; background: var(--energy); }

        .d-results__standings {
          background: var(--bg-raised);
          border: 1px solid var(--line);
          border-radius: var(--r-3);
          padding: var(--s-4);
          display: flex; flex-direction: column; gap: var(--s-2);
        }
        .d-results__rank {
          display: grid;
          grid-template-columns: 24px 1fr;
          grid-template-rows: auto auto;
          column-gap: var(--s-2);
          padding: var(--s-2);
          border-radius: var(--r-1);
        }
        .d-results__rank.is-you {
          background: var(--energy-soft);
        }
        .d-results__rank-n {
          grid-row: 1 / span 2;
          font-family: var(--font-mono);
          font-weight: 800; font-size: var(--t-lg);
          color: var(--fg-mute);
        }
        .d-results__rank-name {
          font-weight: 700;
          font-size: var(--t-base);
        }
        .d-results__rank-sub {
          font-family: var(--font-mono);
          font-size: var(--t-xs);
          color: var(--fg-mute);
        }

        .d-results__moments {
          background: var(--bg-raised);
          border: 1.5px solid var(--line);
          border-radius: var(--r-4);
          padding: var(--s-5) var(--s-6);
        }
        .d-results__moments-head {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: var(--s-4);
        }
        .d-results__mvp-tag {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 4px 10px;
          background: var(--energy-soft); color: var(--energy-fg);
          border-radius: var(--r-pill);
          font-family: var(--font-mono); font-size: var(--t-xs);
          letter-spacing: var(--track-eyebrow);
          text-transform: uppercase;
        }
        .d-results__moments-grid {
          display: grid; grid-template-columns: 1.4fr 1fr;
          gap: var(--s-5);
        }
        .d-results__moments-list {
          list-style: none; padding: 0; margin: 0;
          display: flex; flex-direction: column; gap: var(--s-2);
        }
        .d-results__moments-list li {
          display: grid;
          grid-template-columns: 32px 1fr;
          gap: var(--s-3); align-items: baseline;
          font-size: var(--t-base);
          padding: var(--s-2) 0;
          border-bottom: 1px dashed var(--line);
        }
        .d-results__moments-list li:last-child { border-bottom: none; }
        .d-results__moments-i {
          font-family: var(--font-mono); font-weight: 700;
          color: var(--fg-mute);
        }
        .d-results__mvp {
          background: var(--attack-soft);
          border-radius: var(--r-3);
          padding: var(--s-4);
          display: flex; flex-direction: column; gap: 4px;
        }
        .d-results__mvp-title {
          font-weight: 700;
          font-size: var(--t-lg);
          color: var(--attack-fg);
          letter-spacing: var(--track-snug);
        }
        .d-results__mvp-text {
          margin: 0; color: var(--attack-fg);
          font-size: var(--t-sm);
          line-height: var(--lh-body);
        }
      `}</style>
    </main>
  );
};

const BarSeg = ({ pct, color, value }: { pct: number; color: string; value: number }) => (
  <div className="d-bar" style={{ height: `${Math.max(2, pct * 100)}%` }}>
    <div className="d-bar__fill" style={{ background: color }}/>
    <span className="d-bar__val">{value}</span>
    <style>{`
      .d-bar {
        position: relative; flex: 1;
        min-height: 4px;
        display: flex; flex-direction: column; align-items: center;
      }
      .d-bar__fill {
        width: 100%; flex: 1;
        border-radius: 4px 4px 0 0;
        border: 1px solid var(--line-strong);
        border-bottom: none;
        transition: height var(--d-very) var(--ease-spring);
      }
      .d-bar__val {
        position: absolute;
        top: -16px;
        font-family: var(--font-mono);
        font-size: var(--t-2xs);
        color: var(--fg-mute);
        font-variant-numeric: tabular-nums;
      }
    `}</style>
  </div>
);

const LegendItem = ({ color, name }: { color: string; name: string }) => (
  <div className="d-leg">
    <span className="d-leg__sw" style={{ background: color }}/>
    <span>{name}</span>
    <style>{`
      .d-leg {
        display: inline-flex; align-items: center; gap: 6px;
        font-size: var(--t-sm); color: var(--fg-soft);
      }
      .d-leg__sw {
        width: 10px; height: 10px; border-radius: 2px;
        border: 1px solid var(--line-strong);
      }
    `}</style>
  </div>
);

