import type { ReactNode } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AdScopeProvider } from "@/components/attack-defense/AdScopeProvider";
import "./_styles/colors.css";
import "./_styles/tokens.css";
import "./_styles/base.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans-ad",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-mono-ad",
});

export default function AttackDefensePlayLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <AdScopeProvider>{children}</AdScopeProvider>
    </div>
  );
}
