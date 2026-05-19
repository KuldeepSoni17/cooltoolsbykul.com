"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ALL_TOOLS,
  BRAND,
  CATEGORY_THEME,
  FEATURED_TOOLS,
  HOME_CATEGORIES,
  type CategoryId,
  type HomeCategory,
  type HomeTool,
} from "@/lib/home-sections";

const CATEGORY_IDS = HOME_CATEGORIES.map((c) => c.id);

function ToolCard({
  tool,
  color,
  bg,
}: {
  tool: HomeTool;
  color: string;
  bg: string;
}) {
  const base = (
    <article
      className="flex h-full min-h-[168px] w-[280px] shrink-0 snap-start flex-col rounded-2xl border-2 bg-white p-5 shadow-sm transition hover:shadow-md sm:w-[300px]"
      style={{ borderColor: `${color}33` }}
    >
      <div
        className="mb-3 h-1.5 w-12 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <h3 className="text-lg font-bold leading-tight" style={{ color: BRAND.text }}>
        {tool.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed" style={{ color: BRAND.textMuted }}>
        {tool.tagline}
      </p>
      {tool.href ? (
        <span
          className="mt-4 inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: color }}
        >
          Open
        </span>
      ) : (
        <span
          className="mt-4 inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold"
          style={{ backgroundColor: bg, color }}
        >
          Coming soon
        </span>
      )}
    </article>
  );

  if (tool.href) {
    return (
      <Link
        href={tool.href}
        className="block h-full w-[280px] shrink-0 snap-start sm:w-[300px]"
      >
        {base}
      </Link>
    );
  }

  return <div className="shrink-0 snap-start opacity-80">{base}</div>;
}

function Carousel({
  children,
  ariaLabel,
}: {
  children: React.ReactNode;
  ariaLabel: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => scroll(-1)}
        aria-label={`Scroll ${ariaLabel} left`}
        className="absolute -left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-white text-lg font-bold shadow-lg transition hover:scale-105 sm:flex"
        style={{ color: BRAND.primary }}
      >
        ‹
      </button>
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 pt-1 scrollbar-none snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
        role="region"
        aria-label={ariaLabel}
      >
        {children}
      </div>
      <button
        type="button"
        onClick={() => scroll(1)}
        aria-label={`Scroll ${ariaLabel} right`}
        className="absolute -right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-white text-lg font-bold shadow-lg transition hover:scale-105 sm:flex"
        style={{ color: BRAND.primary }}
      >
        ›
      </button>
    </div>
  );
}

function CategorySection({ category }: { category: HomeCategory }) {
  const theme = CATEGORY_THEME[category.id];

  return (
    <section id={category.id} className="scroll-mt-24">
      <div
        className="mb-4 flex flex-wrap items-end justify-between gap-3 rounded-2xl px-5 py-4"
        style={{ backgroundColor: theme.bg }}
      >
        <div>
          <h2 className="text-2xl font-bold" style={{ color: theme.color }}>
            {theme.label}
          </h2>
          <p className="mt-0.5 text-sm" style={{ color: BRAND.textMuted }}>
            {theme.description}
          </p>
        </div>
        <span
          className="rounded-full px-3 py-1 text-xs font-bold text-white"
          style={{ backgroundColor: theme.color }}
        >
          {category.tools.length}
        </span>
      </div>
      <Carousel ariaLabel={theme.label}>
        {category.tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} color={theme.color} bg={theme.bg} />
        ))}
      </Carousel>
    </section>
  );
}

