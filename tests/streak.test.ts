import { describe, it, expect } from 'vitest';
import { dayKey, touchStreak, streakAlive, levelForXp, levelProgress, XP_PER_LEVEL } from '@/lib/store/streak';

describe('dayKey', () => {
  it('formats a local date as YYYY-MM-DD', () => {
    expect(dayKey(new Date(2026, 6, 4))).toBe('2026-07-04');
    expect(dayKey(new Date(2026, 0, 9))).toBe('2026-01-09');
  });
});

describe('touchStreak', () => {
  it('starts a streak at 1 with no history', () => {
    expect(touchStreak(0, null, '2026-07-04')).toEqual({ streak: 1, lastActive: '2026-07-04', incremented: true });
  });
  it('is a no-op on the same day', () => {
    const r = touchStreak(5, '2026-07-04', '2026-07-04');
    expect(r.streak).toBe(5);
    expect(r.incremented).toBe(false);
  });
  it('increments on a consecutive day', () => {
    expect(touchStreak(5, '2026-07-04', '2026-07-05')).toEqual({ streak: 6, lastActive: '2026-07-05', incremented: true });
  });
  it('resets to 1 after a gap', () => {
    expect(touchStreak(9, '2026-07-01', '2026-07-05')).toEqual({ streak: 1, lastActive: '2026-07-05', incremented: true });
  });
  it('handles month boundaries', () => {
    expect(touchStreak(3, '2026-06-30', '2026-07-01').streak).toBe(4);
  });
});

describe('streakAlive', () => {
  it('is alive today or yesterday, dead after a gap', () => {
    expect(streakAlive('2026-07-04', '2026-07-04')).toBe(true);
    expect(streakAlive('2026-07-03', '2026-07-04')).toBe(true);
    expect(streakAlive('2026-07-01', '2026-07-04')).toBe(false);
    expect(streakAlive(null, '2026-07-04')).toBe(false);
  });
});

describe('levels', () => {
  it('computes level from XP', () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(XP_PER_LEVEL - 1)).toBe(1);
    expect(levelForXp(XP_PER_LEVEL)).toBe(2);
    expect(levelForXp(XP_PER_LEVEL * 3 + 10)).toBe(4);
  });
  it('computes progress within a level as 0..1', () => {
    expect(levelProgress(0)).toBe(0);
    expect(levelProgress(XP_PER_LEVEL / 2)).toBeCloseTo(0.5);
  });
});
