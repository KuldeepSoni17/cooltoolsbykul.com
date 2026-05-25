"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CATALOG_MANIFEST,
  MATCH_LABELS,
  OWNERSHIP_LABELS,
  PRICE_VERDICT_LABELS,
  PRODUCT_COUNT,
  QUALITY_VERDICT_LABELS,
  SHOP_CATEGORIES,
  formatInrRange,
  type MatchLevel,
  type Ownership,
  type PriceVerdict,
  type ProductAlternative,
  type ProductIndexEntry,
  type QualityVerdict,
} from "@/lib/swadeshi/data";
import { fetchCatalogIndex, fetchCategoryProducts, searchIndex } from "@/lib/swadeshi/catalog-loader";
import SwipeCardDeck from "./SwipeCardDeck";
import styles from "./swadeshi.module.css";

function MatchBadge({ level }: { level: MatchLevel }) {
  const cls =
    level === "strong"
      ? styles.matchStrong
      : level === "good"
        ? styles.matchGood
        : styles.matchSituational;
  return <span className={`${styles.badge} ${cls}`}>{MATCH_LABELS[level].label}</span>;
}

function QualityPill({ verdict }: { verdict: QualityVerdict }) {
  const info = QUALITY_VERDICT_LABELS[verdict];
  return (
    <span className={`${styles.badge} ${info.tone === "caution" ? styles.matchSituational : styles.matchGood}`}>
      {info.label}
    </span>
  );
}

function PricePill({ verdict }: { verdict: PriceVerdict }) {
  return <span className={`${styles.badge} ${styles.ownIndian}`}>{PRICE_VERDICT_LABELS[verdict]}</span>;
}

function OwnershipBadge({ ownership }: { ownership: Ownership }) {
  const isMnc = ownership === "mnc-global";
  return (
    <span className={`${styles.badge} ${isMnc ? styles.ownMnc : styles.ownIndian}`}>
      {OWNERSHIP_LABELS[ownership]}
    </span>
  );
}

function SwipeCard({ item }: { item: ProductAlternative }) {
  return (
    <div className={styles.swCard}>
      <div className={styles.swCardHeader}>
        <span className={styles.swCardOccasion}>{item.occasion}</span>
        {item.subcategory && (
          <span className={styles.swCardSub}>{item.subcategory}</span>
        )}
      </div>

      <div className={styles.swCardVs}>
        <div className={styles.swCardSide}>
          <span className={styles.swCardSideLabel}>Common pick</span>
          <p className={styles.swCardBrand}>{item.common.brand}</p>
          <p className={styles.swCardProduct}>{item.common.product}</p>
          <OwnershipBadge ownership={item.common.ownership} />
        </div>
        <div className={styles.swCardDivider}>
          <span className={styles.swCardArrow}>→</span>
        </div>
        <div className={`${styles.swCardSide} ${styles.swCardSideAlt}`}>
          <span className={styles.swCardSideLabel}>Indian option</span>
          <p className={styles.swCardBrand}>{item.alternative.brand}</p>
          <p className={styles.swCardProduct}>{item.alternative.product}</p>
          <OwnershipBadge ownership={item.alternative.ownership} />
        </div>
      </div>

      <div className={styles.swCardMeta}>
        <div className={styles.badgeRow}>
          <MatchBadge level={item.match} />
          {item.qualityVerdict && <QualityPill verdict={item.qualityVerdict} />}
          {item.priceVerdict && <PricePill verdict={item.priceVerdict} />}
        </div>
      </div>

      {item.price && (
        <div className={styles.swCardPrice}>
          <div className={styles.swCardPriceCol}>
            <span className={styles.swCardPriceLabel}>{item.common.brand}</span>
            <span className={styles.swCardPriceVal}>{formatInrRange(item.price.commonRange)}</span>
          </div>
          <div className={styles.swCardPriceDot} />
          <div className={styles.swCardPriceCol}>
            <span className={styles.swCardPriceLabel}>{item.alternative.brand}</span>
            <span className={styles.swCardPriceVal}>{formatInrRange(item.price.altRange)}</span>
          </div>
        </div>
      )}

      {item.summary && <p className={styles.swCardSummary}>{item.summary}</p>}

      <p className={styles.swCardTap}>Tap for full comparison</p>
    </div>
  );
}

