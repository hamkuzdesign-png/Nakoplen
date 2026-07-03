-- Run this once in the Supabase project's SQL Editor (Project → SQL Editor → New query).
-- Backs web/lib/analytics.ts — one row per event, shared across every device
-- that opens the GitHub Pages link, so /stats can aggregate all test sessions.

create table if not exists events (
  id bigint generated always as identity primary key,
  pid text not null,
  scenario text,
  ts bigint not null,
  type text not null,
  path text,
  duration_ms integer,
  x_norm double precision,
  y_page double precision,
  rage_click boolean,
  dead_click boolean,
  max_depth_percent double precision,
  created_at timestamptz not null default now()
);

alter table events enable row level security;

-- The anon (public) key is embedded in the deployed prototype's JS bundle by
-- design — that's how a static site talks to Supabase. RLS is what keeps it
-- safe: anon can only append and read, never update or delete existing rows.
create policy "anon can insert events" on events
  for insert to anon
  with check (true);

create policy "anon can read events" on events
  for select to anon
  using (true);
