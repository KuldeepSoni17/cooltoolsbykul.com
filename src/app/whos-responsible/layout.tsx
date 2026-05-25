import Link from "next/link";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import WhosLightTheme from "@/components/whos/WhosLightTheme";
import "../whos-civic.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-wr-display",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-wr-ui",
});

export default function WhosResponsibleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WhosLightTheme>
      <div
        className={`${fraunces.variable} ${plusJakarta.variable} wr-page font-[family-name:var(--font-wr-ui)]`}
      >
      <header className="border-b border-[var(--wr-border)] bg-[var(--wr-surface)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link
            href="/whos-responsible"
            className="font-[family-name:var(--font-wr-display)] text-lg font-bold text-stone-900"
          >
            Who&apos;s Responsible
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-sky-700 hover:text-sky-800"
          >
            ← Cool Tools by Kul
          </Link>
        </div>
      </header>
      {children}
      </div>
    </WhosLightTheme>
  );
}
