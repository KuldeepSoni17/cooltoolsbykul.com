import type {
  Adjective,
  CoachLevel,
  Connector,
  Gender,
  Noun,
  NounTopic,
  TimeWord,
  Verb,
} from "@/lib/italian-coach/types";
import { adjectives as baseAdj, connectors as baseConn, timeWords as baseTime } from "./other";
import { nouns as baseNouns } from "./nouns";
import { pronouns as basePronouns } from "./pronouns";
import { verbs as baseVerbs } from "./verbs";
import { BULK_L2, BULK_L3, BULK_L4, BULK_L5, BULK_L6 } from "./bulk";

type NounRow = [id: string, sg: string, pl: string, en: string, g: Gender, topic?: NounTopic, art?: string];

function rowToNoun([id, sg, pl, en, g, topic, art]: NounRow, level: CoachLevel): Noun {
  return {
    id,
    singular: sg,
    plural: pl,
    english: en,
    gender: g,
    level,
    topic: topic as NounTopic | undefined,
    articleSingular: art,
  };
}

/** Default level for legacy base catalogue (foundation band) */
const BASE_NOUN_LEVEL: Record<string, CoachLevel> = {
  te: 1, caffe: 1, acqua: 1, pizza: 1, pane: 1, casa: 1, scuola: 1, io: 1,
};

const BASE_VERB_LEVEL: Record<string, CoachLevel> = {
  essere: 1, avere: 1, volere: 1, potere: 1, andare: 1, fare: 1, mangiare: 1, bere: 1,
  parlare: 1, stare: 1, vedere: 1, dire: 1, venire: 1,
};

function levelForVerb(id: string, defaultLevel: CoachLevel = 2): CoachLevel {
  return BASE_VERB_LEVEL[id] ?? defaultLevel;
}

function levelForNoun(id: string, defaultLevel: CoachLevel = 2): CoachLevel {
  return BASE_NOUN_LEVEL[id] ?? defaultLevel;
}

function levelForAdj(id: string, defaultLevel: CoachLevel = 2): CoachLevel {
  const l1 = new Set(["bello", "grande", "piccolo", "buono", "felice", "nuovo", "italiano"]);
  return l1.has(id) ? 1 : defaultLevel;
}

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of items) {
    map.set(item.id, item);
  }
  return Array.from(map.values());
}

export function assembleCatalog() {
  const pronouns = basePronouns.map((p) => ({ ...p, level: 1 as CoachLevel }));

  const verbs: Verb[] = dedupeById([
    ...baseVerbs.map((v) => ({ ...v, level: levelForVerb(v.id) })),
    ...BULK_L2.verbs,
    ...BULK_L3.verbs,
    ...BULK_L4.verbs,
    ...BULK_L5.verbs,
    ...BULK_L6.verbs,
  ]);

  const nouns: Noun[] = dedupeById([
    ...baseNouns.map((n) => ({ ...n, level: levelForNoun(n.id) })),
    ...BULK_L2.nouns.map((r) => rowToNoun(r as NounRow, 2)),
    ...BULK_L3.nouns.map((r) => rowToNoun(r as NounRow, 3)),
    ...BULK_L4.nouns.map((r) => rowToNoun(r as NounRow, 4)),
    ...BULK_L5.nouns.map((r) => rowToNoun(r as NounRow, 5)),
    ...BULK_L6.nouns.map((r) => rowToNoun(r as NounRow, 6)),
  ]);

  const adjectives: Adjective[] = dedupeById([
    ...baseAdj.map((a) => ({ ...a, level: levelForAdj(a.id) })),
    ...BULK_L2.adjectives,
    ...BULK_L3.adjectives,
    ...BULK_L4.adjectives,
    ...BULK_L5.adjectives,
    ...BULK_L6.adjectives,
  ]);

  const timeWords: TimeWord[] = dedupeById([
    ...baseTime.map((t) => ({
      ...t,
      level: (["oggi", "domani", "ieri", "ora", "sempre"].includes(t.id) ? 1 : 2) as CoachLevel,
    })),
    ...BULK_L2.timeWords,
    ...BULK_L3.timeWords,
    ...BULK_L4.timeWords,
    ...BULK_L5.timeWords,
    ...BULK_L6.timeWords,
  ]);

  const connectors: Connector[] = dedupeById([
    ...baseConn.map((c) => ({
      ...c,
      level: (["e", "ma", "con", "per", "di", "a", "in"].includes(c.id) ? 1 : 2) as CoachLevel,
    })),
    ...BULK_L2.connectors,
    ...BULK_L3.connectors,
    ...BULK_L4.connectors,
    ...BULK_L5.connectors,
    ...BULK_L6.connectors,
  ]);

  return { pronouns, verbs, nouns, adjectives, timeWords, connectors };
}
