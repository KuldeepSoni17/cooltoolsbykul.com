import Link from "next/link";
import ItalianCoachClient from "./ItalianCoachClient";

export default function ItalianCoachPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f1e7] text-stone-900">
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.6)_1px,transparent_0)] [background-size:24px_24px]" />
      <div className="pointer-events-none absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-amber-200/40 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-emerald-200/40 blur-[140px]" />

      <div className="relative">
        <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 pt-8 sm:px-8">
          <Link href="/" className="text-sm font-medium text-stone-500 transition hover:text-stone-900">
            ← cooltoolsbykul
          </Link>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-stone-300 bg-white/60 px-3 py-1 text-xs font-medium text-stone-600 backdrop-blur">
              MVP · alpha
            </span>
          </div>
        </header>
        <ItalianCoachClient />
      </div>
    </main>
  );
}
