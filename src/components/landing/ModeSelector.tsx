"use client";

import { useState } from "react";
import { SearchAllMode } from "./SearchAllMode";
import { WatchCompanyMode } from "./WatchCompanyMode";

type Mode = null | "search" | "watch";

export function ModeSelector() {
  const [selected, setSelected] = useState<Mode>(null);

  return (
    <div className="space-y-4">
      {!selected && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModeCard
            mode="search"
            icon="⊞"
            title="Search All Companies"
            description="Search across company career pages at once. Best for broad discovery."
            tag="Broad search"
            tagColor="text-[#5B6EF5]"
            onClick={() => setSelected("search")}
          />
          <ModeCard
            mode="watch"
            icon="◎"
            title="Watch a Company"
            description="Paste any company's careers page. We'll track it and show new PM roles."
            tag="New"
            tagColor="text-[#4CAF7D]"
            onClick={() => setSelected("watch")}
            highlight
          />
        </div>
      )}

      {selected && (
        <div>
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-2 text-xs font-mono text-[#7A7A8C] hover:text-[#F5F0E8] transition-colors mb-6"
          >
            ← Change mode
          </button>

          <div className="flex items-center gap-3 mb-8">
            <span className="text-xs font-mono text-[#4B5563] uppercase tracking-widest">Mode</span>
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded border ${
                selected === "watch"
                  ? "text-[#4CAF7D] border-[#2A5E42] bg-[#1A3D2B]"
                  : "text-[#5B6EF5] border-[#1E2456] bg-[#0D1233]"
              }`}
            >
              {selected === "watch" ? "◎ Watch a Company" : "⊞ Search All Companies"}
            </span>
          </div>

          {selected === "search" && <SearchAllMode />}
          {selected === "watch" && <WatchCompanyMode />}
        </div>
      )}
    </div>
  );
}

function ModeCard({
  icon,
  title,
  description,
  tag,
  tagColor,
  onClick,
  highlight = false,
}: {
  mode: string;
  icon: string;
  title: string;
  description: string;
  tag: string;
  tagColor: string;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left p-6 rounded-2xl border transition-all duration-200 hover:border-[#2E2E3E] hover:bg-[#141418] group ${
        highlight ? "border-[#2A5E42] bg-[#0D1F15] hover:border-[#4CAF7D]/40" : "border-[#1E1E26] bg-[#0C0C0F]"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        <span className={`text-[10px] font-mono uppercase tracking-wider ${tagColor}`}>{tag}</span>
      </div>
      <h2 className="font-display text-lg text-[#F5F0E8] mb-2 group-hover:text-white">{title}</h2>
      <p className="text-sm text-[#7A7A8C] leading-relaxed">{description}</p>
      <div className="mt-6 text-xs font-mono text-[#4B5563] group-hover:text-[#7A7A8C] transition-colors">Select →</div>
    </button>
  );
}
