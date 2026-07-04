import { describe, it, expect } from 'vitest';
import { newSrsItem, review, outcomeToQuality, dueItems, MS_PER_DAY } from '@/lib/store/srs';

const T0 = 1_700_000_000_000; // fixed epoch for determinism

describe('newSrsItem', () => {
  it('starts due immediately with default ease', () => {
    const i = newSrsItem('theory-chords', T0);
    expect(i.ease).toBe(2.5);
    expect(i.reps).toBe(0);
    expect(i.dueAt).toBe(T0);
  });
});

describe('review', () => {
  it('schedules 1 day after first correct review', () => {
    const i = review(newSrsItem('x', T0), 4, T0);
    expect(i.reps).toBe(1);
    expect(i.intervalDays).toBe(1);
    expect(i.dueAt).toBe(T0 + MS_PER_DAY);
  });

  it('schedules 6 days after the second correct review', () => {
    let i = review(newSrsItem('x', T0), 4, T0);
    i = review(i, 4, i.dueAt);
    expect(i.reps).toBe(2);
    expect(i.intervalDays).toBe(6);
  });

  it('grows the interval by the ease factor on subsequent reps', () => {
    let i = review(newSrsItem('x', T0), 5, T0);
    i = review(i, 5, i.dueAt); // interval 6
    const before = i.intervalDays;
    i = review(i, 5, i.dueAt);
    expect(i.intervalDays).toBeGreaterThan(before);
    expect(i.reps).toBe(3);
  });

  it('resets and counts a lapse on failure', () => {
    let i = review(newSrsItem('x', T0), 5, T0);
    i = review(i, 5, i.dueAt); // reps 2
    i = review(i, 1, i.dueAt); // fail
    expect(i.reps).toBe(0);
    expect(i.intervalDays).toBe(1);
    expect(i.lapses).toBe(1);
  });

  it('never lets ease drop below 1.3', () => {
    let i = newSrsItem('x', T0);
    for (let n = 0; n < 10; n++) i = review(i, 0, i.dueAt);
    expect(i.ease).toBeGreaterThanOrEqual(1.3);
  });
});

describe('outcomeToQuality', () => {
  it('maps outcomes to SM-2 quality bands', () => {
    expect(outcomeToQuality(false)).toBe(2);
    expect(outcomeToQuality(true)).toBe(4);
    expect(outcomeToQuality(true, true)).toBe(5);
  });
});

describe('dueItems', () => {
  it('returns only items whose due time has passed', () => {
    const a = { ...newSrsItem('a', T0), dueAt: T0 - 1 };
    const b = { ...newSrsItem('b', T0), dueAt: T0 + MS_PER_DAY };
    expect(dueItems([a, b], T0).map((i) => i.id)).toEqual(['a']);
  });
});
