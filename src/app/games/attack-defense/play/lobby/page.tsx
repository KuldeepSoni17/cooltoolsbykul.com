"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Hatch, PlayerTag, WBtn } from "@/components/attack-defense/wf-primitives";
import { gameSocket } from "@/lib/attack-defense/socket";
import { useAttackDefenseAuth } from "@/hooks/attack-defense/useAuth";

export default function AttackDefenseLobbyPage() {
  const router = useRouter();
  const { user } = useAttackDefenseAuth();
  const [status, setStatus] = useState("Pick a table");
  const [createdLobbyId, setCreatedLobbyId] = useState("");
  const [joinLobbyId, setJoinLobbyId] = useState("");
  const [busy, setBusy] = useState(false);

  const matching = /starting|joining|connecting|finding|matching/i.test(status);

  const emitWhenConnected = (
    event: string,
    payload: Record<string, string | boolean>,
    ack?: (response: { ok?: boolean; roomId?: string; message?: string }) => void
  ) => {
    const run = () => gameSocket.emit(event, payload, ack);
    if (gameSocket.connected) {
      run();
      return;
    }
    setStatus("Connecting to game server...");
    gameSocket.connect();
    gameSocket.once("connect", run);
  };

  useEffect(() => {
    if (!gameSocket.connected) gameSocket.connect();
    gameSocket.on("queue:matched", ({ roomId }: { roomId: string }) => router.push(`/games/attack-defense/play/match/${roomId}`));
    gameSocket.on("lobby:created", ({ lobbyId }: { lobbyId: string }) => {
      setCreatedLobbyId(lobbyId);
      setStatus("Lobby created. Share code with your friend.");
    });
    gameSocket.on("error", ({ message }: { message: string }) => setStatus(message));
    gameSocket.on("connect_error", () => setStatus("Unable to connect to game server. Please try again."));

    return () => {
      gameSocket.off("queue:matched");
      gameSocket.off("lobby:created");
      gameSocket.off("error");
      gameSocket.off("connect_error");
    };
  }, [router]);

  if (!user) {
    return (
      <main className="wf-container wf-pad-3">
        <p className="scribble">Loading player...</p>
      </main>
    );
  }

  const payload = { userId: user.id, displayName: user.displayName, isGuest: user.isGuest };

  const startSolo = () => {
    setBusy(true);
    setStatus("Starting solo match...");
    emitWhenConnected("queue:joinSoloBots", payload, (response) => {
      setBusy(false);
      if (response?.ok && response.roomId) router.push(`/games/attack-defense/play/match/${response.roomId}`);
    });
  };

  return (
    <main className="wf-container wf-col wf-gap-3" style={{ paddingTop: "1.5rem", paddingBottom: "2rem" }}>
      {/* Mobile — Direction B */}
      <section className="md:hidden wf-col wf-gap-2 wf-grow">
        <div className="hand" style={{ fontSize: 22 }}>
          queue
        </div>
        <div className="sketchy wf-pad-2 wf-col wf-gap-2 wf-center" style={{ background: "var(--paper-2)", textAlign: "center" }}>
          {matching ? (
            <>
              <div className="hand wf-xl">finding match…</div>
              <div className="wf-row wf-gap-2 wf-ai-c wf-center">
                <PlayerTag name={user.displayName} you color="var(--accent-3)" />
                <span className="wf-muted">+ 2</span>
              </div>
              <div className="wf-row wf-gap-1 wf-center">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="pip pip-blink" />
                ))}
              </div>
              <div className="wf-xs wf-muted">~ 11s avg</div>
            </>
          ) : (
            <>
              <div className="hand wf-lg">pick your table</div>
              <WBtn variant="primary" full disabled={busy} onClick={startSolo}>
                1 player vs 2 bots
              </WBtn>
              <WBtn full disabled={busy} onClick={() => { setStatus("Joining public queue..."); emitWhenConnected("queue:joinPublic", payload); }}>
                3 players (public)
              </WBtn>
              <WBtn full disabled={busy} onClick={() => { setStatus("Creating lobby..."); emitWhenConnected("lobby:create", payload); }}>
                create friend lobby
              </WBtn>
            </>
          )}
        </div>
        <div className="wf-row wf-gap-2">
          <WBtn full sm disabled={busy} onClick={startSolo}>
            switch: bots
          </WBtn>
          <WBtn full sm disabled={busy} onClick={() => { setStatus("Creating lobby..."); emitWhenConnected("lobby:create", payload); }}>
            switch: friend
          </WBtn>
        </div>
        <div className="wf-divider" />
        <div className="wf-xs wf-muted wf-upper">friend lobby</div>
        <div className="sketchy-thin wf-pad-2 wf-col wf-gap-2">
          {createdLobbyId ? <p className="mono wf-small">code: {createdLobbyId}</p> : null}
          <input
            className="wf-input wf-small"
            style={{ fontSize: 14, fontFamily: "Kalam, cursive" }}
            placeholder="Mickey-Mouse-1234"
            value={joinLobbyId}
            onChange={(e) => setJoinLobbyId(e.target.value)}
          />
          <WBtn sm disabled={busy} onClick={() => {
            if (!joinLobbyId.trim()) { setStatus("Enter lobby code first."); return; }
            setStatus("Joining friend lobby...");
            emitWhenConnected("lobby:join", { ...payload, lobbyId: joinLobbyId.trim() });
          }}>
            join
          </WBtn>
        </div>
        <div className="wf-xs wf-muted wf-upper">while you wait</div>
        <Hatch h={60} label="ad · 320×50" />
        <div className="sketchy-thin wf-pad-2 wf-small wf-col wf-gap-1">
          <b>tip:</b> sneak attack ignores shields. save 4⚡ for it.
        </div>
        <p className="sketchy-thin wf-pad-2 wf-small wf-muted">{status}</p>
      </section>

      {/* Desktop — Direction A */}
      <section className="hidden md:flex md:gap-4 wf-grow">
        <div className="wf-col wf-gap-3 wf-grow">
          <div className="hand" style={{ fontSize: 36 }}>
            Lobby
          </div>
          <div className="wf-row wf-gap-3">
            <div className="sketchy-thin wf-pad-3 wf-grow wf-col wf-gap-2">
              <div className="wf-xs wf-muted wf-upper">quick play</div>
              <div className="hand wf-lg">jump straight in</div>
              <WBtn variant="primary" disabled={busy} onClick={startSolo}>
                1 vs 2 bots
              </WBtn>
              <WBtn disabled={busy} onClick={() => { setStatus("Joining public queue..."); emitWhenConnected("queue:joinPublic", payload); }}>
                3 players (public)
              </WBtn>
            </div>
            <div className="sketchy-thin wf-pad-3 wf-grow wf-col wf-gap-2">
              <div className="wf-xs wf-muted wf-upper">private</div>
              <div className="hand wf-lg">play with a friend</div>
              <WBtn disabled={busy} onClick={() => { setStatus("Creating lobby..."); emitWhenConnected("lobby:create", payload); }}>
                create lobby
              </WBtn>
              <div className="wf-row wf-gap-1">
                <input
                  className="sketchy-thin wf-grow wf-pad-2 wf-small"
                  style={{ background: "var(--paper-2)", border: "1.5px solid var(--ink)", borderRadius: 4 }}
                  placeholder="Mickey-Mouse-1234"
                  value={joinLobbyId}
                  onChange={(e) => setJoinLobbyId(e.target.value)}
                />
                <WBtn sm disabled={busy} onClick={() => {
                  if (!joinLobbyId.trim()) { setStatus("Enter lobby code first."); return; }
                  setStatus("Joining friend lobby...");
                  emitWhenConnected("lobby:join", { ...payload, lobbyId: joinLobbyId.trim() });
                }}>
                  join
                </WBtn>
              </div>
              {createdLobbyId ? <p className="mono wf-small">Code: {createdLobbyId}</p> : null}
            </div>
          </div>
          <div className="sketchy-thin wf-pad-3">
            <div className="wf-xs wf-muted wf-upper wf-mb-1">power-ups · consumable per match</div>
            <div className="wf-row wf-gap-2">
              <div className="sketchy-thin wf-grow wf-pad-2">
                <div className="wf-b wf-small">energy surge</div>
                <div className="wf-xs wf-muted">+5 ⚡ at start</div>
                <div className="wf-small wf-mt-1">$0.99</div>
              </div>
              <div className="sketchy-thin wf-grow wf-pad-2">
                <div className="wf-b wf-small">repair kit</div>
                <div className="wf-xs wf-muted">heal 3hp</div>
                <div className="wf-small wf-mt-1">$0.99</div>
              </div>
              <div className="sketchy-thin wf-grow wf-pad-2">
                <div className="wf-b wf-small">double strike</div>
                <div className="wf-xs wf-muted">2× damage 1×</div>
                <div className="wf-small wf-mt-1">$1.99</div>
              </div>
            </div>
          </div>
          <p className="sketchy-thin wf-pad-2 wf-small wf-muted">{status}</p>
        </div>
        <aside className="wf-col wf-gap-2" style={{ width: 220 }}>
          <div className="sketchy-thin wf-pad-2">
            <div className="wf-xs wf-muted wf-upper">your record</div>
            <div className="mono wf-b">{user.displayName}</div>
          </div>
          <div className="sketchy-thin wf-pad-2 wf-small">
            Tip: sneak attack ignores shield. Keep 4 energy ready.
          </div>
          <Hatch h={180} label="ad · 300×250" />
        </aside>
      </section>
    </main>
  );
}
