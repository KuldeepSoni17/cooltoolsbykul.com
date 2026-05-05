import type { ReactNode } from "react";
import "./theme.css";

export default function AttackDefensePlayLayout({ children }: { children: ReactNode }) {
  return <div className="ad-root">{children}</div>;
}
