"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdResponsiveShell } from "@/components/attack-defense/AdResponsiveShell";
import { ThemeToggle } from "@/components/attack-defense/ThemeToggle";
import { DesktopLobby } from "@/components/attack-defense/screens/DesktopLobby";
import { MobileLobby } from "@/components/attack-defense/screens/MobileLobby";
import { useAttackDefenseAuth } from "@/hooks/attack-defense/useAuth";
import { useAttackDefenseLobby } from "@/hooks/attack-defense/useLobby";

export default function AttackDefenseLobbyPage() {
  const router = useRouter();
  const { user } = useAttackDefenseAuth();
  const [showPrivate, setShowPrivate] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  const lobby = useAttackDefenseLobby(user, { autoQueuePublic: true });

  useEffect(() => {
    if (!user) router.replace("/games/attack-defense/play");
  }, [user, router]);

  if (!user) {
    return (
      <div className="ad-ad-page">
        <p className="ad-eyebrow">Loading…</p>
      </div>
    );
  }

  const themeToggle = <ThemeToggle />;

  return (
    <AdResponsiveShell
      mobile={
        <MobileLobby
          userName={user.displayName}
          elapsed={lobby.elapsed}
          mode={showPrivate ? "create_private" : lobby.mode}
          lobbyId={lobby.lobbyId}
          lobbyUpdate={lobby.lobbyUpdate}
          error={lobby.error}
          themeToggle={themeToggle}
          onCancel={() => {
            lobby.cancel();
            router.push("/games/attack-defense/play");
          }}
          onJoinBots={lobby.joinSoloBots}
          onFriendLobby={() => {
            setShowPrivate(true);
            lobby.createPrivate();
          }}
        />
      }
      desktop={
        <DesktopLobby
          userName={user.displayName}
          mode={lobby.mode}
          lobbyId={lobby.lobbyId}
          lobbyUpdate={lobby.lobbyUpdate}
          error={lobby.error}
          busy={lobby.busy}
          themeToggle={themeToggle}
          onJoinBots={lobby.joinSoloBots}
          onJoinPublic={lobby.joinPublic}
          onCreatePrivate={lobby.createPrivate}
          onJoinPrivate={lobby.joinPrivate}
        />
      }
    />
  );
}
