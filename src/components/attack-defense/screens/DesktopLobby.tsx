"use client";

import { useState, useEffect } from "react";
import { Avatar, Btn, Chip, Energy, HouseRow, Icon, Phase, PipTimer, RingTimer, ActionCard } from "../ui";
import type { HouseData } from "../ui";
import type { ActionDef } from "../ui";

/* ============================================================
 * Desktop / Lobby — Direction A: Stacked menu
 * Document layout. Left: Quick play + Private lobby + Power-ups.
 * Right sidebar (260px): record, last match, ad.
 * ============================================================ */

export function DesktopLobby({
  userName,
  mode,
  lobbyId,
  lobbyUpdate,
  error,
  busy,
  onJoinBots,
  onJoinPublic,
  onCreatePrivate,
  onJoinPrivate,
  themeToggle,
}: {
  userName: string;
  mode: string;
  lobbyId: string;
  lobbyUpdate: { slotsFilled: number; slotsTotal: number } | null;
  error: string | null;
  busy: boolean;
  onJoinBots: () => void;
  onJoinPublic: () => void;
  onCreatePrivate: () => void;
  onJoinPrivate: (code: string) => void;
  themeToggle?: React.ReactNode;
}) {
  const [lobbyCode, setLobbyCode] = useState("");

  return (
    <main className="d-lobby">
      <header className="d-lobby__head">
        <div>
          <span className="ad-eyebrow">Lobby</span>
          <h1 className="d-lobby__title">Pick a table.</h1>
        </div>
        <div className="d-lobby__head-meta">
          <Chip><Icon name="users" size={11} color="var(--ok)"/>142 online</Chip>
          <Chip>14W · 9L · 1D</Chip>
          {themeToggle}
          <Avatar name={userName} variant="you"/>
        </div>
        {error && <p className="ad-eyebrow" style={{ color: "var(--bad)", width: "100%" }}>{error}</p>}
        {lobbyId && (
          <p className="tk-mono" style={{ fontSize: "var(--t-sm)" }}>
            Lobby code: <strong>{lobbyId}</strong>
            {lobbyUpdate ? ` · ${lobbyUpdate.slotsFilled}/${lobbyUpdate.slotsTotal} players` : ""}
          </p>
        )}
      </header>

      <div className="d-lobby__grid">
        <div className="d-lobby__main">
          {/* Quick play + Private lobby — two cards side by side */}
          <div className="d-lobby__row-2">
            <section className="d-lobby__card">
              <div className="d-lobby__card-head">
                <Icon name="play" size={16} color="var(--attack)"/>
                <span className="ad-eyebrow">Quick play</span>
              </div>
              <h2 className="d-lobby__card-title">Jump straight in.</h2>
              <p className="d-lobby__card-sub">Solo vs bots is instant. Public 3-player averages 11s.</p>
              <div className="d-lobby__card-actions">
                <Btn variant="primary" size="lg" onClick={onJoinBots}>
                  <Icon name="sword" size={14} color="var(--bg)"/>
                  vs 2 bots
                </Btn>
                <Btn variant="secondary" size="lg" onClick={onJoinPublic} disabled={busy}>
                  <Icon name="users" size={14}/>
                  Public 3-player
                </Btn>
              </div>
              <div className="d-lobby__card-foot">
                <span className="ad-eyebrow">avg wait</span>
                <span className="tk-mono">11s</span>
              </div>
            </section>

            <section className="d-lobby__card">
              <div className="d-lobby__card-head">
                <Icon name="users" size={16} color="var(--defense)"/>
                <span className="ad-eyebrow">Private lobby</span>
              </div>
              <h2 className="d-lobby__card-title">Play with a friend.</h2>
              <p className="d-lobby__card-sub">2 humans + 1 bot. Share a 4-word code.</p>
              <div className="d-lobby__card-actions">
                <Btn variant="defense" size="lg" onClick={onCreatePrivate} disabled={busy}>Create lobby</Btn>
              </div>
              <div className="d-lobby__input-row">
                <div className="ad-input-group" style={{ flex: 1 }}>
                  <input className="ad-input" placeholder="Mickey-Mouse-1234"
                         value={lobbyCode} onChange={(e) => setLobbyCode(e.target.value)}/>
                  <Btn variant="ghost" size="sm" icon><Icon name="copy" size={14}/></Btn>
                </div>
                <Btn variant="secondary" size="lg" disabled={!lobbyCode || busy} onClick={() => onJoinPrivate(lobbyCode)}>Join</Btn>
              </div>
            </section>
          </div>

          {/* Power-ups row */}
          <section className="d-lobby__card d-lobby__powerups">
            <div className="d-lobby__card-head">
              <Icon name="bolt" size={16} color="var(--energy)"/>
              <span className="ad-eyebrow">Power-ups · consumable per match</span>
            </div>
            <div className="d-lobby__powerups-grid">
              <PowerupTile name="Energy surge" sub="+5 ⚡ at match start" cost="$0.99"/>
              <PowerupTile name="Repair kit"   sub="Heal one house +3 HP" cost="$0.99"/>
              <PowerupTile name="Double strike" sub="2× damage on one attack" cost="$1.99"/>
            </div>
          </section>

          {/* Recent matches */}
          <section className="d-lobby__card d-lobby__recent">
            <div className="d-lobby__card-head">
              <Icon name="clock" size={16} color="var(--fg-mute)"/>
              <span className="ad-eyebrow">Recent matches</span>
            </div>
            <table className="d-lobby__table">
              <thead>
                <tr>
                  <th>Result</th><th>Opponents</th><th>Rounds</th><th>Duration</th><th>+XP</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><Chip tone="energy">W</Chip></td><td>ASH · BOT-K</td><td className="tk-mono">7</td><td className="tk-mono">2m 14s</td><td className="tk-mono">+24</td></tr>
                <tr><td><Chip tone="attack">L</Chip></td><td>JIN · MAE</td><td className="tk-mono">5</td><td className="tk-mono">1m 38s</td><td className="tk-mono">+8</td></tr>
                <tr><td><Chip tone="energy">W</Chip></td><td>BOT-A · BOT-K</td><td className="tk-mono">9</td><td className="tk-mono">3m 02s</td><td className="tk-mono">+28</td></tr>
                <tr><td><Chip>D</Chip></td><td>RAVI · MEI</td><td className="tk-mono">30</td><td className="tk-mono">9m 11s</td><td className="tk-mono">+12</td></tr>
              </tbody>
            </table>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="d-lobby__side">
          <section className="d-lobby__plaque">
            <div className="ad-eyebrow">Your record</div>
            <div className="d-lobby__plaque-stat">14W <span className="d-lobby__plaque-sep">·</span> 9L <span className="d-lobby__plaque-sep">·</span> 1D</div>
            <div className="d-lobby__plaque-bar">
              <div className="d-lobby__plaque-bar-fill" style={{ width: "58%" }}/>
            </div>
            <div className="ad-eyebrow" style={{ color: "var(--fg-mute)" }}>58% win rate</div>
          </section>

          <section className="d-lobby__last">
            <div className="ad-eyebrow">Last match</div>
            <div className="d-lobby__last-result"><Chip tone="energy">Win</Chip><span>Round 7</span></div>
            <div className="d-lobby__last-foot">
              <span className="ad-eyebrow">vs ASH · BOT-K</span>
            </div>
          </section>

          <section className="d-lobby__ad" aria-label="Advertisement">
            <span className="ad-eyebrow">advertisement</span>
            <div className="d-lobby__ad-box">300 × 250</div>
          </section>

          <section className="d-lobby__tip">
            <div className="ad-eyebrow" style={{ color: "var(--attack-fg)" }}>Tip</div>
            <p>Sneak attack costs 4 <Icon name="bolt" size={11} color="var(--energy)"/> but ignores shields. Great against turtle players.</p>
          </section>
        </aside>
      </div>

      <style>{`
        .d-lobby {
          display: flex; flex-direction: column; gap: var(--s-6);
          padding: var(--s-7) var(--s-8);
          min-height: 100%;
        }
        .d-lobby__head {
          display: flex; align-items: flex-end; justify-content: space-between;
          gap: var(--s-4); flex-wrap: wrap;
        }
        .d-lobby__title {
          margin: 4px 0 0;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: var(--t-3xl);
          letter-spacing: var(--track-tight);
          line-height: var(--lh-tight);
        }
        .d-lobby__head-meta { display: flex; align-items: center; gap: var(--s-3); }

        .d-lobby__grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 280px;
          gap: var(--s-5);
        }
        .d-lobby__main { display: flex; flex-direction: column; gap: var(--s-4); }
        .d-lobby__row-2 {
          display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-4);
        }
        .d-lobby__card {
          background: var(--bg-raised);
          border: 1px solid var(--line);
          border-radius: var(--r-3);
          padding: var(--s-5);
          display: flex; flex-direction: column; gap: var(--s-3);
          box-shadow: var(--sh-1);
        }
        .d-lobby__card-head { display: flex; align-items: center; gap: var(--s-2); }
        .d-lobby__card-title {
          margin: 0;
          font-size: var(--t-xl);
          font-weight: 700;
          letter-spacing: var(--track-snug);
          line-height: var(--lh-snug);
        }
        .d-lobby__card-sub { color: var(--fg-mute); font-size: var(--t-sm); margin: 0; }
        .d-lobby__card-actions { display: flex; gap: var(--s-2); flex-wrap: wrap; margin-top: var(--s-1); }
        .d-lobby__card-foot {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: auto; padding-top: var(--s-3);
          border-top: 1px dashed var(--line);
          font-size: var(--t-xs);
          color: var(--fg-mute);
        }
        .d-lobby__input-row {
          display: flex; gap: var(--s-2); margin-top: var(--s-2);
        }

        .d-lobby__powerups-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--s-3);
        }
        .d-lobby__recent {  }
        .d-lobby__table {
          width: 100%; border-collapse: collapse;
        }
        .d-lobby__table th {
          text-align: left; padding: 8px 0;
          font-family: var(--font-mono);
          font-size: var(--t-xs);
          letter-spacing: var(--track-eyebrow);
          text-transform: uppercase;
          color: var(--fg-mute);
          font-weight: 500;
          border-bottom: 1px solid var(--line);
        }
        .d-lobby__table td {
          padding: 12px 0;
          border-bottom: 1px solid var(--line);
          font-size: var(--t-sm);
        }
        .d-lobby__table tr:last-child td { border-bottom: none; }

        .d-lobby__side { display: flex; flex-direction: column; gap: var(--s-3); }

        .d-lobby__plaque {
          background: var(--bg-raised);
          border: 2px solid var(--fg);
          border-radius: var(--r-3);
          padding: var(--s-4);
          box-shadow: var(--sh-stamp);
          display: flex; flex-direction: column; gap: var(--s-1);
        }
        .d-lobby__plaque-stat {
          font-family: var(--font-mono);
          font-weight: 800;
          font-size: var(--t-xl);
          letter-spacing: var(--track-snug);
        }
        .d-lobby__plaque-sep { color: var(--fg-mute); margin: 0 4px; }
        .d-lobby__plaque-bar {
          height: 6px; background: var(--bg-sunken);
          border-radius: var(--r-pill); overflow: hidden;
          margin-top: var(--s-1);
        }
        .d-lobby__plaque-bar-fill {
          height: 100%; background: var(--energy);
        }

        .d-lobby__last {
          background: var(--bg-raised);
          border: 1px solid var(--line);
          border-radius: var(--r-3);
          padding: var(--s-3) var(--s-4);
          display: flex; flex-direction: column; gap: 4px;
        }
        .d-lobby__last-result {
          display: flex; align-items: center; gap: var(--s-2);
          font-weight: 600; font-size: var(--t-md);
        }
        .d-lobby__last-foot { color: var(--fg-mute); }

        .d-lobby__ad {
          background: var(--bg-sunken);
          border: 1.5px dashed var(--line-strong);
          border-radius: var(--r-3);
          padding: var(--s-3);
          display: flex; flex-direction: column; align-items: center; gap: var(--s-2);
        }
        .d-lobby__ad-box {
          width: 100%;
          aspect-ratio: 300 / 250;
          background: var(--bg-raised);
          border: 1px solid var(--line);
          border-radius: var(--r-2);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-mono); color: var(--fg-faint);
          font-size: var(--t-sm);
        }
        .d-lobby__tip {
          background: var(--attack-soft);
          border: 1px solid var(--line);
          border-radius: var(--r-3);
          padding: var(--s-3) var(--s-4);
          font-size: var(--t-sm);
          color: var(--attack-fg);
        }
        .d-lobby__tip p { margin: 4px 0 0; line-height: var(--lh-body); }
      `}</style>
    </main>
  );
};

