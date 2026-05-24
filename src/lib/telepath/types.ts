export type PlayerColor = "red" | "blue" | "green";
export type FeatureStatus = "unused" | "active" | "used";
export type FeatureId = 0 | 1 | 2 | 3;

export const FEATURE_NAMES: Record<FeatureId, string> = {
  0: "Block Transfer",
  1: "Anonymous Transfer",
  2: "Mutual Increase",
  3: "Reversal",
};

export interface Container {
  color: PlayerColor;
  units: number;
  redUnits: number;
  greenUnits: number;
  blueUnits: number;
  blockTransfer: FeatureStatus;
  anonTransfer: FeatureStatus;
  mutualIncrease: FeatureStatus;
  reversal: FeatureStatus;
  status: "ready" | "intransfer";
}

export interface TransferSubmission {
  toGreen: number;
  toBlue: number;
  toRed: number;
  feature: FeatureId | null;
}

export interface RoundMove {
  color: PlayerColor;
  displayName: string;
  toRed: number;
  toGreen: number;
  toBlue: number;
  feature: FeatureId | null;
  hiddenSender?: boolean;
}

export interface RoundDelta {
  color: PlayerColor;
  before: number;
  after: number;
}

export interface MatchState {
  matchId: string;
  round: number;
  containers: Record<PlayerColor, Container>;
  humanColor: PlayerColor;
  winner: PlayerColor | null;
  lastRoundLog: string[];
  /** Moves from the most recently resolved round (for reveal UI). */
  lastRoundMoves: RoundMove[];
  /** Unit counts before last resolve (for animations). */
  lastRoundDeltas: RoundDelta[];
  displayNames: Record<PlayerColor, string>;
  /** Consecutive rounds human was lowest on units (pressure). */
  pressureStreak: number;
}
