import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/storagewar/api-utils";
import { getSessionUser, hasStorageWarBackend } from "@/lib/storagewar/auth";
import { ensureLiveAuctions } from "@/lib/storagewar/auctions";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET() {
  if (!hasStorageWarBackend()) return jsonError("Backend not configured.", 503);
  await ensureLiveAuctions();
  const { data } = await supabaseAdmin
    .from("sw_auctions")
    .select("*")
    .eq("status", "auction")
    .gt("ends_at", new Date().toISOString())
    .order("ends_at", { ascending: true });
  return jsonOk({ auctions: data ?? [] });
}

export async function POST(req: NextRequest) {
  if (!hasStorageWarBackend()) return jsonError("Backend not configured.", 503);
  const user = await getSessionUser();
  if (!user) return jsonError("Sign in to bid.", 401);

  const { auctionId, amount } = await req.json().catch(() => ({}));
  if (!auctionId || typeof amount !== "number") return jsonError("Invalid bid.");

  const { data: auction } = await supabaseAdmin
    .from("sw_auctions")
    .select("*")
    .eq("id", auctionId)
    .eq("status", "auction")
    .maybeSingle();

  if (!auction) return jsonError("Auction not found.");
  if (new Date(auction.ends_at) < new Date()) return jsonError("Auction ended.");
  if (amount <= auction.current_bid) return jsonError("Bid must exceed current bid.");
  if (amount > user.coins) return jsonError("Not enough Vault Coins.");

  const { error } = await supabaseAdmin
    .from("sw_auctions")
    .update({ current_bid: amount, high_bidder_id: user.id })
    .eq("id", auctionId)
    .eq("current_bid", auction.current_bid);

  if (error) return jsonError("Someone else bid first. Try again.", 409);
  return jsonOk({ ok: true, current_bid: amount });
}
