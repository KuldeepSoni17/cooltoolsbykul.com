import { NextRequest, NextResponse } from "next/server";

type Provider = "anthropic" | "openai" | "google" | "groq" | "mistral";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type Body = {
  provider?: Provider;
  model?: string;
  apiKey?: string;
  messages?: ChatMessage[];
};

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

async function callAnthropic(apiKey: string, model: string, messages: ChatMessage[]) {
  const anthropicMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role, content: m.content }));
  const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1200,
      system: system || undefined,
      messages: anthropicMessages,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message ?? "Anthropic request failed");
  }
  return data?.content?.find((item: { type: string; text?: string }) => item.type === "text")?.text ?? "";
}

async function callOpenAICompatible(
  apiKey: string,
  model: string,
  baseURL: string,
  messages: ChatMessage[],
) {
  const res = await fetch(`${baseURL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.4,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message ?? "Provider request failed");
  }
  return data?.choices?.[0]?.message?.content ?? "";
}

async function callGoogle(apiKey: string, model: string, messages: ChatMessage[]) {
  const prompt = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n\n");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4 },
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message ?? "Google request failed");
  }
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    const provider = body.provider;
    const model = body.model?.trim();
    const apiKey = body.apiKey?.trim();
    const messages = body.messages;

    if (!provider) return badRequest("missing_provider");
    if (!model) return badRequest("missing_model");
    if (!apiKey) return badRequest("missing_api_key");
    if (!messages?.length) return badRequest("missing_messages");

    let output = "";
    if (provider === "anthropic") {
      output = await callAnthropic(apiKey, model, messages);
    } else if (provider === "openai") {
      output = await callOpenAICompatible(apiKey, model, "https://api.openai.com/v1", messages);
    } else if (provider === "groq") {
      output = await callOpenAICompatible(apiKey, model, "https://api.groq.com/openai/v1", messages);
    } else if (provider === "mistral") {
      output = await callOpenAICompatible(apiKey, model, "https://api.mistral.ai/v1", messages);
    } else if (provider === "google") {
      output = await callGoogle(apiKey, model, messages);
    } else {
      return badRequest("unsupported_provider");
    }

    return NextResponse.json({ content: output });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "server_error" },
      { status: 500 },
    );
  }
}
