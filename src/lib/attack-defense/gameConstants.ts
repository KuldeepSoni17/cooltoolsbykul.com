import type { AttackType, DefenseType } from "./gameTypes";

export const GAME_UI_CONSTANTS = {
  ENERGY_MAX: 20,
  ROUND_DECISION_SECONDS: 30,
  ROUND_INITIAL_BREATHER_SECONDS: 30,
  ROUND_RESOLUTION_SECONDS: 45
} as const;

export const ATTACK_CONFIG: Record<
  AttackType,
  { name: string; energyCost: number; description: string; target: "player" | "house" }
> = {
  DIRECT_STRIKE: { name: "Direct Strike", energyCost: 3, description: "2 damage to one enemy house.", target: "house" },
  AREA_BLAST: { name: "Area Blast", energyCost: 5, description: "1 damage to all houses of one enemy.", target: "player" },
  SNEAK_ATTACK: { name: "Sneak Attack", energyCost: 4, description: "3 damage and ignores shield.", target: "house" }
};

export const DEFENSE_CONFIG: Record<DefenseType, { name: string; energyCost: number; description: string }> = {
  SHIELD: { name: "Shield", energyCost: 2, description: "Blocks the next non-sneak attack on this house." },
  TRAP: { name: "Trap", energyCost: 3, description: "Reflects 2 damage to the attacker when triggered." }
};