const PowerupTile = ({ name, sub, cost }: { name: string; sub: string; cost: string }) => (
  <div className="d-pw">
    <div className="d-pw__head">
      <span className="d-pw__name">{name}</span>
      <span className="d-pw__cost">{cost}</span>
    </div>
    <div className="d-pw__sub">{sub}</div>
    <div className="d-pw__foot">
      <span className="ad-eyebrow" style={{ color: "var(--fg-faint)" }}>coming soon</span>
    </div>
    <style>{`
      .d-pw {
        background: var(--bg-sunken);
        border: 1.5px solid var(--line);
        border-radius: var(--r-2);
        padding: var(--s-3);
        display: flex; flex-direction: column; gap: 4px;
      }
      .d-pw__head {
        display: flex; align-items: center; justify-content: space-between;
        gap: var(--s-2); min-width: 0;
      }
      .d-pw__name {
        font-weight: 700; font-size: var(--t-sm);
        line-height: 1.2;
        min-width: 0;
        word-break: break-word;
      }
      .d-pw__cost {
        font-family: var(--font-mono); font-size: var(--t-xs);
        color: var(--energy-fg);
        flex-shrink: 0;
        background: var(--energy-soft);
        padding: 2px 8px;
        border-radius: var(--r-pill);
      }
      .d-pw__sub { color: var(--fg-mute); font-size: var(--t-xs); line-height: 1.4; }
      .d-pw__foot { margin-top: auto; padding-top: var(--s-2); }
    `}</style>
  </div>
);

