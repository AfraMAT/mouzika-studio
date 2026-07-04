/**
 * Mouzika audio engine — a lazily-initialised Tone.js singleton that powers
 * every interactive widget (drum sequencer, synth playground, ear/EQ/chord
 * drills). Tone is imported dynamically so it never runs during SSR.
 *
 * The engine owns the shared drum + synth graph. The mixing desk and LUFS
 * meter build their own disposable sub-graphs (see mixer.ts / lufs.ts) because
 * they are transport-driven and per-screen.
 */

import type * as ToneNS from 'tone';

type Tone = typeof ToneNS;

export type DrumTrack = 'kick' | 'clap' | 'hat' | 'perc';
export type Pattern = Record<DrumTrack, boolean[]>;
export type Waveform = 'sawtooth' | 'square' | 'triangle' | 'sine';

export interface SynthParams {
  wave: Waveform;
  cutoff: number;
  reso: number;
  attack: number;
  release: number;
}

let TonePromise: Promise<Tone> | null = null;

/** Load Tone once (client only). */
export async function loadTone(): Promise<Tone> {
  if (typeof window === 'undefined') throw new Error('Tone is client-only');
  if (!TonePromise) TonePromise = import('tone') as unknown as Promise<Tone>;
  return TonePromise;
}

class AudioEngine {
  private T: Tone | null = null;
  ready = false;

  // drums
  private kick: ToneNS.MembraneSynth | null = null;
  private clap: ToneNS.NoiseSynth | null = null;
  private hat: ToneNS.NoiseSynth | null = null;
  private perc: ToneNS.NoiseSynth | null = null;

  // synth playground
  private synth: ToneNS.PolySynth | null = null;
  private filter: ToneNS.Filter | null = null;
  private analyser: ToneNS.Analyser | null = null;

  // eq drill
  private eqGain: ToneNS.Gain | null = null;
  private eqPeak: ToneNS.Filter | null = null;
  private eqNoise: ToneNS.Noise | null = null;

  private seq: ToneNS.Sequence | null = null;
  private heldNotes = new Set<string>();

  /** True once Tone has been started by a user gesture. */
  async ensure(): Promise<void> {
    if (this.ready) return;
    const T = await loadTone();
    this.T = T;
    await T.start();

    // ---- drums ----
    this.kick = new T.MembraneSynth({
      pitchDecay: 0.03,
      octaves: 6,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.34, sustain: 0.0, release: 0.2 },
    }).toDestination();
    this.kick.volume.value = 2;

