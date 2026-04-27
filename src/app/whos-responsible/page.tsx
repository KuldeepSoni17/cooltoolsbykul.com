import Link from "next/link";

const issueToDepartment = [
  ["Potholes / Road Damage", "Municipal Roads Department"],
  ["Waterlogging / Drains", "Stormwater Drain Department"],
  ["Garbage Collection", "Solid Waste Management"],
  ["Street Light Failure", "Electrical Department"],
  ["Power Cuts", "State DISCOM (e.g., BESCOM)"],
  ["Water Supply / Sewage", "Water Board (e.g., BWSSB)"],
  ["Traffic Signal Issues", "Traffic Police"],
  ["Illegal Construction", "Town Planning / Enforcement"],
];

const phasePlan = [
  "MVP: Bengaluru-first issue mapping and representative lookup",
  "v1.1: Live officer-level data via scrapers with freshness labels",
  "v1.2: Multi-city support for major Indian metros",
  "v2.0: Multilingual support and civic tracking enhancements",
];

export default function WhosResponsiblePage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-zinc-100 sm:px-10 lg:px-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <header className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
            Civic Accountability Concept
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Who&apos;s Responsible
          </h1>
          <p className="mt-5 max-w-3xl text-zinc-300">
            A public-facing web app concept for India: enter an issue and location,
            then instantly see the responsible department, key officer contacts, and
            elected representatives with complaint links.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-semibold text-emerald-300 hover:text-emerald-200"
            >
              {"<-"} Back to homepage
            </Link>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h2 className="text-xl font-semibold text-white">Core user flow</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-zinc-300">
              <li>User selects issue + location (India-focused autocomplete).</li>
              <li>Address resolves to ward, city, state, MLA and MP constituency.</li>
              <li>Issue maps to department(s) responsible in that jurisdiction.</li>
              <li>App shows officer contacts, representative details, and links.</li>
            </ol>
          </article>

          <article className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h2 className="text-xl font-semibold text-white">Recommended stack</h2>
            <ul className="mt-4 space-y-2 text-zinc-300">
              <li>Frontend: Next.js + Tailwind CSS</li>
              <li>Geo: Google Maps APIs + Turf.js / PostGIS</li>
              <li>Backend: API routes with caching layer</li>
              <li>Data: PostgreSQL + Redis + scheduled scrapers</li>
            </ul>
          </article>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-xl font-semibold text-white">
            Issue to department examples
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
              <thead>
                <tr className="text-zinc-400">
                  <th className="pr-4">Issue</th>
                  <th>Responsible department</th>
                </tr>
              </thead>
              <tbody>
                {issueToDepartment.map(([issue, department]) => (
                  <tr key={issue} className="rounded-lg bg-zinc-800/60 text-zinc-200">
                    <td className="rounded-l-lg px-3 py-2">{issue}</td>
                    <td className="rounded-r-lg px-3 py-2">{department}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-xl font-semibold text-white">Roadmap snapshot</h2>
          <ul className="mt-4 space-y-2 text-zinc-300">
            {phasePlan.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-zinc-400">
            Source document: <code>whos-responsible-spec.md</code>
          </p>
        </section>
      </div>
    </main>
  );
}
