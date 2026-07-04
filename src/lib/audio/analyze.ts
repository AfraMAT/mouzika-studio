/**
 * Real, in-browser audio analysis for the AI Mix Feedback tool. Decodes an
 * uploaded file and measures a small set of honest, well-defined metrics:
 * integrated loudness (a simplified BS.1770 without K-weighting), true-ish
 * peak, stereo width (L/R correlation), crest factor (dynamics), and a
 * three-band tonal balance. Everything runs locally — nothing is uploaded.
 */

export interface MixMetrics {
  lufs: number; // integrated loudness (dB, approx)
  peakDb: number; // sample peak (dBFS)
  width: number; // 0 (mono) .. ~1 (very wide)
  crest: number; // peak-to-RMS in dB
  balance: { low: number; mid: number; high: number }; // normalised 0..1 energy share
  mono: boolean;
  durationSec: number;
}

const MAX_SECONDS = 40;

function rmsDb(data: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
  const ms = sum / data.length;
  return 10 * Math.log10(ms + 1e-12);
}

function peakDb(data: Float32Array): number {
  let peak = 0;
  for (let i = 0; i < data.length; i++) {
    const a = Math.abs(data[i]);
    if (a > peak) peak = a;
  }
  return 20 * Math.log10(peak + 1e-12);
}

/** Gated integrated loudness (simplified BS.1770; no K-weighting). */
function integratedLufs(data: Float32Array, sampleRate: number): number {
  const block = Math.floor(sampleRate * 0.4);
  if (block < 1) return -70;
  const loudness: number[] = [];
  for (let i = 0; i + block <= data.length; i += block) {
    let sum = 0;
    for (let j = i; j < i + block; j++) sum += data[j] * data[j];
    const ms = sum / block;
    loudness.push(-0.691 + 10 * Math.log10(ms + 1e-12));
  }
  if (!loudness.length) return -70;
  // absolute gate at -70 LUFS
  const gated = loudness.filter((l) => l > -70);
  if (!gated.length) return -70;
  const meanAbs = gated.reduce((a, b) => a + b, 0) / gated.length;
  // relative gate at mean - 10
  const rel = gated.filter((l) => l > meanAbs - 10);
  const arr = rel.length ? rel : gated;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function correlation(l: Float32Array, r: Float32Array): number {
  const n = Math.min(l.length, r.length);
  let sll = 0;
  let srr = 0;
  let slr = 0;
  for (let i = 0; i < n; i++) {
    sll += l[i] * l[i];
    srr += r[i] * r[i];
    slr += l[i] * r[i];
  }
  const denom = Math.sqrt(sll * srr) + 1e-12;
  return slr / denom;
}

/** One-pole low/high energy split into three bands, RMS energy per band. */
function tonalBalance(data: Float32Array, sampleRate: number): { low: number; mid: number; high: number } {
  const lowCut = 250;
  const highCut = 4000;
  const aLow = Math.exp((-2 * Math.PI * lowCut) / sampleRate);
  const aHigh = Math.exp((-2 * Math.PI * highCut) / sampleRate);
  let lpLow = 0;
  let lpHigh = 0;
  let eLow = 0;
  let eMid = 0;
  let eHigh = 0;
  for (let i = 0; i < data.length; i++) {
    const x = data[i];
    lpLow = aLow * lpLow + (1 - aLow) * x; // < 250 Hz
    lpHigh = aHigh * lpHigh + (1 - aHigh) * x; // < 4 kHz
    const low = lpLow;
    const mid = lpHigh - lpLow; // 250 Hz .. 4 kHz
    const high = x - lpHigh; // > 4 kHz
    eLow += low * low;
    eMid += mid * mid;
    eHigh += high * high;
  }
  const total = eLow + eMid + eHigh + 1e-12;
  return { low: eLow / total, mid: eMid / total, high: eHigh / total };
}

export async function decodeFile(file: File): Promise<AudioBuffer> {
  const AC = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
  const ctx = new AC();
  const arrayBuf = await file.arrayBuffer();
  const buffer = await ctx.decodeAudioData(arrayBuf);
  ctx.close();
  return buffer;
}

export function analyzeBuffer(buffer: AudioBuffer): MixMetrics {
  const sr = buffer.sampleRate;
  const maxLen = Math.min(buffer.length, Math.floor(MAX_SECONDS * sr));
  const l = buffer.getChannelData(0).subarray(0, maxLen);
  const mono = buffer.numberOfChannels < 2;
  const r = mono ? l : buffer.getChannelData(1).subarray(0, maxLen);

  // sum to mono for loudness/balance
  const midSig = new Float32Array(maxLen);
  for (let i = 0; i < maxLen; i++) midSig[i] = mono ? l[i] : (l[i] + r[i]) * 0.5;

  const lufs = integratedLufs(midSig, sr);
  const pk = Math.max(peakDb(l), mono ? -120 : peakDb(r));
  const rms = rmsDb(midSig);
  const crest = pk - rms;
  const corr = mono ? 1 : correlation(l, r);
  const width = mono ? 0 : Math.max(0, Math.min(1.2, (1 - corr) * 1.1));
  const balance = tonalBalance(midSig, sr);

  return { lufs, peakDb: pk, width, crest, balance, mono, durationSec: buffer.duration };
}

/** Render the house demo loop to an AudioBuffer so users can try the tool. */
export async function renderDemoLoop(): Promise<AudioBuffer> {
  const Tone = await import('tone');
  const duration = 4;
  const buffer = await Tone.Offline(({ transport }) => {
    const master = new Tone.Volume(-2).toDestination();
    const kick = new Tone.MembraneSynth({ pitchDecay: 0.03, octaves: 6, envelope: { attack: 0.001, decay: 0.34, sustain: 0 } }).connect(master);
    kick.volume.value = 2;
    const bass = new Tone.MonoSynth({ oscillator: { type: 'sawtooth' }, filterEnvelope: { baseFrequency: 110, octaves: 2.4 }, envelope: { attack: 0.006, decay: 0.2, sustain: 0.6, release: 0.2 } }).connect(master);
    bass.volume.value = -5;
    const chord = new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.02, decay: 0.3, sustain: 0.35, release: 0.5 } }).connect(master);
    chord.volume.value = -13;
    const hf = new Tone.Filter(8500, 'highpass').connect(master);
    const hat = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.05, sustain: 0 } }).connect(hf);
    hat.volume.value = -12;
    const bl = ['C2', null, 'C2', null, 'C2', null, 'C2', null, 'Eb2', null, 'Eb2', null, 'G2', null, 'Bb1', null];
    transport.bpm.value = 124;
    new Tone.Sequence(
      (time, step) => {
        if (step % 4 === 0) kick.triggerAttackRelease('C1', '8n', time);
        if (step % 4 === 2) hat.triggerAttackRelease('32n', time);
        if (step === 0 || step === 8) chord.triggerAttackRelease(['C4', 'Eb4', 'G4'], '4n', time);
        const b = bl[step];
        if (b) bass.triggerAttackRelease(b, '8n', time);
      },
      Array.from({ length: 16 }, (_, i) => i),
      '16n'
    ).start(0);
    transport.start();
  }, duration, 2);
  return buffer as unknown as AudioBuffer;
}
