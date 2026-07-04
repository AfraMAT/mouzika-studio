import { describe, it, expect } from 'vitest';
import { cannedReply, LOCALE_NAME, type CannedReplies } from '@/lib/tutor';
import { en, fr, ar } from '@/lib/i18n/dictionaries';

describe('cannedReply', () => {
  const c = en.canned as CannedReplies;

  it('routes sidechain questions', () => {
    expect(cannedReply('how do I sidechain the bass?', c)).toBe(c.sidechain);
    expect(cannedReply('pump effect on pads', c)).toBe(c.sidechain);
  });
  it('routes masking / clash questions', () => {
    expect(cannedReply('my kick and bass clash', c)).toBe(c.mask);
    expect(cannedReply('the low end is muddy', c)).toBe(c.mask);
  });
  it('routes loudness / mastering questions', () => {
    expect(cannedReply('explain LUFS simply', c)).toBe(c.master);
    expect(cannedReply('how loud should my master be', c)).toBe(c.master);
  });
  it('routes AI-workflow questions', () => {
    expect(cannedReply('how do I use Suno stems', c)).toBe(c.ai);
  });
  it('falls back to the default answer', () => {
    expect(cannedReply('what is your favourite colour', c)).toBe(c.def);
  });
});

describe('canned replies exist in every locale', () => {
  it.each([['en', en], ['fr', fr], ['ar', ar]] as const)('%s has all canned keys', (_name, dict) => {
    for (const k of ['sidechain', 'mask', 'reverb', 'eight08', 'master', 'chords', 'arrange', 'ai', 'def'] as const) {
      expect(typeof dict.canned[k]).toBe('string');
      expect(dict.canned[k].length).toBeGreaterThan(10);
    }
  });
});

describe('LOCALE_NAME', () => {
  it('names each supported locale', () => {
    expect(LOCALE_NAME.en).toBe('English');
    expect(LOCALE_NAME.fr).toBe('French');
    expect(LOCALE_NAME.ar).toBe('Arabic');
  });
});
