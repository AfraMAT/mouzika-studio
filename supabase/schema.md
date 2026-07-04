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

Remote project (or the Supabase MCP `apply_migration`): run
`migrations/0001_init.sql`, then `seed.sql`. After applying, run the **security
advisor** and **performance advisor** (the migration enables RLS on every
user-owned table; the advisors confirm no gaps and suggest missing indexes).

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
