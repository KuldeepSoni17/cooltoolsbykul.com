"use client";

import { useRef, type ReactNode } from "react";
import styles from "./swadeshi.module.css";

export function SwadeshiCarousel({
  children,
  ariaLabel,
  header,
}: {
  children: ReactNode;
  ariaLabel: string;
  header?: ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: -1 | 1) => {
    trackRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  return (
    <div className={styles.carouselWrap}>
      <div className={styles.carouselHeader}>
        {header ?? <span className={styles.sectionLabel}>{ariaLabel}</span>}
        <div className={styles.carouselNav}>
          <button type="button" className={styles.carouselBtn} onClick={() => scroll(-1)} aria-label="Scroll left">
            ‹
          </button>
          <button type="button" className={styles.carouselBtn} onClick={() => scroll(1)} aria-label="Scroll right">
            ›
          </button>
        </div>
      </div>
      <div ref={trackRef} className={styles.shopCarouselTrack} role="list" aria-label={ariaLabel}>
        {children}
      </div>
    </div>
  );
}
