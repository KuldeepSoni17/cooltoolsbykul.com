import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { hasPolicyMakersBackend, SEED_POLICIES } from "@/lib/policymakers/backend";
import type { NewPolicyInput } from "@/lib/policymakers/types";

function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}
function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(req: NextRequest) {
  if (!hasPolicyMakersBackend()) {
    return ok({ policies: SEED_POLICIES, readonly: true, myVotes: {} });
  }

  const voterToken = req.nextUrl.searchParams.get("voter") ?? "";

  const { data: policies, error } = await supabaseAdmin
    .from("pm_policies")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return err("Could not load policies.", 500);

  let myVotes: Record<string, number> = {};
  if (voterToken) {
    const { data: votes } = await supabaseAdmin
      .from("pm_votes")
      .select("policy_id, value")
      .eq("voter_token", voterToken);
    myVotes = Object.fromEntries(
      (votes ?? []).map((v) => [v.policy_id as string, v.value as number]),
    );
  }

  return ok({ policies: policies ?? [], readonly: false, myVotes });
}

export async function POST(req: NextRequest) {
  if (!hasPolicyMakersBackend()) {
    return err("Backend not configured — proposals are read-only here.", 503);
  }

  const body = (await req.json().catch(() => ({}))) as Partial<NewPolicyInput>;

  const kind = body.kind;
  const title = (body.title ?? "").trim();
  const proposal = (body.proposal ?? "").trim();
  const rationale = (body.rationale ?? "").trim();

  if (kind !== "new" && kind !== "modify") return err("Invalid policy kind.");
  if (title.length < 4) return err("Title is too short.");
  if (proposal.length < 10) return err("Describe what you are proposing.");
  if (rationale.length < 10) return err("Explain why it is required.");
  if (kind === "modify" && !(body.existing_policy ?? "").trim()) {
    return err("For a modification, describe the existing policy.");
  }

  const clean = (s?: string) => {
    const t = (s ?? "").trim();
    return t.length ? t : null;
  };

  const { data, error } = await supabaseAdmin
    .from("pm_policies")
    .insert({
      kind,
      title,
      domain: clean(body.domain),
      proposal,
      rationale,
      incidents: clean(body.incidents),
      impact_estimate: clean(body.impact_estimate),
      details: clean(body.details),
      existing_policy: kind === "modify" ? clean(body.existing_policy) : null,
      proposed_change: kind === "modify" ? clean(body.proposed_change) : null,
      author_name: clean(body.author_name) ?? "Anonymous",
      status: "proposed",
      upvotes: 0,
      downvotes: 0,
    })
    .select()
    .single();

  if (error) return err("Could not save proposal.", 500);
  return ok({ policy: data }, 201);
}
