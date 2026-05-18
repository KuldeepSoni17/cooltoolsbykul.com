"use client";

import type { CSSProperties, ReactNode } from "react";
import type { House } from "@/lib/attack-defense/gameTypes";

export type HouseSketchState = "shielded" | "trapped" | "destroyed" | "damaged" | "target";

export function houseSketchState(house: House, targetable?: boolean): HouseSketchState | undefined {
  if (house.isDestroyed) return "destroyed";
  if (targetable) return "target";
  if (house.isShielded) return "shielded";
  if (house.isTrapped) return "trapped";
  if (house.hp < house.maxHp) return "damaged";
  return undefined;
}

export function HouseSketch({
  hp,
  max = 6,
  state,
  onClick,
}: {
  hp: number;
  max?: number;
  state?: HouseSketchState;
  onClick?: () => void;
}) {
  const cls = ["house"];
  if (state === "shielded") cls.push("shielded");
  if (state === "trapped") cls.push("trapped");
  if (state === "destroyed") cls.push("dead");
  if (state === "damaged") cls.push("dmg");
  if (state === "target") cls.push("target", "selectable");
  if (onClick && state !== "destroyed") cls.push("selectable");

  return (
    <button type="button" className={cls.join(" ")} onClick={onClick} disabled={!onClick}>
      <span className="wf-xs">{state === "destroyed" ? "" : `${hp}/${max}`}</span>
    </button>
  );
}

export function PipTimer({ filled = 6, total = 10, label }: { filled?: number; total?: number; label?: string }) {
  return (
    <div className="wf-col wf-gap-1">
      {label ? <div className="wf-xs wf-upper wf-muted">{label}</div> : null}
      <div className="wf-row wf-gap-1 wf-ai-c">
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={`pip ${i < filled ? "on" : ""}`} />
        ))}
      </div>
    </div>
  );
}

export function EnergyMeter({ value = 7, max = 20, pending = 0 }: { value?: number; max?: number; pending?: number }) {
  const segs = 10;
  const filledSegs = Math.round((value / max) * segs);
  const pendSegs = Math.round(((value - pending) / max) * segs);

  return (
    <div className="wf-row wf-ai-c wf-gap-2">
      <span className="wf-small">⚡</span>
      <div className="wf-row" style={{ gap: 2, flex: 1 }}>
        {Array.from({ length: segs }).map((_, i) => {
          const isFilled = i < filledSegs;
          const isPending = i >= pendSegs && i < filledSegs;
          return (
            <span
              key={i}
              style={{
                flex: 1,
                height: 10,
                border: "1.5px solid var(--ink)",
                background: isPending
                  ? "repeating-linear-gradient(45deg, #fff 0 3px, #e6b400 3px 6px)"
                  : isFilled
                    ? "var(--ink)"
                    : "var(--paper)",
              }}
            />
          );
        })}
      </div>
      <span className="mono wf-small wf-b">
        {value}
        <span className="wf-muted">/{max}</span>
      </span>
    </div>
  );
}

export function WBtn({
  children,
  variant,
  full,
  sm,
  className = "",
  style,
  disabled,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  variant?: "primary" | "attack" | "defense" | "ghost";
  full?: boolean;
  sm?: boolean;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const cls = ["wbtn"];
  if (variant) cls.push(variant);
  if (full) cls.push("full");
  if (className) cls.push(className);

  const btnStyle: CSSProperties = { ...style };
  if (sm) {
    btnStyle.padding = "3px 8px";
    btnStyle.fontSize = "12px";
  }

  return (
    <button type={type} className={cls.join(" ")} style={btnStyle} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

export function PlayerTag({
  name,
  you,
  eliminated,
  color,
}: {
  name: string;
  you?: boolean;
  eliminated?: boolean;
  color?: string;
}) {
  return (
    <div className="wf-row wf-ai-c wf-gap-2">
      <div
        className="wf-center"
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: "2px solid var(--ink)",
          background: color || "var(--paper)",
          fontFamily: "Architects Daughter, cursive",
          fontSize: 12,
          fontWeight: 700,
          textDecoration: eliminated ? "line-through" : "none",
          opacity: eliminated ? 0.5 : 1,
        }}
      >
        {(name || "?")[0]}
      </div>
      <div className="wf-col" style={{ lineHeight: 1.1 }}>
        <span
          className="wf-b wf-small"
          style={{ textDecoration: eliminated ? "line-through" : "none", opacity: eliminated ? 0.5 : 1 }}
        >
          {name}
          {you ? " (you)" : ""}
        </span>
      </div>
    </div>
  );
}

export function ActionCard({
  kind,
  name,
  cost,
  desc,
  selected,
  disabled,
  sm,
  onClick,
}: {
  kind: "attack" | "defense";
  name: string;
  cost: number;
  desc?: string;
  selected?: boolean;
  disabled?: boolean;
  sm?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className={`action-card ${kind} ${selected ? "selected" : ""} ${disabled ? "disabled" : ""}`}
      style={{ padding: sm ? 6 : 10 }}
      disabled={disabled}
      onClick={onClick}
    >
      <div className="wf-row wf-between wf-ai-c">
        <span className="wf-b" style={{ fontSize: sm ? 12 : 14 }}>
          {name}
        </span>
        <span className="chip energy" style={{ fontSize: 10 }}>
          ⚡{cost}
        </span>
      </div>
      {desc ? (
        <div className="wf-xs wf-mt-1" style={{ opacity: selected ? 0.95 : 0.7 }}>
          {desc}
        </div>
      ) : null}
    </button>
  );
}

export function Hatch({
  w = "100%",
  h = 80,
  label,
  style = {},
}: {
  w?: string | number;
  h?: string | number;
  label?: string;
  style?: CSSProperties;
}) {
  return (
    <div className="hatch" style={{ width: w, height: h, ...style }}>
      {label}
    </div>
  );
}

export function RingTimer({ pct = 0.5, label = "12s", size = 60 }: { pct?: number; label?: string; size?: number }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - pct);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line-soft)" strokeWidth="2" strokeDasharray="3 3" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--ink)"
          strokeWidth="3"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={off}
          strokeLinecap="round"
        />
      </svg>
      <div className="wf-center" style={{ position: "absolute", inset: 0 }}>
        <span className="mono wf-b" style={{ fontSize: size > 50 ? 14 : 12 }}>
          {label}
        </span>
      </div>
    </div>
  );
}
