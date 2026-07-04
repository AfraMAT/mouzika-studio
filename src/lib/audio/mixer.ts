/**
 * Mixing-desk audio graph. Four instrument channels + a master bus, each
 * with its own Tone.Channel (volume / pan / mute / solo) and a meter for the
 * VU bars. Built and disposed per-screen.
 */

import { loadTone } from './engine';
import type * as ToneNS from 'tone';

export type MixField = 'vol' | 'pan' | 'mute' | 'solo';

export interface ChannelState {
  id: string;
  vol: number;
  pan: number;
  mute: boolean;
  solo: boolean;
}

export const MIXER_DEFAULTS: ChannelState[] = [
  { id: 'kick', vol: 0, pan: 0, mute: false, solo: false },
  { id: 'bass', vol: -3, pan: 0, mute: false, solo: false },
  { id: 'chord', vol: -8, pan: 0.28, mute: false, solo: false },
  { id: 'hat', vol: -13, pan: -0.32, mute: false, solo: false },
  { id: 'master', vol: -1, pan: 0, mute: false, solo: false },
];

const BASS_LINE = ['C2', null, 'C2', null, 'C2', null, 'C2', null, 'Eb2', null, 'Eb2', null, 'G2', null, 'Bb1', null];

export class Mixer {
  private T: typeof ToneNS | null = null;
  private chans: (ToneNS.Channel | null)[] = [];
  private meters: (ToneNS.Meter | null)[] = [];
  private masterVol: ToneNS.Volume | null = null;
  private masterPan: ToneNS.Panner | null = null;
  private kick: ToneNS.MembraneSynth | null = null;
  private bass: ToneNS.MonoSynth | null = null;
  private chord: ToneNS.PolySynth | null = null;
  private hat: ToneNS.NoiseSynth | null = null;
  private seq: ToneNS.Sequence | null = null;
  playing = false;

  async build(initial: ChannelState[]) {
    if (this.T) return;
    const T = await loadTone();
    await T.start();
    this.T = T;

    const master = initial[4];
    this.masterVol = new T.Volume(master.vol);
    this.masterPan = new T.Panner(master.pan);
    const masterMeter = new T.Meter();
    this.masterVol.connect(this.masterPan);
    this.masterPan.toDestination();
    this.masterPan.connect(masterMeter);
    this.masterVol.mute = master.mute;
    this.chans[4] = this.masterVol as unknown as ToneNS.Channel;
    this.meters[4] = masterMeter;

    const mk = (cfg: ChannelState, i: number) => {
      const ch = new T.Channel({ volume: cfg.vol, pan: cfg.pan });
      const m = new T.Meter();
      ch.connect(this.masterVol!);
      ch.connect(m);
      ch.mute = cfg.mute;
      ch.solo = cfg.solo;
      this.chans[i] = ch;
      this.meters[i] = m;
      return ch;
    };
    const kCh = mk(initial[0], 0);
    const bCh = mk(initial[1], 1);
    const cCh = mk(initial[2], 2);
    const hCh = mk(initial[3], 3);

    this.kick = new T.MembraneSynth({
      pitchDecay: 0.03,
      octaves: 6,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.34, sustain: 0, release: 0.2 },
    }).connect(kCh);
    this.kick.volume.value = 2;
    this.bass = new T.MonoSynth({
      oscillator: { type: 'sawtooth' },
      filter: { type: 'lowpass', Q: 2 },
      filterEnvelope: { attack: 0.006, decay: 0.18, sustain: 0.25, baseFrequency: 110, octaves: 2.4 },
      envelope: { attack: 0.006, decay: 0.2, sustain: 0.6, release: 0.2 },
    }).connect(bCh);
    this.chord = new T.PolySynth(T.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.35, release: 0.5 },
    }).connect(cCh);
    this.chord.volume.value = -8;
    const hatFilt = new T.Filter(8500, 'highpass').connect(hCh);
    this.hat = new T.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.05, sustain: 0 } }).connect(hatFilt);
  }

  async start() {
    if (!this.T || this.playing) return;
    const T = this.T;
    T.getTransport().bpm.value = 124;
    this.seq = new T.Sequence(
      (time, step) => {
        if (step % 4 === 0) this.kick?.triggerAttackRelease('C1', '8n', time);
        if (step % 4 === 2) this.hat?.triggerAttackRelease('32n', time);
        if (step === 0 || step === 8) this.chord?.triggerAttackRelease(['C4', 'Eb4', 'G4'], '4n', time);
        const b = BASS_LINE[step];
        if (b) this.bass?.triggerAttackRelease(b, '8n', time);
      },
      Array.from({ length: 16 }, (_, i) => i),
      '16n'
    );
    this.seq.start(0);
    T.getTransport().start('+0.05');
    this.playing = true;
  }

  stop() {
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
    this.playing = false;
  }

  set(i: number, field: MixField, value: number | boolean) {
    if (i === 4) {
      if (field === 'vol') this.masterVol!.volume.value = value as number;
      else if (field === 'pan') this.masterPan!.pan.value = value as number;
      else if (field === 'mute') this.masterVol!.mute = value as boolean;
      return;
    }
    const ch = this.chans[i];
    if (!ch) return;
    if (field === 'vol') ch.volume.value = value as number;
    else if (field === 'pan') ch.pan.value = value as number;
    else if (field === 'mute') ch.mute = value as boolean;
    else if (field === 'solo') ch.solo = value as boolean;
  }

  reset(defs: ChannelState[]) {
    defs.forEach((d, i) => {
      if (i === 4) {
        this.masterVol!.volume.value = d.vol;
        this.masterPan!.pan.value = d.pan;
        this.masterVol!.mute = false;
      } else {
        const ch = this.chans[i];
        if (!ch) return;
        ch.volume.value = d.vol;
        ch.pan.value = d.pan;
        ch.mute = false;
        ch.solo = false;
      }
    });
  }

  /** Meter values 0..1 (normalised from dB) for the VU bars. */
  levels(): number[] {
    return this.meters.map((m) => {
      if (!m) return 0.02;
      let db = m.getValue() as number;
      if (typeof db !== 'number' || !isFinite(db)) db = -60;
      return Math.max(0.02, Math.min(1, (db + 54) / 54));
    });
  }

  dispose() {
    this.stop();
    [this.kick, this.bass, this.chord, this.hat, this.masterVol, this.masterPan, ...this.chans, ...this.meters].forEach((n) => {
      try {
        n?.dispose();
      } catch {
        /* ignore */
      }
    });
    this.T = null;
  }
}
