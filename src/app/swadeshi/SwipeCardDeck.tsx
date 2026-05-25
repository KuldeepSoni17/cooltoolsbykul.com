"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type TouchEvent as RE,
  type MouseEvent as ME,
} from "react";
import styles from "./swadeshi.module.css";

interface SwipeCardDeckProps {
  count: number;
  renderCard: (index: number) => ReactNode;
  onTap?: (index: number) => void;
  activeIndex?: number;
  onIndexChange?: (index: number) => void;
}

const SWIPE_THRESHOLD = 60;
const VELOCITY_THRESHOLD = 0.4;
const VISIBLE_BEHIND = 2;

export default function SwipeCardDeck({
  count,
  renderCard,
  onTap,
  activeIndex: controlledIndex,
  onIndexChange,
}: SwipeCardDeckProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const current = controlledIndex ?? internalIndex;
  const setCurrent = useCallback(
    (n: number) => {
      const clamped = Math.max(0, Math.min(n, count - 1));
      if (onIndexChange) onIndexChange(clamped);
      else setInternalIndex(clamped);
    },
    [count, onIndexChange],
  );

  const [drag, setDrag] = useState({ x: 0, active: false });
  const startRef = useRef({ x: 0, y: 0, t: 0, moved: false, scrolling: false });
  const deckRef = useRef<HTMLDivElement>(null);

  const onStart = (clientX: number, clientY: number) => {
    startRef.current = { x: clientX, y: clientY, t: Date.now(), moved: false, scrolling: false };
    setDrag({ x: 0, active: true });
  };

  const onMove = (clientX: number, clientY: number) => {
    if (!drag.active) return;
    const s = startRef.current;
    const dx = clientX - s.x;
    const dy = clientY - s.y;

    if (!s.moved && !s.scrolling) {
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
        s.scrolling = true;
        setDrag({ x: 0, active: false });
        return;
      }
      if (Math.abs(dx) > 10) s.moved = true;
    }
    if (s.scrolling) return;
    if (s.moved) setDrag({ x: dx, active: true });
  };

  const onEnd = () => {
    if (!drag.active) return;
    const s = startRef.current;
    const dt = Math.max(Date.now() - s.t, 1);
    const velocity = Math.abs(drag.x) / dt;

    if (Math.abs(drag.x) > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
      if (drag.x < 0 && current < count - 1) setCurrent(current + 1);
      else if (drag.x > 0 && current > 0) setCurrent(current - 1);
    } else if (!s.moved && onTap) {
      onTap(current);
    }

    setDrag({ x: 0, active: false });
  };

  const handleTouchStart = (e: RE<HTMLDivElement>) => {
    const t = e.touches[0];
    onStart(t.clientX, t.clientY);
  };
  const handleTouchMove = (e: RE<HTMLDivElement>) => {
    const t = e.touches[0];
    onMove(t.clientX, t.clientY);
  };
  const handleTouchEnd = () => onEnd();

  const handleMouseDown = (e: ME<HTMLDivElement>) => {
    e.preventDefault();
    onStart(e.clientX, e.clientY);
  };
  const handleMouseMove = (e: ME<HTMLDivElement>) => onMove(e.clientX, e.clientY);
  const handleMouseUp = () => onEnd();
  const handleMouseLeave = () => {
    if (drag.active) onEnd();
  };

  useEffect(() => {
    if (controlledIndex !== undefined) setInternalIndex(controlledIndex);
  }, [controlledIndex]);

  if (count === 0) {
    return <div className={styles.deckEmpty}>No items to show</div>;
  }

  const rotation = drag.active ? drag.x * 0.04 : 0;
  const opacity = drag.active ? 1 - Math.min(Math.abs(drag.x) / 300, 0.3) : 1;

  return (
    <div className={styles.deckOuter}>
      <div
        ref={deckRef}
        className={styles.deckArea}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: Math.min(VISIBLE_BEHIND + 1, count - current) }, (_, offset) => {
          const idx = current + (VISIBLE_BEHIND - offset);
          if (idx < 0 || idx >= count) return null;
          const depth = idx - current;
          const isTop = depth === 0;

          const scale = 1 - depth * 0.045;
          const translateY = depth * 10;
          const translateX = isTop && drag.active ? drag.x : 0;
          const rot = isTop ? rotation : 0;
          const z = 100 - depth;

          return (
            <div
              key={idx}
              className={`${styles.deckCard} ${isTop ? styles.deckCardTop : ""}`}
              style={{
                transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rot}deg) scale(${scale})`,
                zIndex: z,
                opacity: isTop ? opacity : 1 - depth * 0.15,
                transition: drag.active && isTop ? "none" : "transform 0.35s cubic-bezier(.4,.2,.2,1), opacity 0.35s ease",
                pointerEvents: isTop ? "auto" : "none",
              }}
            >
              {renderCard(idx)}
            </div>
          );
        })}
      </div>

      <div className={styles.deckControls}>
        <button
          type="button"
          className={styles.deckNavBtn}
          disabled={current <= 0}
          onClick={() => setCurrent(current - 1)}
          aria-label="Previous"
        >
          ‹
        </button>
        <span className={styles.deckCounter}>
          {current + 1} / {count}
        </span>
        <button
          type="button"
          className={styles.deckNavBtn}
          disabled={current >= count - 1}
          onClick={() => setCurrent(current + 1)}
          aria-label="Next"
        >
          ›
        </button>
      </div>

      <p className={styles.deckHint}>Swipe or tap to explore</p>
    </div>
  );
}
