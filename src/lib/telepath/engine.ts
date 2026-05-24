import type {
  Container,
  FeatureId,
  FeatureStatus,
  MatchState,
  PlayerColor,
  RoundDelta,
  RoundMove,
  TransferSubmission,
} from "./types";
import { FEATURE_NAMES } from "./types";

const COLORS: PlayerColor[] = ["red", "blue", "green"];
export const STARTING_UNITS = 8;

const BOT_NAMES: Record<PlayerColor, string> = {
  red: "Ember",
  blue: "Cipher",
  green: "Nova",
};

export function createInitialMatch(
  humanColor: PlayerColor,
  humanName = "You"
): MatchState {
  const containers = {} as Record<PlayerColor, Container>;
  for (const color of COLORS) {
    containers[color] = freshContainer(color);
  }

  const displayNames: Record<PlayerColor, string> = {
    red: BOT_NAMES.red,
    blue: BOT_NAMES.blue,
    green: BOT_NAMES.green,
  };
  displayNames[humanColor] = humanName;

  return {
    matchId: `solo-${Date.now()}`,
    round: 1,
    containers,
    humanColor,
    winner: null,
    lastRoundLog: [
      `Match live — ${STARTING_UNITS} units each. Outguess two rivals before your container hits zero.`,
    ],
    lastRoundMoves: [],
    lastRoundDeltas: [],
    displayNames,
    pressureStreak: 0,
  };
}

function freshContainer(color: PlayerColor): Container {
  return {
    color,
    units: STARTING_UNITS,
    redUnits: 0,
    greenUnits: 0,
    blueUnits: 0,
    blockTransfer: "unused",
    anonTransfer: "unused",
    mutualIncrease: "unused",
    reversal: "unused",
    status: "ready",
  };
}

function otherColors(color: PlayerColor): [PlayerColor, PlayerColor] {
  return COLORS.filter((c) => c !== color) as [PlayerColor, PlayerColor];
}

function incomingKey(from: PlayerColor): "redUnits" | "greenUnits" | "blueUnits" {
  return `${from}Units` as "redUnits" | "greenUnits" | "blueUnits";
}

function toTargetKey(color: PlayerColor): "toRed" | "toGreen" | "toBlue" {
  if (color === "red") return "toRed";
  if (color === "green") return "toGreen";
  return "toBlue";
}

function amountTo(
  submission: TransferSubmission,
  target: PlayerColor
): number {
  if (target === "red") return submission.toRed;
  if (target === "green") return submission.toGreen;
  return submission.toBlue;
}

function unusedPowers(c: Container): FeatureId[] {
  const out: FeatureId[] = [];
  if (c.blockTransfer === "unused") out.push(0);
  if (c.anonTransfer === "unused") out.push(1);
  if (c.mutualIncrease === "unused") out.push(2);
  if (c.reversal === "unused") out.push(3);
  return out;
}

function threatScore(box: Container): number {
  const powers = unusedPowers(box).length;
  return box.units * 3 + powers * 2;
}

export function applySubmission(
  state: MatchState,
  color: PlayerColor,
  submission: TransferSubmission
): MatchState {
  const next = structuredClone(state);
  const container = next.containers[color];
  const [o1, o2] = otherColors(color);

  container.status = "intransfer";
  if (submission.feature !== null) {
    const featKey =
      submission.feature === 0
        ? "blockTransfer"
        : submission.feature === 1
          ? "anonTransfer"
          : submission.feature === 2
            ? "mutualIncrease"
            : "reversal";
    if (container[featKey] === "unused") container[featKey] = "active";
  }

  const amounts: Record<PlayerColor, number> = {
    red: submission.toRed,
    green: submission.toGreen,
    blue: submission.toBlue,
  };

  for (const target of [o1, o2]) {
    const amt = amounts[target];
    if (amt > 0) {
      const key = incomingKey(color);
      next.containers[target][key] = amt;
    }
  }

  return next;
}

