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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,#1e1b4b_0%,#09090b_48%),radial-gradient(circle_at_20%_90%,#052e16_0%,transparent_35%)] px-6 py-8 text-zinc-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <h1 className="text-4xl font-black tracking-tight">Pick a table</h1>
      <p className="text-sm text-zinc-200">Logged in as {user.displayName}</p>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-700/80 bg-zinc-900/75 p-4 shadow-xl shadow-black/30 backdrop-blur">
          <h2 className="text-xl font-semibold">Solo run</h2>
          <p className="mt-1 text-sm text-zinc-300">1 player vs 2 bots (instant)</p>
          <button
            className="mt-4 h-11 w-full rounded-lg bg-gradient-to-r from-lime-300 to-lime-400 font-bold text-zinc-900 shadow-md shadow-lime-900/30 disabled:opacity-60"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              setStatus("Starting solo match...");
              emitWhenConnected("queue:joinSoloBots", payload, (response) => {
                setBusy(false);
                if (response?.ok && response.roomId) {
                  router.push(`/games/attack-defense/play/match/${response.roomId}`);
                  return;
                }
                if (response?.message) setStatus(response.message);
              });
            }}
          >
            Play now
          </button>
        </div>

        <div className="rounded-2xl border border-zinc-700/80 bg-zinc-900/75 p-4 shadow-xl shadow-black/30 backdrop-blur">
          <h2 className="text-xl font-semibold">Public 3P</h2>
          <p className="mt-1 text-sm text-zinc-300">Match with strangers</p>
          <button
            className="mt-4 h-11 w-full rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 font-bold shadow-md shadow-indigo-900/30 disabled:opacity-60"
            disabled={busy}
            onClick={() => {
              setStatus("Joining public queue...");
              emitWhenConnected("queue:joinPublic", payload);
            }}
          >
            Join queue
          </button>
        </div>

        <div className="rounded-2xl border border-zinc-700/80 bg-zinc-900/75 p-4 shadow-xl shadow-black/30 backdrop-blur">
          <h2 className="text-xl font-semibold">Friend lobby</h2>
          <button
            className="mt-2 h-10 w-full rounded-lg bg-gradient-to-r from-cyan-500 to-sky-500 font-bold shadow-md shadow-cyan-900/30 disabled:opacity-60"
            disabled={busy}
            onClick={() => {
              setStatus("Creating lobby...");
              emitWhenConnected("lobby:create", payload);
            }}
          >
            Create lobby
          </button>
          {createdLobbyId ? <p className="mt-2 rounded bg-zinc-800 px-2 py-1 text-xs text-cyan-200">Code: {createdLobbyId}</p> : null}
          <input
            className="mt-2 h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-3 text-sm outline-none ring-cyan-300/40 focus:ring-2"
            placeholder="Mickey-Mouse-1234"
            value={joinLobbyId}
            onChange={(event) => setJoinLobbyId(event.target.value)}
          />
          <button
            className="mt-2 h-10 w-full rounded-lg bg-gradient-to-r from-cyan-600 to-blue-500 font-bold shadow-md shadow-cyan-900/30 disabled:opacity-60"
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

      <p className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-200">{status}</p>
      </div>
    </main>
  );
}
