"use client";

import { FormEvent, useMemo, useState } from "react";

type Provider = "anthropic" | "openai" | "google" | "groq" | "mistral";
type Message = { role: "user" | "assistant"; content: string };

const PROVIDER_MODELS: Record<Provider, string[]> = {
  anthropic: ["claude-sonnet-4-5", "claude-haiku-4-5-20251001"],
  openai: ["gpt-4o", "gpt-4o-mini", "o3-mini"],
  google: ["gemini-2.0-flash", "gemini-1.5-pro"],
  groq: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"],
  mistral: ["mistral-large-latest", "mistral-small-latest"],
};

export default function OneStopAiPage() {
  const [provider, setProvider] = useState<Provider>("openai");
  const [model, setModel] = useState("gpt-4o");
  const [apiKeys, setApiKeys] = useState<Record<Provider, string>>({
    anthropic: "",
    openai: "",
    google: "",
    groq: "",
    mistral: "",
  });
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modelOptions = useMemo(() => PROVIDER_MODELS[provider], [provider]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim() || loading) return;
    const apiKey = apiKeys[provider]?.trim();
    if (!apiKey) {
      setError(`Add ${provider} API key first.`);
      return;
    }

    const userText = draft.trim();
    setDraft("");
    setError(null);
    setLoading(true);

    const nextMessages: Message[] = [...messages, { role: "user", content: userText }];
    setMessages(nextMessages);

    try {
      const payloadMessages = nextMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const res = await fetch("/api/onestopai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          model,
          apiKey,
          messages: payloadMessages,
        }),
      });
      const data = (await res.json()) as { content?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMessages((prev) => [...prev, { role: "assistant", content: data.content || "(empty response)" }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-8 sm:px-10">
        <h1 className="text-3xl font-bold tracking-tight">OneStopAI</h1>
        <p className="text-zinc-300">Unified AI webapp on your main domain.</p>

        <div className="grid gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 md:grid-cols-3">
          <select
            value={provider}
            onChange={(e) => {
              const p = e.target.value as Provider;
              setProvider(p);
              setModel(PROVIDER_MODELS[p][0]);
            }}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
          >
            <option value="anthropic">Anthropic</option>
            <option value="openai">OpenAI</option>
            <option value="google">Google</option>
            <option value="groq">Groq</option>
            <option value="mistral">Mistral</option>
          </select>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
          >
            {modelOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input
            type="password"
            value={apiKeys[provider]}
            onChange={(e) => setApiKeys((prev) => ({ ...prev, [provider]: e.target.value }))}
            placeholder={`${provider} API key`}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
          />
        </div>

        <section className="min-h-[420px] rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
          <div className="space-y-3">
            {messages.length === 0 ? (
              <p className="text-zinc-400">Start by adding a provider key and sending a prompt.</p>
            ) : (
              messages.map((m, idx) => (
                <article key={`${m.role}-${idx}`} className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
                  <p className="mb-1 text-xs uppercase tracking-wide text-zinc-400">{m.role}</p>
                  <p className="whitespace-pre-wrap text-sm text-zinc-100">{m.content}</p>
                </article>
              ))
            )}
            {loading ? <p className="text-sm text-emerald-300">Thinking...</p> : null}
          </div>
        </section>

        <form onSubmit={onSubmit} className="flex gap-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Send a message..."
            className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-zinc-950 disabled:opacity-60"
          >
            Send
          </button>
        </form>

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      </div>
    </main>
  );
}
