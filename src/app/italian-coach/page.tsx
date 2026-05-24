import Link from "next/link";
import ItalianCoachClient from "./ItalianCoachClient";

export default function ItalianCoachPage() {
  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-[#f6f1e7] text-stone-900">
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.6)_1px,transparent_0)] [background-size:24px_24px]" />
      <div className="pointer-events-none absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-amber-200/40 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-emerald-200/40 blur-[140px]" />

      <div className="relative">
        <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 pt-6 pb-2 sm:px-8 sm:pt-8">
          <Link
            href="/"
            className="min-h-[44px] min-w-[44px] content-center text-sm font-medium text-stone-500 transition hover:text-stone-900"
          >
            ← Home
          </Link>
          <span className="rounded-full border border-stone-300 bg-white/60 px-3 py-1 text-xs font-medium text-stone-600 backdrop-blur">
            v0.4
          </span>
        </header>
        <ItalianCoachClient />
      </div>
    </main>
  );
}
