/**
 * Spaced-repetition scheduling (SuperMemo-2 variant). Pure functions, unit
 * tested. Each reviewable item (a technique/concept) carries an ease factor,
 * an interval in days, a repetition count, and a next-due timestamp.
 */

export interface SrsItem {
  id: string;
  ease: number; // 1.3 .. ~2.8
  intervalDays: number;
  reps: number;
  dueAt: number; // epoch ms
  lapses: number;
}

export const MS_PER_DAY = 86_400_000;

export function newSrsItem(id: string, now: number): SrsItem {
  return { id, ease: 2.5, intervalDays: 0, reps: 0, dueAt: now, lapses: 0 };
}

/**
 * Grade a review. `quality` is 0..5 (0=blackout, 3=correct-with-effort,
 * 5=perfect). Returns a new item; the original is not mutated.
 */
export function review(item: SrsItem, quality: number, now: number): SrsItem {
  const q = Math.max(0, Math.min(5, Math.round(quality)));
  let { ease, intervalDays, reps, lapses } = item;

  if (q < 3) {
    // Failed — reset the interval, count a lapse.
    reps = 0;
    intervalDays = 1;
    lapses += 1;
  } else {
    reps += 1;
    if (reps === 1) intervalDays = 1;
    else if (reps === 2) intervalDays = 6;
    else intervalDays = Math.round(intervalDays * ease);
  }

  // Update ease factor (SM-2 formula), floored at 1.3.
  ease = Math.max(1.3, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

  return { ...item, ease, intervalDays, reps, lapses, dueAt: now + intervalDays * MS_PER_DAY };
}

/** Map a 0/1 quiz outcome (plus optional streak) to an SM-2 quality score. */
export function outcomeToQuality(correct: boolean, fast = false): number {
  if (!correct) return 2;
  return fast ? 5 : 4;
}

/** Items whose next-due time has passed. */
export function dueItems(items: SrsItem[], now: number): SrsItem[] {
  return items.filter((i) => i.dueAt <= now);
}
