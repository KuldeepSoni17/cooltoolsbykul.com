"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BRAND_CATEGORIES,
  BRAND_SWAPS,
  FLOW_AWARENESS,
  formatInr,
  INDIAN_SPOTLIGHT,
  priceDelta,
} from "@/lib/swadeshi/data";
import styles from "./swadeshi.module.css";

type Section = "swaps" | "flow" | "spotlight";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "swaps", label: "Brand swaps" },
  { id: "flow", label: "Where value flows" },
  { id: "spotlight", label: "Indian ecosystem" },
];

export default function SwadeshiClient() {
  const [section, setSection] = useState<Section>("swaps");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [spotlightTier, setSpotlightTier] = useState<"all" | "established" | "startup">("all");

  const filteredSwaps = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BRAND_SWAPS.filter((s) => {
      if (category !== "All" && s.category !== category) return false;
      if (!q) return true;
      return (
        s.globalBrand.toLowerCase().includes(q) ||
        s.indianBrand.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.whyComparable.toLowerCase().includes(q)
      );
    });
  }, [query, category]);

  const filteredSpotlight = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INDIAN_SPOTLIGHT.filter((b) => {
      if (spotlightTier !== "all" && b.tier !== spotlightTier) return false;
      if (!q) return true;
      return (
        b.name.toLowerCase().includes(q) ||
        b.sector.toLowerCase().includes(q) ||
        b.knownFor.toLowerCase().includes(q)
      );
    });
  }, [query, spotlightTier]);

  const filteredFlow = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FLOW_AWARENESS;
    return FLOW_AWARENESS.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.whatWeUse.toLowerCase().includes(q) ||
        f.indianAngle.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className={styles.root}>
      <header className={styles.heroBand}>
        <div className={styles.chakra} aria-hidden />
        <div className="relative z-10 mx-auto max-w-5xl px-6 py-12 sm:px-10 sm:py-16">
          <Link
            href="/"
            className="text-sm font-medium text-indigo-200 hover:text-white"
          >
            ← cooltoolsbykul.com
          </Link>
          <p
            className={`mt-8 text-4xl font-bold tracking-tight sm:text-5xl ${styles.devanagari}`}
          >
            स्वदेशी
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
            Swadeshi movement portal
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-indigo-100 sm:text-lg">
            Not preachy. Not boycott lists. Just honest pairs — Colgate and Perfora,
            not iPhone and Lava — plus a gentle look at where everyday rupees travel,
            and brands worth knowing.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className={`${styles.badge} bg-white/15 text-white`}>
              🇮🇳 Made for India
            </span>
            <span className={`${styles.badge} bg-orange-500/90 text-white`}>
              Comparable swaps only
            </span>
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-20 border-b border-indigo-100/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-4 sm:px-10">
          <nav className={styles.nav} aria-label="Sections">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`${styles.navBtn} ${section === s.id ? styles.navBtnActive : ""}`}
                onClick={() => setSection(s.id)}
              >
                {s.label}
              </button>
            ))}
          </nav>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              ⌕
            </span>
            <input
              type="search"
              className={styles.search}
              placeholder={
                section === "swaps"
                  ? "Search brands — Colgate, Lay's, Nike…"
                  : section === "flow"
                    ? "Search apps — YouTube, WhatsApp…"
                    : "Search Indian brands — Amul, boAt…"
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search"
            />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-6 py-10 sm:px-10 sm:py-12">
        {section === "swaps" && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-indigo-900">Comparable brand swaps</h2>
              <p className="mt-1 text-sm text-slate-600">
                Same shelf, same job — approximate MRP for context (prices vary by city
                and offers).
              </p>
            </div>
            <div className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {BRAND_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`${styles.filterChip} ${category === cat ? styles.filterChipActive : ""}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredSwaps.map((swap) => {
                const delta = priceDelta(swap.globalPrice.amount, swap.indianPrice.amount);
                return (
                  <article
                    key={swap.id}
                    className={`${styles.card} ${styles.orangeAccent}`}
                  >
                    <span className={`${styles.badge} ${styles.badgeIndigo}`}>
                      {swap.category}
                    </span>
                    <div className="mt-3 flex flex-wrap items-baseline gap-2">
                      <h3 className="text-lg font-bold text-slate-800">
                        {swap.globalBrand}
                      </h3>
                      <span className="text-orange-500 font-semibold">→</span>
                      <h3 className="text-lg font-bold text-orange-600">
                        {swap.indianBrand}
                      </h3>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {swap.whyComparable}
                    </p>
                    <div className={styles.priceRow}>
                      <div className={`${styles.priceBox} ${styles.priceGlobal}`}>
                        <p className="text-xs font-semibold uppercase text-slate-500">
                          Global / MNC
                        </p>
                        <p className="mt-1 font-medium text-slate-800">
                          {swap.globalPrice.label}
                        </p>
                        <p className="mt-1 text-lg font-bold">
                          {formatInr(swap.globalPrice.amount)}
                        </p>
                      </div>
                      <div className={`${styles.priceBox} ${styles.priceIndian}`}>
                        <p className="text-xs font-semibold uppercase text-orange-700">
                          Indian alternative
                        </p>
                        <p className="mt-1 font-medium text-slate-800">
                          {swap.indianPrice.label}
                        </p>
                        <p className="mt-1 text-lg font-bold text-orange-700">
                          {formatInr(swap.indianPrice.amount)}
                        </p>
                      </div>
                    </div>
                    {swap.indianPrice.note && (
                      <p className="mt-2 text-xs text-slate-500">{swap.indianPrice.note}</p>
                    )}
                    <p
                      className={`${styles.delta} ${
                        delta.cheaper === "indian"
                          ? styles.deltaIndian
                          : delta.cheaper === "global"
                            ? styles.deltaGlobal
                            : styles.deltaSame
                      }`}
                    >
                      {delta.cheaper === "same"
                        ? "Roughly same price band"
                        : delta.cheaper === "indian"
                          ? `Indian option ~${formatInr(Math.abs(delta.diff))} less on this SKU`
                          : `Global SKU ~${formatInr(Math.abs(delta.diff))} less — Indian may win on offers`}
                    </p>
                  </article>
                );
              })}
            </div>
            {filteredSwaps.length === 0 && (
              <p className="text-center text-slate-500 py-12">No matches — try another search.</p>
            )}
          </>
        )}

        {section === "flow" && (
          <>
            <div className="mb-8 rounded-2xl border border-indigo-200 bg-indigo-50/80 p-6">
              <h2 className="text-xl font-bold text-indigo-900">A gentle map</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                YouTube, WhatsApp, and Netflix are brilliant tools. This section is only
                about awareness — where subscription and ad money tends to land — not a
                lecture to quit anything.
              </p>
            </div>
            <div className="grid gap-4">
              {filteredFlow.map((item) => (
                <article
                  key={item.id}
                  className={`${styles.card} ${styles.flowCard} ${styles.indigoAccent}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-indigo-900">{item.name}</h3>
                    <span className={`${styles.badge} ${styles.badgeIndigo}`}>
                      {item.category}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        What we use it for
                      </p>
                      <p className="mt-1 text-sm text-slate-700">{item.whatWeUse}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Where value often flows
                      </p>
                      <p className="mt-1 text-sm text-slate-700">{item.whereValueFlows}</p>
                    </div>
                    <div className="rounded-lg bg-orange-50 p-3 border border-orange-100">
                      <p className="text-xs font-bold uppercase tracking-wide text-orange-700">
                        Indian angle (optional)
                      </p>
                      <p className="mt-1 text-sm text-slate-700">{item.indianAngle}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {filteredFlow.length === 0 && (
              <p className="text-center text-slate-500 py-12">No matches.</p>
            )}
          </>
        )}

        {section === "spotlight" && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-indigo-900">
                Big Indian brands & honest startups
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Spreading spend across established champions and young builders helps
                wealth circulate inside India — not an endorsement of every product.
              </p>
            </div>
            <div className="mb-6 flex flex-wrap gap-2">
              {(
                [
                  ["all", "All"],
                  ["established", "Established giants"],
                  ["startup", "Honest startups"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`${styles.filterChip} ${spotlightTier === id ? styles.filterChipActive : ""}`}
                  onClick={() => setSpotlightTier(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredSpotlight.map((brand) => (
                <article
                  key={brand.id}
                  className={`${styles.card} ${
                    brand.tier === "established"
                      ? styles.tierEstablished
                      : styles.tierStartup
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{brand.name}</h3>
                    <span
                      className={`${styles.badge} ${
                        brand.tier === "established"
                          ? styles.badgeIndigo
                          : styles.badgeOrange
                      }`}
                    >
                      {brand.tier === "established" ? "Established" : "Startup"}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500">{brand.sector}</p>
                  <p className="mt-2 text-sm text-slate-700">{brand.blurb}</p>
                  <p className="mt-2 text-sm">
                    <span className="font-semibold text-indigo-800">Known for: </span>
                    {brand.knownFor}
                  </p>
                  {brand.website && (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-sm font-semibold text-orange-600 hover:underline"
                    >
                      Visit site →
                    </a>
                  )}
                </article>
              ))}
            </div>
            {filteredSpotlight.length === 0 && (
              <p className="text-center text-slate-500 py-12">No matches.</p>
            )}
          </>
        )}

        <footer className="mt-16 border-t border-indigo-100 pt-8">
          <p className={`${styles.disclaimer} max-w-3xl`}>
            Prices are indicative MRP snapshots (2024–25) for comparison education —
            not live quotes. Brand ownership can be complex (Indian companies with
            foreign investors, MNCs with Indian factories). We focus on realistic
            substitutes and informed choice, not purity tests.
          </p>
          <p className={`${styles.disclaimer} mt-3`}>
            Built for the Swadeshi spirit of awareness —{" "}
            <span className={styles.devanagari}>जानिए, फिर चुनिए</span> (know, then
            choose).
          </p>
        </footer>
      </main>
    </div>
  );
}
