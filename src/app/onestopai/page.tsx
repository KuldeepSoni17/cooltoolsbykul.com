export default function OneStopAiPage() {
  const sections = [
    {
      title: "Architecture",
      points: [
        "Monorepo with separate apps: frontend (Next.js App Router) and backend (FastAPI).",
        "LiteLLM integration is backend-only for async streaming and provider routing.",
        "No auth and no billing in v1; users manage their own provider API keys.",
      ],
    },
    {
      title: "Backend Essentials",
      points: [
        "FastAPI + SQLAlchemy + APScheduler with SQLite default.",
        "Provider keys encrypted at rest using Fernet (AES-equivalent envelope encryption).",
        "SSE event flow includes provider selection, rate-limit handling, queueing, and done/error states.",
      ],
    },
    {
      title: "Frontend Essentials",
      points: [
        "Next.js UI with dedicated chat, settings, and conversation routes.",
        "SSE stream reader handles token-by-token updates and modal-based recovery flows.",
        "Provider/model lock after first message in each conversation.",
      ],
    },
    {
      title: "Operational Notes",
      points: [
        "Rate limits are learned from 429 responses and tracked per provider.",
        "Context overflow strategies: ask, sliding window, summarize, hard stop.",
        "Out of scope for v1: multimodal, cost dashboard, dark mode, local models.",
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto w-full max-w-5xl px-6 py-10 sm:px-10">
        <p className="inline-flex rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200">
          OneStopAI
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
          Unified AI Provider Webapp Spec
        </h1>
        <p className="mt-4 max-w-3xl text-zinc-300">
          This page publishes the implementation brief from your local markdown
          spec as a production-readable summary on your main site.
        </p>

        <section className="mt-10 grid gap-5 md:grid-cols-2">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5"
            >
              <h2 className="text-xl font-semibold text-white">{section.title}</h2>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-300">
                {section.points.map((point) => (
                  <li key={point}>- {point}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
