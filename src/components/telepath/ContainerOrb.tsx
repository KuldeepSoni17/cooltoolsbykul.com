import type { PlayerColor } from "@/lib/telepath/types";
import { TELEPATH_COLORS } from "./tokens";

type Size = "sm" | "md" | "lg" | "xl";

const SIZE_MAP: Record<Size, { box: string; inner: string; label: string; value: string }> = {
  sm: {
    box: "h-12 w-12",
    inner: "h-10 w-10",
    label: "text-[10px]",
    value: "text-sm",
  },
  md: {
    box: "h-20 w-20",
    inner: "h-16 w-16",
    label: "text-[11px]",
    value: "text-xl",
  },
  lg: {
    box: "h-28 w-28",
    inner: "h-24 w-24",
    label: "text-xs",
    value: "text-3xl",
  },
  xl: {
    box: "h-36 w-36",
    inner: "h-32 w-32",
    label: "text-xs",
    value: "text-5xl",
  },
};

export function ContainerOrb({
  color,
  size = "md",
  active = false,
  pulse = false,
  float = false,
  label,
  value,
  className = "",
}: {
  color: PlayerColor;
  size?: Size;
  active?: boolean;
  pulse?: boolean;
  float?: boolean;
  label?: string;
  value?: number | string;
  className?: string;
}) {
  const token = TELEPATH_COLORS[color];
  const sz = SIZE_MAP[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center ${sz.box} ${
        float ? "telepath-orb-float" : ""
      } ${className}`}
    >
      <div
        className="absolute inset-0 rounded-full blur-2xl transition-opacity duration-500"
        style={{
          backgroundColor: token.hex,
          opacity: active ? 0.7 : 0.45,
        }}
        aria-hidden
      />
      {pulse && (
        <div
          className="absolute inset-0 rounded-full telepath-orb-pulse"
          style={{
            boxShadow: `0 0 0 0 ${token.glow}`,
            borderRadius: "9999px",
          }}
          aria-hidden
        />
      )}
      <div
        className={`relative ${sz.inner} flex flex-col items-center justify-center rounded-full border`}
        style={{
          borderColor: active ? token.hex : `${token.hex}88`,
          background: `radial-gradient(circle at 30% 25%, ${token.hex} 0%, rgba(0,0,0,0.55) 75%)`,
          boxShadow: active
            ? `0 0 36px ${token.glow}, inset 0 0 18px rgba(255,255,255,0.18)`
            : `0 0 18px ${token.soft}, inset 0 0 12px rgba(255,255,255,0.1)`,
        }}
      >
        {value !== undefined && (
          <span
            className={`font-bold tabular-nums text-white drop-shadow ${sz.value}`}
            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
          >
            {value}
          </span>
        )}
        {label && (
          <span
            className={`font-semibold uppercase tracking-wider text-white/85 ${sz.label}`}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
