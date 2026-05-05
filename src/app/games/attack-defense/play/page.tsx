"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAttackDefenseAuth } from "@/hooks/attack-defense/useAuth";

export default function AttackDefenseLanding() {
  const router = useRouter();
  const { user, signInGuest } = useAttackDefenseAuth();
  const [name, setName] = useState("");

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,#312e81_0%,#09090b_42%),radial-gradient(circle_at_10%_80%,#14532d_0%,transparent_35%)] px-6 py-10 text-zinc-100">
      <div className="mx-auto flex w-full max-w-3xl flex-col justify-center gap-6">
      <div className="rounded-3xl border border-zinc-700/80 bg-zinc-900/70 p-7 shadow-2xl shadow-black/40 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.2em] text-lime-300/80">Attack-Defense</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Three kingdoms. One survivor.</h1>
        <p className="mt-3 text-zinc-200">
          Wireframe-inspired arcade lobby. Plan your move, lock it, and review outcomes after every round.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-zinc-700 bg-zinc-800/80 px-3 py-1">30s decisions</span>
          <span className="rounded-full border border-zinc-700 bg-zinc-800/80 px-3 py-1">45s recap</span>
          <span className="rounded-full border border-zinc-700 bg-zinc-800/80 px-3 py-1">3 player tactics</span>
        </div>
      </div>

      {user ? (
        <button
          className="h-12 rounded-xl bg-gradient-to-r from-lime-300 to-lime-400 font-bold text-zinc-900 shadow-lg shadow-lime-900/30 transition hover:brightness-105"
          onClick={() => router.push("/games/attack-defense/play/lobby")}
        >
          Continue as {user.displayName}
        </button>
      ) : (
        <div className="space-y-3 rounded-2xl border border-zinc-700/80 bg-zinc-900/70 p-5 shadow-xl shadow-black/30 backdrop-blur">
          <label className="text-sm font-semibold text-zinc-200">Choose codename</label>
          <input
            className="h-12 w-full rounded-lg border border-zinc-600 bg-zinc-950/80 px-3 outline-none ring-lime-300/40 placeholder:text-zinc-500 focus:ring-2"
            placeholder="kul___"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <button
            className="h-12 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 font-bold shadow-lg shadow-indigo-900/30 transition hover:brightness-110"
            onClick={async () => {
              if (!name.trim()) return;
              await signInGuest(name.trim());
              router.push("/games/attack-defense/play/lobby");
            }}
          >
            Play as Guest
          </button>
        </div>
      )}
      </div>
    </main>
  );
}
