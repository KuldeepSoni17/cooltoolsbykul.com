export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-20 sm:px-10 lg:px-16">
      <p className="mb-6 inline-flex w-fit rounded-full border border-zinc-200 bg-white px-4 py-1 text-sm font-medium text-zinc-700 shadow-sm">
        cooltoolsbykul.com
      </p>
      <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
        Building practical tools for everyday creators.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
        This is the starting point for Cool Tools by Kul. The full platform will
        include a blog, project and tools showcase, and an online shop with
        secure payments.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {["Blog", "Tools and Projects", "Shop and Payments"].map((section) => (
          <div
            key={section}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Coming Soon
            </p>
            <p className="mt-2 text-lg font-semibold text-zinc-900">{section}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
