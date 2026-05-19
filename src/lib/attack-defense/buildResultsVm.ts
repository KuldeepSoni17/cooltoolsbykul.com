import type { HpTimelineRow } from "@/hooks/attack-defense/useGame";
import type { GameRoom } from "./gameTypes";

export interface ResultsVm {
  outcome: "win" | "loss" | "draw";
  rounds: number;
  durationLabel: string;
  xp: number;
  myName: string;
  standings: { rank: number; name: string; subtitle: string; you?: boolean }[];
  timeline: { r: number; [key: string]: number }[];
  playerKeys: { id: string; name: string; color: string }[];
  mvp: { round: number; text: string };
  moments: string[];
}

export function buildResultsVm(
  room: GameRoom,
  myUserId: string | undefined,
  timeline: HpTimelineRow[],
  names: Record<string, string>
): ResultsVm {
  const me = room.players.find((p) => p.userId === myUserId || p.id === myUserId);
  const myName = me?.displayName ?? "You";
  const outcome =
    !room.winnerId ? "draw" : room.winnerId === me?.id || room.winnerId === me?.userId ? "win" : "loss";

  const sorted = [...room.players].sort((a, b) => {
    const aHp = a.houses.reduce((s, h) => s + (h.isDestroyed ? 0 : h.hp), 0);
    const bHp = b.houses.reduce((s, h) => s + (h.isDestroyed ? 0 : h.hp), 0);
    if (a.isEliminated !== b.isEliminated) return a.isEliminated ? 1 : -1;
    return bHp - aHp;
  });

  const colors = ["var(--energy)", "var(--attack)", "var(--defense)"];
  const playerKeys = sorted.map((p, i) => ({
    id: p.id,
    name: p.displayName,
    color: colors[i] ?? "var(--fg-mute)",
  }));

  const timelineRows = timeline.length
    ? timeline.map((row) => {
        const out: { r: number; [key: string]: number } = { r: row.r };
        for (const pk of playerKeys) {
          out[pk.id] = typeof row[pk.id] === "number" ? row[pk.id] : 0;
        }
        return out;
      })
    : [{ r: room.round, ...Object.fromEntries(playerKeys.map((pk) => [pk.id, 18])) }];

  return {
    outcome,
    rounds: room.round,
    durationLabel: "—",
    xp: outcome === "win" ? 24 : outcome === "draw" ? 12 : 8,
    myName,
    standings: sorted.map((p, i) => ({
      rank: i + 1,
      name: p.displayName,
      subtitle: p.isEliminated ? `eliminated · ${p.houses.filter((h) => h.isDestroyed).length} houses down` : `${p.houses.filter((h) => !h.isDestroyed).length} houses · ${p.energy}⚡`,
      you: p.id === me?.id,
    })),
    timeline: timelineRows,
    playerKeys,
    mvp: { round: Math.max(1, room.round - 1), text: room.roundLog?.[0]?.message ?? "A decisive round." },
    moments: (room.roundLog ?? []).slice(0, 4).map((e) => e.message),
  };
}
