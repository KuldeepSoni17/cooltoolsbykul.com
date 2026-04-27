import Link from "next/link";

const highlights = [
  "3 players per match with simultaneous action rounds",
  "Choose attacks, shields, and traps every turn",
  "Energy economy and timing strategy drive outcomes",
  "Built as a live multiplayer web game",
];

export default function AttackDefensePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 px-6 py-12 text-zinc-100 sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(163,230,53,0.2),transparent_38%),radial-gradient(circle_at_15%_80%,rgba(16,185,129,0.18),transparent_30%)]" />

      <div className="relative mx-auto w-full max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center rounded-full border border-zinc-700/70 bg-zinc-900/70 px-4 py-1 text-sm font-semibold text-lime-300 backdrop-blur hover:text-lime-200"
        >
          {"<-"} Back to home
        </Link>

        <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-2xl shadow-black/30">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-300">
            Games
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Attack-Defense
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-200">
            A fast-paced strategy game where each player manages three houses,
            predicts enemy moves, and survives the longest through smart attack
            and defense decisions.
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
            <a
              href="https://web-navy-six-14.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-xl bg-lime-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-lime-300"
            >
              Play Attack-Defense
            </a>
            <span className="inline-flex items-center rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
              Multiplayer is live now
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
