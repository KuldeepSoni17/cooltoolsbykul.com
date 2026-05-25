import type { Metadata } from "next";
import { Noto_Sans_Devanagari } from "next/font/google";

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari", "latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Swadeshi | Cool Tools by Kul",
  description:
    "1,300+ honest Indian product comparisons. Swipe through tier-matched pairs, explore import outflows, and discover Indian brands — with quality verdicts, not guilt.",
};

export default function SwadeshiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={notoDevanagari.variable}>{children}</div>;
}
