import {
  allDictionaryWords,
  sentenceTemplates,
} from "@/content/italian-coach/dictionary";
import type {
  CompressionStats,
  DictionaryWord,
  GeneratedPhrase,
  SentenceTemplate,
  WordType,
} from "./types";

const SLOT_TYPES: Record<string, WordType[]> = {
  SUBJECT: ["pronoun"],
  VERB: ["verb"],
  OBJECT: ["noun"],
  ADJECTIVE: ["adjective"],
  TIME: ["time"],
};

function wordsForSlot(slot: string, pool: DictionaryWord[]): DictionaryWord[] {
  const types = SLOT_TYPES[slot];
  if (!types) return pool;
  return pool.filter((w) => types.includes(w.type));
}

function capitalize(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildItalian(parts: string[], variant: string): string {
  const lower = parts.map((p) => p.toLowerCase());
  if (variant === "time-first" && lower.length >= 3) {
    const timeIdx = lower.findIndex((p) => ["oggi", "domani"].includes(p));
    if (timeIdx > 0) {
      const reordered = [lower[timeIdx], ...lower.filter((_, i) => i !== timeIdx)];
      return capitalize(reordered.join(" "));
    }
  }
  if (variant === "verb-first" && lower.length >= 3) {
    const verbIdx = lower.findIndex((p) =>
      ["voglio", "mangio", "bevo", "ho", "sono", "vado", "posso", "hanno"].includes(p),
    );
    if (verbIdx > 0) {
      const reordered = [lower[verbIdx], ...lower.filter((_, i) => i !== verbIdx)];
      return capitalize(reordered.join(" "));
    }
  }
  return capitalize(lower.join(" "));
}

function buildEnglish(parts: DictionaryWord[]): string {
  return parts.map((p) => p.english).join(" ");
}

export function generatePhrases(
  knownWordIds: Set<string>,
  templates: SentenceTemplate[] = sentenceTemplates,
  limit = 48,
): GeneratedPhrase[] {
  const pool = allDictionaryWords.filter((w) => knownWordIds.has(w.id));
  const results: GeneratedPhrase[] = [];
  const seen = new Set<string>();

  for (const template of templates) {
    const variants = template.orderVariants ?? ["default"];
    const slotPools = template.slots.map((slot) => wordsForSlot(slot, pool));
    if (slotPools.some((p) => p.length === 0)) continue;

    function recurse(idx: number, picked: DictionaryWord[]) {
      if (results.length >= limit) return;
      if (idx === template.slots.length) {
        for (const variant of variants) {
          const italian = buildItalian(
            picked.map((w) => w.word),
            variant,
          );
          const key = italian.toLowerCase();
          if (seen.has(key)) continue;
          seen.add(key);
          results.push({
            italian,
            english: buildEnglish(picked),
            templateId: template.id,
          });
          if (results.length >= limit) return;
        }
        return;
      }
      for (const word of slotPools[idx]) {
        recurse(idx + 1, [...picked, word]);
        if (results.length >= limit) return;
      }
    }
    recurse(0, []);
  }

  return results;
}

export function expandPhraseExplosion(baseIds: string[]): GeneratedPhrase[] {
  const base = new Set(baseIds);
  ["io", "voglio", "mangiare", "pizza", "oggi", "domani", "noi", "caffe", "acqua", "te"].forEach((id) =>
    base.add(id),
  );
  return generatePhrases(base, sentenceTemplates, 12);
}

export function computeCompression(knownWordIds: Set<string>): CompressionStats {
  const wordsKnown = knownWordIds.size;
  const unlockedTemplates = sentenceTemplates.filter((t) => {
    const pool = allDictionaryWords.filter((w) => knownWordIds.has(w.id));
    return t.slots.every((slot) => wordsForSlot(slot, pool).length > 0);
  });
  const patternsKnown = unlockedTemplates.length;

  let possibleSentences = 0;
  const pool = allDictionaryWords.filter((w) => knownWordIds.has(w.id));
  for (const template of unlockedTemplates) {
    const slotCounts = template.slots.map((slot) => wordsForSlot(slot, pool).length);
    const base = slotCounts.reduce((a, b) => a * b, 1);
    const variants = template.orderVariants?.length ?? 1;
    possibleSentences += base * variants;
  }

  return { wordsKnown, patternsKnown, possibleSentences: Math.max(possibleSentences, wordsKnown) };
}

export function normalizeSentence(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[.!?]/g, "")
    .replace(/è/g, "e")
    .replace(/\s+/g, " ");
}

export function validateAgainstPhrases(
  input: string,
  phrases: GeneratedPhrase[],
): { ok: boolean; match?: GeneratedPhrase; close?: string } {
  const norm = normalizeSentence(input);
  const exact = phrases.find((p) => normalizeSentence(p.italian) === norm);
  if (exact) return { ok: true, match: exact };

  const close = phrases.find((p) => {
    const pNorm = normalizeSentence(p.italian);
    return pNorm.split(" ").sort().join(" ") === norm.split(" ").sort().join(" ");
  });
  if (close) return { ok: true, match: close, close: "word order differs but words match" };

  return { ok: false };
}

export function scoreInfiniteBuilder(
  submissions: string[],
  wordSet: string[],
  knownIds: Set<string>,
): { valid: string[]; count: number; xp: number } {
  const phrases = generatePhrases(knownIds, sentenceTemplates, 200);
  const valid: string[] = [];
  const seen = new Set<string>();

  for (const sub of submissions) {
    const norm = normalizeSentence(sub);
    if (!norm) continue;
    const words = norm.split(" ");
    if (!words.every((w) => wordSet.some((allowed) => allowed.toLowerCase() === w))) continue;
    const result = validateAgainstPhrases(sub, phrases);
    if (result.ok && !seen.has(norm)) {
      seen.add(norm);
      valid.push(sub);
    }
  }

  return { valid, count: valid.length, xp: valid.length * 10 };
}

export function almostCorrectFeedback(input: string, expected: string, nativeHint?: string) {
  const normIn = normalizeSentence(input);
  const normExp = normalizeSentence(expected);
  if (normIn === normExp) {
    return { ok: true, message: "Perfetto! Native-level structure." };
  }
  const shared = normExp.split(" ").filter((w) => normIn.includes(w)).length;
  if (shared >= normExp.split(" ").length - 1) {
    return {
      ok: false,
      message: "Almost correct.",
      nativeHint: nativeHint ?? `Native speakers often say: ${expected}`,
    };
  }
  return {
    ok: false,
    message: "Keep assembling — check your verb and word order.",
    nativeHint,
  };
}
