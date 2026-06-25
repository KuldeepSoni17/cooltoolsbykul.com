import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { hasPolicyMakersBackend } from "@/lib/policymakers/backend";

function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}
function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: NextRequest) {
  if (!hasPolicyMakersBackend()) {
    return err("Voting is unavailable — backend not configured.", 503);
  }

  const body = await req.json().catch(() => ({}));
  const policyId = body.policyId as string;
  const value = body.value as number;
  const voter = ((body.voter as string) ?? "").trim();

  if (!policyId) return err("Missing policy.");
  if (value !== 1 && value !== -1) return err("Invalid vote.");
  if (!voter) return err("Missing voter token.");

  const { data: existing } = await supabaseAdmin
    .from("pm_votes")
    .select("id, value")
    .eq("policy_id", policyId)
    .eq("voter_token", voter)
    .maybeSingle();

  let myVote = value;

  if (existing && existing.value === value) {
    // Same button pressed again → toggle the vote off.
    await supabaseAdmin.from("pm_votes").delete().eq("id", existing.id);
    myVote = 0;
  } else if (existing) {
    await supabaseAdmin
      .from("pm_votes")
      .update({ value })
      .eq("id", existing.id);
  } else {
    const { error } = await supabaseAdmin
      .from("pm_votes")
      .insert({ policy_id: policyId, voter_token: voter, value });
    if (error) return err("Could not record vote.", 500);
  }

  // Recompute aggregate counts from the source of truth.
  const [{ count: up }, { count: down }] = await Promise.all([
    supabaseAdmin
      .from("pm_votes")
      .select("id", { count: "exact", head: true })
      .eq("policy_id", policyId)
      .eq("value", 1),
    supabaseAdmin
      .from("pm_votes")
      .select("id", { count: "exact", head: true })
      .eq("policy_id", policyId)
      .eq("value", -1),
  ]);

  const upvotes = up ?? 0;
  const downvotes = down ?? 0;

  await supabaseAdmin
    .from("pm_policies")
    .update({ upvotes, downvotes })
    .eq("id", policyId);

  return ok({ upvotes, downvotes, myVote });
}
