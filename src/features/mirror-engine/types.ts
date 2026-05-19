export type ScoreBand = "Strong" | "Growing" | "Developing" | "Needs attention";

export type QuestionType =
  | "likert"
  | "scenario"
  | "spectrum"
  | "multiselect"
  | "reflection";

export type ScoredOption = {
  label: string;
  score: 1 | 2 | 3 | 4;
  flag?: string;
};

export type LikertQuestion = {
  kind: "question";
  id: string;
  type: "likert";
  domainId: string;
  domainName: string;
  domainNumber: number;
  prompt: string;
  subtext?: string;
  options: ScoredOption[];
  reverseCoded?: boolean;
};

export type ScenarioQuestion = {
  kind: "question";
  id: string;
  type: "scenario";
  domainId: string;
  domainName: string;
  domainNumber: number;
  prompt: string;
  subtext?: string;
  vignettes: ScoredOption[];
};

export type SpectrumQuestion = {
  kind: "question";
  id: string;
  type: "spectrum";
  domainId: string;
  domainName: string;
  domainNumber: number;
  prompt: string;
  subtext?: string;
  leftLabel: string;
  rightLabel: string;
  flagBelow?: number;
};

export type MultiSelectQuestion = {
  kind: "question";
  id: string;
  type: "multiselect";
  domainId: string;
  domainName: string;
  domainNumber: number;
  prompt: string;
  subtext?: string;
  options: { label: string; weight: number }[];
};

export type ReflectionQuestion = {
  kind: "question";
  id: string;
  type: "reflection";
  domainId: string;
  domainName: string;
  domainNumber: number;
  prompt: string;
  subtext?: string;
  placeholder?: string;
};

export type DomainInterstitial = {
  kind: "interstitial";
  domainId: string;
  domainName: string;
  domainNumber: number;
  totalDomains: number;
  framing: string;
};

export type AceExplainer = {
  kind: "explainer";
  id: string;
  title: string;
  body: string;
};

export type AssessmentStep =
  | DomainInterstitial
  | AceExplainer
  | LikertQuestion
  | ScenarioQuestion
  | SpectrumQuestion
  | MultiSelectQuestion
  | ReflectionQuestion;

export type AnswerValue =
  | { type: "choice"; index: number }
  | { type: "spectrum"; value: number }
  | { type: "multiselect"; indices: number[] }
  | { type: "reflection"; text: string }
  | { type: "skipped" };

export type DomainResult = {
  domainId: string;
  domainName: string;
  percent: number;
  label: ScoreBand;
};

export type ProfileBand = {
  id: string;
  name: string;
  oneLiner: string;
  guidance: string;
};

export type MirrorTheme = {
  accent: string;
  accentLight: string;
  accentDim: string;
};

export type ResearchPanel = {
  domainId: string;
  title: string;
  paragraphs: string[];
  action: string;
};

export type LeverageMove = {
  questionId: string;
  prompt: string;
  domainName: string;
  suggestion: string;
};

export type AssessmentResults = {
  domains: DomainResult[];
  profile: ProfileBand;
  flags: string[];
  leverage: LeverageMove[];
  reflections: Record<string, string>;
  completedAt: string;
};

export type AssessmentConfig = {
  id: string;
  title: string;
  storageKey: string;
  totalDomains: number;
  steps: AssessmentStep[];
  profiles: ProfileBand[];
  research: ResearchPanel[];
  theme?: MirrorTheme;
  resultsPath?: string;
  comparePath?: string;
};