export default function ShopView({ onSelectProduct }: { onSelectProduct: (id: string) => void }) {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [subcategory, setSubcategory] = useState<string | "all">("all");
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<ProductIndexEntry[] | null>(null);
  const [products, setProducts] = useState<ProductAlternative[]>([]);
  const [loading, setLoading] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [listMode, setListMode] = useState(false);

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
      setCardIndex(0);
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

  const category = categoryId ? SHOP_CATEGORIES.find((c) => c.id === categoryId) : null;
  const categoryMeta = categoryId ? CATALOG_MANIFEST.categories.find((c) => c.id === categoryId) : null;

  return (
    <div className={styles.shopWrap}>
      {/* Search */}
      <div className={styles.shopSearchBar}>
        <input
          type="search"
          className={styles.shopSearchInput}
          placeholder="Search brands, products…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCardIndex(0);
          }}
        />
      </div>

      {/* Category pills */}
      <div className={styles.shopPillTrack}>
        <button
          type="button"
          className={`${styles.shopPill} ${!categoryId ? styles.shopPillActive : ""}`}
          onClick={() => { setCategoryId(null); setCardIndex(0); }}
        >
          All
        </button>
        {SHOP_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`${styles.shopPill} ${categoryId === cat.id ? styles.shopPillActive : ""}`}
            onClick={() => { setCategoryId(cat.id); setCardIndex(0); }}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Landing grid when no category selected */}
      {!categoryId && !query && (
        <div className={styles.shopLanding}>
          <h2 className={styles.shopLandingTitle}>
            {PRODUCT_COUNT.toLocaleString("en-IN")}+ comparisons
          </h2>
          <p className={styles.shopLandingDesc}>Pick an aisle to start swiping</p>
          <div className={styles.shopAisleGrid}>
            {SHOP_CATEGORIES.map((cat) => {
              const count = CATALOG_MANIFEST.categories.find((c) => c.id === cat.id)?.count ?? 0;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={styles.shopAisleCard}
                  onClick={() => { setCategoryId(cat.id); setCardIndex(0); }}
                >
                  <span className={styles.shopAisleEmoji}>{cat.emoji}</span>
                  <span className={styles.shopAisleName}>{cat.label}</span>
                  <span className={styles.shopAisleCount}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Subcategory pills when category selected */}
      {categoryId && subcategories.length > 2 && (
        <div className={styles.shopPillTrack}>
          {subcategories.map((sub) => (
            <button
              key={sub}
              type="button"
              className={`${styles.shopPill} ${styles.shopPillSm} ${subcategory === sub ? styles.shopPillActive : ""}`}
              onClick={() => { setSubcategory(sub); setCardIndex(0); }}
            >
              {sub === "all" ? "All" : sub}
            </button>
          ))}
        </div>
      )}

      {/* Mode toggle */}
      {categoryId && filteredProducts.length > 0 && (
        <div className={styles.shopModeRow}>
          <span className={styles.shopModeLabel}>
            {category?.emoji} {category?.label} · {filteredProducts.length} pairs
          </span>
          <div className={styles.shopModeToggle}>
            <button
              type="button"
              className={`${styles.shopModeBtn} ${!listMode ? styles.shopModeBtnActive : ""}`}
              onClick={() => setListMode(false)}
            >
              Cards
            </button>
            <button
              type="button"
              className={`${styles.shopModeBtn} ${listMode ? styles.shopModeBtnActive : ""}`}
              onClick={() => setListMode(true)}
            >
              List
            </button>
          </div>
        </div>
      )}

      {loading && <p className={styles.empty}>Loading…</p>}
      {error && <p className={styles.empty}>{error}</p>}

      {/* Swipe card deck */}
      {!loading && !error && (categoryId || query) && filteredProducts.length > 0 && !listMode && (
        <SwipeCardDeck
          count={filteredProducts.length}
          activeIndex={cardIndex}
          onIndexChange={setCardIndex}
          onTap={(i) => onSelectProduct(filteredProducts[i].id)}
          renderCard={(i) => <SwipeCard item={filteredProducts[i]} />}
        />
      )}

      {/* List mode */}
      {!loading && !error && (categoryId || query) && filteredProducts.length > 0 && listMode && (
        <div className={styles.shopListWrap}>
          {filteredProducts.map((item) => (
            <button
              key={item.id}
              type="button"
              className={styles.shopListItem}
              onClick={() => onSelectProduct(item.id)}
            >
              <div className={styles.shopListTop}>
                <span className={styles.shopListOccasion}>{item.occasion}</span>
                <MatchBadge level={item.match} />
              </div>
              <p className={styles.shopListBrands}>
                {item.common.brand}
                <span className={styles.shopListArrow}> → </span>
                {item.alternative.brand}
              </p>
              {item.qualityVerdict && (
                <div className={styles.badgeRow} style={{ marginTop: "0.35rem" }}>
                  <QualityPill verdict={item.qualityVerdict} />
                  {item.priceVerdict && <PricePill verdict={item.priceVerdict} />}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {!loading && !error && (categoryId || query) && filteredProducts.length === 0 && (
        <p className={styles.empty}>No pairs found. Try a different aisle or search.</p>
      )}
    </div>
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
        {item.subcategory && <p className={styles.detailSub}>{item.subcategory}</p>}
        <div className={styles.badgeRow}>
          <MatchBadge level={item.match} />
          {qv && (
            <span className={`${styles.badge} ${qv.tone === "caution" ? styles.matchSituational : styles.matchStrong}`}>
              {qv.label}
            </span>
          )}
          {item.priceVerdict && <PricePill verdict={item.priceVerdict} />}
          {item.trustLevel === "verified" && (
            <span className={`${styles.badge} ${styles.matchStrong}`}>Human verified</span>
          )}
        </div>
      </div>

      {item.summary && (
        <div className={`${styles.infoBlock} ${styles.infoWhy}`} style={{ margin: "1rem 1.35rem 0" }}>
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
