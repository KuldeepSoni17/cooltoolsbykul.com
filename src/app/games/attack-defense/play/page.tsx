"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdResponsiveShell } from "@/components/attack-defense/AdResponsiveShell";
import { DesktopLanding } from "@/components/attack-defense/screens/DesktopLanding";
import { MobileLanding } from "@/components/attack-defense/screens/MobileLanding";
import { useAttackDefenseAuth } from "@/hooks/attack-defense/useAuth";

export default function AttackDefensePlayPage() {
  const router = useRouter();
  const { user, signInGuest } = useAttackDefenseAuth();
  const [busy, setBusy] = useState(false);

  const handlePlay = async (name: string) => {
    const codename = name.trim() || "Guest";
    setBusy(true);
    await signInGuest(codename);
    router.push("/games/attack-defense/play/lobby");
  };

  return (
    <AdResponsiveShell
      mobile={<MobileLanding onPlay={handlePlay} initialName={user?.displayName} />}
      desktop={<DesktopLanding onPlay={handlePlay} initialName={user?.displayName} />}
    />
  );
}
