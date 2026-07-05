import { describe, it, expect } from 'vitest';
import { mergeProgress, resolveSync } from '@/lib/store/cloud';
import type { ProgressState, SavedBeat } from '@/lib/store/progress';
import type { SrsItem } from '@/lib/store/srs';

function srs(id: string, reps: number, dueAt: number): SrsItem {
  return { id, ease: 2.5, intervalDays: reps, reps, dueAt, lapses: 0 };
}

function beat(id: string, createdAt: number): SavedBeat {
  return { id, name: id, bpm: 124, pattern: {}, createdAt };
}

function base(partial: Partial<ProgressState> = {}): ProgressState {
  return {
    version: 1,
    name: 'Alex',
    xp: 0,
    streak: 0,
    lastActive: null,
    completedLessons: [],
    srs: {},
    onboarding: { goal: null, genre: null, level: null, time: null },
    plan: 'free',
    drills: { eqScore: 0, eqStreak: 0, eqBest: 0, earScore: 0, earStreak: 0, earBest: 0 },
    savedBeats: [],
    likedTracks: [],
    ...partial,
  };
}

describe('mergeProgress', () => {
  it('takes the max of xp and streak', () => {
    const m = mergeProgress(base({ xp: 100, streak: 3 }), base({ xp: 250, streak: 1 }));
    expect(m.xp).toBe(250);
    expect(m.streak).toBe(3);
  });

  it('unions completed lessons and liked tracks without duplicates', () => {
    const m = mergeProgress(
      base({ completedLessons: ['a', 'b'], likedTracks: ['t1'] }),
      base({ completedLessons: ['b', 'c'], likedTracks: ['t1', 't2'] })
    );
    expect(m.completedLessons.sort()).toEqual(['a', 'b', 'c']);
    expect(m.likedTracks.sort()).toEqual(['t1', 't2']);
  });

  it('keeps the more-progressed SRS item per topic (more reps wins)', () => {
    const m = mergeProgress(
      base({ srs: { intervals: srs('intervals', 5, 1000) } }),
      base({ srs: { intervals: srs('intervals', 2, 9999) } })
    );
    expect(m.srs.intervals.reps).toBe(5);
  });

  it('breaks SRS ties on reps by the later due date', () => {
    const m = mergeProgress(
      base({ srs: { eq: srs('eq', 3, 1000) } }),
      base({ srs: { eq: srs('eq', 3, 5000) } })
    );
    expect(m.srs.eq.dueAt).toBe(5000);
  });

  it('merges disjoint SRS topics', () => {
    const m = mergeProgress(base({ srs: { a: srs('a', 1, 1) } }), base({ srs: { b: srs('b', 1, 1) } }));
    expect(Object.keys(m.srs).sort()).toEqual(['a', 'b']);
  });

  it('takes the max of every drill stat', () => {
    const m = mergeProgress(
      base({ drills: { eqScore: 90, eqStreak: 2, eqBest: 5, earScore: 0, earStreak: 0, earBest: 1 } }),
      base({ drills: { eqScore: 30, eqStreak: 7, eqBest: 3, earScore: 40, earStreak: 4, earBest: 4 } })
    );
    expect(m.drills).toEqual({ eqScore: 90, eqStreak: 7, eqBest: 5, earScore: 40, earStreak: 4, earBest: 4 });
  });

  it('unions saved beats by id, newest first, capped at 24', () => {
    const local = base({ savedBeats: Array.from({ length: 20 }, (_, i) => beat(`l${i}`, i)) });
    const remote = base({ savedBeats: Array.from({ length: 20 }, (_, i) => beat(`r${i}`, i + 100)) });
    const m = mergeProgress(local, remote);
    expect(m.savedBeats).toHaveLength(24);
    // newest (highest createdAt) first
    expect(m.savedBeats[0].createdAt).toBe(119);
    // no duplicate ids
    expect(new Set(m.savedBeats.map((b) => b.id)).size).toBe(24);
  });

  it('dedupes saved beats sharing an id, preferring one copy', () => {
    const m = mergeProgress(base({ savedBeats: [beat('x', 5)] }), base({ savedBeats: [beat('x', 9)] }));
    expect(m.savedBeats).toHaveLength(1);
    expect(m.savedBeats[0].id).toBe('x');
  });

  it('fills onboarding answers, preferring local non-null then remote', () => {
    const m = mergeProgress(
      base({ onboarding: { goal: 'first-track', genre: null, level: null, time: 10 } }),
      base({ onboarding: { goal: 'go-pro', genre: 'house', level: 'beginner', time: 30 } })
    );
    expect(m.onboarding).toEqual({ goal: 'first-track', genre: 'house', level: 'beginner', time: 10 });
  });

  it('keeps the higher plan tier', () => {
    expect(mergeProgress(base({ plan: 'free' }), base({ plan: 'pro' })).plan).toBe('pro');
    expect(mergeProgress(base({ plan: 'lifetime' }), base({ plan: 'pro' })).plan).toBe('lifetime');
    expect(mergeProgress(base({ plan: 'pro' }), base({ plan: 'free' })).plan).toBe('pro');
  });

  it('takes the later last-active day', () => {
    expect(mergeProgress(base({ lastActive: '2026-07-01' }), base({ lastActive: '2026-07-04' })).lastActive).toBe(
      '2026-07-04'
    );
    expect(mergeProgress(base({ lastActive: null }), base({ lastActive: '2026-01-01' })).lastActive).toBe('2026-01-01');
    expect(mergeProgress(base({ lastActive: '2026-01-01' }), base({ lastActive: null })).lastActive).toBe('2026-01-01');
  });

  it('prefers a remote display name, falling back to local', () => {
    expect(mergeProgress(base({ name: 'Alex' }), base({ name: 'DJ Nova' })).name).toBe('DJ Nova');
    expect(mergeProgress(base({ name: 'Alex' }), base({ name: '' })).name).toBe('Alex');
  });

  it('is loss-free: merging is commutative for unions/maxima', () => {
    const a = base({ xp: 10, completedLessons: ['x'], likedTracks: ['t1'] });
    const b = base({ xp: 40, completedLessons: ['y'], likedTracks: ['t2'] });
    const ab = mergeProgress(a, b);
    const ba = mergeProgress(b, a);
    expect(ab.xp).toBe(ba.xp);
    expect(ab.completedLessons.sort()).toEqual(ba.completedLessons.sort());
    expect(ab.likedTracks.sort()).toEqual(ba.likedTracks.sort());
  });
});

describe('resolveSync (shared-device guard)', () => {
  const A = 'user-a';
  const B = 'user-b';

  it('merges when the device is anonymous (no prior owner) and remote exists', () => {
    expect(resolveSync(null, A, true)).toBe('merge');
  });

  it('uploads local when anonymous device has no remote yet (first signup keeps progress)', () => {
    expect(resolveSync(null, A, false)).toBe('push-local');
  });

  it('merges when the same user returns and remote exists (multi-device union)', () => {
    expect(resolveSync(A, A, true)).toBe('merge');
  });

  it('uploads local when the same user returns but has no remote yet', () => {
    expect(resolveSync(A, A, false)).toBe('push-local');
  });

  it('adopts remote (no bleed) when a different user signs in and has remote', () => {
    expect(resolveSync(A, B, true)).toBe('adopt-remote');
  });

  it('resets to a clean slate when a different user signs in with no remote', () => {
    expect(resolveSync(A, B, false)).toBe('reset');
  });
});
