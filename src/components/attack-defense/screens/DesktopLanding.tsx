"use client";

import { useState, useEffect } from "react";
import { Avatar, Btn, Chip, Energy, HouseRow, Icon, Phase, PipTimer, RingTimer, ActionCard } from "../ui";
import type { HouseData } from "../ui";
import type { ActionDef } from "../ui";

/* ============================================================
 * Desktop / Landing — Direction C: Storybook
 * Two-column. Left: chapter stamp + monumental headline + form.
 * Right: large illustration slot.
 * ============================================================ */

export function DesktopLanding({ onPlay, initialName = "" }: { onPlay: (name: string) => void; initialName?: string }) {
  const [name, setName] = useState(initialName || "");

  return (
    <main className="d-landing">
      <div className="d-landing__content">
        <span className="d-landing__chapter">Chapter 0</span>
        <h1 className="d-landing__title">
          Three small<br/>
          kingdoms.<span className="d-landing__period">.</span>
        </h1>
        <p className="d-landing__sub">
          Only one will be standing at the end of the round.
          <br/>Real-time tactics — 3 players, 9 houses, 30 second turns.
        </p>

        <div className="d-landing__form">
          <div className="d-landing__field">
            <label className="ad-eyebrow" htmlFor="d-codename">Codename</label>
            <input
              id="d-codename"
              className="ad-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="enter codename"
              autoComplete="off"
              style={{ fontSize: "var(--t-md)", fontWeight: 600, height: 52 }}
            />
          </div>
          <div className="d-landing__buttons">
            <Btn variant="primary" size="xl" onClick={() => onPlay && onPlay(name)}>
              <Icon name="play" size={16} color="var(--bg)"/>
              Take a seat
              <Icon name="arrow" size={16} color="var(--bg)"/>
            </Btn>
            <Btn variant="secondary" size="xl">
              <Icon name="google" size={16}/>
              Continue with Google
            </Btn>
          </div>
        </div>

        <div className="d-landing__meta">
          <Chip><Icon name="users" size={11} color="var(--fg-mute)"/>3 players</Chip>
          <Chip><Icon name="house" size={11} color="var(--fg-mute)"/>9 houses</Chip>
          <Chip><Icon name="clock" size={11} color="var(--fg-mute)"/>30s rounds</Chip>
          <Chip><Icon name="trophy" size={11} color="var(--fg-mute)"/>last one wins</Chip>
        </div>

        <footer className="d-landing__foot">
          <a href="#how">How to play</a>
          <span>·</span>
          <a href="#leaderboard">Leaderboard</a>
          <span>·</span>
          <a href="#credits">Credits</a>
        </footer>
      </div>

      <aside className="d-landing__illo">
        <div className="d-landing__illo-stamp">
          <span className="ad-eyebrow">vol. i</span>
          <span>·</span>
          <span className="ad-eyebrow">a 3-player war</span>
        </div>
        <div className="d-landing__illo-art" aria-hidden="true">
          {/* SVG cover art: 3 stylized kingdoms with houses */}
          <svg viewBox="0 0 480 600" preserveAspectRatio="xMidYMid meet">
            <defs>
              <pattern id="hatch" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" strokeWidth="1" opacity="0.18"/>
              </pattern>
            </defs>

            {/* horizon */}
            <line x1="20" y1="430" x2="460" y2="430" stroke="currentColor" strokeWidth="1.5" opacity="0.35"/>

            {/* sun behind */}
            <circle cx="240" cy="200" r="120" fill="var(--energy-soft)" stroke="var(--energy)" strokeWidth="2"/>
            <circle cx="240" cy="200" r="120" fill="url(#hatch)" color="var(--energy)"/>

            {/* Kingdom 1 — left, attack tone */}
            <g transform="translate(60, 290)">
              <polygon points="0,40 30,0 60,40 60,110 0,110" fill="var(--attack-soft)" stroke="currentColor" strokeWidth="1.8"/>
              <rect x="20" y="65" width="20" height="40" fill="currentColor"/>
              <polygon points="-20,60 0,40 0,110 -20,110" fill="var(--bg-raised)" stroke="currentColor" strokeWidth="1.8"/>
              <polygon points="60,60 80,40 80,110 60,110" fill="var(--bg-raised)" stroke="currentColor" strokeWidth="1.8"/>
              <text x="30" y="135" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="currentColor" opacity="0.6">ASH</text>
            </g>

            {/* Kingdom 2 — center, energy tone (you) */}
            <g transform="translate(220, 270)">
              <polygon points="0,50 35,0 70,50 70,130 0,130" fill="var(--energy-soft)" stroke="currentColor" strokeWidth="2"/>
              <rect x="25" y="80" width="22" height="50" fill="currentColor"/>
              <polygon points="-25,70 0,50 0,130 -25,130" fill="var(--bg-raised)" stroke="currentColor" strokeWidth="2"/>
              <polygon points="70,70 95,50 95,130 70,130" fill="var(--bg-raised)" stroke="currentColor" strokeWidth="2"/>
              <text x="35" y="155" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="currentColor" opacity="0.7">KUL</text>
              <text x="35" y="168" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="currentColor" opacity="0.4">you</text>
            </g>

            {/* Kingdom 3 — right, defense tone */}
            <g transform="translate(360, 295)">
              <polygon points="0,40 28,0 56,40 56,105 0,105" fill="var(--defense-soft)" stroke="currentColor" strokeWidth="1.8"/>
              <rect x="18" y="62" width="20" height="43" fill="currentColor"/>
              <polygon points="-18,58 0,40 0,105 -18,105" fill="var(--bg-raised)" stroke="currentColor" strokeWidth="1.8"/>
              <polygon points="56,58 74,40 74,105 56,105" fill="var(--bg-raised)" stroke="currentColor" strokeWidth="1.8"/>
              <text x="28" y="130" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="currentColor" opacity="0.6">BOT-K</text>
            </g>

            {/* arrows between kingdoms */}
            <g stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.35" strokeDasharray="3 4">
              <path d="M 140 340 Q 220 320 280 330"/>
              <path d="M 340 340 Q 280 320 220 330"/>
              <path d="M 110 380 Q 220 420 380 380"/>
            </g>

            {/* clouds */}
            <g opacity="0.4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M 60 90 Q 70 75 90 80 Q 110 65 130 80 Q 140 95 120 100 Q 80 100 60 90 Z"/>
              <path d="M 340 130 Q 350 115 370 120 Q 390 105 410 120 Q 420 135 400 140 Q 360 140 340 130 Z"/>
            </g>
          </svg>
        </div>
      </aside>

      <style>{`
        .d-landing {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
          gap: var(--s-10);
          padding: var(--s-9) var(--s-9);
          min-height: 100%;
          align-items: center;
        }
        .d-landing__content { display: flex; flex-direction: column; gap: var(--s-5); max-width: 580px; }
        .d-landing__chapter {
          display: inline-flex; align-self: flex-start;
          padding: 5px 12px;
          font-family: var(--font-mono);
          font-size: var(--t-xs);
          letter-spacing: var(--track-eyebrow);
          text-transform: uppercase;
          color: var(--attack-fg);
          background: var(--attack-soft);
          border-radius: var(--r-pill);
        }
        .d-landing__title {
          margin: 0;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: var(--t-5xl);
          line-height: 0.92;
          letter-spacing: var(--track-tight);
        }
        .d-landing__period { color: var(--attack); }
        .d-landing__sub {
          margin: 0;
          font-size: var(--t-md);
          color: var(--fg-soft);
          line-height: var(--lh-body);
          max-width: 480px;
        }
        .d-landing__form {
          display: flex; flex-direction: column; gap: var(--s-3);
          margin-top: var(--s-3);
        }
        .d-landing__field {
          display: flex; flex-direction: column; gap: 6px;
          max-width: 380px;
        }
        .d-landing__buttons {
          display: flex; gap: var(--s-3); flex-wrap: wrap;
        }
        .d-landing__meta {
          display: flex; gap: var(--s-2); flex-wrap: wrap; margin-top: var(--s-2);
        }
        .d-landing__foot {
          display: flex; align-items: center; gap: var(--s-2);
          color: var(--fg-mute);
          font-family: var(--font-mono);
          font-size: var(--t-xs);
          letter-spacing: var(--track-eyebrow);
          text-transform: uppercase;
          margin-top: auto;
        }
        .d-landing__foot a { cursor: pointer; }
        .d-landing__foot a:hover { color: var(--fg); }

        .d-landing__illo {
          position: relative;
          background: var(--bg-sunken);
          border-radius: var(--r-4);
          border: 1.5px solid var(--line);
          padding: var(--s-6);
          aspect-ratio: 4 / 5;
          display: flex;
          flex-direction: column;
        }
        .d-landing__illo-stamp {
          position: absolute;
          top: var(--s-3); left: var(--s-4);
          right: var(--s-4);
          display: flex; align-items: center; gap: var(--s-2);
          color: var(--fg-mute);
        }
        .d-landing__illo-art {
          flex: 1;
          display: flex; align-items: center; justify-content: center;
          color: var(--fg);
        }
        .d-landing__illo-art svg {
          width: 100%; height: 100%;
        }
      `}</style>
    </main>
  );
};

