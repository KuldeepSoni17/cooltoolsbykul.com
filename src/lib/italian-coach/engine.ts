import {
  adjectives,
  connectors,
  nouns,
  pronouns,
  timeWords,
  verbs,
} from "@/content/italian-coach/vocab";
import { agreeAdjective, conjugate, definiteArticle, normalize } from "./grammar";
import type {
  BuiltItem,
  CompressionStats,
  DisplayWord,
  GeneratedPhrase,
  Person,
  SentenceTemplate,
  WordType,
} from "./types";

/* ---------------- Flattened display catalogue ---------------- */

export function getAllDisplayWords(): DisplayWord[] {
  const out: DisplayWord[] = [];
  for (const p of pronouns) {
    out.push({ id: pronounUid(p.id), word: p.word, english: p.english, type: "pronoun", meta: { person: p.person, pronounId: p.id } });
  }
  for (const v of verbs) {
    for (const person of PERSONS) {
      out.push({
        id: verbFormUid(v.id, person),
        word: v.present[person],
        english: `${v.english} (${personLabel(person)})`,
        type: "verb",
        meta: { verbId: v.id, person },
      });
    }
  }
  for (const n of nouns) {
    out.push({
      id: nounUid(n.id),
      word: n.singular,
      english: n.english,
      type: "noun",
      meta: { nounId: n.id, gender: n.gender, plural: false },
    });
  }
  for (const a of adjectives) {
    out.push({ id: adjUid(a.id), word: a.m_sg, english: a.english, type: "adjective", meta: { adjectiveId: a.id } });
  }
  for (const t of timeWords) {
    out.push({ id: t.id, word: t.word, english: t.english, type: "time" });
  }
  for (const c of connectors) {
    out.push({ id: c.id, word: c.word, english: c.english, type: "connector" });
  }
  // explicit articles
  out.push({ id: "art_il", word: "il", english: "the (m. sg)", type: "article" });
  out.push({ id: "art_lo", word: "lo", english: "the (m. sg, s+cons.)", type: "article" });
  out.push({ id: "art_la", word: "la", english: "the (f. sg)", type: "article" });
  out.push({ id: "art_l", word: "l'", english: "the (before vowel)", type: "article" });
  out.push({ id: "art_i", word: "i", english: "the (m. pl)", type: "article" });
  out.push({ id: "art_gli", word: "gli", english: "the (m. pl, vowel/special)", type: "article" });
  out.push({ id: "art_le", word: "le", english: "the (f. pl)", type: "article" });
  return out;
}

export const PERSONS: Person[] = ["io", "tu", "lui_lei", "noi", "voi", "loro"];

export function personLabel(p: Person): string {
  if (p === "lui_lei") return "he/she";
  return p;
}

export const pronounUid = (id: string) => `pr_${id}`;
export const verbFormUid = (verbId: string, person: Person) => `vb_${verbId}_${person}`;
export const nounUid = (id: string) => `n_${id}`;
export const adjUid = (id: string) => `aj_${id}`;

/* ---------------- Default unlock set (Level 1 only) ---------------- */

export const DEFAULT_KNOWN_IDS: string[] = [
  ...pronouns.map((p) => pronounUid(p.id)),
  ...verbs.filter((v) => v.level === 1).flatMap((v) => PERSONS.map((p) => verbFormUid(v.id, p))),
  ...nouns.filter((n) => n.level === 1).map((n) => nounUid(n.id)),
  ...adjectives.filter((a) => a.level === 1).map((a) => adjUid(a.id)),
  ...timeWords.filter((t) => t.level === 1).map((t) => t.id),
  ...connectors.filter((c) => c.level === 1).map((c) => c.id),
  "art_il",
  "art_lo",
  "art_la",
  "art_l",
  "art_i",
  "art_gli",
  "art_le",
];

/* ---------------- Templates ---------------- */

export const sentenceTemplates: SentenceTemplate[] = [
  {
    id: "sv",
    label: "Subject + Verb",
    structure: "[SUBJECT] [VERB]",
    slots: ["SUBJECT", "VERB"],
    examples: ["Io mangio", "Noi andiamo"],
    difficulty: 1,
    orderVariants: ["default", "drop-subject"],
  },
  {
    id: "svo",
    label: "Subject + Verb + Object",
    structure: "[SUBJECT] [VERB] [OBJECT]",
    slots: ["SUBJECT", "VERB", "OBJECT"],
    examples: ["Io mangio la pizza", "Noi beviamo caffè"],
    difficulty: 1,
    orderVariants: ["default", "drop-subject"],
  },
  {
    id: "sv_adj",
    label: "Subject + Verb + Adjective",
    structure: "[SUBJECT] [VERB] [ADJECTIVE]",
    slots: ["SUBJECT", "VERB", "ADJECTIVE"],
    examples: ["La casa è grande", "Il libro è bello"],
    difficulty: 1,
  },
  {
    id: "tsv",
    label: "Time + Subject + Verb",
    structure: "[TIME] [SUBJECT] [VERB]",
    slots: ["TIME", "SUBJECT", "VERB"],
    examples: ["Oggi mangio", "Domani andiamo"],
    difficulty: 2,
    orderVariants: ["default", "time-first"],
  },
  {
    id: "tsvo",
    label: "Time + Subject + Verb + Object",
    structure: "[TIME] [SUBJECT] [VERB] [OBJECT]",
    slots: ["TIME", "SUBJECT", "VERB", "OBJECT"],
    examples: ["Oggi mangio la pizza", "Domani vediamo Roma"],
    difficulty: 2,
    orderVariants: ["default", "time-first", "drop-subject"],
  },
];

