import type { AttackType, DefenseType } from "./gameTypes";

export const ATTACK_CONFIG: Record<AttackType, { energyCost: number; name: string; desc: string; target: "house" | "player" }> = {
  DIRECT_STRIKE: { energyCost: 3, name: "Direct strike", desc: "2 dmg → one house", target: "house" },
  AREA_BLAST: { energyCost: 5, name: "Area blast", desc: "1 dmg → all houses", target: "player" },
  SNEAK_ATTACK: { energyCost: 4, name: "Sneak attack", desc: "3 dmg, ignores shield", target: "house" },
};

export const DEFENSE_CONFIG: Record<DefenseType, { energyCost: number; name: string; desc: string; target: "house" }> = {
  SHIELD: { energyCost: 2, name: "Shield", desc: "Blocks next non-sneak attack", target: "house" },
  TRAP: { energyCost: 3, name: "Trap", desc: "Reflects 2 dmg to attacker", target: "house" },
};

export const GAME_UI_CONSTANTS = {
  ROUND_DECISION_SECONDS: 30,
  ROUND_WAITING_SECONDS: 30,
  ROUND_RESOLUTION_SECONDS: 45,
};

export const ATTACKS = (Object.keys(ATTACK_CONFIG) as AttackType[]).map((type) => ({
  type,
  ...ATTACK_CONFIG[type],
}));

export const DEFENSES = (Object.keys(DEFENSE_CONFIG) as DefenseType[]).map((type) => ({
  type,
  ...DEFENSE_CONFIG[type],
}));
