"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PlayerColor } from "@/lib/telepath/types";

const COLORS: { id: PlayerColor; label: string; ring: string }[] = [
  { id: "red", label: "Red", ring: "ring-red-400/60" },
  { id: "blue", label: "Blue", ring: "ring-blue-400/60" },
  { id: "green", label: "Green", ring: "ring-emerald-400/60" },
];

export default function TelepathPlayPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [color, setColor] = useState<PlayerColor>("red");

  const start = () => {
    if (!name.trim()) return;
    const params = new URLSearchParams({ name: name.trim(), color });
    router.push(`/games/telepath/play/match?${params.toString()}`);
  };

  return (
    <main className="relative min-h-screen bg-zinc-950 px-6 py-12 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(167,139,250,0.18),transparent_40%)]" />

      <div className="relative mx-auto w-full max-w-lg">
        <Link href="/games/telepath" className="text-sm text-violet-300 hover:text-violet-200">
          {"<-"} Telepath
        </Link>

        <h1 className="mt-6 text-3xl font-bold">Enter the match</h1>
        <p className="mt-2 text-zinc-400">Solo mode: you vs two AI rivals. Pick your container color.</p>

        <label className="mt-8 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Display name
        </label>
        <input
          className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-100 outline-none focus:border-violet-500"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && start()}
        />

        <p className="mt-8 text-xs font-semibold uppercase tracking-wider text-zinc-400">Your color</p>
        <div className="mt-3 flex gap-3">
          {COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setColor(c.id)}
              className={`flex-1 rounded-xl border px-3 py-4 text-sm font-semibold transition ${
                color === c.id
                  ? `border-violet-500 bg-violet-500/20 ring-2 ${c.ring}`
                  : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={start}
          disabled={!name.trim()}
          className="mt-10 w-full rounded-xl bg-violet-400 py-3 font-semibold text-zinc-950 disabled:opacity-40 hover:bg-violet-300"
        >
          Start match
        </button>
      </div>
    </main>
  );
}
