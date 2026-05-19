import type { HouseData } from "../ui";

export interface MatchOppVm {
  id: string;
  name: string;
  tag: "opp1" | "opp2";
  energy: number;
  isBot?: boolean;
  houses: HouseData[];
  lastAction?: { kind: "attack" | "defense"; name: string; target: string };
}

export interface MatchVm {
  round: number;
  timer: number;
  timerTotal: number;
  energy: number;
  energyMax: number;
  pendingEnergy: number;
  me: {
    id: string;
    name: string;
    energy: number;
    houses: HouseData[];
  };
  opps: MatchOppVm[];
  log: { round: number; text: string; kind: "attack" | "defense" }[];
}

export type SelectState = {
  kind: "attack" | "defense";
  type: string;
  action: { type: string; name: string; cost: number; desc: string; target: "house" | "player" };
};
