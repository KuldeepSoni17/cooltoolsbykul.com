"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getLevelMeta } from "@/content/italian-coach/levels";
import { DEFAULT_KNOWN_IDS } from "./engine";
import { getAtomIdsForLevel } from "./levels";
import type { CoachLevel } from "./types";

export type MasteryMap = Record<string, { seen: number; correct: number; lastSeen: number }>;

type CoachStore = {
  knownWordIds: string[];
  unlockedLevels: CoachLevel[];
  xp: number;
  streak: number;
  lastLoginDate: string | null;
  phrasesCreated: number;
  mastery: MasteryMap;
  unlockWord: (id: string) => void;
  unlockMany: (ids: string[]) => void;
  unlockLevel: (level: CoachLevel) => boolean;
  addXp: (amount: number) => void;
  recordPhraseCreated: () => void;
  recordReview: (id: string, ok: boolean) => void;
  touchDailyLogin: () => void;
  resetProgress: () => void;
};

export const useCoachStore = create<CoachStore>()(
  persist(
    (set, get) => ({
      knownWordIds: DEFAULT_KNOWN_IDS,
      unlockedLevels: [1],
      xp: 0,
      streak: 0,
      lastLoginDate: null,
      phrasesCreated: 0,
      mastery: {},
      unlockWord: (id) => {
        const current = get().knownWordIds;
        if (current.includes(id)) return;
        set({ knownWordIds: [...current, id] });
      },
      unlockMany: (ids) => {
        const current = new Set(get().knownWordIds);
        ids.forEach((id) => current.add(id));
        set({ knownWordIds: Array.from(current) });
      },
      unlockLevel: (level) => {
        const state = get();
        if (state.unlockedLevels.includes(level)) return false;
        const meta = getLevelMeta(level);
        if (level > 1 && !state.unlockedLevels.includes((level - 1) as CoachLevel)) {
          return false;
        }
        if (state.xp < meta.unlockXp) return false;
        const atomIds = getAtomIdsForLevel(level);
        const known = new Set(state.knownWordIds);
        atomIds.forEach((id) => known.add(id));
        set({
          unlockedLevels: [...state.unlockedLevels, level].sort((a, b) => a - b),
          knownWordIds: Array.from(known),
        });
        return true;
      },
      addXp: (amount) => set({ xp: get().xp + amount }),
      recordPhraseCreated: () => set({ phrasesCreated: get().phrasesCreated + 1 }),
      recordReview: (id, ok) => {
        const prev = get().mastery[id] ?? { seen: 0, correct: 0, lastSeen: 0 };
        const next: MasteryMap = {
          ...get().mastery,
          [id]: {
            seen: prev.seen + 1,
            correct: prev.correct + (ok ? 1 : 0),
            lastSeen: Date.now(),
          },
        };
        set({ mastery: next, xp: get().xp + (ok ? 5 : 1) });
      },
      touchDailyLogin: () => {
        const today = new Date().toISOString().slice(0, 10);
        const last = get().lastLoginDate;
        if (last === today) return;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = yesterday.toISOString().slice(0, 10);
        const streak = last === yStr ? get().streak + 1 : 1;
        set({ lastLoginDate: today, streak, xp: get().xp + 15 });
      },
      resetProgress: () =>
        set({
          knownWordIds: DEFAULT_KNOWN_IDS,
          unlockedLevels: [1],
          xp: 0,
          streak: 0,
          phrasesCreated: 0,
          mastery: {},
        }),
    }),
    {
      name: "italian-coach-v5",
      version: 1,
      migrate: (persisted) => {
        const p = persisted as Partial<CoachStore>;
        return {
          ...p,
          unlockedLevels: p.unlockedLevels?.length ? p.unlockedLevels : [1],
        };
      },
    },
  ),
);
