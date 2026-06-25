import type { Policy } from "./types";

export function hasPolicyMakersBackend(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

/**
 * Read-only example proposals shown when no backend is configured (e.g. local
 * dev without Supabase). They illustrate the two flows — a brand new policy and
 * a modification of an existing one — so the page is never empty.
 */
export const SEED_POLICIES: Policy[] = [
  {
    id: "seed-new-1",
    kind: "new",
    title: "Mandatory cooling-off period for fast-tracked legislation",
    domain: "Governance & Transparency",
    proposal:
      "Require any bill not declared a formal emergency to be public for a minimum of 7 days before it can be voted on.",
    rationale:
      "Laws passed in haste, without scrutiny, are how rights get quietly eroded. A short, mandatory public window lets citizens, press, and experts actually read what is being passed in their name.",
    incidents:
      "Several sweeping bills in recent years were tabled and passed within hours, with members admitting they had not read the text. A cooling-off period would have forced disclosure.",
    impact_estimate:
      "Affects ~100% of non-emergency legislation. Estimated to give the public and ~1,400+ legislators meaningful review time on every major bill.",
    details:
      "Emergencies remain exempt but must be justified in writing and reviewed retroactively within 30 days.",
    existing_policy: null,
    proposed_change: null,
    author_name: "Seed proposal",
    status: "proposed",
    upvotes: 128,
    downvotes: 14,
    created_at: "2026-01-15T10:00:00.000Z",
  },
  {
    id: "seed-modify-1",
    kind: "modify",
    title: "Strengthen whistleblower protection thresholds",
    domain: "Civil Liberties",
    proposal:
      "Extend existing whistleblower protections to contractors and gig workers, and add anonymous reporting with legal indemnity.",
    rationale:
      "The current law only shields full-time employees. The people who often see wrongdoing first — contractors, temps — have zero protection and stay silent out of fear.",
    incidents:
      "Multiple safety and corruption cases went unreported for years because the only witnesses were contractors excluded from protection.",
    impact_estimate:
      "Would extend protection to an estimated 40M+ contract and gig workers currently outside the law's scope.",
    details:
      "Includes a 90-day retaliation reversal window and a dedicated independent ombudsman.",
    existing_policy:
      "Whistleblower Protection Act currently covers only direct, full-time public and private employees, with retaliation claims requiring named disclosure.",
    proposed_change:
      "Redefine 'covered person' to include any individual performing work for the organisation, and permit verified anonymous filings.",
    author_name: "Seed proposal",
    status: "under_review",
    upvotes: 211,
    downvotes: 33,
    created_at: "2026-02-02T10:00:00.000Z",
  },
];
