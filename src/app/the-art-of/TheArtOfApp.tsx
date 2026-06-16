"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { CRAFTS, KIND_META, type Craft, type Resource } from "./data";

const ALL_RESOURCES = CRAFTS.flatMap((c) =>
  c.resources.map((r) => ({ ...r, craftId: c.id, craftName: c.name }))
);

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function ResourceCard({
  resource,
  hue,
}: {
  resource: Resource;
  hue: string;
}) {
  const meta = KIND_META[resource.kind];
  return (
    <a
      href={resource.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex h-full flex-col rounded-2xl border bg-[#FBF7EF] p-5 transition hover:-translate-y-0.5 hover:shadow-lg sm:p-6"
      style={{ borderColor: hexToRgba(hue, 0.18) }}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{
            color: hue,
            backgroundColor: hexToRgba(hue, 0.1),
          }}
        >
          {meta.label.replace(/s$/, "")}
        </span>
        <span
          className="text-[10px] font-medium uppercase tracking-[0.14em] text-stone-400 transition group-hover:text-stone-600"
          aria-hidden
        >
          {meta.verb} →
        </span>
      </div>

      <h4 className="mt-3 font-serif text-xl leading-tight text-stone-900 sm:text-[22px]">
        {resource.title}
      </h4>
      {resource.by ? (
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-500">
          By {resource.by}
        </p>
      ) : null}

      <p className="mt-3 flex-1 text-[14px] leading-relaxed text-stone-700">
        {resource.note}
      </p>

      <div
        className="mt-5 inline-flex w-fit items-center gap-1.5 text-[12px] font-semibold"
        style={{ color: hue }}
      >
        Open source
        <span aria-hidden>↗</span>
      </div>
    </a>
  );
}

function CraftPanel({
  craft,
  query,
  kindFilter,
}: {
  craft: Craft;
  query: string;
  kindFilter: string;
}) {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return craft.resources.filter((r) => {
      if (kindFilter !== "all" && r.kind !== kindFilter) return false;
      if (!q) return true;
      const hay = `${r.title} ${r.by ?? ""} ${r.note}`.toLowerCase();
      return hay.includes(q);
    });
  }, [craft.resources, query, kindFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, Resource[]>();
    for (const r of filtered) {
      const list = map.get(r.kind) ?? [];
      list.push(r);
      map.set(r.kind, list);
    }
    return Array.from(map.entries()).sort(
      (a, b) => KIND_META[a[0] as Resource["kind"]].order - KIND_META[b[0] as Resource["kind"]].order
    );
  }, [filtered]);

  return (
    <article className="mt-8">
      <header className="border-b border-stone-300 pb-6">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.32em]"
          style={{ color: craft.hue }}
        >
          The Art Of
        </p>
        <h2 className="mt-2 font-serif text-5xl leading-[1.05] text-stone-900 sm:text-6xl">
          {craft.name}
        </h2>
        <p className="mt-3 max-w-2xl text-base italic text-stone-600 sm:text-lg">
          {craft.tagline}
        </p>
        <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-stone-700 sm:text-base">
          {craft.intro}
        </p>
      </header>

      {filtered.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-stone-300 bg-[#FBF7EF] p-8 text-center text-stone-600">
          <p className="font-serif text-2xl text-stone-900">No matches yet.</p>
          <p className="mt-2 text-sm">
            Try a different search or filter for {craft.name.toLowerCase()}.
          </p>
        </div>
      ) : (
        <div className="mt-10 space-y-12">
          {grouped.map(([kind, list]) => {
            const meta = KIND_META[kind as Resource["kind"]];
            return (
              <section key={kind}>
                <div className="mb-5 flex items-baseline justify-between">
                  <h3 className="font-serif text-2xl text-stone-900 sm:text-3xl">
                    {meta.label}
                  </h3>
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-stone-500">
                    {String(list.length).padStart(2, "0")} picks
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((r) => (
                    <ResourceCard key={r.id} resource={r} hue={craft.hue} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </article>
  );
}

function GlobalSearchPanel({
  query,
  kindFilter,
}: {
  query: string;
  kindFilter: string;
}) {
  const q = query.trim().toLowerCase();
  const matches = useMemo(() => {
    return ALL_RESOURCES.filter((r) => {
      if (kindFilter !== "all" && r.kind !== kindFilter) return false;
      const hay = `${r.title} ${r.by ?? ""} ${r.note} ${r.craftName}`.toLowerCase();
      return hay.includes(q);
    });
  }, [q, kindFilter]);

  return (
    <article className="mt-8">
      <header className="border-b border-stone-300 pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-stone-500">
          Search across crafts
        </p>
        <h2 className="mt-2 font-serif text-4xl leading-[1.05] text-stone-900 sm:text-5xl">
          {matches.length} {matches.length === 1 ? "result" : "results"} for
          <span className="italic"> &ldquo;{query}&rdquo;</span>
        </h2>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {matches.map((r) => {
          const craft = CRAFTS.find((c) => c.id === r.craftId)!;
          return (
            <div key={`${r.craftId}-${r.id}`} className="flex flex-col">
              <span
                className="mb-2 inline-flex w-fit rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em]"
                style={{
                  color: craft.hue,
                  backgroundColor: hexToRgba(craft.hue, 0.1),
                }}
              >
                {craft.name}
              </span>
              <ResourceCard resource={r} hue={craft.hue} />
            </div>
          );
        })}
      </div>
    </article>
  );
}

export default function TheArtOfApp() {
  const [activeId, setActiveId] = useState<string>(CRAFTS[0].id);
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<string>("all");

  const [heroIndex, setHeroIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setHeroIndex((i) => (i + 1) % CRAFTS.length);
    }, 2200);
    return () => clearInterval(t);
  }, []);
  const heroCraft = CRAFTS[heroIndex];

  const tabsRef = useRef<HTMLDivElement>(null);

  const activeCraft = CRAFTS.find((c) => c.id === activeId) ?? CRAFTS[0];
  const isSearching = query.trim().length > 0;

  const allKinds = useMemo(() => {
    const set = new Set<string>();
    for (const c of CRAFTS) {
      for (const r of c.resources) set.add(r.kind);
    }
    return Array.from(set).sort(
      (a, b) =>
        KIND_META[a as Resource["kind"]].order -
        KIND_META[b as Resource["kind"]].order
    );
  }, []);

  const totalCount = ALL_RESOURCES.length;
  const accent = activeCraft.hue;

  return (
    <main
      className="min-h-screen text-stone-900"
      style={{
        backgroundColor: "#F4EDDF",
        backgroundImage:
          "radial-gradient(80% 60% at 50% 0%, rgba(255,255,255,0.9), rgba(244,237,223,0) 60%)",
        ...({ "--accent": accent } as CSSProperties),
      }}
    >
      <div className="mx-auto max-w-6xl px-5 pb-20 pt-6 sm:px-8 sm:pt-10">
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-stone-500 transition hover:text-stone-900"
          >
            <span aria-hidden>←</span>
            cooltoolsbykul
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-stone-500">
            {totalCount} curated picks · {CRAFTS.length} crafts
          </span>
        </header>

        <section className="mt-12 sm:mt-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-stone-500">
            A library of A+++ knowledge
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-[0.98] text-stone-900 sm:text-7xl md:text-[88px]">
            The Art Of{" "}
            <span
              className="inline-block italic transition-colors duration-500"
              style={{ color: heroCraft.hue }}
              aria-live="polite"
            >
              {heroCraft.name}.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-stone-700 sm:text-lg">
            We did not write any of this. We just gathered the books, channels,
            essays and masters that working practitioners actually swear by, in
            one place, for free. Pick a craft below and start.
          </p>
        </section>

        <section className="mt-10 flex flex-col gap-3 sm:mt-14 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative flex-1">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across every craft - books, channels, masters..."
              className="w-full rounded-full border border-stone-300 bg-white px-5 py-3 pr-12 text-sm text-stone-900 outline-none transition focus:border-stone-500 focus:shadow-[0_0_0_4px_rgba(0,0,0,0.04)] sm:text-base"
            />
            <span
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-400"
              aria-hidden
            >
              ⌕
            </span>
          </div>
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value)}
            className="rounded-full border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-stone-500"
          >
            <option value="all">All formats</option>
            {allKinds.map((k) => (
              <option key={k} value={k}>
                {KIND_META[k as Resource["kind"]].label}
              </option>
            ))}
          </select>
        </section>

        {!isSearching ? (
          <nav
            ref={tabsRef}
            className="mt-8 -mx-5 flex gap-2 overflow-x-auto px-5 pb-2 scrollbar-none sm:mx-0 sm:px-0"
            aria-label="Crafts"
          >
            {CRAFTS.map((c) => {
              const active = c.id === activeId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveId(c.id)}
                  className="shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition"
                  style={{
                    borderColor: active ? c.hue : "rgba(120, 113, 108, 0.3)",
                    backgroundColor: active ? c.hue : "transparent",
                    color: active ? "#FBF7EF" : "#44403C",
                  }}
                >
                  {c.name}
                </button>
              );
            })}
          </nav>
        ) : null}

        {isSearching ? (
          <GlobalSearchPanel query={query} kindFilter={kindFilter} />
        ) : (
          <CraftPanel craft={activeCraft} query="" kindFilter={kindFilter} />
        )}

        <footer className="mt-20 border-t border-stone-300 pt-8 text-center">
          <p className="font-serif text-2xl italic text-stone-700">
            Made with respect for every working practitioner.
          </p>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.28em] text-stone-500">
            The Art Of · cooltoolsbykul
          </p>
        </footer>
      </div>
    </main>
  );
}