function FeaturedCarousel() {
  const items = FEATURED_TOOLS;
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback(
    (next: number) => {
      setIndex((i) => (i + next + items.length) % items.length);
    },
    [items.length]
  );

  useEffect(() => {
    timerRef.current = setInterval(() => go(1), 5500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [go]);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => go(1), 5500);
  };

  const current = items[index];
  const theme = HOME_CATEGORIES.find((c) =>
    c.tools.some((t) => t.id === current.id)
  );
  const color = theme ? CATEGORY_THEME[theme.id].color : BRAND.primary;
  const bg = theme ? CATEGORY_THEME[theme.id].bg : "#EEF4FF";

  return (
    <section className="relative overflow-hidden rounded-3xl border-2 border-white shadow-lg">
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{ backgroundColor: bg }}
        aria-hidden
      />
      <div className="relative flex min-h-[220px] flex-col justify-between p-8 sm:min-h-[260px] sm:flex-row sm:items-center sm:gap-8">
        <div className="max-w-xl">
          <p
            className="text-xs font-bold uppercase tracking-[0.2em]"
            style={{ color }}
          >
            Featured
          </p>
          <h2
            className="mt-2 text-3xl font-bold sm:text-4xl"
            style={{ color: BRAND.text }}
          >
            {current.title}
          </h2>
          <p className="mt-3 text-base sm:text-lg" style={{ color: BRAND.textMuted }}>
            {current.tagline}
          </p>
          <Link
            href={current.href!}
            className="mt-6 inline-flex rounded-full px-6 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-90"
            style={{ backgroundColor: color }}
          >
            Launch now
          </Link>
        </div>

        <div className="mt-6 flex items-center gap-3 sm:mt-0">
          <button
            type="button"
            onClick={() => {
              go(-1);
              resetTimer();
            }}
            aria-label="Previous featured"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl font-bold shadow"
            style={{ color: BRAND.primary }}
          >
            ‹
          </button>
          <div className="flex gap-2">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setIndex(i);
                  resetTimer();
                }}
                aria-label={`Show ${item.title}`}
                className="h-2.5 rounded-full transition-all"
                style={{
                  width: i === index ? 28 : 10,
                  backgroundColor: i === index ? color : `${color}44`,
                }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              go(1);
              resetTimer();
            }}
            aria-label="Next featured"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl font-bold shadow"
            style={{ color: BRAND.primary }}
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}

export default function HomeLanding() {
  const [activeCategory, setActiveCategory] = useState<CategoryId | "all">("all");

  const visibleCategories = useMemo(() => {
    if (activeCategory === "all") return HOME_CATEGORIES;
    return HOME_CATEGORIES.filter((c) => c.id === activeCategory);
  }, [activeCategory]);

  return (
    <main className="min-h-screen" style={{ backgroundColor: BRAND.pageBg, color: BRAND.text }}>
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black text-white"
              style={{ backgroundColor: BRAND.primary }}
            >
              K
            </span>
            <span className="text-lg font-bold">cooltoolsbykul</span>
          </Link>
          <p className="text-sm font-medium" style={{ color: BRAND.textMuted }}>
            {ALL_TOOLS.filter((t) => t.href).length} live projects
          </p>
        </header>

        <section className="mt-10 sm:mt-12">
          <h1
            className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl"
            style={{ color: BRAND.text }}
          >
            Cool tools, games & ideas.
          </h1>
          <p className="mt-3 max-w-lg text-lg" style={{ color: BRAND.textMuted }}>
            Browse by category — swipe through each row or jump straight in.
          </p>
        </section>

        <div className="mt-8">
          <FeaturedCarousel />
        </div>

        <nav
          className="mt-10 flex gap-2 overflow-x-auto pb-2"
          aria-label="Categories"
        >
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className="shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition"
            style={{
              backgroundColor: activeCategory === "all" ? BRAND.primary : "white",
              color: activeCategory === "all" ? "white" : BRAND.textMuted,
              boxShadow: activeCategory === "all" ? "none" : "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            All
          </button>
          {CATEGORY_IDS.map((id) => {
            const theme = CATEGORY_THEME[id];
            const active = activeCategory === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveCategory(id)}
                className="shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition"
                style={{
                  backgroundColor: active ? theme.color : "white",
                  color: active ? "white" : BRAND.textMuted,
                  boxShadow: active ? "none" : "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                {theme.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-10 space-y-12">
          {visibleCategories.map((category) => (
            <CategorySection key={category.id} category={category} />
          ))}
        </div>

        <footer
          className="mt-16 border-t pt-8 text-center text-sm"
          style={{ borderColor: `${BRAND.primary}22`, color: BRAND.textMuted }}
        >
          Cool Tools by Kul
        </footer>
      </div>
    </main>
  );
}
