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

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: worryText }],
      }),
    });

    const data = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>;
      error?: { message?: string };
    };

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

    return NextResponse.json({ output: textBlock });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
