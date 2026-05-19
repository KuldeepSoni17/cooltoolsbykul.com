"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { emitWhenConnected } from "@/lib/attack-defense/emitWhenConnected";
import { gameSocket } from "@/lib/attack-defense/socket";

export type LobbyMode = "idle" | "queue_public" | "queue_solo" | "create_private" | "join_private";

interface LobbyPlayer {
  userId: string;
  displayName: string;
}

interface LobbyUpdate {
  lobbyId: string;
  players: LobbyPlayer[];
  slotsFilled: number;
  slotsTotal: number;
}

export function useAttackDefenseLobby(user: { id: string; displayName: string; isGuest: boolean } | null, options?: { autoQueuePublic?: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<LobbyMode>("idle");
  const [lobbyId, setLobbyId] = useState("");
  const [lobbyUpdate, setLobbyUpdate] = useState<LobbyUpdate | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const startedRef = useRef(false);

  const payload = user
    ? { userId: user.id, displayName: user.displayName, isGuest: user.isGuest }
    : null;

  const goMatch = useCallback(
    (roomId: string) => {
      router.push(`/games/attack-defense/play/match/${roomId}`);
    },
    [router]
  );

  useEffect(() => {
    if (!gameSocket.connected) gameSocket.connect();

    const onMatched = ({ roomId }: { roomId: string }) => {
      setBusy(false);
      goMatch(roomId);
    };
    const onCreated = ({ lobbyId: id }: { lobbyId: string }) => {
      setLobbyId(id);
      setMode("create_private");
      setBusy(false);
    };
    const onUpdate = (update: LobbyUpdate) => {
      setLobbyUpdate(update);
      setLobbyId(update.lobbyId);
    };
    const onErr = ({ message }: { message: string }) => {
      setError(message);
      setBusy(false);
    };
    const onConnectErr = () => {
      setError("Unable to connect to game server. Please try again.");
      setBusy(false);
    };

    gameSocket.on("queue:matched", onMatched);
    gameSocket.on("lobby:created", onCreated);
    gameSocket.on("lobby:update", onUpdate);
    gameSocket.on("error", onErr);
    gameSocket.on("connect_error", onConnectErr);

    return () => {
      gameSocket.off("queue:matched", onMatched);
      gameSocket.off("lobby:created", onCreated);
      gameSocket.off("lobby:update", onUpdate);
      gameSocket.off("error", onErr);
      gameSocket.off("connect_error", onConnectErr);
    };
  }, [goMatch]);

  useEffect(() => {
    if (mode !== "queue_public" && mode !== "queue_solo") return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [mode]);

  const joinPublic = useCallback(() => {
    if (!payload) return;
    setBusy(true);
    setError(null);
    setMode("queue_public");
    setElapsed(0);
    emitWhenConnected("queue:joinPublic", payload, undefined, () => setError("Connecting…"));
  }, [payload]);

  const joinSoloBots = useCallback(() => {
    if (!payload) return;
    setBusy(true);
    setError(null);
    setMode("queue_solo");
    emitWhenConnected(
      "queue:joinSoloBots",
      payload,
      (response) => {
        setBusy(false);
        if (response?.ok && response.roomId) goMatch(response.roomId);
        else if (response?.message) setError(response.message);
      },
      () => setError("Connecting…")
    );
  }, [payload, goMatch]);

  const createPrivate = useCallback(() => {
    if (!payload) return;
    setBusy(true);
    setError(null);
    emitWhenConnected("lobby:create", payload, undefined, () => setError("Connecting…"));
  }, [payload]);

  const joinPrivate = useCallback(
    (code: string) => {
      if (!payload || !code.trim()) return;
      setBusy(true);
      setError(null);
      setMode("join_private");
      emitWhenConnected("lobby:join", { ...payload, lobbyId: code.trim() }, undefined, () => setError("Connecting…"));
    },
    [payload]
  );

  const cancel = useCallback(() => {
    gameSocket.emit("queue:leave");
    setMode("idle");
    setElapsed(0);
    setBusy(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (!options?.autoQueuePublic || !payload || startedRef.current) return;
    startedRef.current = true;
    joinPublic();
  }, [options?.autoQueuePublic, payload, joinPublic]);

  return {
    mode,
    lobbyId,
    lobbyUpdate,
    elapsed,
    error,
    busy,
    isQueuing: mode === "queue_public" || mode === "queue_solo",
    joinPublic,
    joinSoloBots,
    createPrivate,
    joinPrivate,
    cancel,
  };
}
