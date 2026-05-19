"use client";

import { useState, useEffect } from "react";
import { Avatar, Btn, Chip, Energy, HouseRow, Icon, Phase, PipTimer, RingTimer, ActionCard } from "../ui";
import type { HouseData } from "../ui";
import type { ActionDef } from "../ui";

/* ============================================================
 * Mobile / Lobby — Direction B: Queue-first
 * Queue panel is the dominant content. Tip + ad fill wait time.
 * ============================================================ */

export function MobileLobby({
  userName,
  elapsed,
  mode,
  lobbyId,
  lobbyUpdate,
  error,
  onCancel,
  onJoinBots,
  onFriendLobby,
  onCreatePrivate,
  onJoinPrivate,
  themeToggle,
}: {
  userName: string;
  elapsed: number;
  mode: string;
  lobbyId: string;
  lobbyUpdate: { slotsFilled: number; slotsTotal: number; players: { displayName: string }[] } | null;
  error: string | null;
  onCancel: () => void;
  onJoinBots: () => void;
  onFriendLobby: () => void;
  onCreatePrivate?: () => void;
  onJoinPrivate?: (code: string) => void;
  themeToggle?: React.ReactNode;
}) {
    return (
    <div className="m-lobby">
      {/* Sticky header */}
      <header className="m-lobby__head">
        <div>
          <div className="ad-eyebrow">Lobby</div>
          <div style={{ fontSize: "var(--t-lg)", fontWeight: 700, letterSpacing: "var(--track-snug)" }}>Finding match</div>
        </div>
        <div className="ad-row">
          {themeToggle}
          <Avatar name={userName} variant="you" size="sm" />
        </div>
      </header>

      {/* Queue hero panel */}
      <section className="m-lobby__hero">
        <div className="m-lobby__hero-inner">
          <RingTimer value={elapsed} total={20} size={84} tone="defense" label={`${elapsed}s`}/>
          <h2 className="m-lobby__hero-title">Looking for two opponents…</h2>
          <p className="m-lobby__hero-sub">~ 11s average. 142 players online.</p>

          <div className="m-lobby__slots">
            <div className="m-lobby__slot m-lobby__slot--you">
              <Avatar name={userName} variant="you"/>
              <div>
                <div style={{ fontWeight: 600 }}>{userName}</div>
                <div className="ad-eyebrow" style={{ color: "var(--fg-mute)" }}>you</div>
              </div>
            </div>
            <div className="m-lobby__slot m-lobby__slot--empty">
              <div className="m-lobby__slot-icon"><Icon name="users" size={20} color="var(--fg-faint)"/></div>
              <div className="ad-eyebrow">waiting…</div>
            </div>
            <div className="m-lobby__slot m-lobby__slot--empty">
              <div className="m-lobby__slot-icon"><Icon name="users" size={20} color="var(--fg-faint)"/></div>
              <div className="ad-eyebrow">waiting…</div>
            </div>
          </div>

          <Btn variant="ghost" size="md" onClick={onCancel}>
            <Icon name="x" size={16}/>
            Cancel queue
          </Btn>
        </div>
      </section>

      {/* Quick switch */}
      <section className="m-lobby__quick">
        <Btn variant="secondary" size="md" full onClick={onJoinBots}>vs Bots</Btn>
        <Btn variant="secondary" size="md" full onClick={onFriendLobby}>Friend lobby</Btn>
      </section>

      {/* Tip */}
      <section className="m-lobby__tip">
        <div className="ad-eyebrow" style={{ marginBottom: 4 }}>Tip of the round</div>
        <div style={{ fontSize: "var(--t-xs)", lineHeight: 1.4 }}>
          <strong>Sneak attack</strong> costs 4 <Icon name="bolt" size={10} color="var(--energy)"/> but ignores shields. Great against turtle players.
        </div>
      </section>

      <style>{`
        .m-lobby {
          display: flex; flex-direction: column; gap: var(--s-3);
          height: 100%;
        }
        .m-lobby__head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 var(--s-1);
        }
        .m-lobby__hero {
          background: var(--bg-sunken);
          border-radius: var(--r-4);
          padding: var(--s-4) var(--s-3);
          border: 1px solid var(--line);
          display: flex;
        }
        .m-lobby__hero-inner {
          display: flex; flex-direction: column; align-items: center; gap: var(--s-3);
          width: 100%;
          justify-content: center;
        }
        .m-lobby__hero-title {
          margin: 0; font-size: var(--t-lg); font-weight: 700;
          letter-spacing: var(--track-snug); text-align: center;
        }
        .m-lobby__hero-sub {
          margin: 0; color: var(--fg-mute);
          font-family: var(--font-mono); font-size: var(--t-xs);
        }
        .m-lobby__slots {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--s-2);
          width: 100%;
        }
        .m-lobby__slot {
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          padding: var(--s-2) var(--s-1);
          background: var(--bg-raised);
          border: 1.5px solid var(--line);
          border-radius: var(--r-2);
        }
        .m-lobby__slot--empty {
          border-style: dashed;
          background: transparent;
        }
        .m-lobby__slot-icon {
          width: 32px; height: 32px; border-radius: var(--r-pill);
          background: var(--bg-sunken);
          display: flex; align-items: center; justify-content: center;
        }
        .m-lobby__quick {
          display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-2);
        }
        .m-lobby__tip {
          background: var(--bg-raised);
          border: 1px solid var(--line);
          border-radius: var(--r-2);
          padding: var(--s-2) var(--s-3);
        }
      `}</style>
    </div>
  );
};

