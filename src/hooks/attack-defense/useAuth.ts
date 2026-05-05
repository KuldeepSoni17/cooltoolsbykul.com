"use client";

import { useState } from "react";

interface AuthUser {
  id: string;
  displayName: string;
  isGuest: boolean;
}

export function useAttackDefenseAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    const existingId = window.localStorage.getItem("ad_user_id");
    const existingName = window.localStorage.getItem("ad_user_name");
    return existingId && existingName ? { id: existingId, displayName: existingName, isGuest: true } : null;
  });

  const signInGuest = async (displayName: string) => {
    const id = crypto.randomUUID();
    window.localStorage.setItem("ad_user_id", id);
    window.localStorage.setItem("ad_user_name", displayName);
    setUser({ id, displayName, isGuest: true });
  };

  return { user, signInGuest };
}
