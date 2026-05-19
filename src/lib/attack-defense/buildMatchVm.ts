import type { MatchVm } from "@/components/attack-defense/screens/matchTypes";
import { logKind, playerVariant, toHouseData } from "./matchView";
import type { GameRoom, RoundEvent } from "./gameTypes";

export function buildMatchVm(room: GameRoom, myUserId: string, extraLog?: RoundEvent[]): MatchVm {
  const me = room.players.find((p) => p.userId === myUserId || p.id === myUserId) ?? room.players[0];
  const opps = room.players.filter((p) => p.id !== me.id).slice(0, 2);

  const mapOpp = (p: (typeof opps)[0], tag: "opp1" | "opp2") => ({
    id: p.id,
    name: p.displayName,
    tag,
    energy: p.energy,
    isBot: p.isGuest === false && p.displayName.toLowerCase().includes("bot"),
    houses: p.houses.map(toHouseData),
    lastAction: undefined as MatchVm["opps"][0]["lastAction"],
  });

  const logFromRoom = (room.roundLog ?? []).map((e) => ({
    round: room.round,
    text: e.message,
    kind: logKind(e),
  }));

  const logFromExtra = (extraLog ?? []).map((e) => ({
    round: room.round,
    text: e.message,
    kind: logKind(e),
  }));

  return {
    round: room.round,
    timer: room.roundTimer,
    timerTotal: 30,
    energy: me.energy,
    energyMax: 20,
    pendingEnergy: 0,
    me: {
      id: me.id,
      name: me.displayName,
      energy: me.energy,
      houses: me.houses.map(toHouseData),
    },
    opps: [
      mapOpp(opps[0] ?? me, "opp1"),
      mapOpp(opps[1] ?? me, "opp2"),
    ],
    log: logFromExtra.length ? logFromExtra : logFromRoom,
  };
}