export function botSubmission(
  color: PlayerColor,
  state: MatchState
): TransferSubmission {
  const self = state.containers[color];
  const [o1, o2] = otherColors(color);
  const human = state.humanColor;

  const opponents: [PlayerColor, PlayerColor] =
    threatScore(state.containers[o2]) > threatScore(state.containers[o1])
      ? [o2, o1]
      : [o1, o2];

  const primary = opponents[0];
  const secondary = opponents[1];
  const pBox = state.containers[primary];
  const sBox = state.containers[secondary];

  const totalAlive = COLORS.reduce((s, c) => s + state.containers[c].units, 0);
  const share = self.units / Math.max(1, totalAlive);

  let spendRatio = 0.55;
  if (share < 0.28) spendRatio = 0.85;
  else if (share > 0.4) spendRatio = 0.45;
  if (self.units <= 2) spendRatio = 0.35;
  if (pBox.units <= 2) spendRatio = Math.min(0.95, spendRatio + 0.25);

  const jitter = 0.75 + Math.random() * 0.35;
  let spend = Math.min(
    self.units,
    Math.max(self.units > 0 && state.round > 1 ? 1 : 0, Math.floor(self.units * spendRatio * jitter))
  );

  if (self.units >= 4 && spend === 0) spend = 1 + Math.floor(Math.random() * 2);

  let toPrimary: number;
  let toSecondary: number;

  if (pBox.units <= 2 && sBox.units > 2) {
    toPrimary = Math.min(spend, Math.ceil(spend * 0.75));
    toSecondary = spend - toPrimary;
  } else if (primary === human && state.round >= 3) {
    toPrimary = Math.min(spend, Math.ceil(spend * (0.5 + Math.random() * 0.25)));
    toSecondary = spend - toPrimary;
  } else {
    toPrimary = Math.floor(spend * (0.5 + Math.random() * 0.35));
    toSecondary = spend - toPrimary;
  }

  const submission: TransferSubmission = {
    toRed: 0,
    toGreen: 0,
    toBlue: 0,
    feature: null,
  };
  submission[toTargetKey(primary)] = toPrimary;
  submission[toTargetKey(secondary)] = toSecondary;

  const available = unusedPowers(self);
  if (!available.length) return submission;

  const incomingOnSelf =
    state.containers[color].redUnits +
    state.containers[color].greenUnits +
    state.containers[color].blueUnits;

  if (
    available.includes(0) &&
    (self.units <= 3 || incomingOnSelf >= 2) &&
    Math.random() < 0.55
  ) {
    submission.feature = 0;
    return submission;
  }

  if (
    available.includes(3) &&
    self.units >= 2 &&
    (self.units + toPrimary + toSecondary) % 2 === 0 &&
    Math.random() < 0.4
  ) {
    submission.feature = 3;
    return submission;
  }

  if (
    available.includes(2) &&
    self.units <= 4 &&
    COLORS.filter((c) => state.containers[c].units <= 3).length >= 2 &&
    Math.random() < 0.35
  ) {
    submission.feature = 2;
    return submission;
  }

  if (available.includes(1) && spend >= 2 && Math.random() < 0.3) {
    submission.feature = 1;
    return submission;
  }

  if (Math.random() < 0.18) {
    submission.feature = available[Math.floor(Math.random() * available.length)]!;
  }

  return submission;
}

export function buildRoundMoves(
  state: MatchState,
  submissions: Record<PlayerColor, TransferSubmission>
): RoundMove[] {
  return COLORS.map((color) => {
    const sub = submissions[color];
    const anon = sub.feature === 1;
    return {
      color,
      displayName: state.displayNames[color],
      toRed: sub.toRed,
      toGreen: sub.toGreen,
      toBlue: sub.toBlue,
      feature: sub.feature,
      hiddenSender: anon && color !== state.humanColor,
    };
  });
}

