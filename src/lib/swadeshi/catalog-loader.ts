import type { CatalogManifest, ProductAlternative, ProductIndexEntry, ShopCategory } from "./types";
import manifest from "../../../data/swadeshi/curated/manifest.json";
import categories from "../../../data/swadeshi/curated/categories.json";

export const CATALOG_MANIFEST = manifest as CatalogManifest;
export const SHOP_CATEGORIES = categories as ShopCategory[];

const CACHE = new Map<string, ProductAlternative[]>();

export async function fetchCatalogIndex(): Promise<ProductIndexEntry[]> {
  const res = await fetch("/swadeshi/catalog/index.json");
  if (!res.ok) throw new Error("Failed to load catalog index");
  return res.json() as Promise<ProductIndexEntry[]>;
}

export async function fetchCategoryProducts(categoryId: string): Promise<ProductAlternative[]> {
  if (CACHE.has(categoryId)) return CACHE.get(categoryId)!;
  const res = await fetch(`/swadeshi/catalog/${categoryId}.json`);
  if (!res.ok) throw new Error(`Failed to load category ${categoryId}`);
  const data = (await res.json()) as ProductAlternative[];
  CACHE.set(categoryId, data);
  return data;
}

export function searchIndex(
  index: ProductIndexEntry[],
  query: string,
  categoryId?: string | null,
): ProductIndexEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return categoryId ? index.filter((e) => e.categoryId === categoryId) : index;
  }
  return index.filter((e) => {
    if (categoryId && e.categoryId !== categoryId) return false;
    const hay = `${e.occasion} ${e.commonBrand} ${e.altBrand} ${e.subcategory}`.toLowerCase();
    return hay.includes(q);
  });
}
