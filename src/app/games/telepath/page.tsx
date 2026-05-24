import Link from "next/link";
import { BackLink } from "@/components/telepath/BackLink";
import { ContainerOrb } from "@/components/telepath/ContainerOrb";
import { PowerIcon } from "@/components/telepath/PowerIcon";
import { TelepathBackdrop } from "@/components/telepath/TelepathBackdrop";
import { POWERS, TELEPATH_COLORS } from "@/components/telepath/tokens";

const STEPS = [
  {
    n: 1,
    title: "Send",
    body: "Decide how many units to push into each rival's container.",
  },
  {
    n: 2,
    title: "Reveal",
    body: "All three players commit simultaneously, then transfers resolve.",
  },
  {
    n: 3,
    title: "Outlast",
    body: "Last container with units standing wins the match.",
  },
];

export default function TelepathPage() {
  return (
    <main className="relative min-h-screen px-5 py-10 text-zinc-100 sm:px-10 lg:px-16">
      <TelepathBackdrop />

      <div className="relative mx-auto w-full max-w-6xl">
        <BackLink href="/" label="Back to home" />

        {/* Hero */}
        <section className="mt-10 grid items-center gap-12 lg:mt-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
              Games · Telepath
            </p>
            <h1 className="mt-5 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                Telepath
              </span>
            </h1>
            <p className="mt-3 text-base text-zinc-400 sm:text-lg">
              Three minds. Three containers. One survivor.
            </p>
            <p className="mt-6 max-w-xl text-base leading-7 text-zinc-300 sm:text-lg">
              A three-player simultaneous mind-game. Outguess Ember, Cipher, and
              Nova — route units through{" "}
              <span className="font-semibold text-[#ff8da3]">red</span>,{" "}
              <span className="font-semibold text-[#8fb4ff]">blue</span>, and{" "}
              <span className="font-semibold text-[#7fe8b2]">green</span>{" "}
              containers. Unblocked hits deal damage; powers twist parity and
              block incoming strikes.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/games/telepath/play"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-white px-6 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_30px_rgba(255,255,255,0.18)] transition hover:shadow-[0_0_45px_rgba(255,255,255,0.28)]"
              >
                Play solo vs 2 bots
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                >
                  <path d="M5 12h14" />
                  <path d="M13 5l7 7-7 7" />
                </svg>
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-medium text-zinc-200 backdrop-blur transition hover:border-white/30 hover:bg-white/[0.08]"
              >
                How to play
              </a>
            </div>

            <p className="mt-6 text-xs text-zinc-500">
              Formerly{" "}
              <span className="text-zinc-400">Conqueror</span> — the original
              from Kul&apos;s repo.
            </p>
          </div>

          {/* Tri-orb hero art */}
          <div className="relative mx-auto flex h-[360px] w-full max-w-md items-center justify-center sm:h-[420px]">
            <div className="absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5 sm:h-[340px] sm:w-[340px]" />
            <div className="absolute left-1/2 top-1/2 h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 sm:h-[220px] sm:w-[220px]" />

            <div className="absolute left-[16%] top-[12%]">
              <ContainerOrb color="red" size="xl" float active />
            </div>
            <div className="absolute right-[8%] top-[18%]">
              <ContainerOrb color="blue" size="lg" float active />
            </div>
            <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2">
              <ContainerOrb color="green" size="xl" float active />
            </div>

            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 400 400"
              fill="none"
              aria-hidden
            >
              <defs>
                <linearGradient id="link-rg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={TELEPATH_COLORS.red.hex} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={TELEPATH_COLORS.green.hex} stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="link-bg" x1="1" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={TELEPATH_COLORS.blue.hex} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={TELEPATH_COLORS.green.hex} stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="link-rb" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={TELEPATH_COLORS.red.hex} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={TELEPATH_COLORS.blue.hex} stopOpacity="0.4" />
                </linearGradient>
              </defs>
              <line x1="105" y1="105" x2="200" y2="330" stroke="url(#link-rg)" strokeWidth="1" strokeDasharray="4 6" />
              <line x1="320" y1="115" x2="200" y2="330" stroke="url(#link-bg)" strokeWidth="1" strokeDasharray="4 6" />
              <line x1="105" y1="105" x2="320" y2="115" stroke="url(#link-rb)" strokeWidth="1" strokeDasharray="4 6" />
            </svg>
          </div>
        </section>

        {/* How a round works */}
        <section id="how-it-works" className="mt-24 scroll-mt-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                A round
              </p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                Three steps, every round.
              </h2>
            </div>
            <p className="hidden max-w-xs text-sm text-zinc-400 sm:block">
              Everyone moves at once. There is no waiting, only outguessing.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.05]"
              >
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/[0.04] blur-2xl transition group-hover:bg-white/[0.08]" />
                <div className="relative">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-sm font-bold tabular-nums text-white">
                    {step.n}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Powers */}
        <section className="mt-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Powers
              </p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                Four one-time powers.
              </h2>
            </div>
            <p className="hidden max-w-xs text-sm text-zinc-400 sm:block">
              Each one fires once per match. Spending them right is the game.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {POWERS.map((p) => (
              <article
                key={p.key}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition hover:border-white/25 hover:bg-white/[0.05]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/[0.05] text-white">
                    <PowerIcon power={p.key} className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      {p.name}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-zinc-400">
                      {p.description}
                    </p>
                  </div>
                </div>
                <div
                  className="pointer-events-none absolute -bottom-12 -right-12 h-32 w-32 rounded-full opacity-0 blur-3xl transition group-hover:opacity-60"
                  style={{ background: "rgba(167,139,250,0.4)" }}
                />
              </article>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <section className="my-20 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl sm:p-12">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-white sm:text-3xl">
                Ready to outguess two bots?
              </h3>
              <p className="mt-2 text-sm text-zinc-400">
                Solo mode runs entirely in your browser. No login, no waiting.
              </p>
            </div>
            <Link
              href="/games/telepath/play"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_30px_rgba(255,255,255,0.2)] transition hover:shadow-[0_0_45px_rgba(255,255,255,0.3)]"
            >
              Play now
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden
              >
                <path d="M5 12h14" />
                <path d="M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
