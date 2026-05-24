export type Person = "io" | "tu" | "lui_lei" | "noi" | "voi" | "loro";
export type Gender = "m" | "f";

/** Six progressive bands — cumulative coverage ≈ 85% at level 6 */
export type CoachLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type NounTopic =
  | "food"
  | "place"
  | "person"
  | "body"
  | "object"
  | "nature"
  | "time"
  | "abstract"
  | "travel"
  | "work"
  | "health"
  | "clothing"
  | "home"
  | "communication";

export type Pronoun = {
  id: string;
  word: string;
  english: string;
  person: Person;
  plural: boolean;
  level: CoachLevel;
};

export type PronounEntry = Omit<Pronoun, "level">;

export type Verb = {
  id: string;
  infinitive: string;
  english: string;
  present: Record<Person, string>;
  level: CoachLevel;
};

/** Raw catalogue entries before level assembly */
export type VerbEntry = Omit<Verb, "level">;

export type Noun = {
  id: string;
  singular: string;
  plural: string;
  english: string;
  gender: Gender;
  level: CoachLevel;
  topic?: NounTopic;
  frequencyRank?: number;
  /** override for irregular article (e.g. lo studente) */
  articleSingular?: string;
};

export type NounEntry = Omit<Noun, "level">;

export type Adjective = {
  id: string;
  english: string;
  m_sg: string;
  f_sg: string;
  m_pl: string;
  f_pl: string;
  level: CoachLevel;
};

export type AdjectiveEntry = Omit<Adjective, "level">;
export type TimeWord = { id: string; word: string; english: string; level: CoachLevel };
export type TimeWordEntry = Omit<TimeWord, "level">;
export type Connector = { id: string; word: string; english: string; level: CoachLevel };
export type ConnectorEntry = Omit<Connector, "level">;
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
