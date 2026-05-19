import type { House, Player, RoundEvent } from "./gameTypes";
import type { HouseData, HouseState } from "@/components/attack-defense/ui/House";

export function houseState(h: House): HouseState {
  if (h.isDestroyed || h.hp <= 0) return "destroyed";
  if (h.isTrapped) return "trapped";
  if (h.isShielded) return "shielded";
  if (h.hp < h.maxHp) return "damaged";
  return "ok";
}

export function toHouseData(h: House): HouseData {
  return { id: h.id, hp: h.hp, max: h.maxHp, state: houseState(h) };
}

export function playerVariant(player: Player, meId: string, opponents: Player[]): "you" | "opp1" | "opp2" {
  if (player.userId === meId || player.id === meId) return "you";
  const idx = opponents.findIndex((o) => o.id === player.id);
  return idx === 0 ? "opp1" : "opp2";
}

export function totalHp(player: Player) {
  return player.houses.filter((h) => !h.isDestroyed && h.hp > 0).reduce((s, h) => s + h.hp, 0);
}

export function logKind(event: RoundEvent): "attack" | "defense" {
  const t = event.type?.toLowerCase() ?? "";
  if (t.includes("defense") || t.includes("shield") || t.includes("trap")) return "defense";
  return "attack";
}

export const ACTION_SHORT: Record<string, string> = {
  DIRECT_STRIKE: "Strike",
  AREA_BLAST: "Blast",
  SNEAK_ATTACK: "Sneak",
  SHIELD: "Shield",
  TRAP: "Trap",
};
