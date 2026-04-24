import Link from "next/link";

type Source = {
  name: string;
  lens: string;
  confidence: "High" | "Medium";
};

const sources: Source[] = [
  {
    name: "NASA, ESA, and major space agency releases",
    lens: "Official mission updates, instrumentation data, and timelines",
    confidence: "High",
  },
  {
    name: "Peer-reviewed astronomy journals",
    lens: "Validated exoplanet detection and atmospheric analysis methods",
    confidence: "High",
  },
  {
    name: "University observatory teams",
    lens: "Interpretation of telescope datasets and model limitations",
    confidence: "High",
  },
  {
    name: "Science media explainers",
    lens: "Public-facing interpretation and simplified implications",
    confidence: "Medium",
  },
];

const consensusPoints = [
  {
    title: "The strongest candidates are super-Earth and mini-Neptune systems",
    detail:
      "Most potentially habitable discoveries currently cluster around smaller stars, where transit signals are easier to detect. That bias shapes headlines, so discovery volume does not equal Earth-like certainty.",
  },
  {
    title: "Liquid water potential is a probabilistic estimate, not proof",
    detail:
      "When articles claim a planet is in the habitable zone, they usually mean distance-based temperature possibility under model assumptions. Surface pressure, atmospheric composition, and magnetic shielding remain unresolved for many targets.",
  },
  {
    title: "Atmospheric biosignatures require multiple independent checks",
    detail:
      "Single-molecule detections can be noisy or confounded by instrument artifacts. Confidence improves when several gases, stellar activity corrections, and repeated observations align across independent teams.",
  },
  {
    title: "Near-term breakthroughs will come from better spectra, not dramatic flybys",
    detail:
      "The next decade is likely to deliver sharper atmospheric characterization from upgraded telescopes and analysis pipelines, while direct visitation remains far beyond current propulsion capability.",
  },
];

const unresolvedQuestions = [
  "How often do Earth-sized planets around M-dwarfs retain stable, life-supporting atmospheres?",
  "What is the minimum biosignature confidence threshold before global scientific consensus forms?",
  "Can abiotic chemistry mimic multi-gas life signatures at rates high enough to fool current models?",
];

export default function SummaryPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(45,212,191,0.24),transparent_28%),radial-gradient(circle_at_80%_15%,rgba(244,114,182,0.2),transparent_34%),radial-gradient(circle_at_50%_90%,rgba(59,130,246,0.2),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 lg:px-16">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <p className="inline-flex rounded-full border border-cyan-300/50 bg-zinc-900/70 px-4 py-1 text-sm font-semibold text-cyan-200 backdrop-blur">
            Summary Engine
          </p>
          <Link
            href="/"
            className="rounded-full border border-zinc-700 bg-zinc-900/80 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:text-white"
          >
            Back to Home
          </Link>
        </header>

        <section className="mt-6 rounded-3xl border border-zinc-700/70 bg-zinc-900/60 p-6 backdrop-blur-xl sm:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">
            Source-of-Truth Topic
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Are We Close to Finding Life on Exoplanets?
          </h1>
          <p className="mt-5 max-w-4xl text-zinc-200 sm:text-lg">
            This page synthesizes repeated claims across space agency reports,
            research papers, and science explainers into one continuously readable
            truth draft. Instead of ten overlapping articles, you get one
            evidence-weighted view.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-300/50 bg-emerald-400/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-200">
                Net Verdict
              </p>
              <p className="mt-2 text-sm leading-6 text-emerald-50">
                We are closer to detecting credible biosignature patterns than
                ever, but not yet at confirmation-grade evidence.
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-300/50 bg-cyan-400/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">
                Confidence
              </p>
              <p className="mt-2 text-sm leading-6 text-cyan-50">
                Medium-high confidence on trend direction, medium confidence on
                timeline certainty.
              </p>
            </div>
            <div className="rounded-2xl border border-fuchsia-300/50 bg-fuchsia-400/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-fuchsia-200">
                Update Rhythm
              </p>
              <p className="mt-2 text-sm leading-6 text-fuchsia-50">
                Recommended refresh every major telescope data release cycle.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <article className="rounded-3xl border border-zinc-700/60 bg-zinc-900/55 p-6 backdrop-blur-xl sm:p-8">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">
              Consolidated Consensus
            </p>
            <div className="mt-4 space-y-4">
              {consensusPoints.map((point) => (
                <div
                  key={point.title}
                  className="rounded-2xl border border-zinc-700/70 bg-zinc-950/50 p-4"
                >
                  <h2 className="text-lg font-semibold text-white">
                    {point.title}
                  </h2>
                  <p className="mt-2 leading-7 text-zinc-300">{point.detail}</p>
                </div>
              ))}
            </div>
          </article>

          <aside className="space-y-5">
            <section className="rounded-3xl border border-zinc-700/60 bg-zinc-900/55 p-5 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">
                Evidence Map
              </p>
              <div className="mt-3 space-y-3">
                {sources.map((source) => (
                  <div
                    key={source.name}
                    className="rounded-2xl border border-zinc-700/70 bg-zinc-950/40 p-3"
                  >
                    <p className="text-sm font-semibold text-zinc-100">
                      {source.name}
                    </p>
                    <p className="mt-1 text-sm text-zinc-300">{source.lens}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-200">
                      Confidence: {source.confidence}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-700/60 bg-zinc-900/55 p-5 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">
                Open Questions
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-200">
                {unresolvedQuestions.map((question) => (
                  <li
                    key={question}
                    className="rounded-xl border border-zinc-700/70 bg-zinc-950/40 px-3 py-2"
                  >
                    {question}
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
