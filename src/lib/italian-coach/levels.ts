import { COACH_LEVELS } from "@/content/italian-coach/levels";
import {
  adjectives,
  connectors,
  nouns,
  pronouns,
  timeWords,
  verbs,
} from "@/content/italian-coach/vocab";
import {
  adjUid,
  nounUid,
  pronounUid,
  verbFormUid,
  PERSONS,
} from "./engine";
import type { CoachLevel } from "./types";

export type LevelProgress = {
  level: CoachLevel;
  total: number;
  known: number;
  pct: number;
};

/** All unlockable atom IDs introduced at a given level */
export function getAtomIdsForLevel(level: CoachLevel): string[] {
  const ids: string[] = [];
  if (level === 1) {
    ids.push(...pronouns.map((p) => pronounUid(p.id)));
  }
  for (const v of verbs.filter((v) => v.level === level)) {
    ids.push(...PERSONS.map((p) => verbFormUid(v.id, p)));
  }
  for (const n of nouns.filter((n) => n.level === level)) {
    ids.push(nounUid(n.id));
  }
  for (const a of adjectives.filter((a) => a.level === level)) {
    ids.push(adjUid(a.id));
  }
  for (const t of timeWords.filter((t) => t.level === level)) {
    ids.push(t.id);
  }
  for (const c of connectors.filter((c) => c.level === level)) {
    ids.push(c.id);
  }
  if (level === 1) {
    ids.push(
      "art_il",
      "art_lo",
      "art_la",
      "art_l",
      "art_i",
      "art_gli",
      "art_le",
    );
  }
  return ids;
}

/** Cumulative atom IDs for levels 1..n */
export function getAtomIdsUpToLevel(maxLevel: CoachLevel): string[] {
  const ids: string[] = [];
  for (let l = 1; l <= maxLevel; l++) {
    ids.push(...getAtomIdsForLevel(l as CoachLevel));
  }
  return [...new Set(ids)];
}

export function getLevelProgress(
  level: CoachLevel,
  knownSet: Set<string>,
): LevelProgress {
  const atoms = getAtomIdsForLevel(level);
  const known = atoms.filter((id) => knownSet.has(id)).length;
  return {
    level,
    total: atoms.length,
    known,
    pct: atoms.length ? Math.round((known / atoms.length) * 100) : 0,
  };
}

export function getAllLevelProgress(knownSet: Set<string>): LevelProgress[] {
  return COACH_LEVELS.map((m) => getLevelProgress(m.level, knownSet));
}

export function canUnlockLevel(
  level: CoachLevel,
  xp: number,
  unlockedLevels: CoachLevel[],
): boolean {
  if (unlockedLevels.includes(level)) return false;
  const meta = COACH_LEVELS.find((l) => l.level === level);
  if (!meta) return false;
  if (level > 1 && !unlockedLevels.includes((level - 1) as CoachLevel)) return false;
  return xp >= meta.unlockXp;
}
