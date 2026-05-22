"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const DEFAULT_KNOWN = [
  "io",
  "tu",
  "voglio",
  "mangio",
  "bevo",
  "ho",
  "te",
  "acqua",
  "pizza",
  "caffe",
  "oggi",
  "casa",
  "bello",
  "grande",
  "la",
];

type CoachStore = {
  knownWordIds: string[];
  xp: number;
  streak: number;
  lastLoginDate: string | null;
  phrasesCreated: number;
  unlockWord: (id: string) => void;
  addXp: (amount: number) => void;
  recordPhraseCreated: () => void;
  touchDailyLogin: () => void;
};

export const useCoachStore = create<CoachStore>()(
  persist(
    (set, get) => ({
      knownWordIds: DEFAULT_KNOWN,
      xp: 0,
      streak: 0,
      lastLoginDate: null,
      phrasesCreated: 0,
      unlockWord: (id) => {
        const current = get().knownWordIds;
        if (current.includes(id)) return;
        set({ knownWordIds: [...current, id] });
      },
      addXp: (amount) => set({ xp: get().xp + amount }),
      recordPhraseCreated: () => set({ phrasesCreated: get().phrasesCreated + 1 }),
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
    }),
    { name: "italian-coach-v2" },
  ),
);
