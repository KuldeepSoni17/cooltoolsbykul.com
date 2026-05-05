export interface House {
  id: string;
  ownerId: string;
  hp: number;
  maxHp: number;
  isShielded: boolean;
  isTrapped: boolean;
  isDestroyed: boolean;
}

export interface Player {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  isGuest: boolean;
  energy: number;
  houses: House[];
  isEliminated: boolean;
  actionsSubmitted: boolean;
}

export interface RoundEvent {
  type: string;
  message: string;
  sourcePlayerId?: string;
  targetPlayerId?: string;
  targetHouseId?: string;
}

export interface GameRoom {
  roomId: string;
  players: Player[];
  round: number;
  phase: "waiting" | "decision" | "resolution" | "game_over";
  winnerId?: string;
  roundTimer: number;
  roundLog: RoundEvent[];
}

export type AttackType = "DIRECT_STRIKE" | "AREA_BLAST" | "SNEAK_ATTACK";
export type DefenseType = "SHIELD" | "TRAP";

export interface Attack {
  type: AttackType;
  targetPlayerId: string;
  targetHouseId?: string;
}

export interface Defense {
  type: DefenseType;
  targetHouseId: string;
}

export interface PlayerAction {
  playerId: string;
  attacks: Attack[];
  defenses: Defense[];
}
