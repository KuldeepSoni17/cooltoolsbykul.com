"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./norm-tionary.module.css";
import { cards, DEFAULT_LABEL_INDEX, labelPairs } from "./data";

type SwipeStart = { x: number; y: number; t: number } | null;

function alpha(hex: string, value: string) {
  return `${hex}${value}`;
}

function cardPosition(index: number, current: number) {
  const diff = index - current;
  if (diff === -1) return "prev";
  if (diff === 0) return "active";
  if (diff === 1) return "next";
  return diff < -1 ? "far-left" : "far-right";
}

export default function NormTionaryClient() {
  const appRef = useRef<HTMLDivElement | null>(null);
  const [currentCard, setCurrentCard] = useState(0);
  const [currentLabel, setCurrentLabel] = useState(DEFAULT_LABEL_INDEX);
  const [revealedByCard, setRevealedByCard] = useState<Record<number, boolean>>(
    {},
  );

  const currentAccent = cards[currentCard].ac;

  useEffect(() => {
    const node = appRef.current;
    if (!node) return;

    const updateLayout = () => {
      const containerWidth = node.offsetWidth;
      const cardWidth = Math.max(240, Math.min(300, Math.floor(containerWidth * 0.8)));
      const cardHeight = Math.round(cardWidth * 1.27);
      const cardLeft = Math.round((containerWidth - cardWidth) / 2);
      const cardOffset = Math.round(cardWidth * 0.94);
      const watermarkSize = Math.round(cardWidth * 0.22);
      const stmtFontSize = Math.min(16, Math.max(13, Math.round(cardWidth * 0.048)));
      const titleFontSize = Math.min(44, Math.max(32, Math.floor(containerWidth * 0.108)));

      node.style.setProperty("--card-width", `${cardWidth}px`);
      node.style.setProperty("--card-height", `${cardHeight}px`);
      node.style.setProperty("--card-left", `${cardLeft}px`);
      node.style.setProperty("--card-offset", `${cardOffset}px`);
      node.style.setProperty("--watermark-size", `${watermarkSize}px`);
      node.style.setProperty("--stmt-size", `${stmtFontSize}px`);
      node.style.setProperty("--title-size", `${titleFontSize}px`);
    };

    updateLayout();
    const ro = new ResizeObserver(updateLayout);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const currentCardRef = useRef(currentCard);
  useEffect(() => {
    currentCardRef.current = currentCard;
  }, [currentCard]);

  const goTo = useCallback((index: number) => {
    if (index < 0 || index >= cards.length) return;
    setRevealedByCard((prev) => ({ ...prev, [currentCardRef.current]: false }));
    setCurrentCard(index);
  }, []);

  const setRevealed = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setRevealedByCard((prev) => {
      const current = Boolean(prev[currentCardRef.current]);
      const nextValue = typeof value === "function" ? value(current) : value;
      return { ...prev, [currentCardRef.current]: nextValue };
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goTo(currentCard - 1);
      if (event.key === "ArrowRight") goTo(currentCard + 1);
      if (event.key === "ArrowUp") setRevealed(true);
      if (event.key === "ArrowDown") setRevealed(false);
      if (event.key === " ") {
        event.preventDefault();
        setRevealed((prev) => !prev);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [currentCard, goTo, setRevealed]);

  const swipeStates = useMemo(() => Array.from({ length: cards.length }, () => null), []);
  const swipeRefs = useRef<SwipeStart[]>(swipeStates);
  const activeMouseCardRef = useRef<number | null>(null);

  const handleStart = (index: number, x: number, y: number, t: number) => {
    swipeRefs.current[index] = { x, y, t };
    activeMouseCardRef.current = index;
  };

  const handleEnd = (index: number, x: number, y: number, t: number) => {
    const start = swipeRefs.current[index];
    if (!start) return;
    swipeRefs.current[index] = null;

    const dx = x - start.x;
    const dy = y - start.y;
    const dt = t - start.t;
    const isHorizontal = Math.abs(dx) > Math.abs(dy) * 1.2;

    if (isHorizontal && Math.abs(dx) > 36 && dt < 450) {
      goTo(currentCardRef.current + (dx < 0 ? 1 : -1));
      return;
    }
    if (!isHorizontal && Math.abs(dy) > 26 && dt < 400) {
      setRevealed(dy < 0);
      return;
    }
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
      setRevealed((prev) => !prev);
    }
    activeMouseCardRef.current = null;
  };

  useEffect(() => {
    const onDocumentMouseUp = (event: MouseEvent) => {
      const activeIndex = activeMouseCardRef.current;
      if (activeIndex === null) return;

      const start = swipeRefs.current[activeIndex];
      if (!start) return;

      swipeRefs.current[activeIndex] = null;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      const dt = event.timeStamp - start.t;
      const isHorizontal = Math.abs(dx) > Math.abs(dy) * 1.2;

      if (isHorizontal && Math.abs(dx) > 36 && dt < 450) {
        goTo(currentCardRef.current + (dx < 0 ? 1 : -1));
      } else if (!isHorizontal && Math.abs(dy) > 26 && dt < 400) {
        setRevealed(dy < 0);
      } else if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
        setRevealed((prev) => !prev);
      }
      activeMouseCardRef.current = null;
    };
    document.addEventListener("mouseup", onDocumentMouseUp);
    return () => document.removeEventListener("mouseup", onDocumentMouseUp);
  }, [goTo, setRevealed]);

  return (
    <main className={styles.page}>
      <div className={styles.app} ref={appRef}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            norm-tionary<span className={styles.tm}>™</span>
          </h1>
          <p className={styles.tagline}>when shit becomes norm, norms go to shit</p>
          <p className={styles.labelTitle}>label style</p>
          <div className={styles.labelPicker}>
            {labelPairs.map((pair, index) => {
              const active = index === currentLabel;
              return (
                <button
                  key={pair.id}
                  type="button"
                  className={`${styles.labelBtn} ${active ? styles.labelBtnActive : ""}`}
                  onClick={() => setCurrentLabel(index)}
                  style={
                    active
                      ? { borderColor: alpha(currentAccent, "55"), color: currentAccent }
                      : undefined
                  }
                >
                  {pair.before} / {pair.after}
                </button>
              );
            })}
          </div>
        </header>

        <section
          className={styles.carouselWrap}
          role="region"
          aria-label="Norm-tionary cards"
        >
          <div className={styles.carousel}>
            {cards.map((card, index) => {
              const isRevealed = Boolean(revealedByCard[index]);
              const pos = cardPosition(index, currentCard);
              return (
                <article
                  key={card.id}
                  className={styles.card}
                  data-pos={pos}
                  aria-current={index === currentCard ? "true" : undefined}
                  onTouchStart={(event) => {
                    const touch = event.changedTouches[0];
                    handleStart(index, touch.clientX, touch.clientY, event.timeStamp);
                  }}
                  onTouchEnd={(event) => {
                    const touch = event.changedTouches[0];
                    handleEnd(index, touch.clientX, touch.clientY, event.timeStamp);
                  }}
                  onMouseDown={(event) =>
                    handleStart(index, event.clientX, event.clientY, event.timeStamp)
                  }
                >
                  <div
                    className={`${styles.cardInner} ${isRevealed ? styles.cardInnerRevealed : ""}`}
                  >
                    <div
                      className={`${styles.panel} ${styles.panelBefore}`}
                      style={{
                        background: card.bg1,
                        borderLeftColor: alpha(card.ac, "30"),
                      }}
                    >
                      <div
                        className={styles.watermark}
                        style={{ color: alpha(card.ac, "08") }}
                      >
                        {card.type}
                      </div>
                      <span
                        className={styles.panelLabel}
                        style={{ color: alpha(card.ac, "50") }}
                      >
                        {labelPairs[currentLabel].before}
                      </span>
                      <p className={`${styles.statement} ${styles.statementBefore}`}>
                        {card.b}
                      </p>
                      <div className={styles.hint}>
                        <span className={styles.bob}>↑</span>
                        <span>see the norm</span>
                      </div>
                    </div>

                    <div
                      className={`${styles.panel} ${styles.panelAfter}`}
                      style={{
                        background: card.bg2,
                        borderLeftColor: card.ac,
                        borderTopColor: alpha(card.ac, "22"),
                      }}
                    >
                      <div
                        className={styles.watermark}
                        style={{ color: alpha(card.ac, "11") }}
                      >
                        {card.type}
                      </div>
                      <span className={styles.panelLabel} style={{ color: card.ac }}>
                        {labelPairs[currentLabel].after}
                      </span>
                      <p className={`${styles.statement} ${styles.statementAfter}`}>
                        {card.a}
                      </p>
                      <div className={styles.tags}>
                        {card.tags.map((tag) => (
                          <span key={`${card.id}-${tag}`} className={styles.tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <footer className={styles.nav}>
          <button
            type="button"
            className={styles.navBtn}
            aria-label="Previous card"
            disabled={currentCard === 0}
            onClick={() => goTo(currentCard - 1)}
            style={{ borderColor: currentCard > 0 ? alpha(currentAccent, "55") : undefined }}
          >
            ←
          </button>
          <div className={styles.dots}>
            {cards.map((card, index) => {
              const active = index === currentCard;
              return (
                <button
                  key={card.id}
                  type="button"
                  className={`${styles.dot} ${active ? styles.dotActive : ""}`}
                  aria-label={`Go to card ${index + 1}`}
                  aria-current={active ? "true" : undefined}
                  onClick={() => goTo(index)}
                  style={active ? { background: currentAccent } : undefined}
                />
              );
            })}
          </div>
          <button
            type="button"
            className={styles.navBtn}
            aria-label="Next card"
            disabled={currentCard === cards.length - 1}
            onClick={() => goTo(currentCard + 1)}
            style={{
              borderColor:
                currentCard < cards.length - 1 ? alpha(currentAccent, "55") : undefined,
            }}
          >
            →
          </button>
        </footer>
      </div>
    </main>
  );
}
