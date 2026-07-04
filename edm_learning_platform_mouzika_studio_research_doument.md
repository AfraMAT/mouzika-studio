# Building a World-Class Interactive Electronic Music Production Learning Platform: Complete Research & Build Plan

## TL;DR
- Build an Ableton-Learning-Music-style **"learn by direct manipulation in the browser"** platform (Tone.js/Web Audio) that takes a zero-knowledge beginner to pro competency, wrapping a rigorous, canonical production curriculum in Duolingo-grade habit mechanics, an AI tutor, and — critically — a modern **"produce with AI tools"** track (Suno/Udio stems, AI mastering, AI mix feedback) that no incumbent teaches well.
- The production knowledge is highly consensus-driven and capturable as a structured knowledge base: 12-note theory, subtractive/FM/wavetable synthesis, genre-specific BPM/drum/arrangement conventions (house ~120-130, techno 130-150, DnB 170-174, dubstep 140 half-time), mixing (gain staging, subtractive EQ, sidechain, frequency masking), and mastering to -14 LUFS integrated / -1 dBTP.
- Recommended stack: Next.js + Tone.js + WaveSurfer.js on Vercel, Supabase (Postgres/auth) for progress + spaced-repetition, a LangGraph human-in-the-loop content-refresh engine, and a Claude Code build harness (Context7 + GitHub + Supabase + Playwright + Firecrawl MCPs). Monetize freemium at roughly $12-15/mo annual. Legally, synthesize facts (Feist) in your own words from lawfully-acquired inputs — do not scrape YouTube against ToS or reproduce verbatim text.

---

## Key Findings

1. **The market's design north star already exists and is beloved but shallow.** Ableton's Learning Music and Learning Synths teach beats, notes/scales, melody, harmony, basslines, song structure, and synthesis entirely in-browser via interactive widgets running on the Web Audio API — but reviewers consistently note they only "skirt the surface." The opportunity is a platform with the same interaction quality but full depth, progression, retention mechanics, and a modern-tools curriculum.

2. **Production knowledge is remarkably consensus-driven** across In The Mix, EDMProd, iZotope, Native Instruments, Ableton, and specialist blogs — meaning a canonical, defensible knowledge base is achievable. The disagreements are about taste, not facts.

