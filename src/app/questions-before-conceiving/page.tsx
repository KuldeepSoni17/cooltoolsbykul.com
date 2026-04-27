import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Questions Before Conceiving | Cool Tools by Kul",
  description:
    "A deep readiness mirror for prospective parents across emotional, relational, practical, and values domains.",
};

const panels = [
  {
    title: "Not what you think it is",
    body: "This is not a fertility quiz or a medical checklist. It is a readiness mirror across the dimensions that shape real parenting outcomes.",
  },
  {
    title: "Designed for honesty",
    body: "The framing avoids obvious right answers. The goal is clarity, not validation.",
  },
  {
    title: "Profile, not score",
    body: "The intended output is an actionable profile across domains, with growth areas and practical next steps.",
  },
];

export default function QuestionsBeforeConceivingPage() {
  return (
    <main className="min-h-screen bg-[#0e0e0e] text-[#f2f0eb]">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-6 py-12 sm:px-10 lg:px-16">
        <header className="mb-12 flex flex-wrap items-center justify-between gap-4">
          <p className="inline-flex items-center rounded-full border border-[#2a2a2a] bg-[#161616] px-4 py-1 text-xs font-semibold tracking-[0.24em] text-[#8a8680]">
            A READINESS ASSESSMENT
          </p>
          <Link
            href="/"
            className="text-sm text-[#c8a97e] transition-colors hover:text-[#d4b896]"
          >
            Back to home
          </Link>
        </header>

        <section className="relative overflow-hidden rounded-3xl border border-[#2a2a2a] bg-[#161616] p-8 sm:p-12">
          <div className="pointer-events-none absolute -right-8 top-1/2 hidden -translate-y-1/2 select-none text-[180px] font-bold leading-none text-[#c8a97e]/10 sm:block">
            32
          </div>
          <h1 className="max-w-3xl text-4xl leading-tight sm:text-6xl">
            Questions Before Conceiving
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#8a8680]">
            Before you decide to bring a child into the world, this project asks
            the hard questions most people skip. It is built to slow you down,
            surface blind spots, and turn reflection into action.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              type="button"
              className="rounded-full bg-[#c8a97e] px-6 py-3 text-sm font-semibold text-[#0e0e0e]"
            >
              Assessment UI in progress
            </button>
            <p className="text-sm text-[#4a4844]">
              32 questions. 10-15 minutes. No fluff.
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {panels.map((panel) => (
            <article
              key={panel.title}
              className="rounded-2xl border border-[#2a2a2a] bg-[#161616] p-6"
            >
              <h2 className="text-xl font-semibold text-[#f2f0eb]">
                {panel.title}
              </h2>
              <p className="mt-3 leading-7 text-[#8a8680]">{panel.body}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
