import type { ReactNode } from "react";
import "./theme.css";

export default function AttackDefensePlayLayout({ children }: { children: ReactNode }) {
  return (
    <div className="wf-root paper-bg">
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <defs>
          <filter id="wob">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={2} seed="3" />
            <feDisplacementMap in="SourceGraphic" scale="1.4" />
          </filter>
        </defs>
      </svg>
      {children}
    </div>
  );
}
