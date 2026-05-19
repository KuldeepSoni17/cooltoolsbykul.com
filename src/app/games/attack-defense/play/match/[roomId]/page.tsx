"use client";

import { useParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { AdResponsiveShell } from "@/components/attack-defense/AdResponsiveShell";
import { DesktopMatch } from "@/components/attack-defense/screens/DesktopMatch";
import { MobileMatch } from "@/components/attack-defense/screens/MobileMatch";
import type { SelectState } from "@/components/attack-defense/screens/matchTypes";
import { ATTACKS, DEFENSES } from "@/lib/attack-defense/gameConstants";
import { buildMatchVm } from "@/lib/attack-defense/buildMatchVm";
import { useAttackDefenseAuth } from "@/hooks/attack-defense/useAuth";
import { useAttackDefenseGame } from "@/hooks/attack-defense/useGame";
import type { AttackType, DefenseType } from "@/lib/attack-defense/gameTypes";

export default function AttackDefenseMatchPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAttackDefenseAuth();
  const game = useAttackDefenseGame(user?.id);

  const vm = useMemo(() => {
    if (!game.room || !user) return null;
    return buildMatchVm(game.room, user.id, game.latestRoundEvents);
  }, [game.room, game.latestRoundEvents, user]);

  const phase = game.room?.phase ?? "waiting";

  const handleSelectAction = useCallback((sel: SelectState) => {
    game.selectAction(sel);
  }, [game]);

  const handleTargetHouse = useCallback(
    (playerId: string, houseId: string) => {
      if (!game.selecting) return;
      if (game.selecting.kind === "attack") {
        game.addAttack(game.selecting.type as AttackType, playerId, houseId);
      } else {
        game.addDefense(game.selecting.type as DefenseType, houseId);
      }
      if (game.room && user) game.lockIn(roomId, user.id);
    },
    [game, roomId, user]
  );

  const handleTargetPlayer = useCallback(
    (playerId: string) => {
      if (!game.selecting || game.selecting.kind !== "attack") return;
      game.addAttack(game.selecting.type as AttackType, playerId);
      if (game.room && user) game.lockIn(roomId, user.id);
    },
    [game, roomId, user]
  );

  const handleLockIn = useCallback(() => {
    if (game.room && user && (game.pending.attacks.length || game.pending.defenses.length)) {
      game.lockIn(roomId, user.id);
    }
  }, [game, roomId, user]);

  const matchProps = vm
    ? {
        vm,
        phase,
        phaseTimer: game.secondsLeft,
        attacks: ATTACKS as import("@/components/attack-defense/ui").ActionDef[],
        defenses: DEFENSES as import("@/components/attack-defense/ui").ActionDef[],
        selecting: game.selecting,
        submitted: game.committed,
        onSelectAction: handleSelectAction,
        onTargetHouse: handleTargetHouse,
        onTargetPlayer: handleTargetPlayer,
        onCancelSelection: game.cancelSelection,
        onLockIn: handleLockIn,
      }
    : null;

  if (!user || !matchProps) {
    return (
      <div className="ad-ad-page">
        <p className="ad-eyebrow">Connecting to match…</p>
      </div>
    );
  }

  return <AdResponsiveShell mobile={<MobileMatch {...matchProps} />} desktop={<DesktopMatch {...matchProps} />} />;
}
