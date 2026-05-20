import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/storagewar/api-utils";
import { getSessionUser, hasStorageWarBackend } from "@/lib/storagewar/auth";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET() {
  if (!hasStorageWarBackend()) return jsonError("Backend not configured.", 503);
  const { data } = await supabaseAdmin
    .from("sw_market_listings")
    .select("*")
    .eq("status", "active")
    .gt("ends_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(20);
  return jsonOk({ listings: data ?? [] });
}

export async function POST(req: NextRequest) {
  if (!hasStorageWarBackend()) return jsonError("Backend not configured.", 503);
  const user = await getSessionUser();
  if (!user) return jsonError("Sign in required.", 401);

  const body = await req.json().catch(() => ({}));
  const action = body.action as string;

  if (action === "list") {
    const { artifact, templateId, askingPrice } = body;
    if (!artifact || !templateId || typeof askingPrice !== "number") {
      return jsonError("Invalid listing.");
    }
    const ends = new Date();
    ends.setHours(ends.getHours() + 24);
    const { data, error } = await supabaseAdmin
      .from("sw_market_listings")
      .insert({
        seller_id: user.id,
        seller_name: user.display_name ?? "Collector",
        artifact,
        template_id: templateId,
        asking_price: askingPrice,
        current_bid: Math.round(askingPrice * 0.5),
        ends_at: ends.toISOString(),
        status: "active",
      })
      .select()
      .single();
    if (error) return jsonError("Could not list item.", 500);
    return jsonOk({ listing: data });
  }

  if (action === "bid") {
    const { listingId, amount } = body;
    const { data: listing } = await supabaseAdmin
      .from("sw_market_listings")
      .select("*")
      .eq("id", listingId)
      .eq("status", "active")
      .maybeSingle();
    if (!listing) return jsonError("Listing not found.");
    if (amount <= listing.current_bid) return jsonError("Bid too low.");
    if (amount > user.coins) return jsonError("Not enough Vault Coins.");
    if (listing.seller_id === user.id) return jsonError("Cannot bid on your own listing.");

    const { error } = await supabaseAdmin
      .from("sw_market_listings")
      .update({ current_bid: amount, high_bidder_id: user.id })
      .eq("id", listingId)
      .eq("current_bid", listing.current_bid);
    if (error) return jsonError("Outbid — try again.", 409);
    return jsonOk({ ok: true });
  }

  return jsonError("Unknown action.");
}
