"use client";

import { useRouter } from "next/navigation";

export default function AttackDefenseResultsPage() {
  const router = useRouter();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 px-6 py-10 text-zinc-100">
      <div className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-6 text-center">
        <h1 className="text-4xl font-bold">Round Table Complete</h1>
        <p className="mt-2 text-zinc-300">Detailed match stats and rewards can be expanded here next.</p>
      </div>
      <button className="h-12 rounded-xl bg-lime-400 font-semibold text-zinc-900" onClick={() => router.push("/games/attack-defense/play/lobby")}>
        Back to lobby
      </button>
    </main>
  );
}
