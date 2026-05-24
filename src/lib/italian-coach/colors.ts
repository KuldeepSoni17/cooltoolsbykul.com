import type { WordType } from "./types";

export const WORD_TYPE_COLORS: Record<
  WordType,
  { chip: string; chipHover: string; dot: string; text: string; label: string; group: string }
> = {
  noun: {
    chip: "bg-sky-50 border-sky-300 text-sky-900",
    chipHover: "hover:bg-sky-100",
    dot: "bg-sky-500",
    text: "text-sky-700",
    label: "Noun",
    group: "Nouns",
  },
  verb: {
    chip: "bg-rose-50 border-rose-300 text-rose-900",
    chipHover: "hover:bg-rose-100",
    dot: "bg-rose-500",
    text: "text-rose-700",
    label: "Verb",
    group: "Verbs",
  },
  adjective: {
    chip: "bg-emerald-50 border-emerald-300 text-emerald-900",
    chipHover: "hover:bg-emerald-100",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    label: "Adj",
    group: "Adjectives",
  },
  connector: {
    chip: "bg-amber-50 border-amber-300 text-amber-900",
    chipHover: "hover:bg-amber-100",
    dot: "bg-amber-500",
    text: "text-amber-700",
    label: "Link",
    group: "Connectors",
  },
  time: {
    chip: "bg-violet-50 border-violet-300 text-violet-900",
    chipHover: "hover:bg-violet-100",
    dot: "bg-violet-500",
    text: "text-violet-700",
    label: "Time",
    group: "Time",
  },
  pronoun: {
    chip: "bg-cyan-50 border-cyan-300 text-cyan-900",
    chipHover: "hover:bg-cyan-100",
    dot: "bg-cyan-500",
    text: "text-cyan-700",
    label: "Pron",
    group: "Pronouns",
  },
  article: {
    chip: "bg-stone-50 border-stone-300 text-stone-900",
    chipHover: "hover:bg-stone-100",
    dot: "bg-stone-500",
    text: "text-stone-700",
    label: "Art",
    group: "Articles",
  },
};

export const WORD_TYPE_ORDER: WordType[] = [
  "pronoun",
  "verb",
  "noun",
  "adjective",
  "time",
  "connector",
  "article",
];
