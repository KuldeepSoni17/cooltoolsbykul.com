import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/storagewar/api-utils";
import { getSessionUser, hasStorageWarBackend, createSession, sessionCookieOptions } from "@/lib/storagewar/auth";
import { parseSignedSession } from "@/lib/storagewar/session-signed";
import { supabaseAdmin } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/storagewar/constants";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return jsonError("Not signed in.", 401);
  return jsonOk({
    coins: user.coins,
    reward_points: user.reward_points,
    game_state: user.game_state,
    phone: user.phone,
    display_name: user.display_name,
  });
}

export async function PUT(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return jsonError("Not signed in.", 401);

  const body = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (typeof body.coins === "number") patch.coins = Math.max(0, Math.floor(body.coins));
  if (typeof body.reward_points === "number") patch.reward_points = Math.max(0, Math.floor(body.reward_points));
  if (body.game_state && typeof body.game_state === "object") patch.game_state = body.game_state;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value ?? "";

  // Signed-session mode: update cookie payload
  if (token.startsWith("sig.")) {
    const updated = {
      ...user,
      coins: (patch.coins as number) ?? user.coins,
      reward_points: (patch.reward_points as number) ?? user.reward_points,
      game_state: (patch.game_state as Record<string, unknown>) ?? user.game_state,
    };
    const newToken = await createSession(updated);
    const res = jsonOk({
      coins: updated.coins,
      reward_points: updated.reward_points,
      game_state: updated.game_state,
    });
    res.cookies.set(sessionCookieOptions(newToken));
    return res;
  }

  if (!hasStorageWarBackend()) return jsonError("Backend not configured.", 503);

  try {
    const { data, error } = await supabaseAdmin
      .from("sw_users")
      .update(patch)
      .eq("id", user.id)
      .select("coins, reward_points, game_state")
      .single();

    if (error || !data) return jsonError("Sync failed.", 500);
    return jsonOk(data);
  } catch (e) {
    console.error("[StorageWar] sync", e);
    // Fallback: refresh signed session from request body
    const signed = parseSignedSession(token);
    if (signed) {
      const updated = {
        ...signed,
        coins: (patch.coins as number) ?? signed.coins,
        reward_points: (patch.reward_points as number) ?? signed.reward_points,
        game_state: (patch.game_state as Record<string, unknown>) ?? signed.game_state,
      };
      const newToken = await createSession(updated);
      const res = jsonOk({
        coins: updated.coins,
        reward_points: updated.reward_points,
        game_state: updated.game_state,
      });
      res.cookies.set(sessionCookieOptions(newToken));
      return res;
    }
    return jsonError("Sync failed.", 500);
  }
}
