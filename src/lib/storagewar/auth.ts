import { cookies } from "next/headers";
import { supabaseAdmin, hasSupabaseAdminConfig } from "@/lib/supabase-server";
import { SESSION_COOKIE, SESSION_DAYS } from "./constants";
import { createSignedSession, parseSignedSession } from "./session-signed";
import { randomBytes } from "crypto";

export type SwUser = {
  id: string;
  phone: string;
  display_name: string | null;
  coins: number;
  reward_points: number;
  game_state: Record<string, unknown>;
};

export function hasStorageWarBackend(): boolean {
  return hasSupabaseAdminConfig();
}

export async function getSessionUser(): Promise<SwUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const signed = parseSignedSession(token);
  if (signed) return signed;

  if (!hasSupabaseAdminConfig()) return null;

  try {
    const { data: session } = await supabaseAdmin
      .from("sw_sessions")
      .select("user_id, expires_at")
      .eq("token", token)
      .maybeSingle();

    if (!session || new Date(session.expires_at) < new Date()) return null;

    const { data: user } = await supabaseAdmin
      .from("sw_users")
      .select("id, phone, display_name, coins, reward_points, game_state")
      .eq("id", session.user_id)
      .maybeSingle();

    return user as SwUser | null;
  } catch {
    return null;
  }
}

export async function createSession(user: SwUser): Promise<string> {
  if (hasSupabaseAdminConfig()) {
    try {
      const token = randomBytes(32).toString("hex");
      const expires = new Date();
      expires.setDate(expires.getDate() + SESSION_DAYS);

      const { error } = await supabaseAdmin.from("sw_sessions").insert({
        token,
        user_id: user.id,
        expires_at: expires.toISOString(),
      });

      if (!error) return token;
      console.warn("[StorageWar] DB session insert failed, using signed session", error);
    } catch (e) {
      console.warn("[StorageWar] DB session unavailable, using signed session", e);
    }
  }

  return createSignedSession(user);
}

export function sessionCookieOptions(token: string) {
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_DAYS);
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires,
  };
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token || token.startsWith("sig.")) return;

  if (!hasSupabaseAdminConfig()) return;

  try {
    await supabaseAdmin.from("sw_sessions").delete().eq("token", token);
  } catch {
    /* ignore */
  }
}
