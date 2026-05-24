export const DATA_VERSION = "2026-03";
export const LAST_CURATED = "March 2026";

export type {
  Ownership,
  MatchLevel,
  ShopCategory,
  ProductAlternative,
  ProductIndexEntry,
  DigitalAwareness,
  BrandSpotlight,
  ImportOutflowBrand,
  QualityVerdict,
  PriceVerdict,
  TrustLevel,
  CatalogManifest,
} from "./types";

import type { Ownership, MatchLevel, ProductAlternative, ImportOutflowBrand, QualityVerdict, PriceVerdict } from "./types";
import {
  DIGITAL_AWARENESS,
  BRAND_SPOTLIGHT,
  IMPORT_OUTFLOW_BRANDS,
} from "./catalog";
import { CATALOG_MANIFEST, SHOP_CATEGORIES } from "./catalog-loader";

export { SHOP_CATEGORIES, CATALOG_MANIFEST };
export { DIGITAL_AWARENESS, BRAND_SPOTLIGHT, IMPORT_OUTFLOW_BRANDS };
export {
  fetchCatalogIndex,
  fetchCategoryProducts,
  searchIndex,
} from "./catalog-loader";

export const PRODUCT_COUNT = CATALOG_MANIFEST.totalProducts;

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

export const QUALITY_VERDICT_LABELS: Record<
  QualityVerdict,
  { label: string; tone: "positive" | "neutral" | "caution" }
> = {
  comparable: { label: "Comparable quality", tone: "positive" },
  "indian-better-value": { label: "Better value", tone: "positive" },
  "indian-weaker": { label: "Weaker — listed honestly", tone: "caution" },
  "different-tier": { label: "Different tier", tone: "caution" },
};

export const PRICE_VERDICT_LABELS: Record<PriceVerdict, string> = {
  cheaper: "Indian option tends to cost less",
  similar: "Similar price band",
  pricier: "Indian option tends to cost more",
};

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Pick your aisle",
    body: "Browse 1,300+ honest pairs across bathroom, kitchen, snacks, and more.",
  },
  {
    step: 2,
    title: "Swipe the carousel",
    body: "Each card is one common pick and one Indian option at a similar tier — no unfair phone swaps.",
  },
  {
    step: 3,
    title: "Read quality & price verdicts",
    body: "We say when the Indian option is weaker, pricier, or a true like-for-like.",
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
    "Pairs are tier-matched — we do not list Samsung Galaxy vs Lava-style unfair comparisons.",
    "Ownership is labelled honestly — Indian-founded, listed, cooperative, or global MNC.",
    "Quality and price verdicts are explicit: comparable, better value, weaker, or different tier.",
    "Catalog is built via research-assisted pipeline + human-reviewed seeds; verify before you buy.",
    "Phones and import-heavy categories live in the import outflow map.",
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

export async function getProductById(id: string): Promise<ProductAlternative | undefined> {
  const { fetchCatalogIndex, fetchCategoryProducts } = await import("./catalog-loader");
  const index = await fetchCatalogIndex();
  const entry = index.find((e) => e.id === id);
  if (!entry) return undefined;
  const products = await fetchCategoryProducts(entry.categoryId);
  return products.find((p) => p.id === id);
}

export const IMPORT_INTENSITY: Record<
  ImportOutflowBrand["importDependency"],
  { label: string; score: number }
> = {
  "very-high": { label: "Very high outflow", score: 90 },
  high: { label: "High outflow", score: 70 },
  medium: { label: "Medium outflow", score: 45 },
};

export const OUTFLOW_TYPE_LABELS: Record<ImportOutflowBrand["outflowType"], string> = {
  electronics: "Electronics & devices",
  energy: "Energy & fuels",
  luxury: "Luxury & precious goods",
  "digital-services": "Digital services",
  "consumer-goods": "Consumer goods",
};
