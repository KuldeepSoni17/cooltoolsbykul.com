"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAttackDefenseAuth } from "@/hooks/attack-defense/useAuth";

export default function AttackDefenseLanding() {
  const router = useRouter();
  const { signInGuest } = useAttackDefenseAuth();
  const [name, setName] = useState("");

  return (
    <main className="ad-container flex min-h-screen flex-col justify-center gap-6">
      {/* Mobile - Direction A */}
      <section className="md:hidden ad-card p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--ad-accent-primary)]">Attack-Defense</p>
        <h1 className="ad-title mt-2 text-4xl leading-tight">ATTACK · DEFENSE</h1>
        <p className="mt-2 text-sm text-[var(--ad-text-soft)]">3 players. 9 houses. One survivor.</p>
        <div className="mt-5 rounded-xl border border-[var(--ad-border)] bg-black/25 p-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--ad-text-soft)]">Codename</div>
          <input
            className="mt-1 h-11 w-full rounded-lg border border-[var(--ad-border)] bg-black/30 px-3 outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-[var(--ad-accent-primary)]/35"
            placeholder="kul___"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
      </section>

      {/* Desktop - Direction C */}
      <section className="hidden md:flex ad-card-strong items-center gap-8 p-8">
        <div className="max-w-sm">
          <span className="ad-tag">Chapter 0</span>
          <h1 className="ad-title mt-3 text-6xl leading-[0.95]">three small kingdoms.</h1>
          <p className="mt-3 text-[var(--ad-text-soft)]">Only one stands. Every round is simultaneous prediction and counterplay.</p>
          <div className="mt-5 rounded-xl border border-[var(--ad-border)] bg-black/20 p-3">
            <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--ad-text-soft)]">Your name</div>
            <input
              className="mt-1 h-11 w-full rounded-lg border border-[var(--ad-border)] bg-black/30 px-3 outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-[var(--ad-accent-primary)]/35"
              placeholder="kul___"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 rounded-2xl border border-[var(--ad-border)] bg-gradient-to-br from-indigo-500/20 to-cyan-400/15 p-8">
          <p className="text-sm text-[var(--ad-text-soft)]">Three kingdoms. One survivor.</p>
          <p className="mt-2 text-2xl font-bold">Plan, lock, survive.</p>
          <div className="mt-4 flex gap-2 text-xs">
            <span className="ad-tag">30s decision</span>
            <span className="ad-tag">45s recap</span>
            <span className="ad-tag">1 attack max</span>
          </div>
        </div>
      </section>

      <button
        className="ad-btn-secondary h-12"
        onClick={async () => {
          if (!name.trim()) return;
          await signInGuest(name.trim());
          router.push("/games/attack-defense/play/lobby");
        }}
      >
        Enter the table
      </button>
    </main>
  );
}
