"use client";

export default function AttackDefensePlayError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="ad-container min-h-screen py-10">
      <section className="ad-card p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--ad-text-soft)]">Route recovery</p>
        <h1 className="ad-title mt-2 text-3xl">Game screen hit an error</h1>
        <p className="mt-3 text-sm text-[var(--ad-text-soft)]">
          A runtime issue interrupted rendering. Retry once, and if this repeats, refresh the page.
        </p>
        <p className="mt-3 rounded-lg bg-black/25 px-3 py-2 text-xs text-rose-200">{error.message}</p>
        <button className="ad-btn-primary mt-4 h-11 px-4" onClick={reset}>
          Retry screen
        </button>
      </section>
    </main>
  );
}
