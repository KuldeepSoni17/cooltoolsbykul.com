"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ALL_TOOLS,
  FEATURED_TOOLS,
  HOME_CATEGORIES,
  type HomeCategory,
  type HomeTool,
} from "@/lib/home-sections";

const FILTERS = [
  { id: "all", label: "All" },
  ...HOME_CATEGORIES.map((c) => ({ id: c.id, label: c.label })),
];

function ToolCard({ emoji, title, tagline, href }: HomeTool) {
  const className = `group flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-zinc-900/50 p-4 transition hover:border-white/12 hover:bg-zinc-900/80 ${
    href ? "cursor-pointer" : "opacity-70"
  }`;

  const content = (
    <>
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-lg ring-1 ring-white/10"
        aria-hidden
      >
        {emoji}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="mt-0.5 line-clamp-2 text-sm text-zinc-400">{tagline}</p>
      </div>
      {href ? (
        <span className="shrink-0 text-zinc-500 transition group-hover:translate-x-0.5 group-hover:text-cyan-300">
          →
        </span>
      ) : (
        <span className="shrink-0 rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
          Soon
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

function CategoryBlock({
  category,
  tools,
}: {
  category: HomeCategory;
  tools: HomeTool[];
}) {
  if (tools.length === 0) return null;

  return (
    <section id={category.id} className="scroll-mt-28">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            className="text-2xl text-white sm:text-3xl"
            style={{ fontFamily: "var(--font-dm-serif-display), serif" }}
          >
            {category.label}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">{category.description}</p>
        </div>
        <span className="text-xs font-medium text-zinc-600">
          {tools.length} {tools.length === 1 ? "item" : "items"}
        </span>
      </div>
      <div
        className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-3 ${tools.length <= 2 ? "lg:grid-cols-2" : ""}`}
      >
        {tools.map((tool) => (
          <ToolCard key={tool.id} {...tool} />
        ))}
      </div>
    </section>
  );
}

export default function HomeLanding() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const normalizedQuery = query.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    return HOME_CATEGORIES.map((category) => {
      if (activeFilter !== "all" && category.id !== activeFilter) {
        return { ...category, tools: [] as HomeTool[] };
      }
      const tools = category.tools.filter((tool) => {
        if (!normalizedQuery) return true;
        const haystack =
          `${tool.title} ${tool.tagline} ${category.label}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      });
      return { ...category, tools };
    }).filter((c) => c.tools.length > 0);
  }, [activeFilter, normalizedQuery]);

  const resultCount = filteredCategories.reduce((n, c) => n + c.tools.length, 0);

  return (
    <main className="relative min-h-screen bg-[#060608] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-32 top-0 h-[480px] w-[480px] rounded-full bg-cyan-500/[0.07] blur-[100px]" />
        <div className="absolute -right-24 top-1/3 h-[400px] w-[400px] rounded-full bg-violet-500/[0.08] blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-[320px] w-[320px] rounded-full bg-amber-500/[0.05] blur-[80px]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-8 sm:px-8 sm:pt-12">
        <header className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 text-sm font-bold text-black">
              K
            </span>
            <span className="text-sm font-medium tracking-tight text-zinc-300">
              cooltoolsbykul
            </span>
          </Link>
          <p className="hidden text-xs text-zinc-600 sm:block">
            {ALL_TOOLS.filter((t) => t.href).length} live · {ALL_TOOLS.length}{" "}
            total
          </p>
        </header>

        <section className="mt-10 sm:mt-14">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-400/90">
            Creative HQ
          </p>
          <h1
            className="mt-3 max-w-3xl text-balance text-4xl font-normal leading-[1.1] text-white sm:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-dm-serif-display), serif" }}
          >
            Tools, games & ideas — built by Kul.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            One home for utilities, playable worlds, and honest life mirrors.
            Pick a category or search below.
          </p>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
            {FEATURED_TOOLS.slice(0, 4).map((tool, i) => (
              <Link
                key={tool.id}
                href={tool.href!}
                className={`group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-5 transition hover:border-cyan-500/30 hover:bg-zinc-900 ${
                  i === 0 ? "sm:col-span-2 lg:row-span-2 lg:min-h-[220px]" : ""
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-500/10 opacity-0 transition group-hover:opacity-100" />
                <span className="relative text-2xl">{tool.emoji}</span>
                <h3
                  className={`relative mt-3 font-semibold text-white ${i === 0 ? "text-xl sm:text-2xl" : "text-base"}`}
                >
                  {tool.title}
                </h3>
                <p
                  className={`relative mt-1 text-zinc-400 ${i === 0 ? "text-sm sm:max-w-xs" : "text-xs line-clamp-2"}`}
                >
                  {tool.tagline}
                </p>
                <span className="relative mt-4 inline-flex text-xs font-medium text-cyan-400">
                  Open →
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="sticky top-0 z-20 mt-12 -mx-5 border-y border-white/[0.06] bg-[#060608]/90 px-5 py-4 backdrop-blur-xl sm:-mx-8 sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600">
                ⌕
              </span>
              <input
                type="search"
                placeholder="Search tools & games…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-zinc-900/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
              />
            </div>
            <p className="shrink-0 text-xs text-zinc-600 sm:w-24 sm:text-right">
              {resultCount} shown
            </p>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                  activeFilter === f.id
                    ? "bg-white text-black"
                    : "bg-zinc-800/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>

        <div className="mt-12 space-y-14">
          {filteredCategories.length === 0 ? (
            <p className="py-16 text-center text-zinc-500">
              No matches for &ldquo;{query}&rdquo;. Try another search or filter.
            </p>
          ) : (
            filteredCategories.map((category) => (
              <CategoryBlock
                key={category.id}
                category={category}
                tools={category.tools}
              />
            ))
          )}
        </div>

        <footer className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.06] pt-8 text-xs text-zinc-600">
          <span>Cool Tools by Kul</span>
          <span>Crafted with Next.js</span>
        </footer>
      </div>
    </main>
  );
}
