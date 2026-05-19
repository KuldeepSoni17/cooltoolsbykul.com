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
    "Discover comparable Indian alternatives to everyday global brands — with honest price context, gentle awareness, and homegrown heroes.",
};

export default function SwadeshiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={notoDevanagari.variable}>{children}</div>;
}