/* ---------------- Compression stats ---------------- */

export function computeCompression(knownIds: Set<string>): CompressionStats {
  const hasPronoun = pronouns.some((p) => knownIds.has(pronounUid(p.id)));
  const hasNoun = nouns.some((n) => knownIds.has(nounUid(n.id)));
  const hasAdj = adjectives.some((a) => knownIds.has(adjUid(a.id)));
  const hasTime = timeWords.some((t) => knownIds.has(t.id));

  // a verb counts as "known" if any of its conjugated forms is unlocked
  const knownVerbs = verbs.filter((v) => PERSONS.some((p) => knownIds.has(verbFormUid(v.id, p))));
  const hasVerb = knownVerbs.length > 0;

  let patterns = 0;
  if (hasPronoun && hasVerb) patterns += 1; // SV
  if (hasPronoun && hasVerb && hasNoun) patterns += 1; // SVO
  if (hasPronoun && hasVerb && hasAdj) patterns += 1; // SV+Adj
  if (hasTime && hasPronoun && hasVerb) patterns += 1; // TSV
  if (hasTime && hasPronoun && hasVerb && hasNoun) patterns += 1; // TSVO

  const subjects = pronouns.filter((p) => knownIds.has(pronounUid(p.id))).length;
  const nounsCount = nouns.filter((n) => knownIds.has(nounUid(n.id))).length;
  const adjCount = adjectives.filter((a) => knownIds.has(adjUid(a.id))).length;
  const timeCount = timeWords.filter((t) => knownIds.has(t.id)).length;
  const verbCount = knownVerbs.length;

  let possible = 0;
  if (hasPronoun && hasVerb) possible += subjects * verbCount;
  if (hasPronoun && hasVerb && hasNoun) possible += subjects * verbCount * nounsCount * 2; // *2 for word-order variants
  if (hasPronoun && hasVerb && hasAdj) possible += subjects * verbCount * adjCount;
  if (hasTime && hasPronoun && hasVerb) possible += timeCount * subjects * verbCount * 2;
  if (hasTime && hasPronoun && hasVerb && hasNoun)
    possible += timeCount * subjects * verbCount * nounsCount * 2;

  const wordsKnown = knownIds.size;
  return { wordsKnown, patternsKnown: patterns, possibleSentences: Math.max(possible, wordsKnown) };
}

/* ---------------- Phrase generation ---------------- */

export function generatePhrases(knownIds: Set<string>, limit = 12): GeneratedPhrase[] {
  const out: GeneratedPhrase[] = [];
  const seen = new Set<string>();

  const knownPronouns = pronouns.filter((p) => knownIds.has(pronounUid(p.id)));
  const knownNouns = nouns.filter((n) => knownIds.has(nounUid(n.id)));
  const knownVerbs = verbs.filter((v) => PERSONS.some((p) => knownIds.has(verbFormUid(v.id, p))));
  const knownAdj = adjectives.filter((a) => knownIds.has(adjUid(a.id)));
  const knownTime = timeWords.filter((t) => knownIds.has(t.id));

  const push = (italian: string, english: string, templateId: string) => {
    const key = normalize(italian);
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ italian: capitalize(italian), english, templateId });
  };

  // SVO
  outer: for (const pr of knownPronouns) {
    for (const v of knownVerbs) {
      for (const n of knownNouns) {
        if (out.length >= limit) break outer;
        const form = conjugate(v, pr.person);
        push(`${pr.word} ${form} ${n.singular}`, `${pr.english} ${v.english.replace(/^to /, "")} ${n.english}`, "svo");
      }
    }
  }

  // SV+adj for nouns (with article)
  outer2: for (const n of knownNouns) {
    for (const a of knownAdj) {
      if (out.length >= limit) break outer2;
      const art = definiteArticle(n);
      const adjForm = agreeAdjective(a, n.gender, false);
      const head = art === "l'" ? `l'${n.singular}` : `${art} ${n.singular}`;
      push(`${head} è ${adjForm}`, `the ${n.english} is ${a.english}`, "sv_adj");
    }
  }

  // Time + SV
  outer3: for (const t of knownTime) {
    for (const pr of knownPronouns) {
      for (const v of knownVerbs) {
        if (out.length >= limit) break outer3;
        const form = conjugate(v, pr.person);
        push(`${t.word} ${pr.word} ${form}`, `${t.english} ${pr.english} ${v.english.replace(/^to /, "")}`, "tsv");
      }
    }
  }

  return out;
}

