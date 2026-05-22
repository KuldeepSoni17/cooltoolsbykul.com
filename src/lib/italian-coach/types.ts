export type WordType =
  | "noun"
  | "verb"
  | "pronoun"
  | "adjective"
  | "connector"
  | "time"
  | "operator"
  | "article";

export type DictionaryWord = {
  id: string;
  word: string;
  english: string;
  type: WordType;
  root?: string;
  difficulty: 1 | 2 | 3;
  frequencyRank: number;
  tags: string[];
};

export type SentenceTemplate = {
  id: string;
  label: string;
  structure: string;
  slots: ("SUBJECT" | "VERB" | "OBJECT" | "ADJECTIVE" | "TIME")[];
  examples: string[];
  difficulty: 1 | 2 | 3;
  /** Alternate valid orderings (e.g. time-first) */
  orderVariants?: ("default" | "time-first" | "verb-first")[];
};

export type GeneratedPhrase = {
  italian: string;
  english: string;
  templateId: string;
};

export type CompressionStats = {
  wordsKnown: number;
  patternsKnown: number;
  possibleSentences: number;
};

export type GameFeedback = {
  ok: boolean;
  message: string;
  nativeHint?: string;
};
