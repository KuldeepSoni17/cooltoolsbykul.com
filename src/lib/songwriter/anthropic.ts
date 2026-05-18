type AnthropicMessageResponse = {
  content?: Array<{ type: string; text?: string }>;
  error?: { message?: string };
};

export async function callAnthropic(
  apiKey: string,
  system: string,
  userPrompt: string,
  maxTokens = 4096,
) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  const data = (await res.json()) as AnthropicMessageResponse;
  if (!res.ok) {
    throw new Error(data?.error?.message ?? "Anthropic request failed");
  }

  const text = data?.content?.find((item) => item.type === "text")?.text ?? "";
  if (!text) throw new Error("Empty response from AI");
  return text;
}

export function resolveApiKey(userKey?: string) {
  const key = userKey?.trim() || process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "No API key. Add ANTHROPIC_API_KEY on the server or enter your key in settings.",
    );
  }
  return key;
}
