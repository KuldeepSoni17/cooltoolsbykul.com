"use client";

import { motion } from "framer-motion";

export type CoachTab = "memory" | "build" | "practice" | "discover";

const TABS: { id: CoachTab; label: string; short: string }[] = [
  { id: "memory", label: "Memorize", short: "Mem" },
  { id: "build", label: "Build", short: "Build" },
  { id: "practice", label: "Practice", short: "Play" },
  { id: "discover", label: "Discover", short: "Find" },
];

export function MobileTabBar({
  tab,
  onTab,
}: {
  tab: CoachTab;
  onTab: (t: CoachTab) => void;
}) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-[#f6f1e7]/95 backdrop-blur-lg md:hidden"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onTab(t.id)}
            className={`relative flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-xs font-medium transition active:scale-95 ${
              tab === t.id ? "text-stone-900" : "text-stone-500"
            }`}
          >
            {tab === t.id ? (
              <motion.span
                layoutId="mobile-tab-indicator"
                className="absolute inset-x-2 top-1 h-0.5 rounded-full bg-stone-900"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            ) : null}
            <span className="relative mt-1">{t.short}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export { TABS as MOBILE_TABS };
