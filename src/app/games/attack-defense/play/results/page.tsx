"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AdResponsiveShell } from "@/components/attack-defense/AdResponsiveShell";
import { DesktopResults } from "@/components/attack-defense/screens/DesktopResults";
import { MobileResults } from "@/components/attack-defense/screens/MobileResults";
import { readLastResult } from "@/hooks/attack-defense/useGame";
import { buildResultsVm } from "@/lib/attack-defense/buildResultsVm";

export default function AttackDefenseResultsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const stored = useMemo(() => (ready ? readLastResult() : null), [ready]);

  useEffect(() => {
    setReady(true);
  }, []);

  const vm = useMemo(() => {
    if (!stored?.room) return null;
    return buildResultsVm(stored.room, stored.myUserId, stored.timeline ?? [], stored.names ?? {});
  }, [stored]);

  if (!ready) return null;

  if (!vm) {
    return (
      <div className="ad-ad-page">
        <p className="ad-eyebrow">No results yet.</p>
        <button type="button" className="ad-btn ad-btn--primary" onClick={() => router.push("/games/attack-defense/play/lobby")}>
          Back to lobby
        </button>
      </div>
    );
  }

  const goLobby = () => router.push("/games/attack-defense/play/lobby");
  const goRematch = () => router.push("/games/attack-defense/play/lobby");

  return (
    <AdResponsiveShell
      mobile={<MobileResults vm={vm} onRematch={goRematch} onLobby={goLobby} />}
      desktop={<DesktopResults vm={vm} onRematch={goRematch} onLobby={goLobby} />}
    />
  );
}
