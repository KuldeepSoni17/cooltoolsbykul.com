import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a calm, rational, and compassionate mental wellness assistant.
Your job is to help people evaluate whether their worry is worth their mental energy.

Analyse the user's worry across three dimensions:
1. Controllability - How much control does the person actually have over this? (0-10, where 10 = fully in their control)
2. Likelihood - How likely is the feared outcome to actually happen? (0-10, where 10 = almost certain)
3. Impact - If it does happen, how significantly would it actually affect their life long-term? (0-10, where 10 = life-changing)

Then compute a Worry Score (0-10) as a weighted average:
  Worry Score = (Likelihood * 0.4) + (Impact * 0.4) + ((10 - Controllability) * 0.2)

Round the Worry Score to one decimal place.

A score of 0-3 means: NOT worth worrying about.
A score of 3.1-6 means: WORTH A MOMENT OF REFLECTION, but not ongoing worry.
A score of 6.1-10 means: WORTH ADDRESSING - take concrete action.

Respond ONLY in the following JSON format, no markdown, no extra text:
{
  "worryScore": 2.4,
  "controllability": 8,
  "likelihood": 2,
  "impact": 3,
  "verdict": "not_worth_it" | "reflect" | "worth_it",
  "verdictLabel": "Not Worth It",
  "controllabilityNote": "One-line insight about their control over this situation.",
  "likelihoodNote": "One-line insight about how likely this really is.",
  "impactNote": "One-line insight about the real long-term impact.",
  "nudge": "A warm, 2-3 sentence message to the user. Be honest but kind. If the worry isn't worth it, gently encourage them to let it go. If it is worth addressing, give them a small concrete action or reframe."
}`;

type Verdict = "not_worth_it" | "reflect" | "worth_it";

type WorryResult = {
  worryScore: number;
  controllability: number;
  likelihood: number;
  impact: number;
  verdict: Verdict;
  verdictLabel: string;
  controllabilityNote: string;
  likelihoodNote: string;
  impactNote: string;
  nudge: string;
};

type AnthropicMessageResponse = {
  content?: Array<{ type: string; text?: string }>;
  error?: { message?: string };
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function toNumber(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : NaN;
}

function extractJsonText(raw: string) {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return raw.slice(firstBrace, lastBrace + 1).trim();
  }
  return raw.trim();
}

function deriveVerdict(score: number): Verdict {
  if (score <= 3) return "not_worth_it";
  if (score <= 6) return "reflect";
  return "worth_it";
}

function deriveVerdictLabel(verdict: Verdict) {
  if (verdict === "not_worth_it") return "Not Worth It";
  if (verdict === "reflect") return "Worth A Moment Of Reflection";
  return "Worth Addressing";
}

function normalizeResult(parsed: Record<string, unknown>): WorryResult {
  const controllability = clamp(Math.round(toNumber(parsed.controllability)), 0, 10);
  const likelihood = clamp(Math.round(toNumber(parsed.likelihood)), 0, 10);
  const impact = clamp(Math.round(toNumber(parsed.impact)), 0, 10);

  const rawScore = toNumber(parsed.worryScore);
  const computedScore = (likelihood * 0.4) + (impact * 0.4) + ((10 - controllability) * 0.2);
  const worryScore = clamp(
    Number((Number.isFinite(rawScore) ? rawScore : computedScore).toFixed(1)),
    0,
    10
  );

  const verdict = (parsed.verdict as Verdict) || deriveVerdict(worryScore);
  const safeVerdict: Verdict =
    verdict === "not_worth_it" || verdict === "reflect" || verdict === "worth_it"
      ? verdict
      : deriveVerdict(worryScore);

  return {
    worryScore,
    controllability,
    likelihood,
    impact,
    verdict: safeVerdict,
    verdictLabel: String(parsed.verdictLabel || deriveVerdictLabel(safeVerdict)),
    controllabilityNote: String(parsed.controllabilityNote || "You have more influence here than it feels."),
    likelihoodNote: String(parsed.likelihoodNote || "This outcome may be less likely than your worry predicts."),
    impactNote: String(parsed.impactNote || "Even if it happens, the long-term impact may be limited."),
    nudge: String(
      parsed.nudge ||
        "Take one small action if needed, then give yourself permission to step out of worry mode."
    ),
  };
}

function parseModelTextToResult(raw: string) {
  const parsed = JSON.parse(extractJsonText(raw)) as Record<string, unknown>;
  return normalizeResult(parsed);
}

async function callAnthropic(apiKey: string, worryText: string, maxTokens = 1000) {
  return fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: maxTokens,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: worryText }],
    }),
  });
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("Missing ANTHROPIC_API_KEY in environment variables.");
    return NextResponse.json({ error: "missing_api_key" }, { status: 500 });
  }

  try {
    const body = (await req.json()) as { worryText?: string };
    const worryText = body.worryText?.trim();
    if (!worryText) {
      return NextResponse.json({ error: "missing_worry_text" }, { status: 400 });
    }

    const response = await callAnthropic(apiKey, worryText);
    const data = (await response.json()) as AnthropicMessageResponse;

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error?.message ?? "anthropic_error" },
        { status: response.status }
      );
    }

    const textBlock = data.content?.find((item) => item.type === "text")?.text;
    if (!textBlock) {
      return NextResponse.json({ error: "invalid_model_response" }, { status: 502 });
    }

    try {
      const result = parseModelTextToResult(textBlock);
      return NextResponse.json({ result });
    } catch {
      // One repair pass: ask model to reformat strictly as JSON.
      const repairResponse = await callAnthropic(
        apiKey,
        `Convert the following analysis into strict valid JSON ONLY (no markdown, no code fences, no commentary). Preserve meaning and return only the required schema fields.\n\n${textBlock}`,
        1200
      );
      const repairData = (await repairResponse.json()) as AnthropicMessageResponse;
      const repairedText = repairData.content?.find((item) => item.type === "text")?.text;
      if (!repairResponse.ok || !repairedText) {
        return NextResponse.json({ error: "invalid_model_response" }, { status: 502 });
      }
      const repairedResult = parseModelTextToResult(repairedText);
      return NextResponse.json({ result: repairedResult });
    }
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
