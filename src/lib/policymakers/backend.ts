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
  {
    id: "seed-new-2",
    kind: "new",
    title: "Right to disconnect after working hours",
    domain: "Labour & Workplace",
    proposal:
      "Give every salaried worker a legal right to ignore work calls, emails, and messages outside their contracted hours, with no penalty.",
    rationale:
      "Always-on culture has quietly turned an 8-hour job into a 14-hour leash. Rest is not a perk — it is the baseline for health, family, and a functioning mind.",
    incidents:
      "Repeated burnout-linked health breakdowns and a rise in stress-related resignations across IT and startups, where after-hours pings are treated as normal.",
    impact_estimate:
      "Would directly protect an estimated 90M+ salaried and knowledge workers from unpaid after-hours availability.",
    details:
      "Employers may define genuine on-call roles, but those must be disclosed in the contract and paid an on-call allowance.",
    existing_policy: null,
    proposed_change: null,
    author_name: "Seed proposal",
    status: "proposed",
    upvotes: 342,
    downvotes: 41,
    created_at: "2026-02-18T10:00:00.000Z",
  },
  {
    id: "seed-new-3",
    kind: "new",
    title: "Open, machine-readable public spending dashboard",
    domain: "Governance & Transparency",
    proposal:
      "Mandate that every rupee of public money — central, state, and municipal — be published line-by-line in a free, open, machine-readable dashboard within 30 days of spending.",
    rationale:
      "You cannot fight corruption you cannot see. Sunlight on budgets lets journalists, researchers, and ordinary citizens trace where money actually goes.",
    incidents:
      "Numerous infrastructure projects with ballooning costs and missing audits that stayed buried because the data was locked in PDFs or never released.",
    impact_estimate:
      "Covers 100% of public expenditure (tens of lakh crore annually) and arms millions of citizens and 600+ districts with audit-ready data.",
    details:
      "Open API with bulk download. Contractor names, amounts, and completion status all required fields.",
    existing_policy: null,
    proposed_change: null,
    author_name: "Seed proposal",
    status: "proposed",
    upvotes: 489,
    downvotes: 52,
    created_at: "2026-03-05T10:00:00.000Z",
  },
  {
    id: "seed-modify-2",
    kind: "modify",
    title: "Cap election campaign spending and mandate real-time disclosure",
    domain: "Elections & Democracy",
    proposal:
      "Tighten the spending ceiling and require every donation and expense to be published within 48 hours during the campaign window.",
    rationale:
      "When money decides who can be heard, democracy becomes an auction. Real-time disclosure makes vote-buying and dark money far harder to hide.",
    incidents:
      "Repeated cases of campaign spends that visibly dwarfed the legal limit, with disclosures filed months later — long after votes were cast.",
    impact_estimate:
      "Affects every candidate in national and state elections, and gives ~900M registered voters visibility before they vote, not after.",
    details:
      "Anonymous bulk instruments above a small threshold are banned. Violations trigger automatic audit.",
    existing_policy:
      "Current rules set a per-candidate expense ceiling but allow post-election disclosure and exempt several party-routed and instrument-based donations from itemisation.",
    proposed_change:
      "Lower the effective ceiling, close the party-routing exemption, and switch from post-facto filing to rolling 48-hour public disclosure.",
    author_name: "Seed proposal",
    status: "proposed",
    upvotes: 376,
    downvotes: 88,
    created_at: "2026-03-20T10:00:00.000Z",
  },
  {
    id: "seed-modify-3",
    kind: "modify",
    title: "Strengthen data-breach notification timelines",
    domain: "Privacy & Technology",
    proposal:
      "Require companies to notify affected users within 72 hours of discovering a breach, with plain-language detail on what leaked.",
    rationale:
      "Today people often learn their data leaked from a news headline months later. Fast, honest notice lets you change passwords, freeze cards, and protect yourself in time.",
    incidents:
      "Large consumer breaches where personal and financial data circulated for months before any user was informed.",
    impact_estimate:
      "Would safeguard hundreds of millions of users whose data sits in breach-prone consumer platforms.",
    details:
      "Includes a public breach registry and proportionate penalties tied to delay and severity.",
    existing_policy:
      "Existing rules require breach reporting to the regulator but set vague timelines and no mandatory direct, plain-language notice to every affected individual.",
    proposed_change:
      "Add a hard 72-hour clock, mandate direct user notification, and publish breaches to an open registry.",
    author_name: "Seed proposal",
    status: "adopted",
    upvotes: 298,
    downvotes: 19,
    created_at: "2026-04-08T10:00:00.000Z",
  },
];
