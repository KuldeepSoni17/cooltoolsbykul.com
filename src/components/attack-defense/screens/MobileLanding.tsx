"use client";

import { useState, useEffect } from "react";
import { Avatar, Btn, Chip, Energy, HouseRow, Icon, Phase, PipTimer, RingTimer, ActionCard } from "../ui";
import type { HouseData } from "../ui";
import type { ActionDef } from "../ui";

/* ============================================================
 * Mobile / Landing — Direction A: Editorial paper
 * Vertical center, monumental type, codename input, primary CTA.
 * ============================================================ */

export function MobileLanding({ onPlay, initialName = "" }: { onPlay: (name: string) => void; initialName?: string }) {
  const [name, setName] = useState(initialName || "");
  return (
    <div className="m-landing">
      <div className="m-landing__brand">
        <span className="ad-eyebrow">v1 · 2026</span>
      </div>

      <div className="m-landing__hero">
        <h1 className="m-landing__title">
          Attack<span style={{ color: "var(--attack)" }}>·</span>Defense.
        </h1>
        <p className="m-landing__sub">
          Three players. Nine houses.<br/>One survivor.
        </p>
      </div>

      <div className="m-landing__form ad-stack">
        <label className="ad-eyebrow" htmlFor="m-codename">Codename</label>
        <input
          id="m-codename"
          className="ad-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="your codename"
          autoComplete="off"
          style={{ fontSize: "var(--t-md)", fontWeight: 600 }}
        />
        <Btn variant="primary" size="xl" full onClick={() => onPlay && onPlay(name)}>
          <Icon name="play" size={18} color="var(--bg)"/>
          Play as guest
        </Btn>
        <Btn variant="secondary" size="lg" full>
          <Icon name="google" size={16}/>
          Continue with Google
        </Btn>
      </div>

      <div className="m-landing__foot">
        <span className="ad-eyebrow">no email · 30s to first match</span>
      </div>

      <style>{`
        .m-landing {
          display: flex; flex-direction: column;
          height: 100%;
          padding: var(--s-3) 0;
          gap: var(--s-5);
        }
        .m-landing__brand { display: flex; align-items: center; justify-content: space-between; }
        .m-landing__hero {
          display: flex; flex-direction: column; gap: var(--s-2);
        }
        .m-landing__title {
          margin: 0;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 44px;
          line-height: 0.95;
          letter-spacing: -0.025em;
        }
        .m-landing__sub {
          margin: 0;
          color: var(--fg-mute);
          font-size: var(--t-md);
          line-height: var(--lh-body);
        }
        .m-landing__form { gap: var(--s-3); margin-top: auto; }
        .m-landing__foot {
          text-align: center;
          padding-top: var(--s-2);
        }
      `}</style>
    </div>
  );
};

