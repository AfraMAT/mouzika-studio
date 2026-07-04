/**
 * The Codex — Mouzika's distilled knowledge base. Facts synthesised from the
 * production-technique consensus (Ableton, iZotope, Native Instruments, and
 * specialist sources) and re-expressed in plain language. Category indices map
 * to the `codex.cats` labels: 0 All, 1 Theory, 2 Synthesis, 3 Drums,
 * 4 Arrangement, 5 Mixing, 6 Mastering, 7 Genres, 8 AI Workflow.
 */

export interface CodexEntry {
  id: number;
  cat: number;
  title: string;
  summary: string;
  body: string[];
  readMin: number;
  updated: string;
  related: number[];
}

export const CODEX: CodexEntry[] = [
  {
    id: 0,
    cat: 1,
    title: 'The 12 notes, keys & intervals',
    summary: 'Everything sits on twelve semitones. Learn the map once and the piano roll stops being a maze.',
    body: [
      'Western music divides the octave into twelve equal semitones: C, C#, D, D#, E, F, F#, G, G#, A, A#, B — then it repeats an octave higher. A key is just a group of seven of those notes that sound settled together. C major is all the white keys; C minor flattens the 3rd, 6th and 7th (C D E♭ F G A♭ B♭).',
      'Intervals — the distance between two notes in semitones — carry the emotion. A minor 3rd (3 semitones) is sad, a major 3rd (4) is bright, a perfect 5th (7) sounds powerful and resolved, and a tritone (6) is tense and perfect for a build.',
      'The practical rule producers actually enforce: pick a key before you write, so your chords, bass, melody and 808 slides never clash. Keep the same interval relationships and you can transpose the whole idea anywhere.',
    ],
    readMin: 5,
    updated: 'Jun 2026',
    related: [1, 12],
  },
  {
    id: 1,
    cat: 1,
    title: 'Chords & the progressions that work',
    summary: 'Triads, sevenths, and the four or five progressions behind most of the music you love.',
    body: [
      'A triad is a root, a third and a fifth stacked together. If the third is a minor 3rd the chord is minor; a major 3rd makes it major. Add the 7th for colour — maj7 is dreamy, min7 is soulful, dominant 7 pushes toward resolution.',
      'In Roman numerals, capitals are major (I, IV, V) and lowercase are minor (ii, vi). The workhorses: I–IV–V (house and pop), I–V–vi–IV (the endlessly catchy “pop” loop), and ii–V–I (jazzy and sophisticated). Most hit songs use only three or four chords.',
      'Loop your progression over 4, 8 or 16 bars, and start the bassline on the root of each chord. Emotion and flow beat complexity every time.',
    ],
    readMin: 4,
    updated: 'Jun 2026',
    related: [0, 8],
  },
  {
    id: 2,
    cat: 2,
    title: 'Signal flow: oscillator → filter → amp',
    summary: 'Learn one subtractive synth deeply and every other synth suddenly feels familiar.',
    body: [
      'Every subtractive synth follows the same path: an oscillator generates a raw, harmonically rich tone; a filter carves away frequencies; an amplifier sets the volume over time. Envelopes and LFOs are the “hands” that move those controls automatically.',
      'Oscillator waveforms have characters: saw is bright and rich (the workhorse for bass and leads), square is hollow, triangle is soft, and sine is pure — ideal for sub-bass. Detune a few saws together and you get the classic supersaw.',
      'The low-pass filter is the one you’ll reach for most: it removes highs above the cutoff, and resonance emphasises the frequencies right at the cutoff. Automating the cutoff is how you get the filter sweeps that build tension.',
    ],
    readMin: 6,
    updated: 'Jun 2026',
    related: [3, 4],
  },
  {
    id: 3,
    cat: 2,
    title: 'ADSR envelopes',
    summary: 'Attack, Decay, Sustain, Release — the four sliders that shape how a sound moves through time.',
    body: [
      'Every synth has at least two envelopes: an amp envelope (volume over time) and a filter envelope (cutoff over time). Attack is how fast it reaches full level, Decay how fast it falls to the Sustain level it holds while you press the key, and Release how long it fades after you let go.',
      'Fast attack + short decay + low sustain gives you a plucky, percussive stab. Slow attack + long release gives you an evolving pad. The same synth becomes a bass, a lead or a pad purely through its envelopes.',
    ],
    readMin: 4,
    updated: 'Jun 2026',
    related: [2, 4],
  },
  {
    id: 4,
    cat: 2,
    title: 'The four synthesis types',
    summary: 'Subtractive, wavetable, FM and granular — what each is for.',
    body: [
      'Subtractive is foundational: start with a rich waveform and filter it down. Learn this first. Wavetable scans through a table of waveforms, and modulating the scan position is what defines the modern EDM and dubstep bass sound.',
      'FM (frequency modulation) uses one oscillator to modulate another’s frequency: integer ratios sound harmonic, non-integer ratios give metallic bells and clangs. Granular chops sound into tiny grains for textures and atmospheres.',
      'You don’t need all four. Get fluent in subtractive, add wavetable when you want movement, and treat FM and granular as flavour.',
    ],
    readMin: 5,
    updated: 'May 2026',
    related: [2, 3],
  },
  {
    id: 5,
    cat: 3,
    title: 'Four-on-the-floor',
    summary: 'The house skeleton every dance genre borrows from.',
    body: [
      'Kick on all four beats, closed hat on every off-beat (the “and”), clap or snare on beats 2 and 4, open hat on the off-beats. That’s the entire foundation of house — everything else is decoration.',
      'Genre identity lives in the drum pattern, not the kick sound. The difference between house and techno is what the kick does relative to everything around it. Keep kicks in the lows, claps in the mids and hats in the highs so they never mask each other.',
      'Elaborate with 16th-note hat variations, extra percussion and subtle changes every 4 or 8 bars. A little swing — nudging hats slightly off the grid — adds the human feel.',
    ],
    readMin: 4,
    updated: 'Jun 2026',
    related: [6, 7],
  },
  {
    id: 6,
    cat: 3,
    title: 'Half-time feel',
    summary: 'How 140 BPM ends up feeling like 70 — the backbone of dubstep and trap.',
    body: [
      'Half-time isn’t a tempo change. You keep the tempo (say 140 BPM) but move the snare to land on beat 3 only instead of 2 and 4. Suddenly the groove feels like it’s moving at 70, while the hats keep skipping along at full speed.',
      'It’s the defining move of dubstep, trap and a lot of modern bass music — heavy, spacious and slow-feeling without ever slowing the clock. The contrast between the lazy backbeat and busy hats is the whole trick.',
    ],
    readMin: 3,
    updated: 'May 2026',
    related: [5, 12],
  },
  {
    id: 7,
    cat: 4,
    title: 'The 8-bar phrase',
    summary: 'Dance music thinks in blocks of 8 — and that’s what keeps it mixable.',
    body: [
      'Dance music moves in 8, 16, 32 and 64-bar blocks, all in 4/4. Landing every arrangement change on a phrase boundary is exactly what keeps a track danceable and lets a DJ blend it with the next one.',
      'Beginners break this without realising — a 7-bar section or an early change throws off the count and makes the track awkward to mix. Count in multiples of 8 and every transition falls into place.',
    ],
    readMin: 3,
    updated: 'Jun 2026',
    related: [8, 5],
  },
  {
    id: 8,
    cat: 4,
    title: 'Club house structure',
    summary: 'A ~7-minute club arrangement, section by section.',
    body: [
      'A classic club structure runs: DJ intro (16–32 bars, kick + hats so DJs can blend) → breakdown → build (8–16 bars of risers and tension) → drop / main groove (16–64) → second breakdown → second drop → outro that strips back for the mix-out.',
      'The pro workflow is to write the busiest section first — usually the drop — then copy it and remove elements to create the intro and breakdown. Energy management, tension then release, is the actual craft.',
      'For a radio or streaming edit, drop the long DJ intro and hit the hook within 8–16 bars.',
    ],
    readMin: 5,
    updated: 'Jun 2026',
    related: [7, 12],
  },
  {
    id: 9,
    cat: 5,
    title: 'Gain staging & EQ',
    summary: 'Get levels and frequency balance right and the mix half-mixes itself.',
    body: [
      'Start with gain staging: high-pass everything except kick and bass around 100 Hz to clear mud, and leave 3–6 dB of headroom on the mix bus for mastering. Aim for peaks around -6 to -3 dB before you master.',
      'With EQ, cut before you boost — subtractive moves sound more natural. The amateur-mix killer is frequency masking: two sounds fighting for the same range. Fix it by carving space with EQ (usually cut the less important element) or by sidechaining.',
      'Keep kick, snare, bass and lead vocal centred and mono below ~120 Hz; let hats, percussion and synths roam wide for stereo width.',
    ],
    readMin: 6,
    updated: 'Jun 2026',
    related: [10, 11],
  },
  {
    id: 10,
    cat: 5,
    title: 'Sidechain compression',
    summary: 'The pump — and the cleanest way to keep kick and bass out of each other’s way.',
    body: [
      'Sidechain compression ducks one sound whenever another plays. The classic use is ducking the bass every time the kick hits, so the two never fight for the low end. Duck pads or reverb to the kick and you get the breathing “pump” that defines a lot of EDM.',
      'You can do it with a stock compressor keyed off the kick, with volume-shaper tools for a precise curve, or with dynamic EQ when you only want to duck a specific frequency band rather than the whole sound.',
    ],
    readMin: 4,
    updated: 'May 2026',
    related: [9, 11],
  },
  {
    id: 11,
    cat: 6,
    title: '−14 LUFS & translation',
    summary: 'The loudness war is over. Here’s the number that matters and why.',
    body: [
      'Mastering is final polish plus loudness that translates across every playback system. In 2026 every major platform normalises loudness, so the target is roughly -14 LUFS integrated with a true peak below -1 dBTP for a one-size-fits-most streaming master.',
      'Chasing loudness is a lost war: master to -8 LUFS and Spotify simply turns you down about 6 dB — you lose dynamics and transients for nothing. A dynamic -14 master often sounds bigger after normalisation.',
      'For electronic music you’ll often keep two masters: a -14 LUFS version for streaming and a louder club/DJ version. Never send the club master to streaming.',
    ],
    readMin: 5,
    updated: 'Jun 2026',
    related: [9, 13],
  },
  {
    id: 12,
    cat: 7,
    title: 'Genre BPM & drum map',
    summary: 'A quick-reference cheat sheet for tempo and feel across the main genres.',
    body: [
      'House lives at 120–130 BPM on a four-on-the-floor groove with a 909-style palette. Techno runs darker and faster at 130–150. Melodic techno and house sit around 120–125 with lush evolving pads and constant 16th hats.',
      'Trance is 128–145 with supersaw leads and big breakdowns. Dubstep is 140 with a half-time feel. Drum & bass is 160–180 (most tracks 170–174) with breakbeats and Reese bass. Trap is 130–160 with a half-time feel, 808 sub-bass and fast hi-hat rolls.',
      'Pick the tempo and drum pattern of your genre first — it sets the whole vibe before you write a single note.',
    ],
    readMin: 4,
    updated: 'Jun 2026',
    related: [5, 8],
  },
  {
    id: 13,
    cat: 8,
    title: 'Suno / Udio → stems → your DAW',
    summary: 'AI isn’t a “make a song” button. It’s a production step — here’s the real workflow.',
    body: [
      'The modern AI workflow is ideation, not automation. Generate a batch of ideas in Suno or Udio — prompt for key, tempo and vibe — then pick the best and regenerate for better structure or vocals.',
      'Export stems (Suno separates up to 12) and MIDI, and keep only what genuinely serves the track. Then do the real work in your DAW: arrange, sound-design and mix the normal way. The AI was just the sketch.',
      'Finish with AI mastering to hit the -14 LUFS target as a first pass, then run an AI mix-feedback tool for a frequency-balance and loudness sanity check before you release. Human ears still make the final call.',
    ],
    readMin: 6,
    updated: 'Jun 2026',
    related: [11, 4],
  },
];

export const CODEX_CAT_COLORS = ['#8a8f9c', '#4FE3E0', '#8B7CFF', '#FF9A3C', '#CBF24E', '#FF5C93', '#4FE3E0', '#8B7CFF', '#FF9A3C'];
