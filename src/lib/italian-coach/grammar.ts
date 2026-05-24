import type { Adjective, Gender, Noun, Person, Pronoun, Verb } from "./types";

/** Resolve the definite article for a noun (singular or plural). */
export function definiteArticle(noun: Noun, plural = false): string {
  if (plural) {
    if (noun.gender === "f") return "le";
    // masculine plural: i / gli
    if (startsWithSpecialMasc(noun.plural) || startsWithVowel(noun.plural)) return "gli";
    return "i";
  }
  if (noun.articleSingular) return noun.articleSingular;
  if (noun.gender === "f") {
    return startsWithVowel(noun.singular) ? "l'" : "la";
  }
  if (startsWithVowel(noun.singular)) return "l'";
  if (startsWithSpecialMasc(noun.singular)) return "lo";
  return "il";
}

/** Resolve the indefinite article for a noun (singular). */
export function indefiniteArticle(noun: Noun): string {
  if (noun.gender === "f") {
    return startsWithVowel(noun.singular) ? "un'" : "una";
  }
  if (startsWithSpecialMasc(noun.singular)) return "uno";
  return "un";
}

function startsWithVowel(w: string): boolean {
  return /^[aeiouAEIOU]/.test(w.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
}

function startsWithSpecialMasc(w: string): boolean {
  const lower = w.toLowerCase();
  if (/^s[bcdfglmnpqrtv]/.test(lower)) return true; // s + consonant
  if (/^(z|gn|ps|pn|x|y)/.test(lower)) return true;
  return false;
}

/** Conjugate a verb in present tense for a given person. */
export function conjugate(verb: Verb, person: Person): string {
  return verb.present[person];
}

/** Get adjective form agreeing with gender and number. */
export function agreeAdjective(adj: Adjective, gender: Gender, plural: boolean): string {
  if (gender === "m" && !plural) return adj.m_sg;
  if (gender === "m" && plural) return adj.m_pl;
  if (gender === "f" && !plural) return adj.f_sg;
  return adj.f_pl;
}

export function personOfPronoun(p: Pronoun): Person {
  return p.person;
}

/** Pretty-print a phrase with article: e.g. "la casa", "lo studente". */
export function withArticle(noun: Noun, plural = false): string {
  const art = definiteArticle(noun, plural);
  const form = plural ? noun.plural : noun.singular;
  // l' merges with following vowel
  if (art === "l'") return `l'${form}`;
  return `${art} ${form}`;
}

/** Combine article + adjective + noun with proper agreement. */
export function nounPhrase(noun: Noun, adj?: Adjective, plural = false): string {
  const art = definiteArticle(noun, plural);
  const nounWord = plural ? noun.plural : noun.singular;
  const head = art === "l'" ? `l'${nounWord}` : `${art} ${nounWord}`;
  if (!adj) return head;
  const form = agreeAdjective(adj, noun.gender, plural);
  return `${head} ${form}`;
}

/** Verify that a person/verb pair is correctly conjugated. */
export function verbMatchesPerson(verb: Verb, person: Person, candidate: string): boolean {
  return normalize(verb.present[person]) === normalize(candidate);
}

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['']/g, "'")
    .replace(/[.,!?;:]/g, "")
    .replace(/\s+/g, " ");
}
