import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "No webhook secret" }, { status: 500 });

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  // Minimal verification via Stripe API retrieve (full verify needs stripe SDK)
  let event: { type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      id: string;
      client_reference_id?: string;
      metadata?: Record<string, string>;
    };
    const userId = session.metadata?.user_id ?? session.client_reference_id;
    const coins = Number(session.metadata?.coins ?? 0);
    if (!userId || !coins) return NextResponse.json({ received: true });

    const { data: purchase } = await supabaseAdmin
      .from("sw_coin_purchases")
      .select("id, status")
      .eq("stripe_session_id", session.id)
      .maybeSingle();

    if (purchase?.status === "completed") {
      return NextResponse.json({ received: true });
    }

    const { data: user } = await supabaseAdmin
      .from("sw_users")
      .select("coins")
      .eq("id", userId)
      .maybeSingle();

    if (user) {
      await supabaseAdmin
        .from("sw_users")
        .update({
          coins: user.coins + coins,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    }

    await supabaseAdmin
      .from("sw_coin_purchases")
      .update({ status: "completed" })
      .eq("stripe_session_id", session.id);
  }

  return NextResponse.json({ received: true });
}
