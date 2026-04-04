-- Job Tracker — Supabase Schema
-- Run this in the Supabase SQL Editor

-- ============================================================
-- JOBS TABLE-- Run this in the Supabase SQL Editor
-- ============================================================
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Core job info
  company text not null,
  title text not null,
  location text,
  salary_min integer,
  salary_max integer,
  salary_currency text default 'EUR',
  url text,
  platform text,

  -- Status workflow
  status text not null default 'needs_apply'
    check (status in (
      'needs_apply', 'applied', 'replied', 'interview',
      'offer', 'rejected', 'skipped', 'closed', 'archived'
    )),

  -- Detail fields
  description text,
  notes text,
  contact_name text,
  contact_email text,

  -- Metadata
  applied_at timestamptz,
  source text  -- 'manual', 'claude', 'import'
);

-- Auto-update updated_at on every change
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger jobs_updated_at
  before update on public.jobs
  for each row execute function update_updated_at();

create index jobs_status_idx on public.jobs(status);
create index jobs_created_at_idx on public.jobs(created_at desc);

-- ============================================================
-- PLATFORMS TABLE
-- ============================================================
create table public.platforms (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  name text not null unique,
  url text not null,
  tier integer not null default 2
    check (tier in (1, 2, 3)),

  tags text[] default '{}',
  -- tag values: 'NO_LOGIN', 'LOGIN_REQ', 'EU', 'REMOTE_FOCUS', 'BARCELONA', 'SPANISH', 'ENGLISH', 'GENERAL'

  notes text,
  is_active boolean not null default true,
  last_checked_at timestamptz
);

create index platforms_tier_idx on public.platforms(tier);

-- ============================================================
-- ROW LEVEL SECURITY (single-user app — allow all)
-- ============================================================
alter table public.jobs enable row level security;
alter table public.platforms enable row level security;

create policy "Allow all on jobs" on public.jobs for all using (true) with check (true);
create policy "Allow all on platforms" on public.platforms for all using (true) with check (true);

-- ============================================================
-- SEED: example platforms
-- ============================================================
insert into public.platforms (name, url, tier, tags, notes) values
  ('LinkedIn', 'https://linkedin.com/jobs', 1, array['GENERAL', 'EU'], 'Main general board'),
  ('InfoJobs', 'https://infojobs.net', 1, array['BARCELONA', 'SPANISH', 'EU'], 'Largest Spanish job board'),
  ('Indeed ES', 'https://es.indeed.com', 1, array['BARCELONA', 'SPANISH', 'EU'], 'Spain-focused Indeed'),
  ('Wellfound', 'https://wellfound.com', 2, array['REMOTE_FOCUS', 'NO_LOGIN'], 'Startup-focused, formerly AngelList'),
  ('Remote OK', 'https://remoteok.com', 2, array['REMOTE_FOCUS', 'NO_LOGIN'], 'Remote-first roles'),
  ('EuroJobs', 'https://eurojobs.com', 2, array['EU', 'NO_LOGIN'], 'Pan-European job board'),
  ('Barcelona Tech City', 'https://barcelonatechcity.com/en/jobs', 2, array['BARCELONA', 'EU'], 'Barcelona tech ecosystem jobs'),
  ('Product Hunt Jobs', 'https://producthunt.com/jobs', 3, array['REMOTE_FOCUS', 'NO_LOGIN'], 'Product-centric startup jobs'),
  ('Notion Jobs', 'https://otta.com', 3, array['REMOTE_FOCUS', 'EU'], 'Tech & startup jobs, EU friendly');
