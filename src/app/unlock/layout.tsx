import { Fraunces, JetBrains_Mono } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-unlock-fraunces",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-unlock-jb",
});

export const metadata: Metadata = {
  title: "Unlock — Cool Tools by Kul",
  description:
    "Discover features, benefits, and tools you already pay for but never knew existed.",
};

export default function UnlockLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`unlock-app min-h-screen ${fraunces.variable} ${jetbrains.variable}`}
    >
      {children}
    </div>
  );
}
