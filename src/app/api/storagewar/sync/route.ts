import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/storagewar/api-utils";
import { getSessionUser, hasStorageWarBackend } from "@/lib/storagewar/auth";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET() {
  if (!hasStorageWarBackend()) return jsonError("Backend not configured.", 503);
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
  if (!hasStorageWarBackend()) return jsonError("Backend not configured.", 503);
  const user = await getSessionUser();
  if (!user) return jsonError("Not signed in.", 401);

  const body = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (typeof body.coins === "number") patch.coins = Math.max(0, Math.floor(body.coins));
  if (typeof body.reward_points === "number") patch.reward_points = Math.max(0, Math.floor(body.reward_points));
  if (body.game_state && typeof body.game_state === "object") patch.game_state = body.game_state;

  const { data, error } = await supabaseAdmin
    .from("sw_users")
    .update(patch)
    .eq("id", user.id)
    .select("coins, reward_points, game_state")
    .single();

  if (error || !data) return jsonError("Sync failed.", 500);
  return jsonOk(data);
}
