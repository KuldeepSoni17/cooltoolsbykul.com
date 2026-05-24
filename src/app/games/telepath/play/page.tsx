"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackLink } from "@/components/telepath/BackLink";
import { ContainerOrb } from "@/components/telepath/ContainerOrb";
import { TelepathBackdrop } from "@/components/telepath/TelepathBackdrop";
import { TELEPATH_COLORS } from "@/components/telepath/tokens";
import type { PlayerColor } from "@/lib/telepath/types";

const COLORS: PlayerColor[] = ["red", "blue", "green"];

export default function TelepathPlayPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [color, setColor] = useState<PlayerColor>("red");

  const token = TELEPATH_COLORS[color];

  const start = () => {
    if (!name.trim()) return;
    const params = new URLSearchParams({ name: name.trim(), color });
    router.push(`/games/telepath/play/match?${params.toString()}`);
  };

  return (
    <main className="relative min-h-screen px-5 py-10 text-zinc-100 sm:px-10">
      <TelepathBackdrop />

      <div className="relative mx-auto w-full max-w-xl">
        <BackLink href="/games/telepath" label="Telepath" />

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl sm:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            Enter the match
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Pick a color, pick a name.
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Solo mode: you versus two AI rivals. Choose the container you want
            to defend.
          </p>

          {/* Display name */}
          <div className="mt-8">
            <label
              htmlFor="display-name"
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500"
            >
              Display name
            </label>
            <input
              id="display-name"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-transparent"
              style={{
                boxShadow: name ? `0 0 0 1px ${token.hex}88, 0 0 24px ${token.soft}` : undefined,
              }}
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && start()}
              autoComplete="off"
            />
          </div>

          {/* Color picker */}
          <div className="mt-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Your container
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3 sm:gap-5">
              {COLORS.map((c) => {
                const isSelected = c === color;
                const t = TELEPATH_COLORS[c];
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    aria-pressed={isSelected}
                    className="group relative flex flex-col items-center gap-3 rounded-2xl border p-4 transition"
                    style={{
                      borderColor: isSelected ? t.hex : "rgba(255,255,255,0.08)",
                      background: isSelected
                        ? `linear-gradient(180deg, ${t.soft}, transparent)`
                        : "rgba(255,255,255,0.02)",
                      boxShadow: isSelected ? `0 0 28px ${t.soft}` : undefined,
                    }}
                  >
                    <ContainerOrb
                      color={c}
                      size="md"
                      active={isSelected}
                      pulse={isSelected}
                      className="transition-transform group-hover:-translate-y-0.5"
                    />
                    <span
                      className="text-sm font-semibold tracking-wide"
                      style={{ color: isSelected ? t.hex : "#a1a1aa" }}
                    >
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start CTA */}
          <button
            type="button"
            onClick={start}
            disabled={!name.trim()}
            className="mt-10 w-full rounded-xl px-5 py-3.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              backgroundColor: token.hex,
              color: "#0a0a0a",
              boxShadow: name.trim() ? `0 0 36px ${token.soft}` : undefined,
            }}
          >
            {name.trim() ? `Start as ${token.label}` : "Enter a name to start"}
          </button>
        </div>
      </div>
    </main>
  );
}
