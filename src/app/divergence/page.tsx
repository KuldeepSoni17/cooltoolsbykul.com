import Link from "next/link";

export default function DivergencePage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm text-cyan-300 hover:text-cyan-200">
          ← cooltoolsbykul.com
        </Link>
        <h1 className="mt-6 text-4xl font-bold">Divergence</h1>
        <p className="mt-4 leading-7 text-zinc-300">
          Scenario analytics and divergence exploration — source on GitHub, full
          Vercel deploy coming soon.
        </p>
        <a
          href="https://github.com/KuldeepSoni17/divergence"
          className="mt-6 inline-flex rounded-full border border-zinc-600 px-5 py-2 text-sm font-semibold text-white hover:border-zinc-400"
          target="_blank"
          rel="noreferrer"
        >
          View repository →
        </a>
      </div>
    </main>
  );
}
