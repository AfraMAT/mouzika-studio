import { describe, it, expect } from 'vitest';
import { en, fr, ar, dictionaries, LOCALES, RTL_LOCALES } from '@/lib/i18n/dictionaries';

/** Recursively collect the "shape" of an object: paths + JS types. */
function shape(obj: unknown, prefix = ''): string[] {
  if (Array.isArray(obj)) {
    // Represent arrays by their length + the shape of the first element.
    const inner = obj.length ? shape(obj[0], `${prefix}[]`) : [`${prefix}[]:empty`];
    return [`${prefix}:array(${obj.length})`, ...inner];
  }
  if (obj && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .flatMap((k) => shape((obj as Record<string, unknown>)[k], prefix ? `${prefix}.${k}` : k));
  }
  return [`${prefix}:${typeof obj}`];
}

describe('dictionary shape parity', () => {
  const base = shape(en);
  it('French matches the English structure exactly', () => {
    expect(shape(fr)).toEqual(base);
  });
  it('Arabic matches the English structure exactly', () => {
    expect(shape(ar)).toEqual(base);
  });
});

describe('locale registry', () => {
  it('exposes three locales, Arabic is RTL', () => {
    expect(LOCALES).toEqual(['en', 'fr', 'ar']);
    expect(RTL_LOCALES).toContain('ar');
    expect(RTL_LOCALES).not.toContain('en');
    expect(Object.keys(dictionaries)).toEqual(['en', 'fr', 'ar']);
  });
});

describe('key content invariants', () => {
  it('has eight curriculum tracks in every locale', () => {
    for (const d of [en, fr, ar]) expect(d.curr.tracks).toHaveLength(8);
  });
  it('has four onboarding steps with options in every locale', () => {
    for (const d of [en, fr, ar]) {
      expect(d.onbq.steps).toHaveLength(4);
      expect(d.onbq.steps[0].options.length).toBeGreaterThan(0);
    }
  });
});
