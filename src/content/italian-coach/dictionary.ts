import type { DictionaryWord, SentenceTemplate } from "@/lib/italian-coach/types";

/** Layer 1 — Memory: atomic language units */
export const memoryWords: DictionaryWord[] = [
  { id: "io", word: "io", english: "I", type: "pronoun", difficulty: 1, frequencyRank: 12, tags: ["core"] },
  { id: "tu", word: "tu", english: "you", type: "pronoun", difficulty: 1, frequencyRank: 18, tags: ["core"] },
  { id: "noi", word: "noi", english: "we", type: "pronoun", difficulty: 1, frequencyRank: 45, tags: ["core"] },
  { id: "loro", word: "loro", english: "they", type: "pronoun", difficulty: 1, frequencyRank: 52, tags: ["core"] },
  { id: "te", word: "tè", english: "tea", type: "noun", difficulty: 1, frequencyRank: 890, tags: ["food", "daily"] },
  { id: "caffe", word: "caffè", english: "coffee", type: "noun", difficulty: 1, frequencyRank: 420, tags: ["food", "daily"] },
  { id: "acqua", word: "acqua", english: "water", type: "noun", difficulty: 1, frequencyRank: 210, tags: ["food", "daily"] },
  { id: "pizza", word: "pizza", english: "pizza", type: "noun", difficulty: 1, frequencyRank: 680, tags: ["food"] },
  { id: "casa", word: "casa", english: "house", type: "noun", difficulty: 1, frequencyRank: 25, tags: ["places"] },
  { id: "giardino", word: "giardino", english: "garden", type: "noun", difficulty: 2, frequencyRank: 1200, tags: ["places"] },
  { id: "mela", word: "mela", english: "apple", type: "noun", difficulty: 1, frequencyRank: 2100, tags: ["food"] },
  { id: "oggi", word: "oggi", english: "today", type: "time", difficulty: 1, frequencyRank: 95, tags: ["daily"] },
  { id: "domani", word: "domani", english: "tomorrow", type: "time", difficulty: 1, frequencyRank: 140, tags: ["daily"] },
  { id: "bello", word: "bello", english: "beautiful", type: "adjective", difficulty: 1, frequencyRank: 380, tags: ["description"] },
  { id: "grande", word: "grande", english: "big", type: "adjective", difficulty: 1, frequencyRank: 290, tags: ["description"] },
  { id: "la", word: "la", english: "the (f.)", type: "article", difficulty: 1, frequencyRank: 5, tags: ["grammar"] },
  { id: "il", word: "il", english: "the (m.)", type: "article", difficulty: 1, frequencyRank: 6, tags: ["grammar"] },
  { id: "e", word: "e", english: "and", type: "connector", difficulty: 1, frequencyRank: 1, tags: ["link"] },
  { id: "con", word: "con", english: "with", type: "connector", difficulty: 1, frequencyRank: 22, tags: ["link"] },
];

/** Layer 2 — Operators: reusable transformations (conjugated forms) */
export const operatorWords: DictionaryWord[] = [
  { id: "ho", word: "ho", english: "have", type: "verb", root: "avere", difficulty: 1, frequencyRank: 8, tags: ["operator"] },
  { id: "voglio", word: "voglio", english: "want", type: "verb", root: "volere", difficulty: 1, frequencyRank: 85, tags: ["operator", "desire"] },
  { id: "mangio", word: "mangio", english: "eat", type: "verb", root: "mangiare", difficulty: 1, frequencyRank: 62, tags: ["operator"] },
  { id: "bevo", word: "bevo", english: "drink", type: "verb", root: "bere", difficulty: 1, frequencyRank: 310, tags: ["operator"] },
  { id: "sono", word: "sono", english: "am / are", type: "verb", root: "essere", difficulty: 1, frequencyRank: 1, tags: ["operator"] },
  { id: "vado", word: "vado", english: "go", type: "verb", root: "andare", difficulty: 1, frequencyRank: 14, tags: ["operator"] },
  { id: "posso", word: "posso", english: "can", type: "verb", root: "potere", difficulty: 2, frequencyRank: 120, tags: ["operator"] },
  { id: "hanno", word: "hanno", english: "have (they)", type: "verb", root: "avere", difficulty: 2, frequencyRank: 30, tags: ["operator"] },
  { id: "mangiare", word: "mangiare", english: "to eat", type: "verb", root: "mangiare", difficulty: 1, frequencyRank: 62, tags: ["infinitive"] },
  { id: "andare", word: "andare", english: "to go", type: "verb", root: "andare", difficulty: 1, frequencyRank: 14, tags: ["infinitive"] },
];

