import Link from "next/link";

const highlights = [
  "3-player simultaneous strategy — originally named Conqueror",
  "Send units into opponents' colored containers each round",
  "Four one-time powers: Block, Anonymous, Mutual Increase, Reversal",
  "Outlast the other two players when their units hit zero",
];

export default function TelepathPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 px-6 py-12 text-zinc-100 sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(167,139,250,0.22),transparent_38%),radial-gradient(circle_at_15%_80%,rgba(124,58,237,0.16),transparent_30%)]" />

      <div className="relative mx-auto w-full max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center rounded-full border border-zinc-700/70 bg-zinc-900/70 px-4 py-1 text-sm font-semibold text-violet-300 backdrop-blur hover:text-violet-200"
        >
          {"<-"} Back to home
        </Link>

        <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-2xl shadow-black/30">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-300">
            Games · Telepath
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Telepath
          </h1>
          <p className="mt-2 text-sm text-violet-300/90">
            Formerly Conqueror — the original mind-game from Kul&apos;s repo.
          </p>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-200">
            A three-player telepathy battle where you predict rivals while routing units through
            red, blue, and green containers. Powers twist parity, block incoming transfers, and
            swing the round tally in your favor.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {highlights.map((item) => (
              <article
                key={item}
                className="rounded-2xl border border-zinc-700/80 bg-zinc-950/60 p-4"
              >
                <p className="text-sm leading-6 text-zinc-200">{item}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/games/telepath/play"
              className="inline-flex items-center rounded-xl bg-violet-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-violet-300"
            >
              Play on Web
            </Link>
            <span className="inline-flex items-center rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
              Solo vs 2 bots · Hosted on cooltoolsbykul.com
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
