import Link from "next/link";

/** Public landing page for the Tag App product (repo + mobile API live separately). */
export default function TagAppPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.15),transparent_40%),radial-gradient(circle_at_80%_60%,rgba(56,189,248,0.12),transparent_35%)]" />
      <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16 sm:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm font-semibold text-emerald-300 hover:text-emerald-200"
          >
            ← Back to Cool Tools
          </Link>
          <p className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
            Tag App · v0.1
          </p>
        </header>

        <section className="space-y-4">
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Tag App — daily chain game on your phone.
          </h1>
          <p className="text-lg leading-8 text-zinc-300">
            Each IST day opens a new contest: grow the longest approved tag chain, stay sharp on
            fraud signals, and let the server pick a winner using encrypted quiz criteria you never
            see until results drop.
          </p>
        </section>

        <section className="rounded-3xl border border-emerald-500/30 bg-emerald-950/30 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Use it now (no install)</p>
          <p className="mt-3 text-sm leading-7 text-zinc-200">
            <strong className="text-white">Web app:</strong>{" "}
            <a
              className="font-semibold text-emerald-300 underline-offset-4 hover:underline"
              href="/tag-app-play/"
            >
              cooltoolsbykul.com/tag-app-play/
            </a>
            <br />
            <strong className="text-white">API:</strong>{" "}
            <a
              className="break-all font-mono text-sm text-emerald-200 hover:underline"
              href="https://tag-app-server-production.up.railway.app/health"
            >
              https://tag-app-server-production.up.railway.app
            </a>
            <br />
            <span className="text-zinc-400">
              Demo sign-in: tap &quot;Send OTP&quot;, then enter code <code className="text-emerald-200">444444</code>{" "}
              (MSG91 not configured on the server yet).
            </span>
          </p>
        </section>

        <section className="grid gap-4 rounded-3xl border border-zinc-800/80 bg-zinc-900/70 p-6 shadow-2xl shadow-black/30 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Stack</p>
            <ul className="mt-3 space-y-2 text-sm text-zinc-200">
              <li>Expo + React Native + Zustand</li>
              <li>Express + Prisma + PostgreSQL</li>
              <li>Redis snapshots · MSG91 OTP · Razorpay payouts (wired)</li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Source</p>
            <p className="mt-3 text-sm leading-7 text-zinc-200">
              Code lives in{" "}
              <a
                className="font-semibold text-emerald-300 underline-offset-4 hover:underline"
                href="https://github.com/KuldeepSoni17/tag-app"
              >
                github.com/KuldeepSoni17/tag-app
              </a>
              . The production API runs on Railway; this site hosts a static web build under{" "}
              <code className="text-emerald-200">/tag-app-play/</code>.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">What ships in v0.1</p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-zinc-200">
            <li>OTP auth (MSG91 or dev static code), encrypted onboarding quiz, tag request → approve flow.</li>
            <li>Directed chain model with solo-chain handoff, fraud heuristics, admin HTTP routes.</li>
            <li>IST cron hooks for close reminders and winner selection pipeline (criteria encrypted at rest).</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
