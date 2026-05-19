"use client";

import type { DomainResult } from "./types";

type Props = {
  domains: DomainResult[];
};

export function RadarChart({ domains }: Props) {
  const n = domains.length;
  if (n === 0) return null;

  const cx = 150;
  const cy = 150;
  const maxR = 110;
  const rings = 5;

  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const point = (i: number, pct: number) => {
    const r = (pct / 100) * maxR;
    return {
      x: cx + r * Math.cos(angle(i)),
      y: cy + r * Math.sin(angle(i)),
    };
  };

  const dataPoints = domains.map((d, i) => point(i, d.percent));
  const polygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox="0 0 300 300" className="mx-auto h-[280px] w-full max-w-[300px]">
      {Array.from({ length: rings }, (_, ri) => {
        const r = ((ri + 1) / rings) * maxR;
        const ringPts = domains
          .map((_, i) => {
            const a = angle(i);
            return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
          })
          .join(" ");
        return (
          <polygon
            key={ri}
            points={ringPts}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
        );
      })}
      {domains.map((d, i) => {
        const a = angle(i);
        const lx = cx + (maxR + 22) * Math.cos(a);
        const ly = cy + (maxR + 22) * Math.sin(a);
        return (
          <g key={d.domainId}>
            <line
              x1={cx}
              y1={cy}
              x2={cx + maxR * Math.cos(a)}
              y2={cy + maxR * Math.sin(a)}
              stroke="rgba(255,255,255,0.06)"
            />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-[#4a4844] text-[8px] font-mono uppercase"
            >
              {d.domainName.split(" ")[0]}
            </text>
          </g>
        );
      })}
      <polygon
        points={polygon}
        fill="rgba(200, 169, 126, 0.15)"
        stroke="#c8a97e"
        strokeWidth={2}
      />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="#c8a97e" />
      ))}
    </svg>
  );
}
