-- ============================================================================
-- Per-user cloud-sync document for the client progress store.
--
-- The app's localStorage state (completed lessons, SRS schedule, drills, saved
-- beats, likes, XP, streak, onboarding, plan) references local content ids, so
-- it is stored as a single owner-scoped JSON document rather than decomposed
-- into the normalized content tables (which require FK-valid lesson/track ids).
-- See src/lib/store/cloud.ts. Owner-only RLS; auth.uid() wrapped in a scalar
-- subselect for initplan performance. user_id is the PK, so its FK is covered.
-- ============================================================================

create table if not exists public.user_state (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  state      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_state enable row level security;

create policy "own state" on public.user_state
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
