# Mouzika Studio — data model & Supabase integration

The app ships **fully functional with zero backend**: all learner state (XP,
streak, spaced-repetition schedule, completed lessons, saved beats, likes,
onboarding answers, plan) lives in `localStorage` behind a small interface in
[`src/lib/store/progress.tsx`](../src/lib/store/progress.tsx). This document
describes how to promote that to a real multi-tenant Postgres backend with
Supabase, matching the schema in [`migrations/0001_init.sql`](./migrations/0001_init.sql).

## Why the store is an interface

`ProgressProvider` exposes a stable API (`addXp`, `completeLesson`,
`recordDrill`, `recordReview`, `saveBeat`, `toggleLike`, …). Today those mutate
React state + `localStorage`. To go cloud-backed you swap the implementation —
the UI never changes.

## Applying the schema

Local development:

```bash
npx supabase init          # once
npx supabase start         # spins up local Postgres + Auth + Studio
npx supabase db reset      # applies migrations/*.sql then seed.sql
```

Remote project (or the Supabase MCP `apply_migration`): run the migrations in
order, then `seed.sql`. After applying, run the **security advisor** and
**performance advisor** (the migrations enable RLS on every user-owned table;
the advisors confirm no gaps and suggest missing indexes).

Migrations:

| File | What it does |
| --- | --- |
| `0001_init.sql` | Full schema: content, users, progress, gamification, community, content engine + RLS. |
| `0002_lock_content_engine_tables.sql` | Enables RLS (deny-all to public roles) on `content_sources` / `content_changes` / `kb_releases` — service-role only. The initial schema left these exposed to the anon key. |
| `0003_rls_perf_and_fn_hardening.sql` | Revokes public EXECUTE on the `handle_new_user()` SECURITY DEFINER function; wraps `auth.uid()` as `(select auth.uid())` in every owner policy (initplan perf); adds covering indexes for unindexed FKs. Clears all advisor WARNs. |
| `0004_user_state.sql` | `user_state` table — the per-user cloud-sync document backing the client store (see below). |

After `0002`+`0003` the only remaining advisor notices are INFO-level and by
design: `rls_enabled_no_policy` on the three service-role-only tables (deny-all
is the intent) and `unused_index` on a fresh DB with no query history.

## Table map

| Concern | Table(s) | Store field it replaces |
| --- | --- | --- |
| Identity / plan / onboarding | `profiles` | `state.name`, `state.plan`, `state.onboarding` |
| Curriculum content | `courses` → `modules` → `lessons` | `src/lib/content/curriculum.ts` |
| Knowledge base | `kb_entries` | `src/lib/content/codex.ts` |
| Lesson completion | `lesson_progress` | `state.completedLessons` |
| Spaced repetition | `srs_items`, `srs_reviews` | `state.srs` (see `src/lib/store/srs.ts`) |
| XP & streak | `xp_events`, `profiles.xp/streak/last_active` | `state.xp`, `state.streak` |
| Achievements | `achievements`, `user_achievements` | `src/lib/content/curriculum.ts` |
| Community tracks | `tracks`, `track_likes` | `state.likedTracks` |
| AI mix feedback | `mix_submissions` | (client-only today) |
| Billing | `subscriptions` | `state.plan` |
| Content engine (HITL) | `content_sources`, `content_changes`, `kb_releases` | Admin `/admin` demo state |

## Cloud sync (implemented)

The client store (`src/lib/store/progress.tsx`) is now wired to Supabase behind
the same interface, entirely **env-gated**: with `NEXT_PUBLIC_SUPABASE_URL` /
`NEXT_PUBLIC_SUPABASE_ANON_KEY` unset the app is byte-for-byte the offline
localStorage build. When they are set and a user signs in (email/password via
`src/lib/auth/AuthProvider.tsx`), the whole `ProgressState` is synced to the
`user_state` table as one owner-scoped JSON document.

Why a blob and not the normalized tables: the app's ids (`found-1`, community
track ids, …) reference local content files, not DB rows, so they would violate
the FK constraints on `lesson_progress` / `track_likes`. The normalized tables
remain for when curriculum/community content is migrated into Postgres; until
then `user_state` is the source of truth for a signed-in learner.

Sync rules (pure + unit-tested in `src/lib/store/cloud.ts`, `tests/cloud.test.ts`):

- **Merge, never lose** — on sign-in, remote and local are merged: XP/streak take
  the max, collections union, SRS keeps the furthest-scheduled item, plan takes
  the higher tier (`mergeProgress`).
- **Shared-device guard** — `resolveSync` records which user the on-device state
  belongs to (`mz_cloud_owner`) and only merges/uploads local when it belongs to
  this user or nobody yet; a different prior owner adopts the account's own remote
  instead, so one account's progress never bleeds into another's.
- **No clobber-on-error** — a failed read is distinguished from an empty one; the
  debounced push is gated on a successful initial pull.

## Security model

Row-Level Security is enabled on all user tables with owner-only policies
(`auth.uid() = user_id`). Reference content (`courses`, `modules`, `lessons`,
`kb_entries`, `achievements`) and community `tracks` are public-read. A trigger
auto-creates a `profiles` row on signup.

**Token hygiene** (per the research doc's governance notes): use the
**anon** key in the browser (`NEXT_PUBLIC_SUPABASE_ANON_KEY`), a **read-only**
role for exploration, and keep the **service-role** key server-only for the
admin content-engine writes. Never commit keys.

## Content-refresh engine (Stage 4)

`content_sources` → scheduled Firecrawl scrape → chunk/embed/diff/classify →
inserts rows into `content_changes` (status `pending`). A human reviews the diff
in `/admin` (Content Engine), and approval applies the delta and records a row
in `kb_releases` — an immutable, provenance-tracked release. The `/admin` UI
already models this loop end-to-end against local state; wiring it to these
tables (plus a LangGraph human-in-the-loop pipeline) is the production step.

## AI Tutor (RAG)

`/api/tutor` today answers via Anthropic (when `ANTHROPIC_API_KEY` is set) or a
rule-based fallback. To make it curriculum-aware, embed `kb_entries` and inject
the top-k relevant chunks into the system prompt, tuned to the learner's level
(adaptive difficulty toward the 80–90% accuracy band).
