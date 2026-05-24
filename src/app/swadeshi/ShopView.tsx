"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CATALOG_MANIFEST,
  MATCH_LABELS,
  OWNERSHIP_LABELS,
  PRODUCT_COUNT,
  QUALITY_VERDICT_LABELS,
  SHOP_CATEGORIES,
  formatInrRange,
  type MatchLevel,
  type Ownership,
  type ProductAlternative,
  type ProductIndexEntry,
} from "@/lib/swadeshi/data";
import { fetchCatalogIndex, fetchCategoryProducts, searchIndex } from "@/lib/swadeshi/catalog-loader";
import { SwadeshiCarousel } from "./SwadeshiCarousel";
import styles from "./swadeshi.module.css";

const PAGE_SIZE = 24;

function MatchBadge({ level }: { level: MatchLevel }) {
  const cls =
    level === "strong"
      ? styles.matchStrong
      : level === "good"
        ? styles.matchGood
        : styles.matchSituational;
  return <span className={`${styles.badge} ${cls}`}>{MATCH_LABELS[level].label}</span>;
}

function ProductCarouselCard({
  item,
  onSelect,
}: {
  item: ProductAlternative;
  onSelect: (id: string) => void;
}) {
  const qv = item.qualityVerdict ? QUALITY_VERDICT_LABELS[item.qualityVerdict] : null;
  return (
    <button
      type="button"
      className={styles.shopCard}
      onClick={() => onSelect(item.id)}
      role="listitem"
    >
      <p className={styles.shopCardOccasion}>{item.occasion}</p>
      <p className={styles.shopCardBrands}>
        {item.common.brand}
        <span className={styles.listArrow}> → </span>
        {item.alternative.brand}
      </p>
      <div className={styles.badgeRow}>
        <MatchBadge level={item.match} />
        {qv && (
          <span
            className={`${styles.badge} ${qv.tone === "caution" ? styles.matchSituational : styles.matchGood}`}
          >
            {qv.label}
          </span>
        )}
      </div>
      {item.summary && <p className={styles.shopCardSummary}>{item.summary}</p>}
    </button>
  );
}

