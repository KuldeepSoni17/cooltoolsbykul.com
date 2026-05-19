"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { loadResults } from "@/features/mirror-engine/persistence";
import { matchBreeds, type MatchPrefs } from "./content-breeds";

export function PetMatchClient() {
  const readiness = loadResults("mirror-pet-results");
  const [species, setSpecies] = useState<"dog" | "cat" | "any">("any");
  const [size, setSize] = useState<"any" | "small" | "medium" | "large">("any");

  const userEnergy = useMemo(() => {
    if (!readiness) return 3;
    const time = readiness.domains.find((d) => d.domainId === "time");
    return time ? Math.round(time.percent / 25) || 2 : 3;
  }, [readiness]);

  const matches = useMemo(() => {
    const prefs: MatchPrefs = { species, size, energyMax: 5 };
    return matchBreeds(prefs, userEnergy);
  }, [species, size, userEnergy]);

  const ruledOut = matchBreeds({ species, size, energyMax: 5 }, userEnergy)
    .filter((m) => m.fitLabel === "weak")
    .slice(0, 4);

  return (
    <main
      className="mirror-root mirror-grain min-h-screen px-6 py-12"
      style={{ "--mirror-accent": "#9caf88" } as React.CSSProperties}
    >
      <div className="mx-auto max-w-3xl">
        <Link href="/questions-before-adopting-pet" className="text-sm text-[#9caf88]">
          ← Pet adoption mirror
        </Link>
        <h1 className="mt-8 text-3xl font-bold">Breed & species matcher</h1>
        {!readiness && (
          <p className="mt-4 rounded-xl border border-[#c97e7e]/40 bg-[#c97e7e]/10 p-4 text-sm">
            You skipped the readiness check. Matches below use defaults only — consider
            completing readiness first.
          </p>
        )}
        {readiness && ["romantic", "unprepared", "unfinished"].includes(readiness.profile.id) && (
          <p className="mt-4 rounded-xl border border-[#c8a97e]/40 bg-[#c8a97e]/10 p-4 text-sm">
            Readiness suggests preparation before adopting. Matches are honest for your
            constraints — not a green light.
          </p>
        )}

        <div className="mt-8 flex flex-wrap gap-4">
          <label className="text-sm">
            Species
            <select
              className="mt-1 block rounded border border-[var(--mirror-border)] bg-[var(--mirror-surface)] px-3 py-2"
              value={species}
              onChange={(e) => setSpecies(e.target.value as typeof species)}
            >
              <option value="any">Any</option>
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
            </select>
          </label>
          <label className="text-sm">
            Size
            <select
              className="mt-1 block rounded border border-[var(--mirror-border)] bg-[var(--mirror-surface)] px-3 py-2"
              value={size}
              onChange={(e) => setSize(e.target.value as typeof size)}
            >
              <option value="any">Any</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </label>
        </div>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-semibold">Top matches</h2>
          {matches
            .filter((m) => m.fitLabel !== "weak")
            .slice(0, 5)
            .map((m) => (
              <article
                key={m.breed.id}
                className="rounded-xl border border-[var(--mirror-border)] bg-[var(--mirror-surface)] p-5"
              >
                <div className="flex justify-between gap-2">
                  <h3 className="font-semibold">{m.breed.name}</h3>
                  {m.breed.rescueAvailability >= 4 && (
                    <span className="text-xs text-[#9caf88]">Often in rescue</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-[var(--mirror-text-secondary)]">
                  {m.breed.notes}
                </p>
                <ul className="mt-3 text-sm text-[var(--mirror-text-muted)]">
                  {m.reasons.map((r) => (
                    <li key={r}>+ {r}</li>
                  ))}
                  {m.watchOuts.map((w) => (
                    <li key={w} className="text-[#c97e7e]">
                      ! {w}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
        </section>

        {ruledOut.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold">Ruled out for you — and why</h2>
            <ul className="mt-4 space-y-3 text-sm text-[var(--mirror-text-secondary)]">
              {ruledOut.map((m) => (
                <li key={m.breed.id} className="rounded-lg border border-[var(--mirror-border)] p-4">
                  <strong>{m.breed.name}</strong>
                  {m.watchOuts[0] ? ` — ${m.watchOuts[0]}` : ""}
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-10 text-sm">
          <a
            href="https://www.petfinder.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#9caf88] underline"
          >
            Search rescues near you (Petfinder) →
          </a>
        </p>
      </div>
    </main>
  );
}
