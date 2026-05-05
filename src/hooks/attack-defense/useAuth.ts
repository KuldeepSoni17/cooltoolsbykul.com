"use client";

import { useState } from "react";

interface AuthUser {
  id: string;
  displayName: string;
  isGuest: boolean;
}

const readStoredUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  try {
    const existingId = window.localStorage.getItem("ad_user_id");
    const existingName = window.localStorage.getItem("ad_user_name");
    return existingId && existingName ? { id: existingId, displayName: existingName, isGuest: true } : null;
  } catch {
    return null;
  }
};

export function useAttackDefenseAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  const signInGuest = async (displayName: string) => {
    const id = crypto.randomUUID();
    try {
      window.localStorage.setItem("ad_user_id", id);
      window.localStorage.setItem("ad_user_name", displayName);
    } catch {
      // Storage may be disabled; keep in-memory session only.
    }
    setUser({ id, displayName, isGuest: true });
  };

  return { user, signInGuest };
}
