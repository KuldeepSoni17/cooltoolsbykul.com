-- PolicyMakers ( /PolicyMakers ) — run in Supabase SQL editor

create table if not exists pm_policies (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('new', 'modify')),
  title text not null,
  domain text,
  -- What is being proposed (both new + modify)
  proposal text not null,
  -- Why it is required
  rationale text not null,
  -- Incidents that could have been impacted / prevented
  incidents text,
  -- Estimated numbers of impact
  impact_estimate text,
  -- Any other relevant details
  details text,
  -- Modify-only fields
  existing_policy text,
  proposed_change text,
  author_name text,
  status text not null default 'proposed'
    check (status in ('proposed', 'under_review', 'adopted', 'rejected')),
  upvotes int not null default 0,
  downvotes int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists pm_votes (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid not null references pm_policies(id) on delete cascade,
  -- Anonymous per-device token (no auth required to vote)
  voter_token text not null,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  unique (policy_id, voter_token)
);

create index if not exists pm_policies_created_idx on pm_policies(created_at desc);
create index if not exists pm_policies_kind_idx on pm_policies(kind);
create index if not exists pm_votes_policy_idx on pm_votes(policy_id);

alter table pm_policies enable row level security;
alter table pm_votes enable row level security;