export default function ShopView({ onSelectProduct }: { onSelectProduct: (id: string) => void }) {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [subcategory, setSubcategory] = useState<string | "all">("all");
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<ProductIndexEntry[] | null>(null);
  const [products, setProducts] = useState<ProductAlternative[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCatalogIndex()
      .then(setIndex)
      .catch(() => setError("Could not load catalog. Refresh and try again."));
  }, []);

  const loadCategory = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCategoryProducts(id);
      setProducts(data);
      setPage(1);
      setSubcategory("all");
    } catch {
      setError("Could not load this aisle.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (categoryId) loadCategory(categoryId);
    else setProducts([]);
  }, [categoryId, loadCategory]);

  const subcategories = useMemo(() => {
    const set = new Set(products.map((p) => p.subcategory));
    return ["all", ...Array.from(set).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!query.trim()) {
      return products.filter((p) => subcategory === "all" || p.subcategory === subcategory);
    }
    if (!index) return [];
    const hits = searchIndex(index, query, categoryId);
    const ids = new Set(hits.map((h) => h.id));
    return products.filter((p) => ids.has(p.id));
  }, [products, subcategory, query, index, categoryId]);

  const visible = filteredProducts.slice(0, page * PAGE_SIZE);
  const category = categoryId ? SHOP_CATEGORIES.find((c) => c.id === categoryId) : null;
  const categoryMeta = categoryId
    ? CATALOG_MANIFEST.categories.find((c) => c.id === categoryId)
    : null;

  return (
    <>
      <div className={styles.shopHero}>
        <p className={styles.sectionLabel}>Shop smarter</p>
        <h2 className={styles.importHeroTitle}>
          {category ? category.label : "Pick an aisle"}
        </h2>
        <p className={styles.importHeroDesc}>
          {category
            ? `${categoryMeta?.count ?? 0} honest pairs · swipe the carousel · tap for full comparison`
            : `${PRODUCT_COUNT.toLocaleString("en-IN")}+ tier-matched comparisons across ${SHOP_CATEGORIES.length} aisles.`}
        </p>
      </div>

      <label className={styles.searchWrap}>
        <span className={styles.searchLabel}>Search catalog</span>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Brand, product, occasion…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
      </label>

      <SwadeshiCarousel
        ariaLabel="Shop categories"
        header={<p className={styles.sectionLabel}>Aisles</p>}
      >
        <button
          type="button"
          className={`${styles.carouselChip} ${!categoryId ? styles.carouselChipActive : ""}`}
          onClick={() => setCategoryId(null)}
        >
          All aisles
        </button>
        {SHOP_CATEGORIES.map((cat) => {
          const count = CATALOG_MANIFEST.categories.find((c) => c.id === cat.id)?.count;
          return (
            <button
              key={cat.id}
              type="button"
              className={`${styles.carouselChip} ${categoryId === cat.id ? styles.carouselChipActive : ""}`}
              onClick={() => setCategoryId(cat.id)}
            >
              {cat.emoji} {cat.label}
              {count ? ` (${count})` : ""}
            </button>
          );
        })}
      </SwadeshiCarousel>

      {!categoryId && (
        <div className={styles.categoryGrid} style={{ marginTop: "1rem" }}>
          {SHOP_CATEGORIES.map((cat) => {
            const count = CATALOG_MANIFEST.categories.find((c) => c.id === cat.id)?.count ?? 0;
            return (
              <button
                key={cat.id}
                type="button"
                className={styles.categoryCard}
                onClick={() => setCategoryId(cat.id)}
              >
                <span className={styles.categoryEmoji}>{cat.emoji}</span>
                <p className={styles.categoryLabel}>{cat.label}</p>
                <p className={styles.categoryHint}>{count} pairs · {cat.hint}</p>
              </button>
            );
          })}
        </div>
      )}

      {categoryId && (
        <>
          {subcategories.length > 2 && (
            <SwadeshiCarousel ariaLabel="Subcategories" header={<p className={styles.sectionLabel}>Within this aisle</p>}>
              {subcategories.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  className={`${styles.carouselChip} ${subcategory === sub ? styles.carouselChipActive : ""}`}
                  onClick={() => {
                    setSubcategory(sub);
                    setPage(1);
                  }}
                >
                  {sub === "all" ? "All" : sub}
                </button>
              ))}
            </SwadeshiCarousel>
          )}

          {loading && <p className={styles.empty}>Loading {category?.label}…</p>}
          {error && <p className={styles.empty}>{error}</p>}

          {!loading && !error && filteredProducts.length > 0 && (
            <>
              <SwadeshiCarousel
                ariaLabel="Featured pairs in aisle"
                header={
                  <p className={styles.sectionLabel}>
                    Swipe comparisons · {filteredProducts.length} shown
                  </p>
                }
              >
                {filteredProducts.slice(0, 12).map((item) => (
                  <ProductCarouselCard key={item.id} item={item} onSelect={onSelectProduct} />
                ))}
              </SwadeshiCarousel>

              <div className={styles.shopListSection}>
                <p className={styles.sectionLabel}>All in {category?.label}</p>
                <div className={styles.shopGrid}>
                  {visible.map((item) => (
                    <ProductCarouselCard key={`grid-${item.id}`} item={item} onSelect={onSelectProduct} />
                  ))}
                </div>
                {visible.length < filteredProducts.length && (
                  <button
                    type="button"
                    className={styles.loadMoreBtn}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Load more ({filteredProducts.length - visible.length} remaining)
                  </button>
                )}
              </div>
            </>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <p className={styles.empty}>No pairs match your search in this aisle.</p>
          )}
        </>
      )}
    </>
  );
}

