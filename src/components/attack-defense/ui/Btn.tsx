import type { ButtonHTMLAttributes, ReactNode } from "react";

type BtnVariant = "primary" | "secondary" | "ghost" | "attack" | "defense" | "energy" | "danger";
type BtnSize = "sm" | "md" | "lg" | "xl";

export function Btn({
  children,
  variant = "secondary",
  size = "md",
  full,
  stamped,
  icon,
  className = "",
  ...props
}: {
  children: ReactNode;
  variant?: BtnVariant;
  size?: BtnSize;
  full?: boolean;
  stamped?: boolean;
  icon?: boolean;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = ["ad-btn", `ad-btn--${variant}`, `ad-btn--${size}`];
  if (full) cls.push("ad-btn--full");
  if (icon) cls.push("ad-btn--icon");
  if (stamped) cls.push("ad-btn--stamped");
  if (className) cls.push(className);
  return (
    <button type="button" className={cls.join(" ")} {...props}>
      {children}
    </button>
  );
}
