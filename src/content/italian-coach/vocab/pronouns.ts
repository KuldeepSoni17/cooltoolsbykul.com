import type { PronounEntry } from "@/lib/italian-coach/types";

export const pronouns: PronounEntry[] = [
  { id: "io", word: "io", english: "I", person: "io", plural: false },
  { id: "tu", word: "tu", english: "you", person: "tu", plural: false },
  { id: "lui", word: "lui", english: "he", person: "lui_lei", plural: false },
  { id: "lei", word: "lei", english: "she", person: "lui_lei", plural: false },
  { id: "noi", word: "noi", english: "we", person: "noi", plural: true },
  { id: "voi", word: "voi", english: "you (plural)", person: "voi", plural: true },
  { id: "loro", word: "loro", english: "they", person: "loro", plural: true },
];
