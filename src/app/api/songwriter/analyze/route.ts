import { NextRequest, NextResponse } from "next/server";
import { callAnthropic, resolveApiKey } from "@/lib/songwriter/anthropic";
import { normalizeAnalysis } from "@/lib/songwriter/normalize";
import { parseJson } from "@/lib/songwriter/parse";
import { ANALYSIS_SYSTEM, buildAnalysisPrompt } from "@/lib/songwriter/prompts";
import type { LyricsInput, MelodyInput, ProjectMeta } from "@/lib/songwriter/types";

type Body = {
  meta?: ProjectMeta;
  lyrics?: LyricsInput;
  melody?: MelodyInput;
  hasAudio?: boolean;
  apiKey?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    if (!body.meta || !body.lyrics || !body.melody) {
      return NextResponse.json({ error: "missing_project_data" }, { status: 400 });
    }

    const apiKey = resolveApiKey(body.apiKey);
    const prompt = buildAnalysisPrompt(
      body.meta,
      body.lyrics,
      body.melody,
      Boolean(body.hasAudio),
    );

    const raw = await callAnthropic(apiKey, ANALYSIS_SYSTEM, prompt);
    const parsed = parseJson<Parameters<typeof normalizeAnalysis>[0]>(raw);
    const analysis = normalizeAnalysis(parsed);

    return NextResponse.json({ analysis });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "analysis_failed" },
      { status: 500 },
    );
  }
}
