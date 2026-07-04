# 🎛️ Mouzika Studio

**Learn to produce electronic music the modern way — interactive, deep, and current.**

Mouzika Studio takes a zero-knowledge beginner to real production competency by
teaching _in the browser, by doing_: real Web Audio synths, sequencers and
mixers; a Duolingo-grade habit engine (streaks, XP, spaced repetition); an AI
tutor; feedback on your own tracks; and — the differentiator no incumbent
teaches — the **produce-with-AI** workflow (Suno/Udio → stems → your DAW).

Built with **Next.js 15 · React 19 · TypeScript · Tone.js · Tailwind v4**.
Fully tri-lingual (**English / French / Arabic** with RTL). Runs completely
standalone — no backend or API keys required to try everything.

---

## ✨ What's inside

### Learner app
| Route | What it is |
| --- | --- |
| `/` | Marketing landing — hero, curriculum, the AI workflow, pricing teaser |
| `/onboarding` | 4-step goal/genre/level/time flow → a personalised path |
| `/learn` | Home dashboard — winding skill tree, streak, XP, daily goal |
| `/lesson` | An interactive lesson with a live **drum sequencer** |
| `/studio` | **Synth playground** — subtractive synth, oscilloscope, playable keyboard |
| `/practice` | Practice Lab hub |
| `/practice/eq` | **EQ Challenge** — ear-train boosted frequency bands |
| `/practice/ear` | **Ear Training** — name intervals by sound |
| `/practice/chords` | **Chord & Scale Explorer** — diatonic chords in any key |
| `/practice/mixer` | **Mixing Desk** — faders, pan, mute/solo, live VU meters |
| `/practice/lufs` | **LUFS Meter** — ride a master into the −14 LUFS streaming pocket |
| `/practice/arrange` | **Arrangement Builder** — stack sections, watch the energy curve |
| `/tutor` | **AI Tutor** chat (Anthropic-backed, rule-based fallback) |
| `/feedback` | **AI Mix Feedback** — real in-browser analysis of an uploaded track |
| `/codex` · `/codex/[id]` | The **Codex** — the whole craft distilled, searchable |
| `/discover` · `/profile` · `/leaderboard` | Community, profile, and the XP league |
| `/pricing` | Free / Pro / Lifetime tiers with billing toggle + FAQ |

### Admin console — `/admin`
A full internal dashboard: KPIs, analytics (retention, funnel, genre split),
curriculum management, users, subscriptions, moderation, and the flagship
**Content Engine** — a human-in-the-loop knowledge-refresh pipeline
(ingest → chunk/embed → diff → classify → **human review** → publish) with an
interactive approve/reject review queue.

### Everything is _real_
- **Audio** is genuine Web Audio via [Tone.js](https://tonejs.dev) — the same
  engine pro tools build on. Every widget makes sound.
- **Mix feedback** decodes your file locally and measures integrated loudness
  (simplified BS.1770), true peak, stereo width (L/R correlation), crest factor,
  and a 3-band tonal balance — then scores it and writes plain-English fixes.
- **Progress** (XP, streaks, spaced-repetition schedule, completed lessons,
  saved beats, likes) persists in `localStorage` behind an interface that maps
  1:1 to the included Supabase schema.

---

## 🚀 Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

That's it — every feature works with no configuration.

### Optional configuration
Copy `.env.example` → `.env.local` to enable cloud/AI features:

- **`ANTHROPIC_API_KEY`** — makes `/api/tutor` answer via the Claude API.
  Without it, the tutor uses a solid rule-based fallback (still fully usable).
- **Supabase keys** — promote the localStorage store to a real multi-tenant
  backend. See [`supabase/schema.md`](./supabase/schema.md) and
  [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql).
- **Stripe keys** — wire up the paid plans.

---

## 🧪 Testing

```bash
npm run test         # Vitest unit tests (theory, SRS, streaks, feedback, i18n, tutor)
npm run test:e2e     # Playwright smoke suite (needs: npm run test:e2e:install once)
npm run typecheck    # tsc --noEmit
npm run build        # production build
```

- **51 unit tests** cover the pure logic: music theory, SuperMemo-2 spaced
  repetition, streak math, LUFS/mix-feedback scoring, tutor routing, and
  **tri-lingual dictionary shape parity** (FR/AR structurally match EN).
- **7 e2e tests** cover the onboarding flow, Web-Audio boot, drill scoring,
  tutor fallback, RTL language switching, and every key route returning 200.

---

## 🏗️ Architecture

```
src/
  app/
    (app)/…              # shared app shell (rail + mobile tab bar): learn, lesson,
                         #   studio, practice/*, tutor, feedback, codex, discover,
                         #   profile, leaderboard
    admin/               # standalone admin console
    api/tutor/           # Anthropic route handler with graceful fallback
    page.tsx  onboarding/  pricing/
  components/
    app/                 # AppShell, PracticeShell
    ui/                  # Icon, EqLogo, LanguageSwitch, primitives
    widgets/             # every interactive Tone.js widget
  lib/
    audio/               # engine (singleton) · mixer · lufs · analyze · feedback
    content/             # curriculum · codex · community data
    i18n/                # EN/FR/AR dictionaries + provider (+ RTL)
    store/               # progress provider · srs · streak (localStorage today)
    theory.ts            # music-theory primitives (unit tested)
supabase/                # migrations · seed · schema docs
tests/  tests-e2e/       # Vitest + Playwright
```

**Design system:** near-black canvas `#0a0b10`, lime `#CBF24E` primary, plus
cyan/violet/orange/pink accents. Space Grotesk (display), Hanken Grotesk (body),
Space Mono (labels), Tajawal (Arabic). Fully responsive: a desktop icon rail
collapses to a mobile bottom tab bar.

---

## 📦 Deploy

Deploys to Vercel as-is (`npm run build`). Add environment variables in the
Vercel dashboard to enable the AI tutor / Supabase / Stripe.

---

## 📝 License & content notes

Production-technique facts in the Codex are synthesised from the broad
industry consensus and re-expressed in original language (facts aren't
copyrightable — _Feist_). Loudness targets and genre conventions are teaching
conventions, not laws. This is educational software, not legal or mastering
advice — always trust your ears.