    const clapFilt = new T.Filter(1200, 'bandpass').toDestination();
    this.clap = new T.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.002, decay: 0.22, sustain: 0.0 },
    }).connect(clapFilt);
    this.clap.volume.value = -8;

    const hatFilt = new T.Filter(8000, 'highpass').toDestination();
    this.hat = new T.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.045, sustain: 0.0 },
    }).connect(hatFilt);
    this.hat.volume.value = -16;

    const percFilt = new T.Filter(2600, 'bandpass').toDestination();
    this.perc = new T.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.001, decay: 0.12, sustain: 0.0 },
    }).connect(percFilt);
    this.perc.volume.value = -14;

    // ---- synth playground ----
    this.analyser = new T.Analyser('waveform', 1024);
    this.filter = new T.Filter({ type: 'lowpass', frequency: 1400, Q: 3 }).toDestination();
    this.filter.connect(this.analyser);
    this.synth = new T.PolySynth(T.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.02, decay: 0.2, sustain: 0.7, release: 0.6 },
    }).connect(this.filter);
    this.synth.volume.value = -10;

    this.ready = true;
  }

  get isReady() {
    return this.ready;
  }

  // ---------------- drums ----------------
  triggerDrum(track: DrumTrack) {
    if (!this.ready) return;
    switch (track) {
      case 'kick':
        this.kick?.triggerAttackRelease('C1', '8n');
        break;
      case 'clap':
        this.clap?.triggerAttackRelease('16n');
        break;
      case 'hat':
        this.hat?.triggerAttackRelease('32n');
        break;
      case 'perc':
        this.perc?.triggerAttackRelease('16n');
        break;
    }
  }

  /**
   * Start the 16-step sequencer. `getPattern` and `getBpm` are called live so
   * edits made while playing take effect immediately. `onStep` fires per step.
   */
  async startSequencer(getPattern: () => Pattern, bpm: number, onStep: (step: number) => void) {
    await this.ensure();
    const T = this.T!;
    T.getTransport().bpm.value = bpm;
    this.stopSequencer();
    const steps = Array.from({ length: 16 }, (_, i) => i);
    this.seq = new T.Sequence(
      (time, step) => {
        const p = getPattern();
        if (p.kick[step]) this.kick?.triggerAttackRelease('C1', '8n', time);
        if (p.clap[step]) this.clap?.triggerAttackRelease('16n', time);
        if (p.hat[step]) this.hat?.triggerAttackRelease('32n', time);
        if (p.perc[step]) this.perc?.triggerAttackRelease('16n', time);
        T.getDraw().schedule(() => onStep(step), time);
      },
      steps,
      '16n'
    );
    this.seq.start(0);
    T.getTransport().start('+0.05');
  }

  stopSequencer() {
    if (!this.T) return;
    try {
      if (this.seq) {
        this.seq.dispose();
        this.seq = null;
      }
      this.T.getTransport().stop();
      this.T.getTransport().cancel();
    } catch {
      /* ignore */
    }
  }

  setBpm(bpm: number) {
    if (this.T) this.T.getTransport().bpm.value = bpm;
  }

  // ---------------- synth ----------------
  async noteOn(note: string) {
    await this.ensure();
    if (this.heldNotes.has(note)) return;
    this.heldNotes.add(note);
    this.synth?.triggerAttack(note);
  }

  noteOff(note: string) {
    if (!this.ready || !this.heldNotes.has(note)) return;
    this.heldNotes.delete(note);
    this.synth?.triggerRelease(note);
  }

  async pluck(note: string) {
    await this.ensure();
    this.synth?.triggerAttackRelease(note, '8n');
  }

  setWave(w: Waveform) {
    this.synth?.set({ oscillator: { type: w } });
  }
  setCutoff(v: number) {
    this.filter?.frequency.rampTo(v, 0.05);
  }
  setReso(v: number) {
    this.filter?.Q.rampTo(v, 0.05);
  }
  setAttack(v: number) {
    this.synth?.set({ envelope: { attack: v } });
  }
  setRelease(v: number) {
    this.synth?.set({ envelope: { release: v } });
  }

  applyParams(p: SynthParams) {
    this.synth?.set({ oscillator: { type: p.wave }, envelope: { attack: p.attack, release: p.release } });
    this.filter?.frequency.rampTo(p.cutoff, 0.05);
    this.filter?.Q.rampTo(p.reso, 0.05);
  }

  /** Live waveform data for the oscilloscope, or null if not playing. */
  getWaveform(): Float32Array | null {
    if (!this.analyser) return null;
    try {
      return this.analyser.getValue() as Float32Array;
    } catch {
      return null;
    }
  }

  // ---------------- chord explorer ----------------
  async playChord(notes: string[], duration: ToneNS.Unit.Time = '2n') {
    await this.ensure();
    this.synth?.triggerAttackRelease(notes, duration);
  }

  async playProgression(chords: string[][], onStep: (i: number) => void, spacing = 0.72) {
    await this.ensure();
    const T = this.T!;
    const now = T.now();
    chords.forEach((notes, i) => {
      this.synth?.triggerAttackRelease(notes, '2n', now + i * spacing);
      T.getDraw().schedule(() => onStep(i), now + i * spacing);
    });
  }

  // ---------------- ear training ----------------
  async playInterval(semitones: number, root = 'C4') {
    await this.ensure();
    const T = this.T!;
    const n2 = T.Frequency(root).transpose(semitones).toNote();
    const now = T.now();
    this.synth?.triggerAttackRelease(root, '4n', now, 0.7);
    this.synth?.triggerAttackRelease(n2, '4n', now + 0.62, 0.7);
  }

  // ---------------- eq challenge ----------------
  private ensureEq() {
    const T = this.T;
    if (!T || this.eqGain) return;
    this.eqGain = new T.Gain(0).toDestination();
    this.eqPeak = new T.Filter({ type: 'peaking', frequency: 1000, Q: 4.5, gain: 0 }).connect(this.eqGain);
    this.eqNoise = new T.Noise('pink');
    this.eqNoise.volume.value = -13;
    this.eqNoise.connect(this.eqPeak);
    this.eqNoise.start();
  }

  async playEq(freq: number, boosted: boolean) {
    await this.ensure();
    this.ensureEq();
    const T = this.T!;
    this.eqPeak!.frequency.value = freq;
    this.eqPeak!.gain.value = boosted ? 12 : 0;
    const g = this.eqGain!.gain;
    const now = T.now();
    g.cancelScheduledValues(now);
    g.setValueAtTime(0.0001, now);
    g.linearRampToValueAtTime(0.9, now + 0.04);
    g.setValueAtTime(0.9, now + 1.25);
    g.linearRampToValueAtTime(0.0001, now + 1.55);
  }
}

/** Client-side singleton. */
let engineInstance: AudioEngine | null = null;
export function getEngine(): AudioEngine {
  if (!engineInstance) engineInstance = new AudioEngine();
  return engineInstance;
}

export type { AudioEngine };
