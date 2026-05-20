import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/storagewar/api-utils";
import { getSessionUser, hasStorageWarBackend } from "@/lib/storagewar/auth";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  if (!hasStorageWarBackend()) return jsonError("Backend not configured.", 503);
  const user = await getSessionUser();
  if (!user) return jsonError("Sign in required.", 401);

  const { auctionId } = await req.json().catch(() => ({}));
  const { data: auction } = await supabaseAdmin
    .from("sw_auctions")
    .select("*")
    .eq("id", auctionId)
    .maybeSingle();

  if (!auction) return jsonError("Auction not found.");
  const ended = new Date(auction.ends_at) < new Date() || auction.status !== "auction";

  if (auction.high_bidder_id === user.id && ended) {
    if (user.coins < auction.current_bid) return jsonError("Not enough coins.");
    const gameState = (user.game_state ?? {}) as Record<string, unknown>;
    const wonUnits = Array.isArray(gameState.wonUnits) ? gameState.wonUnits : [];
    wonUnits.push({
      id: auction.id,
      label: auction.label,
      description: auction.description,
      hint: auction.hint,
      currentBid: auction.current_bid,
      artifacts: auction.artifacts,
      status: "won",
    });
    const newCoins = user.coins - auction.current_bid;
    await supabaseAdmin
      .from("sw_users")
      .update({
        coins: newCoins,
        game_state: { ...gameState, wonUnits },
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    await supabaseAdmin.from("sw_auctions").update({ status: "closed" }).eq("id", auctionId);
    return jsonOk({ ok: true, coins: newCoins, wonUnit: wonUnits[wonUnits.length - 1] });
  }

  if (ended && auction.high_bidder_id !== user.id) {
    await supabaseAdmin.from("sw_auctions").update({ status: "closed" }).eq("id", auctionId);
    return jsonOk({ ok: true, lost: true });
  }

  return jsonError("Auction still active or you are not the high bidder.");
}