export const allDictionaryWords: DictionaryWord[] = [...memoryWords, ...operatorWords];

export const sentenceTemplates: SentenceTemplate[] = [
  {
    id: "svo",
    label: "Subject + Verb + Object",
    structure: "[SUBJECT] [VERB] [OBJECT]",
    slots: ["SUBJECT", "VERB", "OBJECT"],
    examples: ["Io mangio pizza", "Tu bevi acqua"],
    difficulty: 1,
    orderVariants: ["default", "verb-first"],
  },
  {
    id: "sv_adj",
    label: "Subject + Verb + Adjective",
    structure: "[SUBJECT] [VERB] [ADJECTIVE]",
    slots: ["SUBJECT", "VERB", "ADJECTIVE"],
    examples: ["La casa e grande", "Il giardino e bello"],
    difficulty: 1,
  },
  {
    id: "tsv",
    label: "Time + Subject + Verb",
    structure: "[TIME] [SUBJECT] [VERB]",
    slots: ["TIME", "SUBJECT", "VERB"],
    examples: ["Oggi voglio", "Domani andiamo"],
    difficulty: 1,
    orderVariants: ["default", "time-first"],
  },
  {
    id: "tsvo",
    label: "Time + Subject + Verb + Object",
    structure: "[TIME] [SUBJECT] [VERB] [OBJECT]",
    slots: ["TIME", "SUBJECT", "VERB", "OBJECT"],
    examples: ["Oggi voglio tè", "Domani mangio pizza"],
    difficulty: 2,
    orderVariants: ["default", "time-first", "verb-first"],
  },
  {
    id: "svo_inf",
    label: "Want + Infinitive",
    structure: "[SUBJECT] [VERB] [VERB:infinitive] [OBJECT]",
    slots: ["SUBJECT", "VERB", "OBJECT"],
    examples: ["Io voglio mangiare pizza", "Noi vogliamo andare"],
    difficulty: 2,
  },
];

/** Phrase pairs for translation combat & craft modes */
export const combatChallenges = [
  { english: "I want water", italian: "Io voglio acqua", hint: "Oggi voglio acqua" },
  { english: "I want tea today", italian: "Oggi voglio tè", hint: "Io voglio tè oggi" },
  { english: "We eat pizza", italian: "Noi mangiamo pizza", hint: "Noi mangiamo la pizza" },
  { english: "They have coffee", italian: "Loro hanno caffè", hint: "Loro hanno il caffè" },
  { english: "I drink water today", italian: "Oggi bevo acqua", hint: "Bevo acqua oggi" },
  { english: "The house is big", italian: "La casa e grande", hint: "La casa è grande" },
];

export const craftChallenges = [
  { scrambled: ["voglio", "io", "acqua"], answer: "Io voglio acqua", english: "I want water" },
  { scrambled: ["oggi", "tè", "voglio"], answer: "Oggi voglio tè", english: "Today I want tea" },
  { scrambled: ["pizza", "mangio", "io"], answer: "Io mangio pizza", english: "I eat pizza" },
  { scrambled: ["caffè", "bevo", "oggi"], answer: "Oggi bevo caffè", english: "Today I drink coffee" },
  { scrambled: ["grande", "e", "casa", "la"], answer: "La casa e grande", english: "The house is big" },
];

export const infiniteBuilderSets = [
  { words: ["io", "voglio", "tè", "caffè", "oggi"], minValid: 4 },
  { words: ["io", "mangio", "pizza", "acqua", "oggi"], minValid: 3 },
  { words: ["noi", "voglio", "andare", "casa", "domani"], minValid: 2 },
];
