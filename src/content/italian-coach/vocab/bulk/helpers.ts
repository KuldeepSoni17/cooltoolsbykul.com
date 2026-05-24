import { verbAre, verbEre, verbIre, verbIreSc } from "@/lib/italian-coach/verb-helpers";
import type { Adjective, CoachLevel, Connector, TimeWord, Verb } from "@/lib/italian-coach/types";

export type NounRow = [string, string, string, string, "m" | "f", string?, string?];

export type BulkPack = {
  verbs: Verb[];
  nouns: NounRow[];
  adjectives: Adjective[];
  timeWords: TimeWord[];
  connectors: Connector[];
};

export function vAre(id: string, inf: string, stem: string, en: string, level: CoachLevel): Verb {
  return { ...verbAre(id, inf, stem, en), level };
}
export function vEre(id: string, inf: string, stem: string, en: string, level: CoachLevel): Verb {
  return { ...verbEre(id, inf, stem, en), level };
}
export function vIre(id: string, inf: string, stem: string, en: string, level: CoachLevel): Verb {
  return { ...verbIre(id, inf, stem, en), level };
}
export function vIsc(id: string, inf: string, stem: string, en: string, level: CoachLevel): Verb {
  return { ...verbIreSc(id, inf, stem, en), level };
}

export function adj(
  id: string,
  en: string,
  m: string,
  f: string,
  mpl: string,
  fpl: string,
  level: CoachLevel,
): Adjective {
  return { id, english: en, m_sg: m, f_sg: f, m_pl: mpl, f_pl: fpl, level };
}

export function tw(id: string, word: string, en: string, level: CoachLevel): TimeWord {
  return { id, word, english: en, level };
}

export function conn(id: string, word: string, en: string, level: CoachLevel): Connector {
  return { id, word, english: en, level };
}

/** Plural heuristics for regular nouns */
export function pl(sg: string, g: "m" | "f"): string {
  if (sg.endsWith("à") || sg.endsWith("a")) return sg.slice(0, -1) + "e";
  if (sg.endsWith("o")) return sg.slice(0, -1) + "i";
  if (sg.endsWith("e")) return sg.slice(0, -1) + "i";
  if (sg.endsWith("ca")) return sg.slice(0, -2) + "che";
  return sg;
}

export function n(
  id: string,
  sg: string,
  en: string,
  g: "m" | "f",
  topic?: string,
  customPl?: string,
  art?: string,
): NounRow {
  const plural =
    customPl && customPl !== "undefined" ? customPl : pl(sg, g);
  const article = art && art !== "undefined" ? art : undefined;
  return [id, sg, plural, en, g, topic, article];
}
