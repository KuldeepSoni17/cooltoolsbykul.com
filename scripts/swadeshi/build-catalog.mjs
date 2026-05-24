/**
 * Swadeshi catalog builder — generates tier-matched product pairs from brand matrix.
 * Run: node scripts/swadeshi/build-catalog.mjs
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { BRAND_MATRIX, SHOP_CATEGORIES } from "./brand-matrix.mjs";

import path from "node:path";

const ROOT = path.join(fileURLToPath(new URL("../../", import.meta.url)));
const OUT_DIR = path.join(ROOT, "data/swadeshi/curated");
const MANUAL_PATH = path.join(ROOT, "data/swadeshi/raw/manual-pairs.json");

function slug(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function priceVerdict(commonRange, altRange) {
  const cMid = (commonRange[0] + commonRange[1]) / 2;
  const aMid = (altRange[0] + altRange[1]) / 2;
  const ratio = aMid / cMid;
  if (ratio <= 0.85) return "cheaper";
  if (ratio >= 1.15) return "pricier";
  return "similar";
}

function qualityLabel(v) {
  const map = {
    comparable: "Comparable quality for daily use",
    "indian-better-value": "Indian option wins on value",
    "indian-weaker": "Indian option is weaker — listed honestly",
    "different-tier": "Different tier — not a drop-in swap",
  };
  return map[v] ?? v;
}

function makeWhyMatch(sub, common, alt, match) {
  if (alt.whyMatch) return alt.whyMatch;
  const base = `Both cover ${sub.occasion.toLowerCase()} in the ${sub.tier} tier — same shopping moment, comparable pack sizes.`;
  if (match === "situational") {
    return `${base} Format or feel may differ; read the caveat before switching.`;
  }
  return base;
}

function makeNotSameAs(sub, common, alt, match, qualityVerdict) {
  if (alt.notSameAs) return alt.notSameAs;
  if (qualityVerdict === "indian-weaker") {
    return `${alt.brand} may not match ${common.brand} on finish, durability, or consistency — acceptable if you prioritise Indian ownership over peak performance.`;
  }
  if (qualityVerdict === "different-tier") {
    return `Not a fair like-for-like with ${common.brand}. We list this only where buyers explicitly want a budget or different-format Indian option.`;
  }
  if (match === "situational") {
    return `Not a clone of ${common.product}. Same occasion, different product experience.`;
  }
  if (sub.excludePhoneTier) {
    return "Smartphones are not listed as shop swaps — see Import outflow map for phone economics.";
  }
  return undefined;
}

function pairFromMatrix(sub, common, alt) {
  const match = alt.match ?? (common.tier === alt.tier ? "good" : "situational");
  const qualityVerdict =
    alt.qualityVerdict ??
    (match === "strong" ? "comparable" : match === "good" ? "indian-better-value" : "different-tier");
  const commonRange = common.priceRange ?? sub.defaultCommonRange;
  const altRange = alt.priceRange ?? sub.defaultAltRange;
  const id = slug(`${sub.categoryId}-${sub.id}-${common.brand}-${alt.brand}`);

  return {
    id,
    categoryId: sub.categoryId,
    subcategory: sub.label,
    occasion: sub.occasion,
    tags: [sub.label, sub.tier, ...(sub.tags ?? [])],
    trustLevel: alt.trustLevel ?? common.trustLevel ?? "research-assisted",
    common: {
      brand: common.brand,
      product: common.product,
      ownership: common.ownership,
      ownershipNote: common.ownershipNote,
    },
    alternative: {
      brand: alt.brand,
      product: alt.product,
      ownership: alt.ownership,
      ownershipNote: alt.ownershipNote,
      website: alt.website,
    },
    match,
    qualityVerdict,
    priceVerdict: alt.priceVerdict ?? priceVerdict(commonRange, altRange),
    whyMatch: makeWhyMatch(sub, common, alt, match),
    notSameAs: makeNotSameAs(sub, common, alt, match, qualityVerdict),
    price: {
      basis: sub.priceBasis,
      commonRange,
      altRange,
      note: alt.priceNote ?? sub.priceNote ?? "Typical MRP band — verify before you buy.",
    },
    summary: `${common.brand} → ${alt.brand}: ${qualityLabel(qualityVerdict)}. Price tends to be ${priceVerdict(commonRange, altRange)}.`,
  };
}

function generateFromMatrix() {
  const products = [];
  const seen = new Set();

  for (const sub of BRAND_MATRIX) {
    for (const common of sub.common) {
      for (const alt of sub.indian) {
        if (common.tier !== alt.tier && !alt.allowCrossTier) continue;
        if (sub.blockedPairs?.some(([a, b]) => a === common.brand && b === alt.brand)) continue;

        const row = pairFromMatrix(sub, common, alt);
        if (seen.has(row.id)) continue;
        seen.add(row.id);
        products.push(row);
      }
    }
  }

  return products;
}

async function loadManual() {
  try {
    const raw = await readFile(MANUAL_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const generated = generateFromMatrix();
  const manual = await loadManual();

  const byId = new Map();
  for (const row of generated) byId.set(row.id, row);
  for (const row of manual) byId.set(row.id, { ...byId.get(row.id), ...row, trustLevel: "verified" });

  const products = [...byId.values()].sort((a, b) =>
    a.categoryId.localeCompare(b.categoryId) || a.subcategory.localeCompare(b.subcategory),
  );

  const manifest = {
    version: "2026-03",
    generatedAt: new Date().toISOString(),
    totalProducts: products.length,
    categories: SHOP_CATEGORIES.map((c) => ({
      ...c,
      count: products.filter((p) => p.categoryId === c.id).length,
    })),
  };

  if (products.length < 1000) {
    console.error(`Catalog has ${products.length} products — expected at least 1000. Expand brand-matrix.mjs.`);
    process.exit(1);
  }

  const publicDir = path.join(ROOT, "public/swadeshi/catalog");
  await mkdir(publicDir, { recursive: true });

  await writeFile(path.join(OUT_DIR, "products.json"), JSON.stringify(products));
  await writeFile(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
  await writeFile(path.join(OUT_DIR, "categories.json"), JSON.stringify(SHOP_CATEGORIES, null, 2));

  const index = products.map((p) => ({
    id: p.id,
    categoryId: p.categoryId,
    subcategory: p.subcategory,
    occasion: p.occasion,
    commonBrand: p.common.brand,
    altBrand: p.alternative.brand,
    match: p.match,
    trustLevel: p.trustLevel,
  }));

  await writeFile(path.join(publicDir, "index.json"), JSON.stringify(index));
  for (const cat of SHOP_CATEGORIES) {
    const slice = products.filter((p) => p.categoryId === cat.id);
    await writeFile(path.join(publicDir, `${cat.id}.json`), JSON.stringify(slice));
  }

  console.log(`Wrote ${products.length} products to data/swadeshi/curated/products.json`);
  console.log(`Published ${SHOP_CATEGORIES.length} category files + index to public/swadeshi/catalog/`);
  for (const c of manifest.categories) {
    console.log(`  ${c.emoji} ${c.label}: ${c.count}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
