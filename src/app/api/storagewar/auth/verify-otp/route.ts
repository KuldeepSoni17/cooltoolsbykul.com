import { NextRequest, NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/storagewar/api-utils";
import {
  createSession,
  hasStorageWarBackend,
  sessionCookieOptions,
  type SwUser,
} from "@/lib/storagewar/auth";
import { INITIAL_COINS, normalizePhone } from "@/lib/storagewar/constants";
import { verifyOtp } from "@/lib/storagewar/otp";
import { buildFallbackUser, userIdFromPhone } from "@/lib/storagewar/session-signed";
import { supabaseAdmin } from "@/lib/supabase-server";

async function loadOrCreateDbUser(phone: string, displayName: string): Promise<SwUser | null> {
  const { data: existing } = await supabaseAdmin
    .from("sw_users")
    .select("id, phone, display_name, coins, reward_points, game_state")
    .eq("phone", phone)
    .maybeSingle();

  if (existing) {
    if (displayName && displayName !== "Collector" && displayName !== existing.display_name) {
      await supabaseAdmin
        .from("sw_users")
        .update({ display_name: displayName, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      return { ...existing, display_name: displayName };
    }
    return existing as SwUser;
  }

  const { data: created, error } = await supabaseAdmin
    .from("sw_users")
    .insert({
      phone,
      display_name: displayName,
      coins: INITIAL_COINS,
      reward_points: 0,
      game_state: {},
    })
    .select("id, phone, display_name, coins, reward_points, game_state")
    .single();

  if (error || !created) {
    console.error("[StorageWar] create user", error);
    return null;
  }
  return created as SwUser;
}

export async function POST(req: NextRequest) {
  if (!hasStorageWarBackend()) {
    return jsonError("Backend not configured.", 503);
  }

  const body = await req.json().catch(() => ({}));
  const phone = normalizePhone(String(body.phone ?? ""));
  const code = String(body.code ?? "").trim();
  const displayName = String(body.displayName ?? "Collector").slice(0, 40);

  if (!phone) return jsonError("Invalid phone number.");
  if (code.length < 4) return jsonError("Enter the verification code.");

  const otpToken = typeof body.otpToken === "string" ? body.otpToken : undefined;
  const valid = await verifyOtp(phone, code, otpToken);
  if (!valid) return jsonError("Invalid or expired code.");

  let user: SwUser | null = null;
  let usedFallback = false;

  try {
    user = await loadOrCreateDbUser(phone, displayName);
  } catch (e) {
    console.warn("[StorageWar] Supabase user ops failed, signed-session fallback", e);
  }

  if (!user) {
    user = buildFallbackUser(phone, displayName);
    usedFallback = true;
    console.log("[StorageWar] Signed-session login for", userIdFromPhone(phone));
  }

  try {
    const token = await createSession(user);
    const opts = sessionCookieOptions(token);
    const res = jsonOk({
      user,
      mode: usedFallback ? "signed" : "database",
      notice: usedFallback
        ? "Playing in cloud-lite mode. Run scripts/storagewar-schema.sql in Supabase for full multiplayer sync."
        : undefined,
    });
    res.cookies.set(opts);
    return res;
  } catch (e) {
    console.error("[StorageWar] create session", e);
    return jsonError("Could not start session.", 500);
  }
}

export async function DELETE() {
  const { clearSession, hasStorageWarBackend } = await import("@/lib/storagewar/auth");
  if (hasStorageWarBackend()) await clearSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: "sw_session",
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}
