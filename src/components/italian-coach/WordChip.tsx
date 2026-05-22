"use client";

import { WORD_TYPE_COLORS } from "@/lib/italian-coach/colors";
import type { DictionaryWord } from "@/lib/italian-coach/types";

export function WordChip({
  word,
  onClick,
  selected,
  size = "md",
}: {
  word: DictionaryWord;
  onClick?: () => void;
  selected?: boolean;
  size?: "sm" | "md";
}) {
  const colors = WORD_TYPE_COLORS[word.type];
  const pad = size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`${pad} rounded-xl border font-medium transition ${colors.bg} ${colors.border} ${colors.text} ${
        selected ? "ring-2 ring-white/60 scale-105" : "hover:brightness-125"
      } ${onClick ? "cursor-pointer" : "cursor-default opacity-90"}`}
      title={`${word.english} · ${colors.label}`}
    >
      {word.word}
    </button>
  );
}
