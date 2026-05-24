export const DATA_VERSION = "2025-05";
export const LAST_CURATED = "May 2025";

export type {
  Ownership,
  MatchLevel,
  ShopCategory,
  ProductAlternative,
  DigitalAwareness,
  BrandSpotlight,
} from "./types";

import type { Ownership, MatchLevel, ProductAlternative } from "./types";
import {
  PRODUCT_ALTERNATIVES,
  SHOP_CATEGORIES,
  DIGITAL_AWARENESS,
  BRAND_SPOTLIGHT,
} from "./catalog";

export { PRODUCT_ALTERNATIVES, SHOP_CATEGORIES, DIGITAL_AWARENESS, BRAND_SPOTLIGHT };

export const OWNERSHIP_LABELS: Record<Ownership, string> = {
  "indian-founded": "Indian-founded",
  "indian-listed": "Indian-listed co.",
  cooperative: "Indian cooperative",
  "mnc-global": "Global MNC",
};

export const MATCH_LABELS: Record<MatchLevel, { label: string; desc: string }> = {
  strong: {
    label: "Strong match",
    desc: "Same product type, same price shelf, same daily use.",
  },
  good: {
    label: "Good match",
    desc: "Same occasion; minor differences in format or flavour.",
  },
  situational: {
    label: "Situational",
    desc: "Works if your priority fits — not a drop-in clone.",
  },
};

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Pick your aisle",
    body: "Start with where you actually shop — bathroom, kitchen, snacks — not a random brand list.",
  },
  {
    step: 2,
    title: "See one honest pair",
    body: "Each card is one common pick and one Indian option that solves the same job. No iPhone-vs-Lava nonsense.",
  },
  {
    step: 3,
    title: "Read the fine print",
    body: "We show who owns what, how strong the match is, and a price band — not fake exact rupees.",
  },
  {
    step: 4,
    title: "Choose, don't preach",
    body: "Try one swap if it fits. Keep what works. Awareness is the point.",
  },
] as const;

export const METHODOLOGY = {
  title: "How we curate",
  points: [
    "We only list pairs we'd use ourselves in the same shopping trip.",
    "Ownership is labelled honestly — Indian-founded, listed, cooperative, or global MNC.",
    "Prices are typical MRP bands for comparable pack sizes, checked against brand sites and major retailers. They drift — verify before you buy.",
    "We remove entries when ownership changes or the match is marketing, not reality.",
    "This is not medical, financial, or legal advice.",
  ],
};

export function formatInrRange([low, high]: [number, number]): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);
  if (low === high) return fmt(low);
  return `${fmt(low)} – ${fmt(high)}`;
}

export function getAlternativesByCategory(categoryId: string): ProductAlternative[] {
  return PRODUCT_ALTERNATIVES.filter((a) => a.categoryId === categoryId);
}

export function getAlternativeById(id: string): ProductAlternative | undefined {
  return PRODUCT_ALTERNATIVES.find((a) => a.id === id);
}
