/**
 * LUFS-meter audio graph. A single master-gain into a limiter, playing a house
 * loop. Loudness readouts are modelled from the master gain (a faithful
 * teaching approximation — real ITU-1770 integration is out of scope for a
 * browser drill, but the pocket at −14 LUFS behaves correctly).
 */

import { loadTone } from './engine';
import type * as ToneNS from 'tone';

const BASS_LINE = ['C2', null, 'C2', null, 'C2', null, 'C2', null, 'Eb2', null, 'Eb2', null, 'G2', null, 'Bb1', null];

export interface LufsReadout {
  integrated: number;
  momentary: number;
  peak: number;
  inRange: boolean;
  tooHot: boolean;
  tooLow: boolean;
}

/** Pure model of the loudness readout as a function of master-gain dB. */
export function lufsReadout(gainDb: number): LufsReadout {
  const integrated = -15.5 + gainDb;
  const peak = Math.min(-0.1, integrated + 9.6);
  const inRange = integrated >= -15 && integrated <= -13;
  const tooHot = integrated > -13;
  const tooLow = integrated < -15;
  return { integrated, momentary: integrated + 0.3, peak, inRange, tooHot, tooLow };
}

export class LufsMeter {
  private T: typeof ToneNS | null = null;
  private gain: ToneNS.Volume | null = null;
  private limiter: ToneNS.Limiter | null = null;
  private kick: ToneNS.MembraneSynth | null = null;
  private bass: ToneNS.MonoSynth | null = null;
  private chord: ToneNS.PolySynth | null = null;
  private hat: ToneNS.NoiseSynth | null = null;
  private seq: ToneNS.Sequence | null = null;
  playing = false;

  async build(initialGain: number) {
    if (this.T) return;
    const T = await loadTone();
    await T.start();
    this.T = T;

    this.gain = new T.Volume(initialGain);
    this.limiter = new T.Limiter(-1);
    this.gain.connect(this.limiter);
    this.limiter.toDestination();

    this.kick = new T.MembraneSynth({
      pitchDecay: 0.03,
      octaves: 6,
      envelope: { attack: 0.001, decay: 0.34, sustain: 0 },
    }).connect(this.gain);
    this.kick.volume.value = 2;
    this.bass = new T.MonoSynth({
      oscillator: { type: 'sawtooth' },
      filterEnvelope: { baseFrequency: 110, octaves: 2.4 },
      envelope: { attack: 0.006, decay: 0.2, sustain: 0.6, release: 0.2 },
    }).connect(this.gain);
    this.bass.volume.value = -4;
    this.chord = new T.PolySynth(T.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.35, release: 0.5 },
    }).connect(this.gain);
    this.chord.volume.value = -12;
    const hf = new T.Filter(8500, 'highpass').connect(this.gain);
    this.hat = new T.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.05, sustain: 0 } }).connect(hf);
    this.hat.volume.value = -10;
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

  setGain(db: number) {
    if (this.gain) this.gain.volume.value = db;
  }

  dispose() {
    this.stop();
    [this.gain, this.limiter, this.kick, this.bass, this.chord, this.hat].forEach((n) => {
      try {
        n?.dispose();
      } catch {
        /* ignore */
      }
    });
    this.T = null;
  }
}
