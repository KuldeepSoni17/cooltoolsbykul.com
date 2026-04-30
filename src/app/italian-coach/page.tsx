import Link from "next/link";
import ItalianCoachClient from "./ItalianCoachClient";

export default function ItalianCoachPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(34,197,94,0.22),transparent_28%),radial-gradient(circle_at_84%_20%,rgba(56,189,248,0.2),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.22),transparent_36%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />

      <div className="relative">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 pt-8 sm:px-10 lg:px-16">
          <p className="inline-flex rounded-full border border-emerald-300/50 bg-zinc-900/70 px-4 py-1 text-sm font-semibold text-emerald-200 backdrop-blur">
            Italian Coach
          </p>
          <Link
            href="/"
            className="rounded-full border border-zinc-700 bg-zinc-900/80 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:text-white"
          >
            Back to Home
          </Link>
        </header>
        <ItalianCoachClient />
      </div>
    </main>
  );
}