export function resolveRound(
  state: MatchState,
  submissions: Record<PlayerColor, TransferSubmission>
): MatchState {
  const next = structuredClone(state);
  const log: string[] = [];
  const before: RoundDelta[] = COLORS.map((c) => ({
    color: c,
    before: next.containers[c].units,
    after: next.containers[c].units,
  }));

  next.lastRoundMoves = buildRoundMoves(state, submissions);

  for (const color of COLORS) {
    const sub = submissions[color];
    const name = next.displayNames[color];
    const parts: string[] = [];
    for (const target of COLORS) {
      if (target === color) continue;
      const amt = amountTo(sub, target);
      if (amt > 0) {
        const anon = sub.feature === 1 && color !== next.humanColor;
        parts.push(
          `${amt}→${anon ? "?" : colorLabel(target)}`
        );
      }
    }
    if (sub.feature !== null) {
      parts.push(FEATURE_NAMES[sub.feature]);
    }
    if (parts.length) {
      log.push(`${name}: ${parts.join(" · ")}`);
    } else {
      log.push(`${name}: held position`);
    }
  }

  const red = next.containers.red;
  const green = next.containers.green;
  const blue = next.containers.blue;

  let redUnits = red.units;
  let greenUnits = green.units;
  let blueUnits = blue.units;

  const greenInRed = red.greenUnits;
  const blueInRed = red.blueUnits;
  const redInGreen = green.redUnits;
  const blueInGreen = green.blueUnits;
  const redInBlue = blue.redUnits;
  const greenInBlue = blue.greenUnits;

  const baRed = red.blockTransfer === "active";
  const baGreen = green.blockTransfer === "active";
  const baBlue = blue.blockTransfer === "active";
  const atRed = red.anonTransfer === "active";
  const atGreen = green.anonTransfer === "active";
  const atBlue = blue.anonTransfer === "active";
  const mrRed = red.mutualIncrease === "active";
  const mrGreen = green.mutualIncrease === "active";
  const mrBlue = blue.mutualIncrease === "active";
  const revRed = red.reversal === "active";
  const revGreen = green.reversal === "active";
  const revBlue = blue.reversal === "active";

  redUnits -= redInGreen + redInBlue;
  greenUnits -= greenInRed + greenInBlue;
  blueUnits -= blueInRed + blueInGreen;

  log.push(
    `Outbound cost — R−${redInGreen + redInBlue} G−${greenInRed + greenInBlue} B−${blueInRed + blueInGreen}`
  );

  const applyIncomingDamage = (
    label: string,
    units: number,
    incoming: number,
    blocked: boolean
  ): number => {
    if (blocked || incoming <= 0) {
      if (blocked && incoming > 0) {
        log.push(`${label} blocked ${incoming} incoming — no damage.`);
      }
      return units;
    }
    const dmg = Math.min(units, incoming);
    if (dmg > 0) {
      log.push(`${label} took ${dmg} damage from ${incoming} incoming.`);
    }
    return units - dmg;
  };

  redUnits = applyIncomingDamage(
    colorLabel("red"),
    redUnits,
    greenInRed + blueInRed,
    baRed
  );
  greenUnits = applyIncomingDamage(
    colorLabel("green"),
    greenUnits,
    redInGreen + blueInGreen,
    baGreen
  );
  blueUnits = applyIncomingDamage(
    colorLabel("blue"),
    blueUnits,
    redInBlue + greenInBlue,
    baBlue
  );

  if (mrGreen || mrRed || mrBlue) {
    redUnits++;
    blueUnits++;
    greenUnits++;
    log.push("Mutual Increase — everyone gains +1 unit.");
  }

  const setFeature = (
    c: Container,
    key: "blockTransfer" | "anonTransfer" | "mutualIncrease" | "reversal",
    val: FeatureStatus
  ) => {
    c[key] = val;
  };

  if (baGreen) {
    setFeature(green, "blockTransfer", "used");
    log.push(`${colorLabel("green")} raised Block.`);
  } else setFeature(green, "blockTransfer", "unused");

  if (baRed) {
    setFeature(red, "blockTransfer", "used");
    log.push(`${colorLabel("red")} raised Block.`);
  } else setFeature(red, "blockTransfer", "unused");

  if (baBlue) {
    setFeature(blue, "blockTransfer", "used");
    log.push(`${colorLabel("blue")} raised Block.`);
  } else setFeature(blue, "blockTransfer", "unused");

  setFeature(red, "anonTransfer", atRed ? "used" : "unused");
  setFeature(green, "anonTransfer", atGreen ? "used" : "unused");
  setFeature(blue, "anonTransfer", atBlue ? "used" : "unused");
  if (atRed || atGreen || atBlue) {
    log.push("Anonymous transfer — senders stay hidden in the log.");
  }

  const applyReversal = (
    label: string,
    units: number,
    incoming: number,
    reversed: boolean
  ): number => {
    const total = units + incoming;
    if (reversed) {
      if (total % 2 !== 0) {
        log.push(`${label} Reversal — odd parity, −1 unit.`);
        return units - 1;
      }
      log.push(`${label} Reversal — parity held.`);
      return units;
    }
    if (total % 2 === 0) {
      log.push(`${label} parity crack — even total, −1 unit.`);
      return units - 1;
    }
    return units;
  };

  greenUnits = applyReversal(
    colorLabel("green"),
    greenUnits,
    redInGreen + blueInGreen,
    revGreen
  );
  if (revGreen) setFeature(green, "reversal", "used");
  else setFeature(green, "reversal", "unused");

  redUnits = applyReversal(
    colorLabel("red"),
    redUnits,
    greenInRed + blueInRed,
    revRed
  );
  if (revRed) setFeature(red, "reversal", "used");
  else setFeature(red, "reversal", "unused");

  blueUnits = applyReversal(
    colorLabel("blue"),
    blueUnits,
    redInBlue + greenInBlue,
    revBlue
  );
  if (revBlue) setFeature(blue, "reversal", "used");
  else setFeature(blue, "reversal", "unused");

  red.units = Math.max(0, redUnits);
  green.units = Math.max(0, greenUnits);
  blue.units = Math.max(0, blueUnits);

  for (const color of COLORS) {
    const c = next.containers[color];
    c.status = "ready";
    c.redUnits = 0;
    c.greenUnits = 0;
    c.blueUnits = 0;
  }

  next.lastRoundDeltas = before.map((d) => ({
    ...d,
    after: next.containers[d.color].units,
  }));

  for (const d of next.lastRoundDeltas) {
    const delta = d.after - d.before;
    if (delta !== 0) {
      log.push(
        `${colorLabel(d.color)} ${delta > 0 ? "+" : ""}${delta} → ${d.after} units`
      );
    }
  }

  const humanUnits = next.containers[next.humanColor].units;
  const lowest = Math.min(...COLORS.map((c) => next.containers[c].units));
  if (humanUnits <= lowest) {
    next.pressureStreak += 1;
    if (next.pressureStreak >= 2) {
      log.push("Pressure rising — you're trailing. Strike before they finish you.");
    }
  } else {
    next.pressureStreak = 0;
  }

  next.round += 1;
  next.lastRoundLog = log;

  const alive = COLORS.filter((c) => next.containers[c].units > 0);
  if (alive.length === 1) {
    next.winner = alive[0]!;
    const w = colorLabel(alive[0]!);
    next.lastRoundLog.push(
      alive[0] === next.humanColor
        ? "Victory — your container is the last one standing."
        : `${w} wins. Your mind-game ends here — run it back.`
    );
  } else if (alive.length === 0) {
    next.lastRoundLog.push("Mutual wipe — everyone hit zero. Chaos wins.");
  }

  return next;
}

export function commitRound(
  state: MatchState,
  humanSubmission: TransferSubmission
): MatchState {
  const submissions: Record<PlayerColor, TransferSubmission> = {
    [state.humanColor]: humanSubmission,
  } as Record<PlayerColor, TransferSubmission>;

  let working = applySubmission(state, state.humanColor, humanSubmission);
  for (const color of COLORS) {
    if (color === state.humanColor) continue;
    const botMove = botSubmission(color, working);
    submissions[color] = botMove;
    working = applySubmission(working, color, botMove);
  }

  return resolveRound(working, submissions);
}

export function allReady(state: MatchState): boolean {
  return COLORS.every((c) => state.containers[c].status === "intransfer");
}

export function colorLabel(c: PlayerColor): string {
  return c.charAt(0).toUpperCase() + c.slice(1);
}

export function botDisplayName(color: PlayerColor): string {
  return BOT_NAMES[color];
}
