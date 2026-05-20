import { NextRequest, NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/storagewar/api-utils";
import {
  createSession,
  hasStorageWarBackend,
  sessionCookieOptions,
} from "@/lib/storagewar/auth";
import { INITIAL_COINS, normalizePhone } from "@/lib/storagewar/constants";
import { verifyOtp } from "@/lib/storagewar/otp";
import { supabaseAdmin } from "@/lib/supabase-server";

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

  let user: {
    id: string;
    phone: string;
    display_name: string | null;
    coins: number;
    reward_points: number;
    game_state: Record<string, unknown>;
  } | null = null;

  try {
    const { data } = await supabaseAdmin
      .from("sw_users")
      .select("id, phone, display_name, coins, reward_points, game_state")
      .eq("phone", phone)
      .maybeSingle();
    user = data;
  } catch (e) {
    console.error("[StorageWar] verify-otp user lookup", e);
    return jsonError(
      "Account database unavailable. Run scripts/storagewar-schema.sql in Supabase and check env vars.",
      503,
    );
  }

  if (!user) {
    try {
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
        return jsonError(
          error?.code === "42P01"
            ? "Run scripts/storagewar-schema.sql in Supabase first."
            : "Could not create account.",
          500,
        );
      }
      user = created;
    } catch (e) {
      console.error("[StorageWar] create user", e);
      return jsonError("Could not create account. Check Supabase connection.", 503);
    }
  } else if (displayName && displayName !== "Collector") {
    try {
      await supabaseAdmin
        .from("sw_users")
        .update({ display_name: displayName, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      user = { ...user, display_name: displayName };
    } catch {
      /* non-fatal */
    }
  }

  try {
    const token = await createSession(user.id);
    const opts = sessionCookieOptions(token);
    const res = jsonOk({ user });
    res.cookies.set(opts);
    return res;
  } catch (e) {
    console.error("[StorageWar] create session", e);
    return jsonError(
      "Could not create session. Run scripts/storagewar-schema.sql in Supabase.",
      503,
    );
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
