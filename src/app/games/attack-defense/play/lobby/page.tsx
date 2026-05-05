"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { gameSocket } from "@/lib/attack-defense/socket";
import { useAttackDefenseAuth } from "@/hooks/attack-defense/useAuth";

export default function AttackDefenseLobbyPage() {
  const router = useRouter();
  const { user } = useAttackDefenseAuth();
  const [status, setStatus] = useState("Pick a table");
  const [createdLobbyId, setCreatedLobbyId] = useState("");
  const [joinLobbyId, setJoinLobbyId] = useState("");
  const [busy, setBusy] = useState(false);

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

  if (!user) return <main className="p-6 text-zinc-100">Loading player...</main>;

  const payload = { userId: user.id, displayName: user.displayName, isGuest: user.isGuest };

  return (
    <main className="ad-container space-y-4">
      <h1 className="ad-title text-4xl">Lobby</h1>
      <p className="text-sm text-[var(--ad-text-soft)]">Logged in as {user.displayName}</p>

      {/* Mobile - Direction B (queue-first) */}
      <section className="md:hidden ad-card p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--ad-text-soft)]">Queue</p>
        <div className="mt-2 rounded-xl border border-[var(--ad-border)] bg-black/25 p-4 text-center">
          <h2 className="text-2xl font-bold">finding match...</h2>
          <p className="mt-1 text-xs text-[var(--ad-text-soft)]">avg wait ~11s</p>
          <div className="mt-3 grid gap-2">
            <button
              className="ad-btn-primary h-11 disabled:opacity-60"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                setStatus("Starting solo match...");
                emitWhenConnected("queue:joinSoloBots", payload, (response) => {
                  setBusy(false);
                  if (response?.ok && response.roomId) router.push(`/games/attack-defense/play/match/${response.roomId}`);
                });
              }}
            >
              Solo (vs 2 bots)
            </button>
            <button
              className="ad-btn-secondary h-11 disabled:opacity-60"
              disabled={busy}
              onClick={() => {
                setStatus("Joining public queue...");
                emitWhenConnected("queue:joinPublic", payload);
              }}
            >
              Public 3P queue
            </button>
            <button
              className="ad-btn-tertiary h-11 disabled:opacity-60"
              disabled={busy}
              onClick={() => {
                setStatus("Creating lobby...");
                emitWhenConnected("lobby:create", payload);
              }}
            >
              Create friend lobby
            </button>
          </div>
        </div>
      </section>

      {/* Desktop - Direction A (stacked menu/cards) */}
      <section className="hidden md:grid grid-cols-[1fr_220px] gap-4">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="ad-card p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--ad-text-soft)]">Quick Play</p>
              <h2 className="mt-2 text-2xl font-bold">Jump straight in</h2>
              <p className="text-sm text-[var(--ad-text-soft)]">Best path for immediate match.</p>
              <div className="mt-4 grid gap-2">
                <button
                  className="ad-btn-primary h-11 disabled:opacity-60"
                  disabled={busy}
                  onClick={() => {
                    setBusy(true);
                    setStatus("Starting solo match...");
                    emitWhenConnected("queue:joinSoloBots", payload, (response) => {
                      setBusy(false);
                      if (response?.ok && response.roomId) router.push(`/games/attack-defense/play/match/${response.roomId}`);
                    });
                  }}
                >
                  1 vs 2 bots
                </button>
                <button
                  className="ad-btn-secondary h-11 disabled:opacity-60"
                  disabled={busy}
                  onClick={() => {
                    setStatus("Joining public queue...");
                    emitWhenConnected("queue:joinPublic", payload);
                  }}
                >
                  3 players (public)
                </button>
              </div>
            </div>

            <div className="ad-card p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--ad-text-soft)]">Private</p>
              <h2 className="mt-2 text-2xl font-bold">Play with a friend</h2>
              <div className="mt-4 grid gap-2">
                <button
                  className="ad-btn-tertiary h-10 disabled:opacity-60"
                  disabled={busy}
                  onClick={() => {
                    setStatus("Creating lobby...");
                    emitWhenConnected("lobby:create", payload);
                  }}
                >
                  Create lobby
                </button>
                {createdLobbyId ? <p className="rounded-lg bg-black/25 px-3 py-2 text-sm text-cyan-200">Code: {createdLobbyId}</p> : null}
                <input
                  className="h-10 rounded-lg border border-[var(--ad-border)] bg-black/25 px-3 text-sm outline-none focus:ring-2 focus:ring-cyan-300/35"
                  placeholder="Mickey-Mouse-1234"
                  value={joinLobbyId}
                  onChange={(event) => setJoinLobbyId(event.target.value)}
                />
                <button
                  className="ad-btn-tertiary h-10 disabled:opacity-60"
                  disabled={busy}
                  onClick={() => {
                    if (!joinLobbyId.trim()) {
                      setStatus("Enter lobby code first.");
                      return;
                    }
                    setStatus("Joining friend lobby...");
                    emitWhenConnected("lobby:join", { ...payload, lobbyId: joinLobbyId.trim() });
                  }}
                >
                  Join lobby
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-3">
          <div className="ad-card p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--ad-text-soft)]">Record</p>
            <p className="mt-1 text-sm">Current profile: {user.displayName}</p>
          </div>
          <div className="ad-card p-3 text-xs text-[var(--ad-text-soft)]">
            Tip: sneak attack ignores shield. Keep 4 energy ready.
          </div>
        </aside>
      </section>

      {/* Mobile companion friend controls */}
      <section className="md:hidden ad-card p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--ad-text-soft)]">Friend Lobby</p>
        <div className="mt-2 grid gap-2">
          <button
            className="ad-btn-tertiary h-10 disabled:opacity-60"
            disabled={busy}
            onClick={() => {
              setStatus("Creating lobby...");
              emitWhenConnected("lobby:create", payload);
            }}
          >
            Create lobby
          </button>
          {createdLobbyId ? <p className="rounded-lg bg-black/25 px-3 py-2 text-sm text-cyan-200">Code: {createdLobbyId}</p> : null}
          <input
            className="h-10 rounded-lg border border-[var(--ad-border)] bg-black/25 px-3 text-sm outline-none focus:ring-2 focus:ring-cyan-300/35"
            placeholder="Mickey-Mouse-1234"
            value={joinLobbyId}
            onChange={(event) => setJoinLobbyId(event.target.value)}
          />
          <button
            className="ad-btn-tertiary h-10 disabled:opacity-60"
            disabled={busy}
            onClick={() => {
              if (!joinLobbyId.trim()) {
                setStatus("Enter lobby code first.");
                return;
              }
              setStatus("Joining friend lobby...");
              emitWhenConnected("lobby:join", { ...payload, lobbyId: joinLobbyId.trim() });
            }}
          >
            Join lobby
          </button>
        </div>
      </section>

      <p className="ad-card px-3 py-2 text-sm text-[var(--ad-text-soft)]">{status}</p>
    </main>
  );
}
