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

export interface MatchState {
  matchId: string;
  round: number;
  containers: Record<PlayerColor, Container>;
  humanColor: PlayerColor;
  winner: PlayerColor | null;
  lastRoundLog: string[];
}
