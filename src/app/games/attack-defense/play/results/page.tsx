"use client";

import { useRouter } from "next/navigation";

export default function AttackDefenseResultsPage() {
  const router = useRouter();

  return (
    <main className="ad-container">
      {/* Mobile - Direction C (Podium + MVP) */}
      <section className="md:hidden ad-card p-5 text-center">
        <span className="ad-tag">Victory</span>
        <h1 className="ad-title mt-3 text-4xl">kul standing.</h1>
        <div className="mt-5 flex items-end justify-center gap-2">
          <div className="rounded border border-[var(--ad-border)] bg-black/25 px-3 py-4 text-xs">ASH<br />#2</div>
          <div className="rounded border border-[var(--ad-border)] bg-[var(--ad-accent-primary)]/25 px-3 py-7 text-xs font-bold">KUL<br />#1</div>
          <div className="rounded border border-[var(--ad-border)] bg-black/25 px-3 py-3 text-xs">BOT-K<br />#3</div>
        </div>
        <div className="mt-4 rounded-lg border border-[var(--ad-border)] bg-black/25 p-3 text-sm">
          MVP move: R6 area blast on ASH
        </div>
      </section>

      {/* Desktop - Direction B (Timeline recap) */}
      <section className="mt-4 hidden md:block ad-card-strong p-6">
        <div className="flex items-center justify-between">
          <h1 className="ad-title text-5xl">KUL wins.</h1>
          <span className="text-sm text-[var(--ad-text-soft)]">Round 7 · 2m 14s</span>
        </div>
        <div className="mt-5 grid grid-cols-7 gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((round) => (
            <div key={round} className="rounded border border-[var(--ad-border)] bg-black/20 p-2 text-center">
              <div className="text-xs text-[var(--ad-text-soft)]">R{round}</div>
              <div className="mt-2 h-14 rounded bg-gradient-to-t from-indigo-500/50 to-transparent" />
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-[var(--ad-border)] bg-black/25 p-3 text-sm text-[var(--ad-text-soft)]">
          Key moments: R3 sneak pressure, R4 bot elimination, R6 area blast swing.
        </div>
      </section>

      <div className="mt-4 flex flex-col gap-2 md:flex-row">
        <button
          className="ad-btn-primary h-12 flex-1"
          onClick={() => router.push("/games/attack-defense/play/lobby")}
        >
          Rematch
        </button>
        <button
          className="ad-btn-ghost h-12 flex-1 font-semibold"
          onClick={() => router.push("/games/attack-defense/play/lobby")}
        >
          Back to lobby
        </button>
      </div>
    </main>
  );
}
