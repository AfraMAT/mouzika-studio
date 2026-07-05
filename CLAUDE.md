# CLAUDE.md — Mouzika Studio

Guidance for working in this repo. Read this before making changes.

## What this is
An interactive electronic-music-production **learning platform** (Next.js 15 App
Router · React 19 · TypeScript · Tone.js · Tailwind v4). Tri-lingual EN/FR/AR
with RTL. Runs fully standalone (localStorage + rule-based tutor); cloud/AI
features are optional and behind env vars.

## Run / test / build
```bash
npm run dev            # dev server on :3000
npm run test           # Vitest unit tests (tests/)
npm run test:e2e       # Playwright (tests-e2e/) — run `npm run test:e2e:install` once
npm run typecheck      # tsc --noEmit — keep this green
npm run build          # production build
```
The Playwright config reuses a dev server on :3000 if one is already running.

## Conventions (match these)
- **Styling is inline `style={{…}}` objects**, not Tailwind utility classes.
  The only Tailwind used is a few responsive display helpers (`hidden lg:flex`,
  `flex lg:hidden`, `md:grid-cols-2`, `lg:ps-[92px]`). Colours/fonts come from
  CSS variables defined in `src/app/globals.css` (`--font-display`,
  `--font-sans`, `--font-mono`, `--font-arabic`).
- **CRITICAL — never set a CSS property both inline and via a responsive
  Tailwind class**: inline styles win, so `className="lg:hidden"` +
  `style={{display:'flex'}}` will NOT hide on desktop. Put the property in the
  class only (`className="flex lg:hidden"` and omit `display` from the inline
  style). Same for `grid-template-columns`, `padding-inline-start`, etc.
- **One `className` per element.** JSX keeps only the last `className` prop —
  merge classes into a single string.
- Palette: canvas `#0a0b10`, surface `#111219`, elev `#171922`, lime `#CBF24E`
  (shadow `#7f9f2b`), cyan `#4FE3E0`, violet `#8B7CFF`, orange `#FF9A3C`, pink
  `#FF5C93`. Use `<Icon name="…" />` (Material Symbols) for all icons.

## Where things live
- **i18n**: `src/lib/i18n/dictionaries.ts` is the single source of truth. `en`
  defines the canonical shape (no `as const` — strings are intentionally
  widened so `fr`/`ar` conform). A test (`tests/i18n.test.ts`) enforces that all
  three dictionaries have identical structure — **when you add a key to `en`,
  add it to `fr` and `ar` too** or that test fails. Access via `useT()` /
  `useI18n()` (client only).
- **Audio**: `src/lib/audio/engine.ts` is a lazy Tone.js singleton (drums +
  synth + EQ, shared across widgets). `mixer.ts` and `lufs.ts` are disposable
  per-screen graphs. `analyze.ts` + `feedback.ts` power the mix-feedback tool.
  Tone is always imported dynamically (`await loadTone()`) so it never runs in
  SSR. `getEngine().ensure()` must be called from a user gesture.
- **Gamification store**: `src/lib/store/progress.tsx` (provider + `useProgress`)
  persists to `localStorage`. Pure logic is split out and unit-tested:
  `srs.ts` (SuperMemo-2) and `streak.ts`. Keep those pure.
- **Content data**: `src/lib/content/` (curriculum, codex, community).
- **Theory**: `src/lib/theory.ts` — pure, unit-tested; reuse it, don't reinvent
  note/chord math in components.

## Backend
- `/api/tutor` calls Anthropic when `ANTHROPIC_API_KEY` is set, else returns
  `{reply:null}` and the client falls back to `cannedReply` (`src/lib/tutor.ts`).
  Shared canned copy lives in the dictionaries (`t.canned`).
- Supabase is optional and **env-gated** (`NEXT_PUBLIC_SUPABASE_URL` /
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`): with them unset the app is the offline
  localStorage build unchanged. Migrations `0001`–`0004` + `seed.sql` are applied
  to the live `mouzika-studio` project; notes in `supabase/schema.md`.
  - Browser client: `src/lib/supabase/client.ts` (`getSupabaseClient()` returns
    `null` when unconfigured or during SSR — never throws). Generated types in
    `src/lib/supabase/types.ts` (regenerate after schema changes).
  - Auth: `src/lib/auth/AuthProvider.tsx` (`useAuth()`), email/password; the
    `AccountPanel` on `/profile` only renders when configured.
  - Cloud sync: `src/lib/store/cloud.ts` (pure `mergeProgress` / `resolveSync`,
    unit-tested) mirrors the whole `ProgressState` to the `user_state` table when
    signed in. Keep the offline path and the `hydrated` pattern intact.
  - Never put the service-role key in client code / `NEXT_PUBLIC_*`.

## Gotchas
- **Tailwind v4 version skew** caused a `Missing field 'negated'` build crash;
  `tailwindcss` and `@tailwindcss/postcss` are pinned to matching 4.3.x. Keep
  them in lockstep with the installed `@tailwindcss/oxide`.
- Hydration: dynamic values (streak/XP/liked state) render a placeholder until
  `hydrated` is true so SSR matches the client. Preserve that pattern.
- The design source of truth is `Mouzika Studio UIUX Design/*.dc.html` (a
  proprietary "Design Canvas" prototype) and the research doc — consult them for
  intended copy, colours, and widget behaviour before redesigning.
