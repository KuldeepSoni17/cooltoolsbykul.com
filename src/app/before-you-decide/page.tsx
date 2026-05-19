import Link from "next/link";
import { MIRROR_FAMILY, liveMirrors } from "@/features/mirror-engine/registry";

export default function BeforeYouDecidePage() {
  const live = liveMirrors();
  const upcoming = MIRROR_FAMILY.filter((m) => m.status === "coming_soon");

  return (
    <main className="mirror-root mirror-grain min-h-screen px-6 py-12 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm text-[var(--mirror-accent)]">
          ← cooltoolsbykul.com
        </Link>
        <p className="mt-10 text-[11px] font-light uppercase tracking-[0.35em] text-[var(--mirror-text-muted)]">
          Before You Decide
        </p>
        <h1
          className="mt-4 text-5xl italic leading-tight sm:text-6xl"
          style={{ fontFamily: "var(--mirror-font-display)" }}
        >
          Readiness mirrors for hard decisions
        </h1>
        <p className="mt-6 max-w-2xl text-lg font-light text-[var(--mirror-text-secondary)]">
          Not quizzes. Not predictors. Structured pauses that show you where you
          stand — and what to do next.
        </p>
        <div className="mt-6 flex flex-wrap gap-4 text-sm font-medium">
          <Link href="/before-you-decide/carrying" className="text-[var(--mirror-accent)] hover:underline">
            What I&apos;m carrying →
          </Link>
          <Link href="/before-you-decide/compare" className="text-[var(--mirror-accent)] hover:underline">
            Couple compare →
          </Link>
        </div>

        <section className="mt-14 grid gap-4 sm:grid-cols-2">
          {live.map((m) => (
            <Link
              key={m.id}
              href={m.href!}
              className="group rounded-2xl border border-[var(--mirror-border)] bg-[var(--mirror-surface)] p-6 transition hover:border-[var(--mirror-accent)]/50"
              style={{ borderTopColor: m.accent, borderTopWidth: 3 }}
            >
              <p className="text-xs uppercase tracking-widest text-[var(--mirror-text-muted)]">
                {m.estDuration}
              </p>
              <h2 className="mt-2 text-xl font-semibold group-hover:text-[var(--mirror-accent)]">
                {m.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--mirror-text-secondary)]">
                {m.tagline}
              </p>
              <span className="mt-4 inline-block text-sm font-semibold text-[var(--mirror-accent)]">
                Open mirror →
              </span>
            </Link>
          ))}
        </section>

        {upcoming.length > 0 && (
          <section className="mt-16">
            <h2 className="text-lg font-semibold text-[var(--mirror-text-muted)]">
              Coming soon
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-[var(--mirror-text-secondary)]">
              {upcoming.map((m) => (
                <li key={m.id}>{m.title}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
