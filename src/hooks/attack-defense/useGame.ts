"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ATTACK_CONFIG, DEFENSE_CONFIG } from "@/lib/attack-defense/gameConstants";
import { totalHp } from "@/lib/attack-defense/matchView";
import { gameSocket } from "@/lib/attack-defense/socket";
import type { Attack, AttackType, Defense, DefenseType, GameRoom, PlayerAction, RoundEvent } from "@/lib/attack-defense/gameTypes";

import type { SelectState } from "@/components/attack-defense/screens/matchTypes";

export type SelectingState = SelectState | null;

interface PendingState {
  attacks: Attack[];
  defenses: Defense[];
}

export interface RoundSelectionSummary {
  playerId: string;
  displayName: string;
  decisions: string[];
  energySpent: number;
}

export interface HpTimelineRow {
  r: number;
  [playerId: string]: number;
}

const RESULT_KEY = "ad:lastResult";

export function useAttackDefenseGame(myUserId: string | undefined) {
  const router = useRouter();
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(30);
  const [pending, setPending] = useState<PendingState>({ attacks: [], defenses: [] });
  const [selecting, setSelecting] = useState<SelectingState>(null);
  const [committed, setCommitted] = useState(false);
  const [latestRoundEvents, setLatestRoundEvents] = useState<RoundEvent[]>([]);
  const [latestRoundSummaries, setLatestRoundSummaries] = useState<RoundSelectionSummary[]>([]);
  const [timeline, setTimeline] = useState<HpTimelineRow[]>([]);
  const routedRef = useRef(false);
  const timelineRef = useRef<HpTimelineRow[]>([]);
  const eventsRef = useRef<RoundEvent[]>([]);
  const summariesRef = useRef<RoundSelectionSummary[]>([]);

  useEffect(() => {
    timelineRef.current = timeline;
  }, [timeline]);
  useEffect(() => {
    eventsRef.current = latestRoundEvents;
    summariesRef.current = latestRoundSummaries;
  }, [latestRoundEvents, latestRoundSummaries]);

  useEffect(() => {
    if (!gameSocket.connected) gameSocket.connect();

    gameSocket.on("game:stateUpdate", (nextRoom: GameRoom) => {
      setRoom((prevRoom) => {
        const enteringDecision =
          nextRoom.phase === "decision" && (prevRoom?.phase !== "decision" || prevRoom?.round !== nextRoom.round);
        if (enteringDecision) {
          setPending({ attacks: [], defenses: [] });
          setSelecting(null);
          setCommitted(false);
        }
        if (nextRoom.phase === "resolution" && prevRoom?.phase === "decision") {
          const row: HpTimelineRow = { r: nextRoom.round };
          for (const p of nextRoom.players) row[p.id] = totalHp(p);
          setTimeline((t) => {
            const filtered = t.filter((x) => x.r !== nextRoom.round);
            return [...filtered, row];
          });
        }
        if (nextRoom.phase === "game_over" && !routedRef.current) {
          routedRef.current = true;
          const names: Record<string, string> = {};
          for (const p of nextRoom.players) names[p.id] = p.displayName;
          try {
            sessionStorage.setItem(
              RESULT_KEY,
              JSON.stringify({
                room: nextRoom,
                timeline: timelineRef.current,
                events: eventsRef.current,
                summaries: summariesRef.current,
                myUserId,
                names,
              })
            );
          } catch {
            /* ignore */
          }
          router.push("/games/attack-defense/play/results");
        }
        return nextRoom;
      });
    });

    gameSocket.on("game:timerTick", ({ secondsLeft: next }: { secondsLeft: number }) => setSecondsLeft(next));
    gameSocket.on("game:roundResult", ({ events, summaries }: { events: RoundEvent[]; summaries?: RoundSelectionSummary[] }) => {
      setLatestRoundEvents(events ?? []);
      setLatestRoundSummaries(summaries ?? []);
    });

    return () => {
      gameSocket.off("game:stateUpdate");
      gameSocket.off("game:timerTick");
      gameSocket.off("game:roundResult");
    };
  }, [router, myUserId]);

  const pendingEnergy =
    pending.attacks.reduce((sum, attack) => sum + ATTACK_CONFIG[attack.type].energyCost, 0) +
    pending.defenses.reduce((sum, defense) => sum + DEFENSE_CONFIG[defense.type].energyCost, 0);

  const selectAction = (sel: SelectingState) => setSelecting(sel);
  const cancelSelection = () => setSelecting(null);

  const addAttack = (type: AttackType, targetPlayerId: string, targetHouseId?: string) => {
    setPending({ attacks: [{ type, targetPlayerId, ...(targetHouseId ? { targetHouseId } : {}) }], defenses: [] });
    setSelecting(null);
  };

  const addDefense = (type: DefenseType, targetHouseId: string) => {
    setPending({ attacks: [], defenses: [{ type, targetHouseId }] });
    setSelecting(null);
  };

  const lockIn = (roomId: string, playerId: string) => {
    if (!pending.attacks.length && !pending.defenses.length) return;
    setCommitted(true);
    const actions: PlayerAction = { playerId, attacks: pending.attacks, defenses: pending.defenses };
    gameSocket.emit("game:submitActions", { roomId, actions });
  };

  return {
    room,
    secondsLeft,
    pending,
    selecting,
    committed,
    pendingEnergy,
    latestRoundEvents,
    latestRoundSummaries,
    timeline,
    selectAction,
    cancelSelection,
    addAttack,
    addDefense,
    lockIn,
    socketConnected: gameSocket.connected,
  };
}

export function readLastResult(): {
  room: GameRoom;
  timeline: HpTimelineRow[];
  events: RoundEvent[];
  summaries: RoundSelectionSummary[];
  myUserId?: string;
  names: Record<string, string>;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(RESULT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
