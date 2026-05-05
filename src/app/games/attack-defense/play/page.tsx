"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAttackDefenseAuth } from "@/hooks/attack-defense/useAuth";

export default function AttackDefenseLanding() {
  const router = useRouter();
  const { user, signInGuest } = useAttackDefenseAuth();
  const [name, setName] = useState("");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-6 px-6 py-10 text-zinc-100">
      <div className="rounded-3xl border border-zinc-700 bg-zinc-900/70 p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Attack-Defense</p>
        <h1 className="mt-2 text-4xl font-bold">Three kingdoms. One survivor.</h1>
        <p className="mt-3 text-zinc-300">
          Wireframe-inspired arcade lobby. Plan your move, lock it, and review outcomes after every round.
        </p>
      </div>

      {user ? (
        <button className="h-12 rounded-xl bg-lime-400 font-semibold text-zinc-900" onClick={() => router.push("/games/attack-defense/play/lobby")}>
          Continue as {user.displayName}
        </button>
      ) : (
        <div className="space-y-3 rounded-2xl border border-zinc-700 bg-zinc-900/70 p-4">
          <label className="text-sm text-zinc-300">Choose codename</label>
          <input
            className="h-12 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3"
            placeholder="kul___"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <button
            className="h-12 w-full rounded-xl bg-indigo-500 font-semibold"
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
    </main>
  );
}
