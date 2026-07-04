import { describe, it, expect } from 'vitest';
import { lufsReadout } from '@/lib/audio/lufs';
import { buildReport } from '@/lib/audio/feedback';
import type { MixMetrics } from '@/lib/audio/analyze';

describe('lufsReadout', () => {
  it('reports the streaming pocket around -14 LUFS', () => {
    // integrated = -15.5 + gain; gain +1.5 -> -14
    const r = lufsReadout(1.5);
    expect(r.integrated).toBeCloseTo(-14, 5);
    expect(r.inRange).toBe(true);
    expect(r.tooHot).toBe(false);
    expect(r.tooLow).toBe(false);
  });
  it('flags too-hot above -13', () => {
    const r = lufsReadout(6);
    expect(r.integrated).toBeGreaterThan(-13);
    expect(r.tooHot).toBe(true);
  });
  it('flags too-low below -15', () => {
    const r = lufsReadout(-6);
    expect(r.tooLow).toBe(true);
  });
  it('keeps true peak under -0.1', () => {
    expect(lufsReadout(6).peak).toBeLessThanOrEqual(-0.1);
  });
});

const balanced: MixMetrics = {
  lufs: -14,
  peakDb: -1.2,
  width: 0.4,
  crest: 10,
  balance: { low: 0.34, mid: 0.4, high: 0.26 },
  mono: false,
  durationSec: 12,
};

describe('buildReport', () => {
  it('rewards a clean, balanced master with a high score and strengths', () => {
    const rep = buildReport(balanced, 'en');
    expect(rep.score).toBeGreaterThanOrEqual(85);
    expect(rep.strengths.length).toBeGreaterThan(0);
    expect(rep.fixes.length).toBe(0);
  });

  it('penalises an over-hot, clipping, bass-heavy squashed mix', () => {
    const bad: MixMetrics = { lufs: -6, peakDb: 0.8, width: 0.4, crest: 3, balance: { low: 0.7, mid: 0.2, high: 0.1 }, mono: false, durationSec: 12 };
    const rep = buildReport(bad, 'en');
    expect(rep.score).toBeLessThan(60);
    expect(rep.fixes.length).toBeGreaterThanOrEqual(3);
  });

  it('flags a mono file', () => {
    const rep = buildReport({ ...balanced, mono: true, width: 0 }, 'en');
    expect(rep.fixes.some((f) => /mono/i.test(f.text))).toBe(true);
  });

  it('localises findings (FR / AR differ from EN)', () => {
    const en = buildReport(balanced, 'en').strengths[0].text;
    const fr = buildReport(balanced, 'fr').strengths[0].text;
    const ar = buildReport(balanced, 'ar').strengths[0].text;
    expect(fr).not.toBe(en);
    expect(ar).not.toBe(en);
  });

  it('clamps the score into 20..100', () => {
    const rep = buildReport({ lufs: 3, peakDb: 5, width: 1.1, crest: 1, balance: { low: 0.85, mid: 0.05, high: 0.1 }, mono: false, durationSec: 5 }, 'en');
    expect(rep.score).toBeGreaterThanOrEqual(20);
    expect(rep.score).toBeLessThanOrEqual(100);
  });
});
