"use client";

import { motion } from "framer-motion";
import { COACH_LEVELS } from "@/content/italian-coach/levels";
import { canUnlockLevel, getAllLevelProgress } from "@/lib/italian-coach/levels";
import { useCoachStore } from "@/lib/italian-coach/store";
import type { CoachLevel } from "@/lib/italian-coach/types";

export function LevelProgress() {
  const knownWordIds = useCoachStore((s) => s.knownWordIds);
  const unlockedLevels = useCoachStore((s) => s.unlockedLevels);
  const xp = useCoachStore((s) => s.xp);
  const unlockLevel = useCoachStore((s) => s.unlockLevel);

  const knownSet = new Set(knownWordIds);
  const progress = getAllLevelProgress(knownSet);
  const maxCoverage = Math.max(
    ...unlockedLevels.map((l) => COACH_LEVELS.find((m) => m.level === l)?.coveragePct ?? 0),
  );

  return (
    <section className="rounded-2xl border border-stone-200 bg-white/80 p-4 shadow-sm backdrop-blur sm:rounded-3xl sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="font-serif text-xl text-stone-900 sm:text-2xl">Curriculum</h2>
          <p className="mt-0.5 text-sm text-stone-500">
            ~{maxCoverage}% everyday Italian unlocked · 6 levels
          </p>
        </div>
      </div>

      <ol className="mt-5 space-y-3">
        {COACH_LEVELS.map((meta) => {
          const prog = progress.find((p) => p.level === meta.level)!;
          const unlocked = unlockedLevels.includes(meta.level);
          const canUnlock = canUnlockLevel(meta.level, xp, unlockedLevels);
          const isNext =
            !unlocked &&
            (meta.level === 1 || unlockedLevels.includes((meta.level - 1) as CoachLevel));

          return (
            <li
              key={meta.level}
              className={`rounded-xl border p-3 sm:p-4 ${
                unlocked
                  ? "border-stone-300 bg-stone-50/80"
                  : isNext
                    ? "border-amber-200 bg-amber-50/50"
                    : "border-stone-200 bg-white/60 opacity-80"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-stone-500">
                      Level {meta.level} · {meta.cefr}
                    </span>
                    {unlocked ? (
                      <span className="rounded-full bg-stone-900 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                        Unlocked
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 font-medium text-stone-900">{meta.title}</p>
                  <p className="text-xs text-stone-500">{meta.subtitle}</p>
                </div>
                <div className="text-right text-xs text-stone-500">
                  <span className="font-serif text-lg text-stone-800">{meta.coveragePct}%</span>
                  <span className="block">coverage</span>
                </div>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone-200">
                <motion.div
                  className="h-full rounded-full bg-stone-800"
                  initial={false}
                  animate={{ width: `${prog.pct}%` }}
                  transition={{ duration: 0.35 }}
                />
              </div>
              <p className="mt-1 text-[11px] text-stone-500">
                {prog.known}/{prog.total} atoms mastered
                {meta.unlockXp > 0 ? ` · unlock at ${meta.unlockXp} XP` : ""}
              </p>

              {canUnlock ? (
                <button
                  type="button"
                  onClick={() => unlockLevel(meta.level as CoachLevel)}
                  className="mt-3 min-h-[44px] rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
                >
                  Unlock Level {meta.level} ({meta.targetLemmas}+ words)
                </button>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
