import Link from "next/link";

export default function Home() {
  const sections = [
    {
      title: "Tools",
      description:
        "Smart utilities for creators and builders: fast, practical, and absurdly useful.",
      vibe: "Build faster",
      accent: "from-cyan-400/30 via-blue-500/20 to-transparent",
      href: "/summary",
    },
    {
      title: "Radical Ideas",
      description:
        "Thought experiments, product bets, and spicy concepts that challenge default thinking.",
      vibe: "Think bigger",
      accent: "from-fuchsia-400/30 via-purple-500/20 to-transparent",
    },
    {
      title: "Non-Sense Stuffs",
      description:
        "Playground zone for weird experiments that should not work, but sometimes do.",
      vibe: "Stay curious",
      accent: "from-amber-300/30 via-orange-500/20 to-transparent",
    },
    {
      title: "Songs / Poems / Stories",
      description:
        "Words, rhythm, and imagination blended into pieces that are raw and memorable.",
      vibe: "Feel deeply",
      accent: "from-emerald-300/30 via-teal-500/20 to-transparent",
      href: "/poems",
    },
    {
      title: "Area 51",
      description:
        "Secret lab: unreleased builds, moonshot prototypes, and high-risk concepts.",
      vibe: "Classified",
      accent: "from-pink-400/30 via-rose-500/20 to-transparent",
    },
    {
      title: "Attack-Defense Game",
      description:
        "Real-time 3-player strategy battleground where timing, targeting, and defense choices decide who survives.",
      vibe: "Play now",
      accent: "from-lime-300/30 via-emerald-500/20 to-transparent",
      href: "/games/attack-defense",
    },
    {
      title: "Who's Responsible",
      description:
        "A civic accountability concept to help citizens quickly find the right department and public representative for local issues.",
      vibe: "Civic impact",
      accent: "from-sky-300/30 via-cyan-500/20 to-transparent",
      href: "/whos-responsible",
    },
    {
      title: "Questions Before Conceiving",
      description:
        "A deep readiness assessment concept for people considering parenthood.",
      vibe: "Reflect deeply",
      accent: "from-yellow-300/30 via-amber-500/20 to-transparent",
      href: "/questions-before-conceiving",
    },
    {
      title: "Norm-tionary",
      description:
        "A swipeable dictionary of modern dysfunctions that became normal.",
      vibe: "Uncomfortable truth",
      accent: "from-violet-300/30 via-fuchsia-500/20 to-transparent",
      href: "/norm-tionary",
    },
    {
      title: "WorthIt?",
      description:
        "A calm reflection tool that checks whether a worry deserves your mental energy.",
      vibe: "Worry less",
      accent: "from-emerald-300/30 via-lime-500/20 to-transparent",
      href: "/worth-it",
    },
    {
      title: "Italian Coach",
      description:
        "A serious grammar-first Italian learning system with sentence building, correction drills, and mastery tracking.",
      vibe: "Speak with confidence",
      accent: "from-emerald-300/30 via-cyan-500/20 to-transparent",
      href: "/italian-coach",
    },
    {
      title: "OneStopAI Spec",
      description:
        "Implementation blueprint for a multi-provider AI chat app built with Next.js, FastAPI, and LiteLLM.",
      vibe: "Ship faster",
      accent: "from-indigo-300/30 via-violet-500/20 to-transparent",
      href: "/onestopai",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.2),transparent_38%),radial-gradient(circle_at_20%_80%,rgba(217,70,239,0.18),transparent_32%)]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col px-6 py-12 sm:px-10 lg:px-16">
        <header className="mb-14 flex flex-wrap items-center justify-between gap-4">
          <p className="inline-flex items-center rounded-full border border-zinc-700/70 bg-zinc-900/70 px-4 py-1 text-sm font-semibold text-cyan-300 backdrop-blur">
            cooltoolsbykul.com
          </p>
          <p className="text-sm text-zinc-300">
            Inventive. Artistic. Slightly dangerous.
          </p>
        </header>

        <section className="max-w-4xl">
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            Welcome to the creative HQ of Kul.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300 sm:text-xl">
            A digital universe where useful tools, bold ideas, playful chaos, and
            storytelling live in one place. Every section is crafted to feel like
            a world of its own.
          </p>
        </section>

        <section className="mt-12 grid gap-5 md:grid-cols-2">
          {sections.map((section) => (
            <article
              key={section.title}
              className="group relative overflow-hidden rounded-3xl border border-zinc-800/90 bg-zinc-900/80 p-6 shadow-2xl shadow-black/20 transition-transform duration-300 hover:-translate-y-1"
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${section.accent} opacity-60 transition-opacity duration-300 group-hover:opacity-90`}
              />
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-300">
                  {section.vibe}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {section.title}
                </h2>
                <p className="mt-3 leading-7 text-zinc-200/90">
                  {section.description}
                </p>
                {section.href ? (
                  <Link
                    href={section.href}
                    className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-200 hover:text-emerald-100"
                  >
                    Open section {"->"}
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </section>

        <footer className="mt-14 border-t border-zinc-800 pt-6 text-sm text-zinc-400">
          Cool Tools by Kul - Crafted with Next.js, styled for impact.
        </footer>
      </div>
    </main>
  );
}
