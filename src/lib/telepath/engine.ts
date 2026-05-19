import type { Container, FeatureId, FeatureStatus, MatchState, PlayerColor, TransferSubmission } from "./types";

const COLORS: PlayerColor[] = ["red", "blue", "green"];

export function createInitialMatch(humanColor: PlayerColor): MatchState {
  const containers = {} as Record<PlayerColor, Container>;
  for (const color of COLORS) {
    containers[color] = freshContainer(color);
  }
  return {
    matchId: `solo-${Date.now()}`,
    round: 1,
    containers,
    humanColor,
    winner: null,
    lastRoundLog: ["Match started. Each player begins with 5 units."],
  };
}

function freshContainer(color: PlayerColor): Container {
  return {
    color,
    units: 5,
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

export function botSubmission(color: PlayerColor, containers: Record<PlayerColor, Container>): TransferSubmission {
  const self = containers[color];
  const [o1, o2] = otherColors(color);
  const spend = Math.min(self.units, Math.floor(Math.random() * 4));
  const a = Math.floor(Math.random() * (spend + 1));
  const b = spend - a;

  const submission: TransferSubmission = { toRed: 0, toGreen: 0, toBlue: 0, feature: null };
  submission[toTargetKey(o1)] = a;
  submission[toTargetKey(o2)] = b;

  const features: FeatureId[] = [];
  if (self.blockTransfer === "unused") features.push(0);
  if (self.anonTransfer === "unused") features.push(1);
  if (self.mutualIncrease === "unused") features.push(2);
  if (self.reversal === "unused") features.push(3);
  if (features.length && Math.random() < 0.35) {
    submission.feature = features[Math.floor(Math.random() * features.length)]!;
  }
  return submission;
}

function capitalize(c: PlayerColor): string {
  return c.charAt(0).toUpperCase() + c.slice(1);
}

function toTargetKey(color: PlayerColor): "toRed" | "toGreen" | "toBlue" {
  if (color === "red") return "toRed";
  if (color === "green") return "toGreen";
  return "toBlue";
}

export function resolveRound(state: MatchState): MatchState {
  const next = structuredClone(state);
  const log: string[] = [];

  const red = next.containers.red;
  const green = next.containers.green;
  const blue = next.containers.blue;

  let redUnits = red.units;
  let greenUnits = green.units;
  let blueUnits = blue.units;

  let greenInRed = red.greenUnits;
  let blueInRed = red.blueUnits;
  let redInGreen = green.redUnits;
  let blueInGreen = green.blueUnits;
  let redInBlue = blue.redUnits;
  let greenInBlue = blue.greenUnits;

  let baRed = red.blockTransfer === "active" ? 1 : 0;
  let baGreen = green.blockTransfer === "active" ? 1 : 0;
  let baBlue = blue.blockTransfer === "active" ? 1 : 0;
  let atRed = red.anonTransfer === "active" ? 1 : 0;
  let atGreen = green.anonTransfer === "active" ? 1 : 0;
  let atBlue = blue.anonTransfer === "active" ? 1 : 0;
  let mrRed = red.mutualIncrease === "active" ? 1 : 0;
  let mrGreen = green.mutualIncrease === "active" ? 1 : 0;
  let mrBlue = blue.mutualIncrease === "active" ? 1 : 0;
  let revRed = red.reversal === "active" ? 1 : 0;
  let revGreen = green.reversal === "active" ? 1 : 0;
  let revBlue = blue.reversal === "active" ? 1 : 0;

  redUnits -= redInGreen + redInBlue;
  greenUnits -= greenInRed + greenInBlue;
  blueUnits -= blueInRed + blueInGreen;

  if (mrGreen || mrRed || mrBlue) {
    redUnits++;
    blueUnits++;
    greenUnits++;
    log.push("Mutual Increase: all players gained 1 unit.");
  }

  const setFeature = (
    c: Container,
    key: "blockTransfer" | "anonTransfer" | "mutualIncrease" | "reversal",
    val: FeatureStatus
  ) => {
    c[key] = val;
  };

  if (baGreen) {
    blueInGreen = 0;
    redInGreen = 0;
    setFeature(green, "blockTransfer", "used");
    log.push("Green blocked incoming transfers.");
  } else setFeature(green, "blockTransfer", "unused");

  if (baRed) {
    greenInRed = 0;
    blueInRed = 0;
    setFeature(red, "blockTransfer", "used");
    log.push("Red blocked incoming transfers.");
  } else setFeature(red, "blockTransfer", "unused");

  if (baBlue) {
    redInBlue = 0;
    greenInBlue = 0;
    setFeature(blue, "blockTransfer", "used");
    log.push("Blue blocked incoming transfers.");
  } else setFeature(blue, "blockTransfer", "unused");

  setFeature(red, "anonTransfer", atRed ? "used" : "unused");
  setFeature(green, "anonTransfer", atGreen ? "used" : "unused");
  setFeature(blue, "anonTransfer", atBlue ? "used" : "unused");

  if (revGreen) {
    setFeature(green, "reversal", "used");
    if ((greenUnits + redInGreen + blueInGreen) % 2 !== 0) greenUnits--;
    else log.push("Green Reversal shifted parity.");
  } else {
    setFeature(green, "reversal", "unused");
    if ((greenUnits + redInGreen + blueInGreen) % 2 === 0) greenUnits--;
  }

  if (revRed) {
    setFeature(red, "reversal", "used");
    if ((redUnits + greenInRed + blueInRed) % 2 !== 0) redUnits--;
  } else {
    setFeature(red, "reversal", "unused");
    if ((redUnits + greenInRed + blueInRed) % 2 === 0) redUnits--;
  }

  if (revBlue) {
    setFeature(blue, "reversal", "used");
    if ((blueUnits + greenInBlue + redInBlue) % 2 !== 0) blueUnits--;
  } else {
    setFeature(blue, "reversal", "unused");
    if ((blueUnits + greenInBlue + redInBlue) % 2 === 0) blueUnits--;
  }

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

  next.round += 1;
  next.lastRoundLog = log.length ? log : ["Round resolved."];

  const alive = COLORS.filter((c) => next.containers[c].units > 0);
  if (alive.length === 1) {
    next.winner = alive[0]!;
    next.lastRoundLog.push(`${colorLabel(alive[0]!)} wins!`);
  }

  return next;
}

export function allReady(state: MatchState): boolean {
  return COLORS.every((c) => state.containers[c].status === "intransfer");
}

export function colorLabel(c: PlayerColor): string {
  return c.charAt(0).toUpperCase() + c.slice(1);
}
