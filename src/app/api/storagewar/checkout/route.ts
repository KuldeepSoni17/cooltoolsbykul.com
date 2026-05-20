import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/storagewar/api-utils";
import { getSessionUser, hasStorageWarBackend } from "@/lib/storagewar/auth";
import { COIN_PACKAGES } from "@/lib/storagewar/constants";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  if (!hasStorageWarBackend()) return jsonError("Backend not configured.", 503);
  const user = await getSessionUser();
  if (!user) return jsonError("Sign in to purchase Vault Coins.", 401);

  const { packageId } = await req.json().catch(() => ({}));
  const pkg = COIN_PACKAGES.find((p) => p.id === packageId);
  if (!pkg) return jsonError("Invalid package.");

  // Free daily stipend
  if (pkg.priceCents === 0) {
    const newCoins = user.coins + pkg.coins + pkg.bonus;
    await supabaseAdmin
      .from("sw_users")
      .update({ coins: newCoins, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    return jsonOk({ ok: true, coins: newCoins, message: `+${pkg.coins + pkg.bonus} VC claimed.` });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return jsonError("Payments not configured. Set STRIPE_SECRET_KEY.", 503);

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cooltoolsbykul.com";
  const totalCoins = pkg.coins + pkg.bonus;

  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", `${origin}/StorageWar?purchase=success`);
  params.set("cancel_url", `${origin}/StorageWar?purchase=cancel`);
  params.set("client_reference_id", user.id);
  params.set("metadata[user_id]", user.id);
  params.set("metadata[package_id]", pkg.id);
  params.set("metadata[coins]", String(totalCoins));
  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", "usd");
  params.set("line_items[0][price_data][unit_amount]", String(pkg.priceCents));
  params.set(
    "line_items[0][price_data][product_data][name]",
    `${pkg.name} — ${totalCoins.toLocaleString()} Vault Coins`,
  );
  params.set(
    "line_items[0][price_data][product_data][description]",
    "Virtual currency for Storage War (not redeemable for cash).",
  );

  const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const session = await stripeRes.json();
  if (!stripeRes.ok) {
    console.error("[StorageWar] Stripe error", session);
    return jsonError("Could not start checkout.", 500);
  }

  await supabaseAdmin.from("sw_coin_purchases").insert({
    user_id: user.id,
    stripe_session_id: session.id,
    package_id: pkg.id,
    coins: totalCoins,
    amount_cents: pkg.priceCents,
    status: "pending",
  });

  return jsonOk({ url: session.url });
}