3. **AI tools have shifted from "generate a full song" to a real production workflow step** — generate ideas, export stems/MIDI, then finish in a DAW. This is the single biggest gap in existing music education and the platform's clearest differentiator. AI adoption is already near-universal among learners: per LANDR's survey of 1,241 music makers (fieldwork Sept 30–Oct 6, 2025), **87% of artists have incorporated AI into at least one part of their process**, with beginners far likelier to use song generators (51%) than professionals (25%). (Note: respondents were drawn from LANDR's own user community, so the figure skews high.)

4. **Interactive learning apps win on retention mechanics, not content superiority** (Duolingo's own framing). Streaks, XP, adaptive difficulty, and per-item spaced repetition are what convert curious beginners into daily-habit subscribers.

5. **The technical build is very feasible in 2026.** Tone.js is a mature Web Audio framework purpose-built for interactive browser music; the Claude Code + MCP stack (Context7, GitHub, Supabase, Playwright, Firecrawl) is production-ready; and human-in-the-loop RAG content-refresh patterns (LangGraph) are documented.

6. **Legally, the "input vs. output" line is the whole game.** Extracting facts and re-expressing them is safe (Feist); reproducing verbatim expression or scraping against platform ToS is not.

---

## Details

### STREAM 1 — Production Knowledge (the domain knowledge base)

**A. Music theory for electronic producers (the minimum that matters).**
The consensus "90% of what you need" set: the 12-note chromatic scale (C, C#, D, D#, E, F, F#, G, G#, A, A#, B), octaves and semitones, the piano roll as the interface, what a *key* is (7 notes that sound good together), the major-vs-minor distinction, essential intervals, and 4/4 time at genre BPM.
- **Scales:** Major = happy/uplifting; natural minor = serious/melancholic. C major = all white keys (C D E F G A B). C minor = C D Eb F G Ab Bb (C major with 3rd, 6th, 7th flattened). Start major, move to natural minor.
- **Intervals (semitone distance from C):** minor 3rd (3, C-Eb, sad/minor character), major 3rd (4, C-E, bright), perfect 4th (5, stable), tritone (6, C-F#, tense/dissonant — great for builds), perfect 5th (7, powerful/resolved — used everywhere), minor 7th (10, jazzy/soulful), octave (12, for doubling bass).
- **Chords:** triads = root + third + fifth. Minor chords have a minor 3rd (3 semitones) between root and 3rd; major chords have a major 3rd (4 semitones). Add the 7th for color (maj7, min7, dominant 7).
- **Roman numerals:** uppercase = major (I, IV, V), lowercase = minor (ii, vi). In C major: I=C, IV=F, V=G, vi=Am.
- **Canonical progressions:** I–IV–V (house/pop, resolution), I–V–vi–IV (the "pop" progression, catchy/uplifting), ii–V–I (jazzy/sophisticated), vi–IV–I–V. In minor, chords usually resolve via a V or VII (leading tone) back to i. Most hit songs use just 3-4 chords; emotion and flow matter more than complexity.
- **Practical rule producers actually enforce:** define the key upfront so chords, bass, melody, and 808 slides don't clash. Use DAW scale-highlighting or Scaler 2 / Captain Chords to stay in key. Bassline should start on the root of each chord. Transpose by keeping the same Roman-numeral relationships. Chord progressions in electronic music typically loop over 4, 8, or 16 bars.

**B. Sound design / synthesis fundamentals.**
- **Signal flow:** Oscillator → Filter → Amplifier, with Envelopes and LFOs as the "hands" moving those controls over time. Learn one subtractive synth deeply and every other synth becomes familiar.
- **Oscillators/waveforms:** saw (bright, harmonically rich — the workhorse for bass/leads/supersaws), square/pulse, triangle, sine (pure — for sub-bass). Detuning multiple saws = the "supersaw" festival/trance sound.
- **Filters:** low-pass (most common) removes highs above the cutoff; resonance emphasizes frequencies at the cutoff; push resonance to max and many filters self-oscillate into a pure sine. Cutoff automation/filter sweeps create tension.
- **ADSR envelopes:** Attack, Decay, Sustain, Release. Every synth has at least two — an amp envelope (volume over time) and a filter envelope (cutoff over time). Fast attack + short decay + low sustain = plucky/percussive. Slow attack + long release = evolving pads.
- **LFO:** a low-frequency oscillator that modulates a parameter cyclically. LFO→pitch = vibrato (small amount, 4-7 Hz); LFO→filter cutoff = wah/wobble (the future-bass and dubstep sound); LFO→amp = tremolo. A little LFO on the filter keeps a sound alive over 8 bars instead of 2.
- **Four synthesis types:** **Subtractive** (start rich, filter away — foundational; learn first; the reese bass is 2-3 detuned saws through a low-pass with envelope/LFO on cutoff). **Wavetable** (scan through a table of waveforms; the *position* parameter modulated is what defines it — the engine of modern neuro/dubstep bass and modern EDM). **FM** (modulate one oscillator's frequency with another; integer operator ratios = harmonic, non-integer = metallic/bell/inharmonic timbres). **Granular** (textures, atmospheres, resampling).
- **Worked bass-design recipe (from consensus sources):** saw oscillator + second sine/triangle an octave below for sub weight; low-pass cutoff ~40%; resonance 25-35%; filter envelope fast attack/medium decay/low sustain for the pluck; amp envelope fast attack/short decay/moderate sustain/short release to keep it tight.

**C. Drums & rhythm programming.**
- **House (the skeleton):** kick on all 4 beats (four-on-the-floor); closed hat on every off-beat (the "and"); clap/snare on beats 2 and 4; open hat on the off-beats. Elaborate by adding claps, percussion, and 16th-note variations over 4/8/16-bar phrases. The 909, 808, and 707 drum machines define the palette — most modern samples still resemble them.
- **Genre identity lives in the drum pattern, not the kick sound** — the difference between house and techno is what the kick does relative to everything else.
- **Half-time feel** (dubstep, trap, some DnB): snare hits on beat 3 only, making 140 BPM *feel* like 70, while hats keep moving at full tempo. Not a tempo change — it's where the backbeat lands.
- **Groove/swing:** shifting hats/percussion slightly off the grid (swing) adds human feel; MIDI is best for rigid 4-on-the-floor, audio drag-in is better for manual swing/acoustic feel.
- **Layering:** kicks in the lows, claps in the mids, hats in the highs — keep them in separate frequency zones so they don't mask.

**D. Arrangement & song structure.**
- **Dance music moves in 8/16/32/64-bar blocks (multiples of 8), all in 4/4.** Getting arrangement changes to land on phrase boundaries is what keeps a track danceable and DJ-mixable.
- **Classic club house structure (~7 min):** DJ Intro (16-32 bars) → Breakdown (16-32) → Build (8-16) → Drop/Main Groove (16-64) → Breakdown (16-32) → Drop (16-32) → Outro (16-32). Subtle changes every 8 bars.
- **Section defaults:** Intro 16-32 bars (DJ-friendly: kick + hats + simple groove). Build 8-16 bars (risers, percussion, automation, tension). Drop 16-64 bars. Breakdown 8-32 bars (strip elements to make the drop feel big). Outro 16-32 bars (remove parts to fade energy for DJ mix-out).
- **Radio/streaming edit:** drop the long DJ intro/outro, hit the hook within 8-16 bars. Progressive house often stretches past 7 minutes; future bass follows a more pop structure with short 4-bar intros.
- **Pro workflow:** write the busiest section first (usually the drop), then copy/paste and *remove* elements to build the intro/breakdown. Energy management (tension → release) is the core craft.

**E. Mixing fundamentals.**
- **Gain staging first:** high-pass everything except kick/bass around 100 Hz (and cut sub-rumble below ~20-30 Hz on the master with a steep slope). Leave 3-6 dB headroom on the mix bus for mastering; aim -6 to -3 dB peak before mastering. Pink-noise reference technique for balancing levels.
- **EQ:** subtractive (cutting) before additive (boosting); digital/linear-phase EQ for surgical corrective work, analog-modeled for tonal sweetening. Vocal cheat sheet: HPF 80-100 Hz, cut mud 250-350 Hz, cut nasal 800 Hz-1 kHz, presence boost 3-5 kHz, air shelf above 10 kHz.
- **Frequency masking** is the amateur-mix killer: two sounds in the same frequency range obscure each other. Fix by carving space with EQ (usually cut the less-important element) or sidechaining.
- **Sidechain compression:** duck the bass when the kick hits (the classic kick/bass separation), or duck pads/reverb to the kick for the "pumping" EDM effect. Tools: stock compressors, Cableguys Kickstart 2 / VolumeShaper, LFOTool; dynamic EQ (FabFilter Pro-Q 3, TDR Nova, Soothe 2, iZotope Neutron Unmask) for surgical frequency-specific ducking.
- **Reverb/delay:** insert delay before reverb; use pre-delay (vocals 20-60 ms, drums 10-20 ms) to preserve transient punch; the "Abbey Road trick" (HPF reverb at ~600 Hz, LPF at 10 kHz) keeps reverb from muddying the mix; duck/sidechain reverb tails to keep clarity.
- **Panning/stereo:** keep kick, snare, bass, and lead vocal centered and mono below ~120 Hz; roam freely with hats, percussion, synths, backing vocals. LCR panning for width.
- **Reference tracking:** A/B against commercial tracks in the genre *at matched loudness* to defeat the "louder = better" bias.

**F. Mastering basics.**
- **Mastering = final polish + loudness for translation across systems.** In 2026 the loudness wars are over: every major platform normalizes.
- **Targets (strong consensus): -14 LUFS integrated, true peak -1 dBTP** for a one-size-fits-most streaming master. Per Spotify's official artist support page: "We adjust tracks to -14 dB LUFS, according to the ITU 1770 standard," with three listener modes — Loud (-11 LUFS), Normal (-14, default), and Quiet (-19 to -23 LUFS) — and a recommended ceiling "below -1 dB TP (True Peak) max." Apple Music is more conservative (-16 LUFS); Amazon wants -2 dBTP; TikTok/Reels allow louder.
- **The loudness penalty:** master to -8 LUFS and Spotify just turns you down ~6 dB — you lose dynamics/transients for nothing. A dynamic -14 master often *sounds* bigger after normalization. Notably, top-charting tracks still average around -8 to -8.4 LUFS and get normalized down — so chasing loudness is a war already lost.
- **Two-master reality for electronic music:** a -14 LUFS streaming master and a louder -8 to -6 LUFS club/DJ master (for Rekordbox waveform comparison and festival systems) — never send the club master to streaming.
- **AI mastering tools** (LANDR, iZotope Ozone 12 Master Assistant, Logic Pro Mastering Assistant, BandLab, CloudBounce) hit the -14 target automatically but can over-compress vocals or flatten transients — use as a first pass or reference; a human/trained ear makes better context-aware calls. Metering: Youlean Loudness Meter (free), iZotope Insight, Loudness Penalty Analyzer.

**G. Genre conventions (knowledge-base table).**
- **House:** 120-130 BPM (deep house 118-126, tech house 124-132). Four-on-the-floor, 909 palette, groove/vibe over melody, long DJ intros/outros.
- **Techno:** 130-150 BPM. Darker, hypnotic, stripped-back, driving. Subgenres: acid techno (TB-303 squelch, heavy filter/resonance automation), melodic techno.
- **Melodic techno/house:** ~120-125 BPM. Emotional, cinematic — lush evolving pads, hypnotic arps, deep basslines, constant 16th hats, filter sweeps, reverb/delay for space. Artists: Tale of Us, Stephan Bodzin, ARTBAT, Anyma, Miss Monique. Analog/analog-modeled synths for warmth.
- **Trance:** 128-145 BPM; supersaw leads, big breakdowns, uplifting. Tech-trance 132-140, darker/utilitarian.
- **Dubstep/bass:** 140 BPM with half-time feel (feels like 70). Wavetable growl bass, LFO-modulated wobbles.
- **Drum & bass:** 160-180 BPM, most tracks 170-174. Liquid 170-174, jump-up/neurofunk 174-180. Reese bass (subtractive), breakbeats.
- **Trap:** 130-160 BPM (half-time feel ~65-80); 808 sub-bass, fast hi-hat rolls.

**H. Workflow & beating the blank project.**
- Start from the busiest section (the drop) and subtract. Use loops/sample packs early so you write while your synthesis skills develop. Reference tracks: import a favorite song, match tempo, study its arrangement.
- **Common beginner mistakes:** plugin overload (10 plugins used deeply beat 200 used shallowly); mixing while writing; not defining a key (causes clashes); intros too short for DJs; odd-bar-length sections that break mixing; chasing loudness. The skill limitation is almost never the tools — "I produced my first signed record using almost entirely free and stock plugins."

### STREAM 2 — Modern AI-Tools + Software Landscape (2026)

**DAWs (what beginners should pick):**
- **FL Studio** — best for hip-hop/trap/beats and bedroom EDM; best piano roll and step sequencer in the industry; **lifetime free updates**; fastest to start beats. Fruity ~$99 → All Plugins ~$499. Unlimited free trial (can't reopen saved projects).
- **Ableton Live** — the electronic-music and live-performance standard; Session View for clip-based sketching; Operator/Wavetable/Drum Rack stock instruments; Max for Live extensibility; Push controller. Intro ~$99 → Suite ~$749. Stem separation arriving in Live 12.3. 30-day Suite trial.
- **Logic Pro** — Mac only, best value ($199 one-time, or a new ~$12.99/mo Apple bundle); great stock library; pop/songwriting/Mac home studios. 90-day trial.
- **Bitwig Studio** — ex-Ableton devs; The Grid modular sound-design environment; the deepest native modulation system; MPE; Linux support. Essentials ~$99 → Studio ~$399.
- **Others:** Reaper ($60, runs anywhere, tiny footprint); Pro Tools (pro studios/film); Cubase (composers/scoring).
- **Verdict for beginners:** FL Studio (beats, lifetime updates) or Ableton (electronic/live). "The best DAW is the one you actually finish songs in." All DAWs sound identical — skill and arrangement make the difference.

**AI music tools (2026 state):**
- **Suno (v4/v5.5)** — the dominant platform: over 100 million people have used Suno and 2M+ are paid subscribers; **its valuation reached $5.4B after a $400M Series D closed June 3, 2026 led by Bond Capital — "more than double the $2.45 billion valuation it reached in November 2025."** Text-to-song in under a minute; **Suno Studio** is an AI-native DAW with multitrack timeline, **up to 12-stem separation**, MIDI export, persona/voice cloning. Settled with Warner Music; launching licensed models in 2026. Free tier ~10 songs/day; Pro ~$10/mo (500 songs, stem separation); Premier ~$30/mo (Suno Studio, 2,000 songs).
- **Udio (v1.5)** — the high-fidelity/control alternative; 48 kHz stereo, key guidance, and the differentiated **inpainting** tool (regenerate a 2-second selection — "replace the guitar solo with a saxophone"). Signed licensing deals with Warner, Universal, and Merlin. Tiny (~28 employees, ~$3.1M revenue) but label-partnered.
- **How pros actually use them:** generate a batch of ideas on Udio for speed → pick the best → regenerate in Suno for better vocals/structure → export stems → do the real mixing/mastering in a DAW. AI is a pre-production/ideation partner and a stem/MIDI source, not a finished-track button.
- **AI stem separation:** Suno (up to 12 stems), LALAL.AI (up to 10), Moises (7, plus chord/tempo detection), Ultimate Vocal Remover (free, open-source, runs locally), Gaudio Studio. Used for remixing, sampling, practice, and pulling elements into new projects.
- **AI mastering:** LANDR (Low/Medium/High intensity — use Low for streaming), iZotope Ozone 12, Logic Mastering Assistant, BandLab, CloudBounce.
- **AI mix feedback (emerging, 2026):** TrackScore.ai, Describe Music, and the research system AI TrackMate (arXiv) — upload a track, get frequency-balance/stereo/LUFS/phase analysis plus natural-language, sometimes genre-specific advice ("build-up around 250 Hz; high-pass the pads"). Still limited on mixing nuance and genre coverage — a real product gap.
- **Legal note:** licensing is unsettled; Sony has not settled with Suno/Udio; commercial rights vary by plan.

**Key plugins/instruments (essential vs. nice-to-have):**
- **Synths:** Serum 2 (~$189-249; the wavetable industry standard, biggest preset/tutorial ecosystem — the highest-value first paid synth) and **Vital (free)** which delivers ~90% of Serum for $0. Also Massive X (modulation), Pigments, Phase Plant (modular), Diva (analog warmth — classic house/deep house), Omnisphere (14,000 presets), Sylenth1 (future bass).
- **Effects (the small pro toolkit):** FabFilter Pro-Q 3/4 (EQ — most-used, most worth buying; free alt TDR Nova), FabFilter Pro-C 2 (compression), Valhalla reverbs (VintageVerb, Supermassive free), FabFilter Saturn 2 (saturation), FabFilter Pro-L 2 (limiting), Soundtoys, Decapitator, RC-20 Retro Color.
- **Consensus:** a free/stock setup (Vital + Valhalla Supermassive + TDR Nova + stock) can produce professional tracks at $0. A ~$600 setup (Serum 2 + Ozone + Pro-Q) covers 95% of needs. Six plugins used deeply cover 90% of work.

**Sample economy:** Splice (rent-to-own plugins + subscription sample library) dominates; Loopcloud, Cymatics, Ghosthack, genre-specific pack vendors. Producers source drums, one-shots, chord stabs, vocal chops, and FX from packs — labeled with key/BPM. Sample packs let beginners write while synthesis skills develop.

### STREAM 3 — Interactive Learning / Pedagogical Gold Standard

**Ableton Learning Music / Learning Synths teardown (the design north star):**
- Each page = a small amount of explanatory text + an interactive widget that mimics a stripped-down DAW element (step sequencer, piano roll, mono synth with 2 oscillators), running entirely in-browser via the Web Audio API.
- **What makes them effective:** (1) *learn by direct manipulation* — you make sound immediately, no equipment/theory prerequisite; (2) *constrained interfaces* — restrict notes to a scale, or design patterns that can't clash, so beginners always make something pleasing; (3) *cultural relevance* — concepts broken down through real songs (Daft Punk, Beyoncé, Queen); (4) export your sketch to a Live Set to continue. Per NYU MusEDLab (Alex Ruthmann/Ethan Hein, 2017), the site's co-creators are **Dennis DeSantis** (who wrote Live's "unusually lucid documentation") and **Jack Schaedler** (who created an "interactive digital signal theory primer"); the MusEDLab team noted "you might notice some strong similarities between Ableton's site and our tools. That's no coincidence."
- **The gap:** they "only skirt the surface," have no progression/retention system, no feedback on your work, and stop at fundamentals. That's the whitespace.

**Duolingo / Brilliant mechanics (retention engine):**
- Duolingo's own framing: "not a language app that happens to use gamification — a gamification engine that happens to teach languages." Streaks (loss aversion — a 90-day streak feels like an asset worth protecting), XP, leaderboards, guilt-trip notifications (A/B tested; notification tweaks alone lifted retention ~3%), skill trees, 3-5 minute micro-lessons, placement test, and adaptive difficulty (Birdbrain algorithm).
- **Evidence-based nuances to adopt:** adaptive difficulty should target 80-90% accuracy (Duolingo's default is too easy; "hard mode" users learn faster); reward *deliberate practice of weak areas*, not repetition of strengths (needs per-item spaced repetition + a mistake-analysis loop); pair extrinsic hooks with intrinsic ones (content the user genuinely cares about — their favorite genre/artist).
- Scale proof (Duolingo Q4/FY2025 shareholder letter): **FY2025 revenue $1.04B**, surpassed 50M DAU (52.7M in Q4), ~133M MAU, and **12.2M paying subscribers**; the company "generated over $1 billion in bookings, over $400 million in net income" in 2025. Freemium + annual-plan retention advantage.

**Melodics (closest music analog):**
- Interactive practice app for MIDI keys, finger-drum pads, and (acoustic) drums; real-time performance feedback (timing, early/late/missed notes, score/100), streaks, guided learning path with "always queued next lesson," 2,600+ lessons, ~20+ genres. Standard ~$24.99/mo or $119/yr; Premium ~$29.99/mo or $169/yr; 7-day trial; free tier limited to 5 min/day.
- **What works:** deliberate practice, immediate feedback, "takes you by the hand," fun/game-like, good for going 0→competent on hardware.
- **What's missing (your opportunity):** it teaches *performance* (hitting notes on time), not *production* (sound design, arrangement, mixing, finishing tracks). Requires MIDI hardware. Reviewers note it can feel repetitive for intermediates and there's an obvious "jumping off point" where you're ready for real production but the app doesn't take you there.

**Learning-science principles to build in:**
- **Spaced repetition** (distributed practice) — the Ebbinghaus forgetting curve shows ~70% forgotten in 24 hours without reinforcement; review at expanding intervals when recall probability drops to ~90% (SuperMemo/Anki/Leitner model). Per-item scheduling.
- **Retrieval practice** (active recall) — testing yourself strengthens and reconsolidates memory far more than re-reading; end each session with retrieval.
- **Scaffolding** (worked example → faded → solo) — show a completed example, then partially-completed, then have the learner do it alone.
- **Interleaving** — mix problem/skill types rather than blocking one topic; builds stronger connections and transfer (e.g., alternate EQ, compression, and arrangement challenges).
- **Immediate feedback** — the core of Melodics and of effective skill acquisition.
- **Dual coding** — pair audio with synchronized visuals (waveform, spectrum, piano roll) — uniquely powerful and natural for music production.
- **Desirable difficulties** (Bjork) — make learning effortful (harder = better long-term retention).

**Market gaps a new platform can fill:**
1. Depth + interactivity together (Ableton has interactivity but no depth; courses have depth but no interactivity).
2. Teaching *production* (finishing tracks), not just *performance* (Melodics) or theory.
3. A first-class **"produce with AI tools"** curriculum — no incumbent teaches the Suno/Udio → stems → DAW workflow, AI mastering, or AI mix feedback.
4. Feedback on the learner's actual work (a track/mix), not just quiz answers.
5. A curriculum that stays current as tools change (most courses go stale fast).

### STREAM 4 — Technical Architecture

**Web Audio API + Tone.js (2026 state):**
- **Tone.js** is the mature, purpose-built Web Audio framework for interactive browser music — DAW-like features (a global Transport for scheduling/timing, prebuilt synths and effects, plus low-level DSP building blocks). It uses very few ScriptProcessorNodes (finding native GainNode/WaveShaperNode workarounds) so it performs well on desktop and mobile.
- **Latency/scheduling:** Tone uses a lookAhead (default 0.1 s) summed with `context.currentTime`; `latencyHint` can be "interactive" (low latency, default), "playback," or "balanced." Schedule events in advance; start Transport slightly in the future. Trade-off: lower lookAhead = lower latency but more risk of glitches. Most CPU-intensive nodes: ConvolverNode (reverb) and HRTF PannerNode.
- **What you can build in-browser:** EQ challenges, synth playgrounds (mono/poly synths with real oscillators/filters/ADSR/LFO), ear-training drills (interval/frequency recognition), step sequencers/drum machines, piano-roll editors, arrangement builders, and real-time spectrum/waveform visualizers. Precedent: EarSketch (teaches code + music), and NYU MusEDLab tools.
- **Visualization:** WaveSurfer.js for waveforms; the Web Audio AnalyserNode for real-time frequency/time-domain data; Pts.js for creative audio viz; canvas/WebGL for spectrums. Pair audio manipulation with synchronized visuals (dual coding).

**MCP + Claude Code build stack (2026):**
- **Consensus starter set:** **Context7** (live version-specific library docs — stops API hallucination; ~2 tools, low cost — "if you install only one, install this"), **GitHub MCP** (repo/PR/issue management), **Playwright MCP** (Microsoft-maintained; drives a real browser via the accessibility tree so Claude can verify its own UI — essential for a Web Audio front-end), **Supabase MCP** (DB/auth/storage/edge functions — use a read-only role for exploration; the migration capability is "powerful and unforgiving"), and **Firecrawl** (scrape sites/changelogs into clean markdown — for the content-ingestion engine). Add **Vercel MCP** for deploy-from-IDE.
- **Governance cautions (verify current, space moves fast):** each MCP server burns ~2,000-5,000 tokens of context on schema injection alone, so run a tight set; prefer official/vendor servers; scope tokens (read-only DB roles, fine-grained GitHub tokens, user-scope secrets never in-repo); Anthropic archived 13 of its 20 original reference servers in 2025 (many old tutorials point at dead code); the Postgres reference server had a known SQL-injection issue (use Supabase MCP instead). Claude Code now supports Skills (.md files) and the older reference Filesystem MCP is redundant with built-in file tools.
- **Claude Code project config:** a CLAUDE.md with the production knowledge-base conventions, audio/Tone.js patterns, and schema; subagents for discrete jobs (curriculum authoring, exercise-widget scaffolding, content-diffing); Skills for repeatable workflows. HTTP transport + browser OAuth is now standard for vendor servers.

**Supabase / database schema patterns (learning platform):**
- Core entities: `courses` → `modules` → `lessons` → `exercises` (typed: quiz, synth-playground, EQ-challenge, arrangement-builder, track-upload); `users`, `enrollments`, `user_progress` (lesson/exercise completion + score), `srs_items` + `srs_reviews` (per-item spaced-repetition scheduling: ease factor, interval, next-due, à la SuperMemo/Leitner), `streaks`, `xp_events`, `achievements`, `subscriptions` (Stripe), and `submissions` (learner tracks for AI feedback). Row-Level Security on all user data. Run Supabase security/performance advisors after DDL.

**Admin content-refresh engine (human-in-the-loop):**
- **Recommended pattern: LangGraph HITL.** The documented flow maps 1:1 to the requirement: admin uploads a file (transcript/article/changelog) → chunk (consistent, *versioned* chunking params) + embed → **diff** against the existing KB via content hashes + semantic similarity → **classify** each candidate change (net-new / contradicts / stale / redundant) with a CRAG-style grading/classification LLM layer using version+timestamp metadata → **propose a changeset** as a reviewable diff → `interrupt()` to pause for **human approval** (approve / edit / reject / respond via `HumanInTheLoopMiddleware`), state persisted via a Postgres checkpointer → on approval, **apply incrementally** (delta index, no full rebuild) and publish as a **versioned, immutable release with full provenance/audit logging** (release version, source, URL, timestamp — for replay/audit).
- **Best practices:** interrupt only before consequential/irreversible writes (not every step); adaptive interrupts (auto-approve high-confidence, gate low-confidence); maintain a metadata registry (doc IDs, hashes, timestamps); validate required metadata on ingest; version-aware retrieval so newer facts supersede older (the "version conflation" problem — see VersionRAG, arXiv). Reference implementations: **Complyra** (open-source multi-tenant RAG with approval gates + per-document sensitivity + full audit trail), CRAG (corrective RAG classification). Scheduled monitoring of tool changelog pages via Firecrawl feeding the same pipeline.

**AI-native tutoring features:**
- **Context-aware tutor:** RAG over your own knowledge base so the tutor answers *in the context of the current lesson*, tuned to the learner's level; adaptive difficulty toward the 80-90% accuracy band; feedback on submitted work.
- **Can AI "hear" a track yet (2026)?** Partially. Music-information-retrieval models reliably extract BPM, key, and instrumentation, and tools (TrackScore.ai, Describe Music, AI TrackMate) analyze frequency balance, stereo width, LUFS, phase and give natural-language, sometimes genre-specific feedback ("muddy 250 Hz; vocals centered well; high-pass the pads"). But nuanced mixing/arrangement judgment is still limited and genre coverage is uneven — so pair automated metrics with structured rubrics and human/expert review for high-stakes feedback.

### STREAM 5 — Business, Monetization & Growth

**Monetization / pricing benchmarks:**
- **Melodics:** ~$24.99-29.99/mo, ~$119-169/yr, 7-day trial, free 5-min/day tier.
- **Duolingo:** freemium; Super promotional ~$35-42/yr up to ~$168/yr; Family ~$119.99/yr (6 members). ~$1.04B revenue 2025, 12.2M paid subs.
- **Skillshare:** ~$167.88/yr (~$13.99/mo annual); ~$32/mo monthly; heavy discounting (~$59.99/yr promos).
- **MasterClass:** ~$120-240/yr, celebrity-led edutainment.
- **Udemy:** pay-per-course ~$10-20 on sale.
- **Recommendation:** freemium with a genuinely useful free tier (fundamentals + limited interactive exercises) converting to ~$12-15/mo billed annually (competitive with Skillshare/Melodics annual, below MasterClass). Push annual plans hard (materially higher retention than monthly per Duolingo). Freemium works only when the paid upgrade is a clear "ship the result" (full curriculum, AI feedback, project/certification, advanced AI-tools track) vs. free "learn the concept." Consider a one-time-purchase "path" option and possible B2B (schools/bootcamps) later.

**Onboarding & retention:**
- Placement/goal onboarding (like Duolingo) → get the user to a first "win" (make a beat that sounds good) within the first session/week. Daily streaks + loss-aversion notifications, XP, achievements, skill tree, "next lesson always queued." Measure activation (first-win completion in week 1), monthly churn (annual subs churn far less), content cadence (ship a new module every 4-8 weeks to fight staleness/churn). Tie retention to intrinsic motivation — let users work in *their* chosen genre with *their* favorite reference tracks.

**Positioning & go-to-market:**
- Position: **"Learn to produce music the modern way — including the AI tools the pros actually use."** Differentiators vs. incumbents: interactive + deep + finishes tracks + teaches AI workflow + gives feedback on your work + stays current.
- Target audience: complete beginners and bedroom producers overwhelmed by YouTube-tutorial chaos and by feature-bloated DAWs; the 87% of music makers already using AI in at least one part of their process (LANDR 2025 survey).
- Acquisition: content/SEO (the knowledge base doubles as SEO surface), YouTube/TikTok short-form teardowns (the medium producers already learn from), free interactive tools as top-of-funnel (Ableton's free sites drive Live adoption), creator partnerships. Watch rising Meta/Google CPMs — lean on organic/creator channels.

**Legal / copyright:**
- **Input vs. output is the whole game.** Extracting *facts* (techniques, parameters, ideas) and re-expressing them in your own words/structure is squarely safe — **Feist Publications v. Rural Telephone (US Supreme Court, 1991):** "facts do not owe their origin to an act of authorship... they are not copyrightable"; only original selection/arrangement is protected (17 U.S.C. §102(b)).
- **Recent AI cases:** training/ingesting copyrighted work as *input* is trending toward transformative fair use. In *Bartz v. Anthropic* (N.D. Cal.), Judge William Alsup ruled June 23, 2025 that training on lawfully-acquired books was "quintessentially transformative" fair use, but that retaining pirated copies was not; **Anthropic settled Aug/Sept 2025 for a minimum of $1.5 billion (~$3,000 per work across ~500,000 books) — "the largest publicly reported copyright recovery in history," with a final fairness hearing rescheduled to May 14, 2026.** *Kadrey v. Meta* (2025) also found training fair use (on failure to show market harm). The losing patterns: piracy, building a market *substitute* for the source (*Thomson Reuters v. Ross*, 2025 — but that was non-generative), and *outputs* that reproduce verbatim/substantially-similar expression (*NYT v. OpenAI*, core claims survived to trial). Only Feist and *Campbell v. Acuff-Rose* (1994) are binding Supreme Court authority; the rest are unsettled district-court rulings.
- **YouTube ToS is separate from copyright:** YouTube's Terms prohibit accessing the service via "automated means (robots... scrapers) except... in accordance with robots.txt or with prior written permission." Scraping transcripts can breach the *contract* (and possibly CFAA) even where the underlying facts are free. **Use the official YouTube Data API within quota/terms, creator permissions/partnerships, licensed transcript providers, or your own content.**
- **Safe synthesis recipe:** extract facts across many sources, rewrite entirely in your own words, add transformative teaching value, cite sources, serve a different market than the source, and acquire all inputs lawfully. Risky: verbatim/near-verbatim text, copying a source's distinctive curation, or a product that substitutes for a source.
- **Sample/reference-track licensing:** every recording has two copyrights (composition + master) — using an actual recording needs both cleared, individually negotiated (no statutory sample rate). For a teaching product, use **royalty-free/pre-cleared libraries** (Splice, Tracklib, Uppbeat, Creative Commons, public domain) — but note "royalty-free ≠ copyright-free," read licenses. Short reference-track clips for genuine *criticism/commentary/teaching* have the strongest fair-use footing (§107 lists teaching/criticism as favored), especially behind a login for enrolled users with real commentary — but fair use is a defense, not a guarantee, and length is never a safe harbor (*Bridgeport*, *Newton v. Diamond*). A public commercial platform has weaker footing than a closed classroom — lean on cleared/public-domain material for anything reproduced at scale.

---

## Recommendations

**Stage 1 — Prove the interaction + curriculum spine (MVP).** Build the Ableton-Learning-Music-quality interactive core in Next.js + Tone.js + WaveSurfer.js on Vercel: the fundamentals track (beats, notes/scales, chords, basslines, arrangement, one synth playground) with in-browser exercises, immediate feedback, and dual-coded audio+visuals. Author the knowledge base as structured content (feeds both the app and the AI tutor). Ship free. **Benchmark to advance:** users reach a "first win" (make a good-sounding 8-bar loop) in session one; week-1 activation >40%.

**Stage 2 — Retention engine + depth.** Add Supabase-backed accounts, per-item spaced repetition (SuperMemo/Leitner), streaks, XP, skill tree, adaptive difficulty targeting 80-90% accuracy, and the full curriculum depth (sound design, mixing, mastering, genre modules). Launch paid tier (~$12-15/mo annual). **Benchmark:** monthly churn trending down; annual-plan mix rising; deliberate-practice loop (weak-area review) measurably lifting quiz/exercise scores.

**Stage 3 — The AI-tools differentiator + feedback.** Add the "produce with AI" track (Suno/Udio → stems → DAW, AI mastering, AI mix feedback), the AI context-aware tutor (RAG over your KB), and track-submission feedback (automated metrics + rubric). **Benchmark:** the AI-tools track is a top-3 driver of conversions and shares.

**Stage 4 — Keep it current + scale.** Ship the LangGraph human-in-the-loop content-refresh engine (admin upload → diff → classify → propose changeset → approve → versioned release) plus scheduled Firecrawl changelog monitoring. Add B2B (schools/bootcamps) and creator partnerships. **Benchmark:** content never goes stale (tool changes reflected within weeks); CAC held down by organic/creator channels.

**What would change the plan:** if AI audio-understanding models mature enough to give reliable, nuanced mix/arrangement feedback (watch this closely — it's improving fast), lean much harder into automated feedback as the core loop. If AI music-licensing lawsuits resolve against the generators (Sony has not settled), de-emphasize Suno/Udio integration and pivot the AI track toward stem separation, mastering, and assistive tools with clearer rights.

## Caveats
- **Fast-moving areas (verify at build time):** AI music tool versions/pricing/licensing (Suno/Udio litigation is unsettled — Sony hasn't settled; Suno's valuation moved from $2.45B in Nov 2025 to $5.4B by June 2026), the MCP server ecosystem (Anthropic archived many reference servers; official servers now preferred), and DAW pricing/stem-separation features. Treat all 2026 pricing and version numbers as planning estimates to reconfirm.
- **Legal is not settled and this is not legal advice.** The AI-copyright cases are district-court-level and appealed; only Feist and Campbell are binding. Confirm the content-ingestion and sample/reference-track approach with IP counsel before launch.
- **Source quality:** production-technique facts are well-corroborated across many reputable sources (Ableton, iZotope, Native Instruments, EDMProd, FabFilter-ecosystem blogs) and are safe for the knowledge base. Some pricing/version data comes from SEO-oriented blogs; the highest-confidence technical claims come from primary sources (MDN, Tone.js docs, LangChain docs, arXiv, court opinions, Feist, Spotify artist support, Duolingo shareholder letter).
- **Survey/statistic caveats:** the "87% use AI" figure is from a LANDR survey of its own user community and skews high; Duolingo/Suno metrics come from company disclosures and press.
- **Loudness numbers are conventions, not laws** — genre and context (club vs. streaming) change targets; teach the *why* (normalization) not just the number.
- **"Pro-level competency" is a long arc** — the platform should set the expectation that finishing many tracks (not consuming lessons) is what produces a pro; design the product around shipping tracks, not completing videos.