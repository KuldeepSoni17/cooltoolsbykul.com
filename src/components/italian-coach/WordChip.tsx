"use client";

import { WORD_TYPE_COLORS } from "@/lib/italian-coach/colors";
import type { DisplayWord, WordType } from "@/lib/italian-coach/types";

export function WordChip({
  word,
  onClick,
  selected,
  size = "md",
  showMeaning = false,
  overrideWord,
}: {
  word: DisplayWord;
  onClick?: () => void;
  selected?: boolean;
  size?: "sm" | "md" | "lg";
  showMeaning?: boolean;
  /** override visible surface text (used for conjugated render in builder) */
  overrideWord?: string;
}) {
  const c = WORD_TYPE_COLORS[word.type as WordType];
  const sizing =
    size === "lg"
      ? "px-4 py-2.5 text-lg"
      : size === "sm"
        ? "px-2.5 py-1 text-sm"
        : "px-3 py-1.5 text-base";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`group inline-flex items-baseline gap-2 rounded-lg border ${sizing} ${c.chip} ${
        onClick ? `${c.chipHover} cursor-pointer` : "cursor-default"
      } ${selected ? "shadow-[0_2px_0_0_rgba(0,0,0,0.08)] ring-2 ring-stone-900/20" : "shadow-[0_1px_0_0_rgba(0,0,0,0.06)]"} font-medium transition-all`}
      title={`${word.english} · ${c.label}`}
    >
      <span>{overrideWord ?? word.word}</span>
      {showMeaning ? <span className={`text-xs font-normal opacity-70 ${c.text}`}>{word.english}</span> : null}
    </button>
  );
}
