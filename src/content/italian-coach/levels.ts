import type { CoachLevel } from "@/lib/italian-coach/types";

export type LevelMeta = {
  level: CoachLevel;
  slug: string;
  title: string;
  subtitle: string;
  cefr: string;
  /** Estimated % of everyday spoken Italian once this level is mastered (cumulative) */
  coveragePct: number;
  /** Target lemma count introduced at this level (not counting verb forms) */
  targetLemmas: number;
  /** XP to unlock this level (0 = free) */
  unlockXp: number;
  topics: string[];
};

export const COACH_LEVELS: LevelMeta[] = [
  {
    level: 1,
    slug: "foundation",
    title: "Foundation",
    subtitle: "Survive a café, introduce yourself, basic needs",
    cefr: "A1",
    coveragePct: 35,
    targetLemmas: 220,
    unlockXp: 0,
    topics: ["pronouns", "core verbs", "food", "home", "numbers"],
  },
  {
    level: 2,
    slug: "daily",
    title: "Daily Life",
    subtitle: "Shopping, routines, family, weather, city",
    cefr: "A1+",
    coveragePct: 52,
    targetLemmas: 380,
    unlockXp: 120,
    topics: ["routines", "family", "city", "shopping", "more verbs"],
  },
  {
    level: 3,
    slug: "conversation",
    title: "Conversation",
    subtitle: "Opinions, feelings, work basics, travel",
    cefr: "A2",
    coveragePct: 65,
    targetLemmas: 420,
    unlockXp: 280,
    topics: ["emotions", "work", "travel", "health", "connectors"],
  },
  {
    level: 4,
    slug: "connected",
    title: "Connected Speech",
    subtitle: "Stories, past context, media, technology",
    cefr: "A2+",
    coveragePct: 74,
    targetLemmas: 450,
    unlockXp: 500,
    topics: ["technology", "media", "nature", "education", "formal you"],
  },
  {
    level: 5,
    slug: "fluency",
    title: "Fluency",
    subtitle: "Abstract ideas, society, business, nuance",
    cefr: "B1",
    coveragePct: 80,
    targetLemmas: 420,
    unlockXp: 800,
    topics: ["abstract", "business", "society", "law", "science basics"],
  },
  {
    level: 6,
    slug: "mastery",
    title: "Mastery",
    subtitle: "Rare but useful words — newspapers, culture, precision",
    cefr: "B2",
    coveragePct: 85,
    targetLemmas: 400,
    unlockXp: 1200,
    topics: ["culture", "politics", "academic", "literary", "regional"],
  },
];

export function getLevelMeta(level: CoachLevel): LevelMeta {
  return COACH_LEVELS.find((l) => l.level === level) ?? COACH_LEVELS[0];
}

export function maxUnlockedCoverage(levels: CoachLevel[]): number {
  if (!levels.length) return 0;
  return Math.max(...levels.map((l) => getLevelMeta(l).coveragePct));
}
