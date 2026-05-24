"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  BRAND_SPOTLIGHT,
  DATA_VERSION,
  DIGITAL_AWARENESS,
  IMPORT_OUTFLOW_BRANDS,
  formatInrRange,
  getAlternativeById,
  getAlternativesByCategory,
  HOW_IT_WORKS,
  LAST_CURATED,
  MATCH_LABELS,
  METHODOLOGY,
  OWNERSHIP_LABELS,
  PRODUCT_ALTERNATIVES,
  SHOP_CATEGORIES,
  type MatchLevel,
  type Ownership,
  type ProductAlternative,
} from "@/lib/swadeshi/data";
import ImportOutflowView from "./ImportOutflowView";
import styles from "./swadeshi.module.css";

type View =
  | { name: "home" }
  | { name: "shop"; categoryId: string | null }
  | { name: "detail"; id: string }
  | { name: "digital" }
  | { name: "imports" }
  | { name: "discover" };

function MatchBadge({ level }: { level: MatchLevel }) {
  const cls =
    level === "strong"
      ? styles.matchStrong
      : level === "good"
        ? styles.matchGood
        : styles.matchSituational;
  return (
    <span className={`${styles.badge} ${cls}`}>{MATCH_LABELS[level].label}</span>
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

function AlternativeListItem({
  item,
  onSelect,
}: {
  item: ProductAlternative;
  onSelect: (id: string) => void;
}) {
  return (
    <button type="button" className={styles.listItem} onClick={() => onSelect(item.id)}>
      <p className={styles.listOccasion}>{item.occasion}</p>
      <p className={styles.listBrands}>
        {item.common.brand}
        <span className={styles.listArrow}> → </span>
        {item.alternative.brand}
      </p>
      <div className={styles.badgeRow}>
        <MatchBadge level={item.match} />
        <OwnershipBadge ownership={item.alternative.ownership} />
      </div>
    </button>
  );
}

function AlternativeDetail({ item }: { item: ProductAlternative }) {
  return (
    <article className={styles.detailCard}>
      <div className={styles.detailHeader}>
        <p className={styles.detailOccasion}>{item.occasion}</p>
        <p className={styles.detailVs}>
          {item.common.brand} → {item.alternative.brand}
        </p>
        <div className={styles.badgeRow}>
          <MatchBadge level={item.match} />
        </div>
      </div>

      <div className={styles.detailBody}>
        <div className={`${styles.compareCol} ${styles.colCommon}`}>
          <p className={styles.colLabel}>What many of us reach for</p>
          <p className={styles.colBrand}>{item.common.brand}</p>
          <p className={styles.colProduct}>{item.common.product}</p>
          <p className={styles.colOwnership}>
            <OwnershipBadge ownership={item.common.ownership} /> —{" "}
            {item.common.ownershipNote}
          </p>
        </div>

        <div className={`${styles.compareCol} ${styles.colAlt}`}>
          <p className={styles.colLabel}>Indian option worth knowing</p>
          <p className={styles.colBrand}>{item.alternative.brand}</p>
          <p className={styles.colProduct}>{item.alternative.product}</p>
          <p className={styles.colOwnership}>
            <OwnershipBadge ownership={item.alternative.ownership} /> —{" "}
            {item.alternative.ownershipNote}
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
                <p className={styles.priceRange}>
                  {formatInrRange(item.price.commonRange)}
                </p>
              </div>
              <div className={styles.priceCell}>
                <p className={styles.colLabel}>{item.alternative.brand}</p>
                <p className={styles.priceRange}>
                  {formatInrRange(item.price.altRange)}
                </p>
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

function MethodologyBlock() {
  return (
    <div className={styles.methodBox}>
      <p className={styles.methodTitle}>{METHODOLOGY.title}</p>
      <ul className={styles.methodList}>
        {METHODOLOGY.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      <p style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "#78716c" }}>
        Curated {LAST_CURATED} · data v{DATA_VERSION}
      </p>
    </div>
  );
}

export default function SwadeshiClient() {
  const [view, setView] = useState<View>({ name: "home" });
  const [discoverTab, setDiscoverTab] = useState<"all" | "established" | "startup">("all");
  const [digitalOpen, setDigitalOpen] = useState<string | null>(null);

  const goHome = useCallback(() => setView({ name: "home" }), []);

  const category =
    view.name === "shop" && view.categoryId
      ? SHOP_CATEGORIES.find((c) => c.id === view.categoryId)
      : null;

  const detail = view.name === "detail" ? getAlternativeById(view.id) : undefined;

  const shopItems = useMemo(() => {
    if (view.name !== "shop" || !view.categoryId) return [];
    return getAlternativesByCategory(view.categoryId);
  }, [view]);

  const filteredSpotlight = useMemo(() => {
    if (discoverTab === "all") return BRAND_SPOTLIGHT;
    return BRAND_SPOTLIGHT.filter((b) => b.type === discoverTab);
  }, [discoverTab]);

  const headerBack = () => {
    if (view.name === "detail") {
      const item = getAlternativeById(view.id);
      if (item) setView({ name: "shop", categoryId: item.categoryId });
      else goHome();
      return;
    }
    if (view.name !== "home") goHome();
  };

  const showTopBar = view.name !== "home";

  return (
    <div className={styles.root}>
      {showTopBar && (
        <header className={styles.topBar}>
          <div className={styles.topBarInner}>
            <button type="button" className={styles.backBtn} onClick={headerBack}>
              ← Back
            </button>
            <span className={`${styles.wordmark} ${styles.devanagari}`}>स्वदेशी</span>
            <span className={styles.versionTag}>v{DATA_VERSION}</span>
          </div>
        </header>
      )}

      {view.name === "home" && (
        <>
          <section className={styles.hero}>
            <div className={styles.heroInner}>
              <Link href="/" className={styles.backBtn}>
                ← cooltoolsbykul.com
              </Link>
              <p
                className={`${styles.heroTitle} ${styles.devanagari}`}
                style={{ marginTop: "1.5rem" }}
              >
                स्वदेशी
              </p>
              <h1
                style={{
                  fontSize: "1.35rem",
                  fontWeight: 650,
                  color: "#1c1917",
                  marginTop: "0.5rem",
                }}
              >
                Know what&apos;s Indian. Choose consciously.
              </h1>
              <p className={styles.heroSubtitle}>
                A calm guide to everyday product swaps, where digital rupees flow, and
                brands that keep value in India — with ownership labels and honest price
                bands, not fake exact rupees.
              </p>
              <span className={styles.heroTagline}>
                जानिए, फिर चुनिए — know, then choose
              </span>
            </div>
          </section>

          <div className={styles.page}>
            <p className={styles.sectionLabel}>How to use this</p>
            <div className={styles.steps}>
              {HOW_IT_WORKS.map((step) => (
                <div key={step.step} className={styles.step}>
                  <span className={styles.stepNum}>{step.step}</span>
                  <div>
                    <p className={styles.stepTitle}>{step.title}</p>
                    <p className={styles.stepBody}>{step.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className={styles.sectionLabel} style={{ marginTop: "2.5rem" }}>
              Pick a path
            </p>
            <div className={styles.pathways}>
              <button
                type="button"
                className={`${styles.pathCard} ${styles.pathCardPrimary}`}
                onClick={() => setView({ name: "shop", categoryId: null })}
              >
                <span className={styles.pathEmoji}>🛒</span>
                <p className={styles.pathTitle}>Shop smarter</p>
                <p className={styles.pathDesc}>
                  Pick an aisle — bathroom, kitchen, snacks — then open one honest pair
                  at a time.
                </p>
                <p className={styles.pathAction}>
                  {PRODUCT_ALTERNATIVES.length} curated pairs →
                </p>
              </button>

              <button
                type="button"
                className={`${styles.pathCard} ${styles.pathCardSecondary}`}
                onClick={() => setView({ name: "digital" })}
              >
                <span className={styles.pathEmoji}>📱</span>
                <p className={styles.pathTitle}>Daily apps &amp; subscriptions</p>
                <p className={styles.pathDesc}>
                  Where YouTube, WhatsApp, and streaming money tends to flow — awareness,
                  not a lecture.
                </p>
                <p className={styles.pathAction}>Open map →</p>
              </button>

              <button
                type="button"
                className={`${styles.pathCard} ${styles.pathCardSecondary}`}
                onClick={() => setView({ name: "imports" })}
              >
                <span className={styles.pathEmoji}>🌍</span>
                <p className={styles.pathTitle}>Where India&apos;s money goes out</p>
                <p className={styles.pathDesc}>
                  Import-heavy categories and the global brands where household and business
                  spending often exits India as forex.
                </p>
                <p className={styles.pathAction}>
                  {IMPORT_OUTFLOW_BRANDS.length} outflow categories →
                </p>
              </button>

              <button
                type="button"
                className={`${styles.pathCard} ${styles.pathCardTertiary}`}
                onClick={() => setView({ name: "discover" })}
              >
                <span className={styles.pathEmoji}>🏛</span>
                <p className={styles.pathTitle}>Indian brands to know</p>
                <p className={styles.pathDesc}>
                  Cooperatives, listed giants, and startups — spread spend inside India
                  when it fits you.
                </p>
                <p className={styles.pathAction}>Browse {BRAND_SPOTLIGHT.length} brands →</p>
              </button>
            </div>

            <MethodologyBlock />

            <p className={styles.footerNote}>
              Swadeshi is a curated awareness tool — not a marketplace or affiliate site.
              Ownership and prices change; always verify before you buy.
            </p>
          </div>
        </>
      )}

      {view.name === "shop" && (
        <div className={styles.page}>
          <p className={styles.sectionLabel}>Shop smarter</p>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#1e1b4b" }}>
            {category ? category.label : "Pick an aisle"}
          </h2>
          <p style={{ marginTop: "0.35rem", fontSize: "0.875rem", color: "#57534e" }}>
            {category
              ? "Tap a pair to see ownership, match quality, and price bands."
              : "Where do you actually shop? We only show pairs we'd use in the same trip."}
          </p>

          <div
            className={styles.categoryGrid}
            style={{ marginTop: "1.25rem", marginBottom: category ? "1.25rem" : 0 }}
          >
            {SHOP_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={styles.categoryCard}
                style={
                  category?.id === cat.id
                    ? { borderColor: "#4f46e5", background: "#eef2ff" }
                    : undefined
                }
                onClick={() => setView({ name: "shop", categoryId: cat.id })}
              >
                <span className={styles.categoryEmoji}>{cat.emoji}</span>
                <p className={styles.categoryLabel}>{cat.label}</p>
                <p className={styles.categoryHint}>{cat.hint}</p>
              </button>
            ))}
          </div>

          {category &&
            (shopItems.length === 0 ? (
              <p className={styles.empty}>No pairs in this aisle yet.</p>
            ) : (
              shopItems.map((item) => (
                <AlternativeListItem
                  key={item.id}
                  item={item}
                  onSelect={(id) => setView({ name: "detail", id })}
                />
              ))
            ))}
        </div>
      )}

      {view.name === "detail" && detail && (
        <div className={styles.page}>
          <AlternativeDetail item={detail} />
          <MethodologyBlock />
        </div>
      )}

      {view.name === "detail" && !detail && (
        <div className={styles.page}>
          <p className={styles.empty}>That item isn&apos;t in our catalog.</p>
        </div>
      )}

      {view.name === "digital" && (
        <div className={styles.page}>
          <p className={styles.sectionLabel}>Daily apps</p>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#1e1b4b" }}>
            Where everyday rupees tend to flow
          </h2>
          <p
            style={{
              marginTop: "0.35rem",
              fontSize: "0.875rem",
              color: "#57534e",
              marginBottom: "1.25rem",
            }}
          >
            Tap an app — one fact, one nuance, optional Indian options.
          </p>

          <div className={styles.digitalIntro}>
            <strong>Not a boycott list.</strong> These tools are useful. This map is
            only about knowing where subscription and ad money tends to land.
          </div>

          {DIGITAL_AWARENESS.map((item) => {
            const open = digitalOpen === item.id;
            return (
              <div
                key={item.id}
                className={
                  open ? `${styles.accordion} ${styles.accordionOpen}` : styles.accordion
                }
              >
                <button
                  type="button"
                  className={styles.accordionBtn}
                  onClick={() => setDigitalOpen(open ? null : item.id)}
                >
                  <span>
                    <span style={{ marginRight: "0.5rem" }}>{item.icon}</span>
                    <span className={styles.accordionTitle}>{item.name}</span>
                  </span>
                  <span className={styles.accordionIcon} aria-hidden>
                    {open ? "−" : "+"}
                  </span>
                </button>
                {open && (
                  <div className={styles.accordionPanel}>
                    <p>
                      <span className={styles.panelLabel}>Daily use</span>
                      {item.dailyUse}
                    </p>
                    <p style={{ marginTop: "0.75rem" }}>
                      <span className={styles.panelLabel}>Economics</span>
                      {item.economics}
                    </p>
                    {item.indianNotes && (
                      <p style={{ marginTop: "0.75rem" }}>
                        <span className={styles.panelLabel}>Indian options</span>
                        {item.indianNotes}
                      </p>
                    )}
                    <p style={{ marginTop: "0.75rem" }}>
                      <span className={styles.panelLabel}>Keep in mind</span>
                      {item.nuance}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          <MethodologyBlock />
        </div>
      )}


      {view.name === "imports" && (
        <div className={styles.page}>
          <ImportOutflowView />
          <MethodologyBlock />
        </div>
      )}

      {view.name === "discover" && (
        <div className={styles.page}>
          <p className={styles.sectionLabel}>Indian ecosystem</p>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#1e1b4b" }}>
            Brands that keep value in India
          </h2>
          <p style={{ marginTop: "0.35rem", fontSize: "0.875rem", color: "#57534e" }}>
            Why each is listed — not an endorsement of every product they make.
          </p>

          <div className={styles.tabRow} style={{ marginTop: "1.25rem" }}>
            {(
              [
                ["all", "All"],
                ["established", "Established"],
                ["startup", "Startups"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`${styles.tab} ${discoverTab === id ? styles.tabActive : ""}`}
                onClick={() => setDiscoverTab(id)}
              >
                {label}
              </button>
            ))}
          </div>

          {filteredSpotlight.map((brand) => (
            <article key={brand.id} className={styles.spotCard}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "0.5rem",
                }}
              >
                <p className={styles.spotName}>{brand.name}</p>
                <span
                  className={`${styles.badge} ${
                    brand.type === "established" ? styles.matchGood : styles.matchSituational
                  }`}
                >
                  {brand.type}
                </span>
              </div>
              <p className={styles.spotMeta}>
                {brand.sector} · {brand.hq}
              </p>
              <p className={styles.spotWhy}>{brand.whyListed}</p>
              <p style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>
                <strong>Known for:</strong> {brand.highlights}
              </p>
              {brand.website && (
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.linkOut}
                >
                  Official site →
                </a>
              )}
            </article>
          ))}

          <MethodologyBlock />
        </div>
      )}
    </div>
  );
}
