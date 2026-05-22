import { randomUUID } from "crypto";
import {
  buildReformatPrompt,
  buildScenarioUserPrompt,
  DIVERGENCE_SYSTEM_PROMPT,
  type ScenarioInput,
} from "./prompts";

/** Fast model — same family as WorthIt; completes within Cloudflare ~100s limit */
const MODEL =
  process.env.DIVERGENCE_ANTHROPIC_MODEL ??
  process.env.ANTHROPIC_MODEL ??
  "claude-haiku-4-5-20251001";

const MAX_TOKENS = 8192;
const REQUEST_TIMEOUT_MS = 85_000;

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
  temperature = 0.5
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
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
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(
        "Generation timed out on the server. Try again with fewer variables or open a curated example."
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
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
    try {
      raw = await callAnthropic(
        apiKey,
        [
          { role: "user", content: userPrompt },
          { role: "assistant", content: raw.slice(0, 6000) },
          { role: "user", content: buildReformatPrompt(raw) },
        ],
        0.2
      );
      parsed = JSON.parse(extractJson(raw)) as Record<string, unknown>;
    } catch {
      throw new Error(
        "The model returned invalid JSON. Please try again — shorter change details often help."
      );
    }
  }

  return {
    ...parsed,
    id: randomUUID(),
    parentScenarioId: null,
    createdAt: new Date().toISOString(),
    modelUsed: MODEL,
  };
}
