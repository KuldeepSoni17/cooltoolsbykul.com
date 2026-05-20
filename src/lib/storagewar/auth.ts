import { cookies } from "next/headers";
import { supabaseAdmin, hasSupabaseAdminConfig } from "@/lib/supabase-server";
import { SESSION_COOKIE, SESSION_DAYS } from "./constants";
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
  if (!hasSupabaseAdminConfig()) return null;
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const { data: session } = await supabaseAdmin
    .from("sw_sessions")
    .select("user_id, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (!session || new Date(session.expires_at) < new Date()) {
    return null;
  }

  const { data: user } = await supabaseAdmin
    .from("sw_users")
    .select("id, phone, display_name, coins, reward_points, game_state")
    .eq("id", session.user_id)
    .maybeSingle();

  return user as SwUser | null;
}

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_DAYS);

  await supabaseAdmin.from("sw_sessions").insert({
    token,
    user_id: userId,
    expires_at: expires.toISOString(),
  });

  return token;
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
  if (token) {
    await supabaseAdmin.from("sw_sessions").delete().eq("token", token);
  }
}
