/** Daily-streak logic. Pure and unit-tested. Dates are `YYYY-MM-DD` strings. */

export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysBetween(a: string, b: string): number {
  const [ya, ma, da] = a.split('-').map(Number);
  const [yb, mb, db] = b.split('-').map(Number);
  const ta = Date.UTC(ya, ma - 1, da);
  const tb = Date.UTC(yb, mb - 1, db);
  return Math.round((tb - ta) / 86_400_000);
}

export interface StreakUpdate {
  streak: number;
  lastActive: string;
  incremented: boolean;
}

/**
 * Given the previous streak count and last-active day, compute the streak
 * after activity on `today`:
 *  - same day → unchanged
 *  - consecutive day → +1
 *  - any gap (or first ever) → reset to 1
 */
export function touchStreak(prevStreak: number, lastActive: string | null, today: string): StreakUpdate {
  if (!lastActive) return { streak: 1, lastActive: today, incremented: true };
  const gap = daysBetween(lastActive, today);
  if (gap <= 0) return { streak: prevStreak || 1, lastActive, incremented: false };
  if (gap === 1) return { streak: prevStreak + 1, lastActive: today, incremented: true };
  return { streak: 1, lastActive: today, incremented: true };
}

/** True if the streak is still alive as of `today` (active today or yesterday). */
export function streakAlive(lastActive: string | null, today: string): boolean {
  if (!lastActive) return false;
  return daysBetween(lastActive, today) <= 1;
}

export const XP_PER_LEVEL = 500;
export function levelForXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}
export function levelProgress(xp: number): number {
  return (xp % XP_PER_LEVEL) / XP_PER_LEVEL;
}
