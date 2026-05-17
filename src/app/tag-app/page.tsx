import Link from "next/link";

/** TagRush product page (play in browser + repo links). */
export default function TagRushPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <BackgroundGlow />
      <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16 sm:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm font-semibold text-emerald-300 hover:text-emerald-200"
          >
            ← Back to Cool Tools
          </Link>
          <p className="rounded-full border border-[#00FF87]/40 bg-[#00FF87]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#00FF87]">
            TagRush · v0.2
          </p>
        </header>

        <section className="space-y-4">
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            TagRush — tag chains. Win the pot.
          </h1>
          <p className="text-lg leading-8 text-zinc-300">
            Each IST day opens a new contest: grow the longest approved tag chain, invite friends on
            WhatsApp (they earn a signup bonus), and let the server pick a winner using encrypted quiz
            criteria revealed after close.
          </p>
        </section>

        <section className="rounded-3xl border border-[#00FF87]/30 bg-emerald-950/30 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#00FF87]">Play now</p>
          <p className="mt-3 text-sm leading-7 text-zinc-200">
            <strong className="text-white">Web app:</strong>{" "}
            <a
              className="font-semibold text-[#00FF87] underline-offset-4 hover:underline"
              href="/tag-app-play/"
            >
              cooltoolsbykul.com/tag-app-play/
            </a>
            <br />
            <strong className="text-white">Invite friends:</strong> in-app → WhatsApp share → friend
            earns ₹10 on signup (adjust via <code className="text-[#00FF87]">INVITE_REWARD_INR</code> on
            the API).
            <br />
            <strong className="text-white">API:</strong>{" "}
            <a
              className="break-all font-mono text-sm text-emerald-200 hover:underline"
              href="https://tag-app-server-production.up.railway.app/health"
            >
              tag-app-server-production.up.railway.app
            </a>
            <br />
            <span className="text-zinc-400">
              Demo OTP: <code className="text-[#00FF87]">444444</code>
            </span>
          </p>
        </section>

        <section className="grid gap-4 rounded-3xl border border-zinc-800/80 bg-zinc-900/70 p-6 shadow-2xl shadow-black/30 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Code</p>
            <p className="mt-3 text-sm leading-7 text-zinc-200">
              Monorepo:{" "}
              <a
                className="font-semibold text-[#00FF87] underline-offset-4 hover:underline"
                href="https://github.com/KuldeepSoni17/tagrush"
              >
                github.com/KuldeepSoni17/tagrush
              </a>
              <br />
              Local: <code className="text-emerald-200">~/Documents/TagRush</code>
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">UI reference</p>
            <p className="mt-3 text-sm leading-7 text-zinc-200">
              Design artboards in <code className="text-emerald-200">design/reference/</code> (from your
              Tag App UI folder). Neon green · Bebas · JetBrains Mono.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function BackgroundGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,255,135,0.12),transparent_40%),radial-gradient(circle_at_80%_60%,rgba(56,189,248,0.1),transparent_35%)]" />
  );
}
