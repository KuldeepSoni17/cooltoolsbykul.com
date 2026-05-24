"use client";

import { useMemo, useRef, useState } from "react";
import {
  IMPORT_INTENSITY,
  IMPORT_OUTFLOW_BRANDS,
  OUTFLOW_TYPE_LABELS,
  type ImportOutflowBrand,
} from "@/lib/swadeshi/data";
import styles from "./swadeshi.module.css";

const OUTFLOW_TYPES = Object.keys(OUTFLOW_TYPE_LABELS) as ImportOutflowBrand["outflowType"][];

function ImportCard({ row }: { row: ImportOutflowBrand }) {
  const intensity = IMPORT_INTENSITY[row.importDependency];
  return (
    <article className={styles.importCard}>
      <div className={styles.importCardHead}>
        <div>
          <p className={styles.importCategory}>{row.category}</p>
          <p className={styles.importMeta}>{row.commonSpendUse}</p>
        </div>
        <span className={`${styles.badge} ${styles.importBadge}`}>{intensity.label}</span>
      </div>

      <div className={styles.importMeterTrack} aria-hidden>
        <div className={styles.importMeterFill} style={{ width: `${intensity.score}%` }} />
      </div>

      <div className={styles.brandChipRow}>
        {row.brandExamples.map((brand) => (
          <span key={brand} className={styles.brandChip}>
            {brand}
          </span>
        ))}
      </div>

      <div className={styles.importBlock}>
        <p className={styles.importBlockLabel}>Why money leaves India</p>
        <p className={styles.importBlockText}>{row.whyMoneyGoesOut}</p>
      </div>

      <div className={styles.importBlock}>
        <p className={styles.importBlockLabel}>Indian options today</p>
        <p className={styles.importBlockText}>{row.indiaOptions}</p>
      </div>

      <div className={styles.importHonesty}>{row.honestyNote}</div>
    </article>
  );
}

export default function ImportOutflowView() {
  const [typeFilter, setTypeFilter] = useState<ImportOutflowBrand["outflowType"] | "all">("all");
  const carouselRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (typeFilter === "all") return IMPORT_OUTFLOW_BRANDS;
    return IMPORT_OUTFLOW_BRANDS.filter((r) => r.outflowType === typeFilter);
  }, [typeFilter]);

  const scrollCarousel = (dir: -1 | 1) => {
    carouselRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <>
      <div className={styles.importHero}>
        <p className={styles.sectionLabel}>Import outflow map</p>
        <h2 className={styles.importHeroTitle}>Where India&apos;s money goes out</h2>
        <p className={styles.importHeroDesc}>
          Not guilt — clarity. See which categories and global brands pull the most forex
          out of India, and where Indian substitutes are realistic right now.
        </p>
        <div className={styles.importStats}>
          <div className={styles.importStat}>
            <p className={styles.importStatNum}>{IMPORT_OUTFLOW_BRANDS.length}</p>
            <p className={styles.importStatLabel}>categories tracked</p>
          </div>
          <div className={styles.importStat}>
            <p className={styles.importStatNum}>
              {IMPORT_OUTFLOW_BRANDS.filter((r) => r.importDependency === "very-high").length}
            </p>
            <p className={styles.importStatLabel}>very high dependence</p>
          </div>
          <div className={styles.importStat}>
            <p className={styles.importStatNum}>₹</p>
            <p className={styles.importStatLabel}>household + business spend</p>
          </div>
        </div>
      </div>

      <div className={styles.carouselWrap}>
        <div className={styles.carouselHeader}>
          <p className={styles.sectionLabel}>Browse by sector</p>
          <div className={styles.carouselNav}>
            <button type="button" className={styles.carouselBtn} onClick={() => scrollCarousel(-1)}>
              ‹
            </button>
            <button type="button" className={styles.carouselBtn} onClick={() => scrollCarousel(1)}>
              ›
            </button>
          </div>
        </div>
        <div ref={carouselRef} className={styles.carouselTrack}>
          <button
            type="button"
            className={`${styles.carouselChip} ${typeFilter === "all" ? styles.carouselChipActive : ""}`}
            onClick={() => setTypeFilter("all")}
          >
            All sectors
          </button>
          {OUTFLOW_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className={`${styles.carouselChip} ${typeFilter === type ? styles.carouselChipActive : ""}`}
              onClick={() => setTypeFilter(type)}
            >
              {OUTFLOW_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.importList}>
        {filtered.map((row) => (
          <ImportCard key={row.id} row={row} />
        ))}
      </div>

      <div className={styles.importDisclaimer}>
        <strong>How to read this:</strong> High outflow does not mean “never buy.” It means a
        large share of value (IP, components, royalties, or raw materials) tends to leave India.
        Energy and premium electronics are structural; FMCG and apps have more room to shift
        spend locally when quality matches your need.
      </div>
    </>
  );
}
