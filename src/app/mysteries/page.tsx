import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mysteries | Cool Tools by Kul",
  description:
    "A space to explore cold cases, murders, serial killings, and the stories that refuse to stay buried.",
};

const comingSoon = [
  "Unsolved murders and the theories that follow them",
  "Serial killers — patterns, psychology, and the hunt",
  "Cold cases reopened: what changed, what didn't",
  "True crime deep dives you can lose an evening in",
  "Interactive timelines, evidence boards, and rabbit holes",
];

export default function MysteriesPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(127,29,29,0.22),transparent_42%),radial-gradient(circle_at_85%_75%,rgba(24,24,27,0.9),transparent_50%)]" />

      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.15)_2px,rgba(255,255,255,0.15)_3px)]" />

      <div className="relative mx-auto flex w-full max-w-3xl flex-col px-6 py-12 sm:px-10 lg:py-16">
        <Link
          href="/"
          className="text-sm font-medium text-red-300/80 transition hover:text-red-200"
        >
          ← cooltoolsbykul.com
        </Link>

        <p className="mt-12 text-xs font-semibold uppercase tracking-[0.35em] text-red-400/90">
          Case file · opening soon
        </p>

        <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight text-white sm:text-6xl">
          Mysteries
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl">
          A home for the stories that keep you up at night — murders that went
          unsolved, serial patterns that haunt investigators, and the rabbit
          holes worth falling into. No spec yet. The crime scene is still being
          taped off.
        </p>

        <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-red-900/60 bg-red-950/40 px-4 py-2 text-sm font-semibold text-red-200 backdrop-blur">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
          Coming soon
        </div>

        <section className="mt-14 rounded-3xl border border-zinc-800/90 bg-zinc-900/70 p-6 shadow-2xl shadow-black/30 sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-400">
            What we&apos;re building toward
          </h2>
          <ul className="mt-5 space-y-3">
            {comingSoon.map((item) => (
              <li
                key={item}
                className="flex gap-3 text-base leading-7 text-zinc-200/90"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500/80" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-10 text-sm leading-7 text-zinc-500">
          Pull up a chair. The files are being organized. When this space opens,
          you&apos;ll be able to explore, compare theories, and enjoy the
          mysteries — from headline cases to the ones almost everyone forgot.
        </p>
      </div>
    </main>
  );
}