export function AlternativeDetailPanel({ item }: { item: ProductAlternative }) {
  const qv = item.qualityVerdict ? QUALITY_VERDICT_LABELS[item.qualityVerdict] : null;

  return (
    <article className={styles.detailCard}>
      <div className={styles.detailHeader}>
        <p className={styles.detailOccasion}>{item.occasion}</p>
        <p className={styles.detailVs}>
          {item.common.brand} → {item.alternative.brand}
        </p>
        <p className={styles.detailSub}>{item.subcategory}</p>
        <div className={styles.badgeRow}>
          <MatchBadge level={item.match} />
          {qv && (
            <span className={`${styles.badge} ${qv.tone === "caution" ? styles.matchSituational : styles.matchStrong}`}>
              {qv.label}
            </span>
          )}
          {item.trustLevel === "verified" && (
            <span className={`${styles.badge} ${styles.matchStrong}`}>Human verified</span>
          )}
        </div>
      </div>

      {item.summary && (
        <div className={`${styles.infoBlock} ${styles.infoWhy}`}>
          <strong>Quick take</strong>
          <p style={{ marginTop: "0.35rem" }}>{item.summary}</p>
        </div>
      )}

      <div className={styles.detailBody}>
        <div className={`${styles.compareCol} ${styles.colCommon}`}>
          <p className={styles.colLabel}>What many of us reach for</p>
          <p className={styles.colBrand}>{item.common.brand}</p>
          <p className={styles.colProduct}>{item.common.product}</p>
          <p className={styles.colOwnership}>
            <OwnershipBadge ownership={item.common.ownership} /> — {item.common.ownershipNote}
          </p>
        </div>

        <div className={`${styles.compareCol} ${styles.colAlt}`}>
          <p className={styles.colLabel}>Indian option worth knowing</p>
          <p className={styles.colBrand}>{item.alternative.brand}</p>
          <p className={styles.colProduct}>{item.alternative.product}</p>
          <p className={styles.colOwnership}>
            <OwnershipBadge ownership={item.alternative.ownership} /> — {item.alternative.ownershipNote}
          </p>
        </div>

        <div className={`${styles.infoBlock} ${styles.infoWhy}`}>
          <strong>Why we paired these</strong>
          <p style={{ marginTop: "0.35rem" }}>{item.whyMatch}</p>
          <p style={{ marginTop: "0.5rem", fontSize: "0.8rem", opacity: 0.85 }}>
            {MATCH_LABELS[item.match].desc}
          </p>
        </div>

        {item.notSameAs && (
          <div className={`${styles.infoBlock} ${styles.infoNot}`}>
            <strong>Honest caveat</strong>
            <p style={{ marginTop: "0.35rem" }}>{item.notSameAs}</p>
          </div>
        )}

        {item.price && (
          <div className={`${styles.infoBlock} ${styles.infoPrice}`}>
            <strong>Typical price band</strong>
            <p style={{ marginTop: "0.25rem", fontSize: "0.8rem", color: "#57534e" }}>
              {item.price.basis} · verify at store
            </p>
            <div className={styles.priceGrid}>
              <div className={styles.priceCell}>
                <p className={styles.colLabel}>{item.common.brand}</p>
                <p className={styles.priceRange}>{formatInrRange(item.price.commonRange)}</p>
              </div>
              <div className={styles.priceCell}>
                <p className={styles.colLabel}>{item.alternative.brand}</p>
                <p className={styles.priceRange}>{formatInrRange(item.price.altRange)}</p>
              </div>
            </div>
            <p className={styles.priceNote}>{item.price.note}</p>
          </div>
        )}

        {item.alternative.website && (
          <a
            href={item.alternative.website}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkOut}
          >
            Visit {item.alternative.brand} →
          </a>
        )}
      </div>
    </article>
  );
}

function OwnershipBadge({ ownership }: { ownership: Ownership }) {
  const isMnc = ownership === "mnc-global";
  return (
    <span className={`${styles.badge} ${isMnc ? styles.ownMnc : styles.ownIndian}`}>
      {OWNERSHIP_LABELS[ownership]}
    </span>
  );
}
