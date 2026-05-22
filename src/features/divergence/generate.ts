import { randomUUID } from "crypto";
import {
  buildReformatPrompt,
  buildScenarioUserPrompt,
  DIVERGENCE_SYSTEM_PROMPT,
  type ScenarioInput,
} from "./prompts";

const MODEL =
  process.env.DIVERGENCE_ANTHROPIC_MODEL ??
  process.env.ANTHROPIC_MODEL ??
  "claude-sonnet-4-5";

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

async function callAnthropic(
  apiKey: string,
  messages: { role: "user" | "assistant"; content: string }[],
  temperature = 0.7
): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 16000,
      temperature,
      system: DIVERGENCE_SYSTEM_PROMPT,
      messages,
    }),
  });

  const data = (await response.json()) as {
    content?: { type: string; text?: string }[];
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(data.error?.message ?? "Anthropic API error");
  }

  const block = data.content?.find((b) => b.type === "text");
  if (!block?.text) throw new Error("No text response from model");
  return block.text;
}

export async function generateDivergenceScenario(input: ScenarioInput) {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not configured on cooltoolsbykul.com (same key as WorthIt)."
    );
  }

  const userPrompt = buildScenarioUserPrompt(input);
  let raw = await callAnthropic(apiKey, [{ role: "user", content: userPrompt }]);

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(extractJson(raw)) as Record<string, unknown>;
  } catch {
    raw = await callAnthropic(
      apiKey,
      [
        { role: "user", content: userPrompt },
        { role: "assistant", content: raw },
        { role: "user", content: buildReformatPrompt(raw) },
      ],
      0.3
    );
    parsed = JSON.parse(extractJson(raw)) as Record<string, unknown>;
  }

  return {
    ...parsed,
    id: randomUUID(),
    parentScenarioId: null,
    createdAt: new Date().toISOString(),
    modelUsed: MODEL,
  };
}
