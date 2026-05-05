"use client";

import { useRouter } from "next/navigation";

export default function AttackDefenseResultsPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,#312e81_0%,#09090b_45%),radial-gradient(circle_at_15%_80%,#14532d_0%,transparent_35%)] px-6 py-10 text-zinc-100">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <div className="rounded-2xl border border-zinc-700/80 bg-zinc-900/75 p-6 text-center shadow-2xl shadow-black/35 backdrop-blur">
        <h1 className="text-4xl font-black tracking-tight">Round Table Complete</h1>
        <p className="mt-2 text-zinc-200">Detailed match stats and rewards can be expanded here next.</p>
        <div className="mt-4 flex justify-center gap-2 text-xs">
          <span className="rounded-full border border-zinc-700 bg-zinc-800/80 px-3 py-1">+24 XP</span>
          <span className="rounded-full border border-zinc-700 bg-zinc-800/80 px-3 py-1">3 houses standing</span>
        </div>
      </div>
      <button
        className="h-12 rounded-xl bg-gradient-to-r from-lime-300 to-lime-400 font-bold text-zinc-900 shadow-lg shadow-lime-900/30 transition hover:brightness-105"
        onClick={() => router.push("/games/attack-defense/play/lobby")}
      >
        Back to lobby
      </button>
      </div>
    </main>
  );
}
