-- ============================================================================
-- Mouzika Studio — initial schema (Postgres / Supabase)
-- Learning platform: curriculum, per-item spaced repetition, gamification,
-- subscriptions, community tracks, and the human-in-the-loop content engine.
--
-- Every user-owned table has Row-Level Security enabled so a learner can only
-- read/write their own rows. Run the Supabase security & performance advisors
-- after applying (see supabase/schema.md).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Reference / content (public read, admin write)
-- ---------------------------------------------------------------------------

create table if not exists courses (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  description  text,
  icon         text,
  color        text,
  sort_order   int  not null default 0,
  status       text not null default 'published' check (status in ('draft','published','archived')),
  created_at   timestamptz not null default now()
);

create table if not exists modules (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references courses(id) on delete cascade,
  title       text not null,
  sort_order  int  not null default 0
);

create table if not exists lessons (
  id          uuid primary key default gen_random_uuid(),
  module_id   uuid not null references modules(id) on delete cascade,
  slug        text unique not null,
  title       text not null,
  -- typed interactive lessons: quiz | synth | eq | ear | chords | mixer |
  -- lufs | arrange | sequencer | video | reading
  kind        text not null default 'reading',
  body        jsonb,
  xp_reward   int  not null default 50,
  sort_order  int  not null default 0,
  status      text not null default 'published' check (status in ('draft','published','archived')),
  created_at  timestamptz not null default now()
);

