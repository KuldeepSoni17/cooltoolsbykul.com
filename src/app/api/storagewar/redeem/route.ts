import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/storagewar/api-utils";
import { getSessionUser, hasStorageWarBackend } from "@/lib/storagewar/auth";
import { COLLECTION_BUYBACK } from "@/lib/storagewar/constants";
import { supabaseAdmin } from "@/lib/supabase-server";

const COLLECTION_ITEMS: Record<string, string[]> = {
  "victorian-stamps": [
    "stamp-penny-black", "stamp-blue-mauritius", "stamp-inverted-jenny", "stamp-wilding", "stamp-zeppelin",
  ],
  "historical-docs": [
    "doc-declaration-fragment", "doc-lincoln-letter", "doc-shipping-log", "doc-land-deed", "doc-postcard",
  ],
  "colonial-coins": [
    "coin-morgan", "coin-double-eagle", "coin-halfpenny", "coin-shekel", "coin-wheat",
  ],
  "pioneer-era": ["stamp-first-flight", "doc-map", "coin-trade", "doc-diary"],
};

const COLLECTION_NAMES: Record<string, string> = {
  "victorian-stamps": "Victorian Stamps",
  "historical-docs": "Historical Documents",
  "colonial-coins": "Colonial Coins",
  "pioneer-era": "Pioneer Era",
};

export async function GET() {
  if (!hasStorageWarBackend()) return jsonError("Backend not configured.", 503);
  const user = await getSessionUser();
  if (!user) return jsonError("Sign in required.", 401);

  const { data } = await supabaseAdmin
    .from("sw_redemptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return jsonOk({ redemptions: data ?? [] });
}

export async function POST(req: NextRequest) {
  if (!hasStorageWarBackend()) return jsonError("Backend not configured.", 503);
  const user = await getSessionUser();
  if (!user) return jsonError("Sign in required.", 401);

  const { collectionId } = await req.json().catch(() => ({}));
  const required = COLLECTION_ITEMS[collectionId];
  const payout = COLLECTION_BUYBACK[collectionId];
  if (!required || !payout) return jsonError("Unknown collection.");

  const gameState = (user.game_state ?? {}) as {
    artifacts?: Array<{ templateId: string; instanceId: string }>;
    redeemedCollections?: string[];
  };
  const artifacts = gameState.artifacts ?? [];
  const redeemed = new Set(gameState.redeemedCollections ?? []);
  if (redeemed.has(collectionId)) return jsonError("Collection already redeemed.");

  const ownedByTemplate = new Map<string, string[]>();
  for (const a of artifacts) {
    const list = ownedByTemplate.get(a.templateId) ?? [];
    list.push(a.instanceId);
    ownedByTemplate.set(a.templateId, list);
  }

  const toRemove = new Set<string>();
  for (const tid of required) {
    const ids = ownedByTemplate.get(tid);
    if (!ids?.length) return jsonError(`Missing piece: ${tid}`);
    toRemove.add(ids[0]);
  }

  const remaining = artifacts.filter((a) => !toRemove.has(a.instanceId));
  redeemed.add(collectionId);
  const newCoins = user.coins + payout;

  const { data: redemption, error: rErr } = await supabaseAdmin
    .from("sw_redemptions")
    .insert({
      user_id: user.id,
      collection_id: collectionId,
      collection_name: COLLECTION_NAMES[collectionId],
      payout_coins: payout,
      artifact_ids: [...toRemove],
      status: "approved",
      phone: user.phone,
    })
    .select()
    .single();

  if (rErr) return jsonError("Redemption failed.", 500);

  await supabaseAdmin
    .from("sw_users")
    .update({
      coins: newCoins,
      game_state: {
        ...gameState,
        artifacts: remaining,
        redeemedCollections: [...redeemed],
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  return jsonOk({
    ok: true,
    redemption,
    coins: newCoins,
    payout,
    message: `Vault Buyback approved: +${payout} VC. Payout to ${user.phone} when processed.`,
  });
}