function capitalize(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ---------------- Sentence builder validation ---------------- */

/**
 * Structural validation:
 * - extracts subject pronouns and verbs in built order, checks they agree
 * - extracts (article, noun) pairs, checks article agrees with gender
 * - extracts (noun, adjective) pairs, checks adjective agrees
 * Returns ok + structured feedback.
 */
export type ValidationResult = {
  ok: boolean;
  issues: string[];
  hint?: string;
};

export function validateBuilt(built: BuiltItem[]): ValidationResult {
  const issues: string[] = [];
  if (built.length < 2) {
    return { ok: false, issues: ["Add at least two words."] };
  }

  // subject-verb agreement
  let currentPerson: Person | null = null;
  let currentNounGender: "m" | "f" | null = null;
  let lastWasArticle: { word: string } | null = null;

  for (const it of built) {
    if (it.kind === "pronoun") {
      const pr = pronouns.find((p) => p.id === it.refId);
      currentPerson = pr?.person ?? null;
    } else if (it.kind === "verb") {
      const verb = verbs.find((v) => v.id === it.refId);
      if (!verb) continue;
      const person = inferVerbPerson(verb, it.surface);
      if (currentPerson && person && person !== currentPerson) {
        issues.push(
          `“${it.surface}” is the ${personLabel(person)} form, but the subject is ${personLabel(currentPerson)}. Try “${verb.present[currentPerson]}”.`,
        );
      }
      if (!currentPerson && person) {
        // dropped subject — implicit subject = verb's person, ok
        currentPerson = person;
      }
    } else if (it.kind === "article") {
      lastWasArticle = { word: it.surface };
    } else if (it.kind === "noun") {
      const n = nouns.find((nn) => nn.id === it.refId);
      if (!n) continue;
      currentNounGender = n.gender;
      if (lastWasArticle) {
        const expected = definiteArticle(n, false);
        if (
          normalize(lastWasArticle.word) !== normalize(expected) &&
          // accept l' before vowel matching l' family
          !(lastWasArticle.word === "l'" && expected === "l'")
        ) {
          issues.push(
            `Article “${lastWasArticle.word}” doesn’t match “${n.singular}” (${n.gender === "m" ? "masculine" : "feminine"}). Use “${expected}”.`,
          );
        }
        lastWasArticle = null;
      }
    } else if (it.kind === "adjective") {
      const a = adjectives.find((aa) => aa.id === it.refId);
      if (!a) continue;
      if (currentNounGender) {
        const expected = agreeAdjective(a, currentNounGender, false);
        if (normalize(it.surface) !== normalize(expected)) {
          issues.push(
            `Adjective “${it.surface}” should agree with the noun → “${expected}”.`,
          );
        }
      }
    } else {
      lastWasArticle = null;
    }
  }

  if (issues.length === 0) {
    return { ok: true, issues: [] };
  }
  return { ok: false, issues };
}

function inferVerbPerson(verb: { present: Record<Person, string> }, candidate: string): Person | null {
  for (const p of PERSONS) {
    if (normalize(verb.present[p]) === normalize(candidate)) return p;
  }
  return null;
}

/* ---------------- Looser legacy validation (rearrange game) ---------------- */

export function permutationMatch(input: string, expectedWords: string[]): boolean {
  const a = normalize(input).split(" ").filter(Boolean).sort().join(" ");
  const b = expectedWords.map(normalize).filter(Boolean).sort().join(" ");
  return a === b;
}

export function normalizeSentence(text: string): string {
  return normalize(text);
}

export function almostCorrectFeedback(input: string, expected: string, hint?: string) {
  if (normalize(input) === normalize(expected)) {
    return { ok: true, message: "Perfetto." };
  }
  const a = normalize(input).split(" ").filter(Boolean);
  const b = normalize(expected).split(" ").filter(Boolean);
  if (a.sort().join(" ") === b.sort().join(" ")) {
    return { ok: true, message: "Valid — word order varies." };
  }
  const shared = b.filter((w) => a.includes(w)).length;
  if (shared >= b.length - 1) {
    return { ok: false, message: "Almost.", nativeHint: hint ?? `Native speakers say: ${expected}` };
  }
  return { ok: false, message: "Not quite — check verb form and order.", nativeHint: hint };
}

/* ---------------- "kind" utility ---------------- */

export function kindFromDisplay(w: DisplayWord): WordType {
  return w.type;
}
