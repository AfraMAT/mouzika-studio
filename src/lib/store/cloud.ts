/**
 * Cloud sync for the progress store. Kept separate from the React provider so the
 * merge logic stays pure and unit-testable (see tests/cloud.test.ts).
 *
 * The whole ProgressState is stored as one owner-scoped JSON document in the
 * `user_state` table (RLS: `auth.uid() = user_id`). We store a blob rather than
 * decomposing into the normalized content tables because the app's ids
 * (`found-1`, community track ids, …) reference local content files, not DB rows.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from '@/lib/supabase/types';
import type { SrsItem } from './srs';
import type { ProgressState, SavedBeat } from './progress';

type Db = SupabaseClient<Database>;

const PLAN_RANK: Record<ProgressState['plan'], number> = { free: 0, pro: 1, lifetime: 2 };

/** localStorage key recording which user the on-device state belongs to. */
const CLOUD_OWNER_KEY = 'mz_cloud_owner';

export type SyncAction = 'merge' | 'adopt-remote' | 'push-local' | 'reset';

/**
 * Decide how to reconcile the on-device state with the cloud on sign-in, guarding
 * against cross-account bleed on shared devices: local data is only merged or
 * pushed up when it belongs to this user (or to nobody yet). A different prior
 * owner means local is ignored — we adopt the account's own remote state when it
 * exists, or start from a clean slate when it does not.
 *
 *  - merge:        same user (or anonymous local) + remote exists → union them
 *  - adopt-remote: different prior owner + remote exists → take remote as-is
 *  - push-local:   same user (or anonymous local) + no remote yet → upload local
 *  - reset:        different prior owner + no remote yet → clean slate
 */
export function resolveSync(prevOwner: string | null, uid: string, hasRemote: boolean): SyncAction {
  const claimable = prevOwner === null || prevOwner === uid;
  if (hasRemote) return claimable ? 'merge' : 'adopt-remote';
  return claimable ? 'push-local' : 'reset';
}

export function readCloudOwner(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(CLOUD_OWNER_KEY);
  } catch {
    return null;
  }
}

export function writeCloudOwner(uid: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CLOUD_OWNER_KEY, uid);
  } catch {
    /* ignore quota / disabled storage */
  }
}

/** Pick the more-progressed SRS item for a topic: more reps wins, ties → later due. */
function pickSrs(a: SrsItem, b: SrsItem): SrsItem {
  if (a.reps !== b.reps) return a.reps > b.reps ? a : b;
  return a.dueAt >= b.dueAt ? a : b;
}

/** Later of two `YYYY-MM-DD` day keys (lexicographic order is chronological). */
function laterDay(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return a >= b ? a : b;
}

/**
 * Deterministically merge two full progress states (local + remote) so signing in
 * on a new device never loses progress: XP/streak take the max, collections union,
 * SRS keeps the furthest-scheduled item, and the higher plan tier wins.
 */
export function mergeProgress(local: ProgressState, remote: ProgressState): ProgressState {
  const completedLessons = Array.from(new Set([...local.completedLessons, ...remote.completedLessons]));
  const likedTracks = Array.from(new Set([...local.likedTracks, ...remote.likedTracks]));

  const srs: Record<string, SrsItem> = { ...remote.srs };
  for (const [topic, item] of Object.entries(local.srs)) {
    const other = srs[topic];
    srs[topic] = other ? pickSrs(item, other) : item;
  }

  const drills = {
    eqScore: Math.max(local.drills.eqScore, remote.drills.eqScore),
    eqStreak: Math.max(local.drills.eqStreak, remote.drills.eqStreak),
    eqBest: Math.max(local.drills.eqBest, remote.drills.eqBest),
    earScore: Math.max(local.drills.earScore, remote.drills.earScore),
    earStreak: Math.max(local.drills.earStreak, remote.drills.earStreak),
    earBest: Math.max(local.drills.earBest, remote.drills.earBest),
  };

  // Union saved beats by id, newest first, capped like the local store (24).
  const beatsById = new Map<string, SavedBeat>();
  for (const b of [...remote.savedBeats, ...local.savedBeats]) {
    if (!beatsById.has(b.id)) beatsById.set(b.id, b);
  }
  const savedBeats = Array.from(beatsById.values())
    .sort((x, y) => y.createdAt - x.createdAt)
    .slice(0, 24);

  const onboarding = {
    goal: local.onboarding.goal ?? remote.onboarding.goal,
    genre: local.onboarding.genre ?? remote.onboarding.genre,
    level: local.onboarding.level ?? remote.onboarding.level,
    time: local.onboarding.time ?? remote.onboarding.time,
  };

  return {
    version: local.version,
    name: remote.name || local.name,
    xp: Math.max(local.xp, remote.xp),
    streak: Math.max(local.streak, remote.streak),
    lastActive: laterDay(local.lastActive, remote.lastActive),
    completedLessons,
    srs,
    onboarding,
    plan: PLAN_RANK[local.plan] >= PLAN_RANK[remote.plan] ? local.plan : remote.plan,
    drills,
    savedBeats,
    likedTracks,
  };
}

export interface PullResult {
  /** `empty` = no row yet; `error` = the read failed (caller must NOT push). */
  status: 'ok' | 'empty' | 'error';
  state: Record<string, unknown> | null;
}

/**
 * Read the stored state document. Distinguishes "no row yet" from a failed read:
 * on `error` the caller must not push, or it could clobber good remote data with
 * a stale local copy.
 */
export async function pullRemoteState(supabase: Db, userId: string): Promise<PullResult> {
  const { data, error } = await supabase
    .from('user_state')
    .select('state')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) return { status: 'error', state: null };
  if (!data) return { status: 'empty', state: null };
  const state = data.state;
  if (state && typeof state === 'object' && !Array.isArray(state)) {
    return { status: 'ok', state: state as Record<string, unknown> };
  }
  return { status: 'empty', state: null };
}

/** Upsert the user's state document. Fire-and-forget from the provider. */
export async function pushRemoteState(
  supabase: Db,
  userId: string,
  state: ProgressState,
  now: number = Date.now()
): Promise<void> {
  await supabase.from('user_state').upsert(
    {
      user_id: userId,
      state: state as unknown as Json,
      updated_at: new Date(now).toISOString(),
    },
    { onConflict: 'user_id' }
  );
}
