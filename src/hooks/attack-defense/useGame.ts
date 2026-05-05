"use client";

import { useEffect, useState } from "react";
import { ATTACK_CONFIG, DEFENSE_CONFIG, GAME_UI_CONSTANTS } from "@/lib/attack-defense/gameConstants";
import { gameSocket } from "@/lib/attack-defense/socket";
import type { Attack, AttackType, Defense, DefenseType, GameRoom, PlayerAction, RoundEvent } from "@/lib/attack-defense/gameTypes";

type ActionTab = "attack" | "defense";
export type SelectingState = { kind: ActionTab; type: AttackType | DefenseType } | null;

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

export function useAttackDefenseGame() {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(GAME_UI_CONSTANTS.ROUND_DECISION_SECONDS);
  const [pending, setPending] = useState<PendingState>({ attacks: [], defenses: [] });
  const [selecting, setSelecting] = useState<SelectingState>(null);
  const [activeTab, setActiveTab] = useState<ActionTab>("attack");
  const [committed, setCommitted] = useState(false);
  const [latestRoundEvents, setLatestRoundEvents] = useState<RoundEvent[]>([]);
  const [latestRoundSummaries, setLatestRoundSummaries] = useState<RoundSelectionSummary[]>([]);

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
  }, []);

  const pendingEnergy =
    pending.attacks.reduce((sum, attack) => sum + ATTACK_CONFIG[attack.type].energyCost, 0) +
    pending.defenses.reduce((sum, defense) => sum + DEFENSE_CONFIG[defense.type].energyCost, 0);

  const selectActionType = (kind: ActionTab, type: AttackType | DefenseType) => setSelecting({ kind, type });
  const cancelSelection = () => setSelecting(null);

  const addAttack = (type: AttackType, targetPlayerId: string, targetHouseId?: string) => {
    setPending({ attacks: [{ type, targetPlayerId, ...(targetHouseId ? { targetHouseId } : {}) }], defenses: pending.defenses });
    setSelecting(null);
  };

  const addDefense = (type: DefenseType, targetHouseId: string) => {
    setPending({ attacks: pending.attacks, defenses: [{ type, targetHouseId }] });
    setSelecting(null);
  };

  const submitActions = (roomId: string, actions: PlayerAction) => {
    setCommitted(true);
    gameSocket.emit("game:submitActions", { roomId, actions });
  };

  return {
    room,
    secondsLeft,
    pending,
    selecting,
    activeTab,
    committed,
    pendingEnergy,
    latestRoundEvents,
    latestRoundSummaries,
    setActiveTab,
    selectActionType,
    cancelSelection,
    addAttack,
    addDefense,
    submitActions,
    socketConnected: gameSocket.connected
  };
}