-- The Codex knowledge base (versioned, provenance-tracked).
create table if not exists kb_entries (
  id           uuid primary key default gen_random_uuid(),
  category     text not null,
  title        text not null,
  summary      text,
  body         jsonb not null,
  read_min     int  not null default 4,
  source_url   text,
  kb_version   int  not null default 1,
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Users & profile (auth.users is managed by Supabase Auth)
-- ---------------------------------------------------------------------------

create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  handle       text unique,
  display_name text,
  bio          text,
  genre        text,
  level_label  text,
  plan         text not null default 'free' check (plan in ('free','pro','lifetime')),
  onboarding   jsonb not null default '{}'::jsonb,
  xp           int  not null default 0,
  streak       int  not null default 0,
  last_active  date,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Progress, spaced repetition & gamification
-- ---------------------------------------------------------------------------

create table if not exists lesson_progress (
  user_id      uuid not null references auth.users(id) on delete cascade,
  lesson_id    uuid not null references lessons(id) on delete cascade,
  score        numeric,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

-- SuperMemo-2 style per-item scheduling (mirrors src/lib/store/srs.ts).
create table if not exists srs_items (
  user_id       uuid not null references auth.users(id) on delete cascade,
  topic_id      text not null,
  ease          numeric not null default 2.5,
  interval_days int  not null default 0,
  reps          int  not null default 0,
  lapses        int  not null default 0,
  due_at        timestamptz not null default now(),
  primary key (user_id, topic_id)
);

create table if not exists srs_reviews (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  topic_id   text not null,
  quality    int  not null check (quality between 0 and 5),
  reviewed_at timestamptz not null default now()
);

create table if not exists xp_events (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  amount     int  not null,
  reason     text,
  created_at timestamptz not null default now()
);

create table if not exists achievements (
  code        text primary key,
  name        text not null,
  description text,
  icon        text,
  color       text
);

create table if not exists user_achievements (
  user_id    uuid not null references auth.users(id) on delete cascade,
  code       text not null references achievements(code) on delete cascade,
  earned_at  timestamptz not null default now(),
  primary key (user_id, code)
);

-- ---------------------------------------------------------------------------
-- Community tracks & AI mix feedback submissions
-- ---------------------------------------------------------------------------

create table if not exists tracks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  genre       text,
  bpm         int,
  audio_path  text,
  plays       int not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists track_likes (
  user_id  uuid not null references auth.users(id) on delete cascade,
  track_id uuid not null references tracks(id) on delete cascade,
  primary key (user_id, track_id)
);

create table if not exists mix_submissions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  track_id    uuid references tracks(id) on delete set null,
  metrics     jsonb not null,     -- { lufs, peakDb, width, crest, balance, ... }
  score       int,
  report      jsonb,              -- { strengths[], fixes[] }
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Subscriptions (Stripe mirror)
-- ---------------------------------------------------------------------------

create table if not exists subscriptions (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text,
  plan               text not null default 'free' check (plan in ('free','pro','lifetime')),
  interval           text check (interval in ('month','year','once')),
  status             text not null default 'active',
  current_period_end timestamptz,
  updated_at         timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Content engine (human-in-the-loop) — admin only
-- ---------------------------------------------------------------------------

create table if not exists content_sources (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  kind       text not null,          -- firecrawl | manual | api
  cadence    text,                   -- daily | weekly | on-demand
  last_run   timestamptz,
  ok         boolean not null default true
);

create table if not exists content_changes (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  change_type text not null check (change_type in ('net-new','contradicts','stale','redundant')),
  source      text,
  confidence  int,                   -- 0..100
  added       jsonb not null default '[]'::jsonb,
  removed     jsonb not null default '[]'::jsonb,
  status      text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at  timestamptz not null default now(),
  resolved_by uuid references auth.users(id),
  resolved_at timestamptz
);

create table if not exists kb_releases (
  id          uuid primary key default gen_random_uuid(),
  version     text not null,
  summary     text,
  released_by text,
  released_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_lessons_module   on lessons(module_id);
create index if not exists idx_modules_course    on modules(course_id);
create index if not exists idx_srs_due           on srs_items(user_id, due_at);
create index if not exists idx_progress_user     on lesson_progress(user_id);
create index if not exists idx_tracks_user       on tracks(user_id);
create index if not exists idx_xp_user           on xp_events(user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------
alter table profiles           enable row level security;
alter table lesson_progress    enable row level security;
alter table srs_items          enable row level security;
alter table srs_reviews        enable row level security;
alter table xp_events          enable row level security;
alter table user_achievements  enable row level security;
alter table tracks             enable row level security;
alter table track_likes        enable row level security;
alter table mix_submissions    enable row level security;
alter table subscriptions      enable row level security;

-- Public content is readable by everyone.
alter table courses      enable row level security;
alter table modules      enable row level security;
alter table lessons      enable row level security;
alter table kb_entries   enable row level security;
alter table achievements enable row level security;

create policy "content is public read" on courses      for select using (true);
create policy "content is public read" on modules      for select using (true);
create policy "content is public read" on lessons      for select using (true);
create policy "content is public read" on kb_entries   for select using (true);
create policy "achievements public read" on achievements for select using (true);

-- Owner-only policies (helper: a row is mine when its user_id = auth.uid()).
create policy "own profile"      on profiles          for all using (auth.uid() = id)          with check (auth.uid() = id);
create policy "own progress"     on lesson_progress   for all using (auth.uid() = user_id)     with check (auth.uid() = user_id);
create policy "own srs items"    on srs_items         for all using (auth.uid() = user_id)     with check (auth.uid() = user_id);
create policy "own srs reviews"  on srs_reviews       for all using (auth.uid() = user_id)     with check (auth.uid() = user_id);
create policy "own xp"           on xp_events         for all using (auth.uid() = user_id)     with check (auth.uid() = user_id);
create policy "own achievements" on user_achievements for all using (auth.uid() = user_id)     with check (auth.uid() = user_id);
create policy "own likes"        on track_likes       for all using (auth.uid() = user_id)     with check (auth.uid() = user_id);
create policy "own submissions"  on mix_submissions   for all using (auth.uid() = user_id)     with check (auth.uid() = user_id);
create policy "own subscription" on subscriptions     for select using (auth.uid() = user_id);

-- Tracks: public read, owner write.
create policy "tracks public read" on tracks for select using (true);
create policy "tracks owner write" on tracks for insert with check (auth.uid() = user_id);
create policy "tracks owner update" on tracks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tracks owner delete" on tracks for delete using (auth.uid() = user_id);

-- Auto-provision a profile row when a new auth user is created.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
