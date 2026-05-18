import { NextRequest, NextResponse } from "next/server";
import { callAnthropic, resolveApiKey } from "@/lib/songwriter/anthropic";
import { parseJson } from "@/lib/songwriter/parse";
import { ANALYSIS_SYSTEM, buildRefinePrompt } from "@/lib/songwriter/prompts";
import type { ProjectMeta, RefineAction } from "@/lib/songwriter/types";

const ACTION_LABELS: Record<RefineAction, string> = {
  rewrite: "Rewrite with user feedback",
  more_emotional: "Make more emotional",
  simpler: "Make simpler",
  more_commercial: "Make more commercial",
  more_poetic: "Make more poetic",
  match_artist: "Match artist style inspiration",
};

type Body = {
  meta?: ProjectMeta;
  sectionType?: string;
  content?: string;
  action?: RefineAction;
  feedback?: string;
  apiKey?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    if (!body.meta || !body.sectionType || body.content === undefined || !body.action) {
      return NextResponse.json({ error: "missing_refine_data" }, { status: 400 });
    }

    const apiKey = resolveApiKey(body.apiKey);
    const actionLabel = ACTION_LABELS[body.action] ?? body.action;
    const prompt = buildRefinePrompt(
      body.meta,
      body.sectionType,
      body.content,
      actionLabel,
      body.feedback,
    );

    const raw = await callAnthropic(apiKey, ANALYSIS_SYSTEM, prompt, 1200);
    const parsed = parseJson<{ content?: string }>(raw);

    return NextResponse.json({ content: parsed.content ?? "" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "refine_failed" },
      { status: 500 },
    );
  }
}
