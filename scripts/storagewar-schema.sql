-- Storage War — run in Supabase SQL editor

create table if not exists sw_users (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  display_name text,
  coins bigint not null default 5000,
  reward_points int not null default 0,
  game_state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sw_sessions (
  token text primary key,
  user_id uuid not null references sw_users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists sw_otp (
  phone text primary key,
  code text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists sw_auctions (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  description text not null,
  hint text not null,
  base_price int not null,
  current_bid int not null,
  high_bidder_id uuid references sw_users(id),
  artifacts jsonb not null default '[]'::jsonb,
  status text not null default 'auction' check (status in ('auction', 'closed')),
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists sw_market_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references sw_users(id) on delete cascade,
  seller_name text not null,
  artifact jsonb not null,
  template_id text not null,
  asking_price int not null,
  current_bid int not null,
  high_bidder_id uuid references sw_users(id),
  ends_at timestamptz not null,
  status text not null default 'active' check (status in ('active', 'sold', 'expired')),
  created_at timestamptz not null default now()
);

create table if not exists sw_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references sw_users(id) on delete cascade,
  collection_id text not null,
  collection_name text not null,
  payout_coins int not null,
  artifact_ids jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'paid')),
  phone text not null,
  created_at timestamptz not null default now()
);

create table if not exists sw_coin_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references sw_users(id) on delete cascade,
  stripe_session_id text unique,
  package_id text not null,
  coins int not null,
  amount_cents int not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  created_at timestamptz not null default now()
);

create index if not exists sw_auctions_status_idx on sw_auctions(status, ends_at);
create index if not exists sw_market_status_idx on sw_market_listings(status, ends_at);
create index if not exists sw_sessions_user_idx on sw_sessions(user_id);

alter table sw_users enable row level security;
alter table sw_sessions enable row level security;
alter table sw_otp enable row level security;
alter table sw_auctions enable row level security;
alter table sw_market_listings enable row level security;
alter table sw_redemptions enable row level security;
alter table sw_coin_purchases enable row level security;
