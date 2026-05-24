export type Person = "io" | "tu" | "lui_lei" | "noi" | "voi" | "loro";
export type Gender = "m" | "f";

export type Pronoun = {
  id: string;
  word: string;
  english: string;
  person: Person;
  plural: boolean;
};

export type Verb = {
  id: string;
  infinitive: string;
  english: string;
  present: Record<Person, string>;
};

export type Noun = {
  id: string;
  singular: string;
  plural: string;
  english: string;
  gender: Gender;
  /** override for irregular article (e.g. lo studente) */
  articleSingular?: string;
};

export type Adjective = {
  id: string;
  english: string;
  /** masculine singular base */
  m_sg: string;
  f_sg: string;
  m_pl: string;
  f_pl: string;
};

export type TimeWord = { id: string; word: string; english: string };
export type Connector = { id: string; word: string; english: string };
export type ArticleWord = { id: string; word: string; english: string; gender?: Gender; plural?: boolean };

export type WordType =
  | "pronoun"
  | "verb"
  | "noun"
  | "adjective"
  | "time"
  | "connector"
  | "article";

/** A flat representation used by the chip / palette UI. */
export type DisplayWord = {
  id: string;
  word: string;
  english: string;
  type: WordType;
  /** optional metadata used for sentence rendering */
  meta?: {
    person?: Person;
    pronounId?: string;
    verbId?: string;
    nounId?: string;
    adjectiveId?: string;
    gender?: Gender;
    plural?: boolean;
  };
};

/** A logical item the user has placed in the sentence builder. */
export type BuiltItem = {
  uid: string;
  kind: WordType;
  /** stable id referring to vocab entry */
  refId: string;
  /** the surface form to render, possibly conjugated/agreed */
  surface: string;
  english: string;
};

export type CompressionStats = {
  wordsKnown: number;
  patternsKnown: number;
  possibleSentences: number;
};

export type GeneratedPhrase = {
  italian: string;
  english: string;
  templateId: string;
};

export type SentenceTemplate = {
  id: string;
  label: string;
  structure: string;
  slots: ("SUBJECT" | "VERB" | "OBJECT" | "ADJECTIVE" | "TIME")[];
  examples: string[];
  difficulty: 1 | 2 | 3;
  orderVariants?: ("default" | "time-first" | "verb-first" | "drop-subject")[];
};
