import type { WordType } from "./types";

export const WORD_TYPE_COLORS: Record<WordType, { bg: string; border: string; text: string; label: string }> = {
  noun: { bg: "bg-blue-500/15", border: "border-blue-400/50", text: "text-blue-200", label: "Noun" },
  verb: { bg: "bg-red-500/15", border: "border-red-400/50", text: "text-red-200", label: "Verb" },
  adjective: { bg: "bg-emerald-500/15", border: "border-emerald-400/50", text: "text-emerald-200", label: "Adj" },
  connector: { bg: "bg-amber-500/15", border: "border-amber-400/50", text: "text-amber-200", label: "Link" },
  time: { bg: "bg-violet-500/15", border: "border-violet-400/50", text: "text-violet-200", label: "Time" },
  pronoun: { bg: "bg-cyan-500/15", border: "border-cyan-400/50", text: "text-cyan-200", label: "Pro" },
  operator: { bg: "bg-orange-500/15", border: "border-orange-400/50", text: "text-orange-200", label: "Op" },
  article: { bg: "bg-zinc-500/15", border: "border-zinc-400/50", text: "text-zinc-200", label: "Art" },
};
