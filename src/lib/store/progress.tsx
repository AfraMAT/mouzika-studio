'use client';

/**
 * Client-side progress store — the gamification engine. Holds XP, streak, SRS
 * schedule, completed lessons, drill stats, onboarding answers and saved beats.
 * Persisted to localStorage behind a small interface so it can later be swapped
 * for the Supabase adapter (see supabase/schema.md) without touching the UI.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { newSrsItem, review as srsReview, outcomeToQuality, dueItems, type SrsItem } from './srs';
import { dayKey, touchStreak, levelForXp } from './streak';
import { useAuth } from '@/lib/auth/AuthProvider';
import { getSupabaseClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import {
  mergeProgress,
  pullRemoteState,
  pushRemoteState,
  resolveSync,
  readCloudOwner,
  writeCloudOwner,
} from './cloud';

export interface OnboardingAnswers {
  goal: string | null;
  genre: string | null;
  level: string | null;
  time: number | null;
}

export interface SavedBeat {
  id: string;
  name: string;
  bpm: number;
  pattern: Record<string, boolean[]>;
  createdAt: number;
}

export interface DrillStats {
  eqScore: number;
  eqStreak: number;
  eqBest: number;
  earScore: number;
  earStreak: number;
  earBest: number;
}

export interface ProgressState {
  version: number;
  name: string;
  xp: number;
  streak: number;
  lastActive: string | null;
  completedLessons: string[];
  srs: Record<string, SrsItem>;
  onboarding: OnboardingAnswers;
  plan: 'free' | 'pro' | 'lifetime';
  drills: DrillStats;
  savedBeats: SavedBeat[];
  likedTracks: string[];
}

const STORAGE_KEY = 'mz_progress_v1';
const CURRENT_VERSION = 1;

function initialState(): ProgressState {
  return {
    version: CURRENT_VERSION,
    name: 'Alex',
    xp: 3410,
    streak: 12,
    lastActive: null,
    completedLessons: ['found-1', 'found-2'],
    srs: {},
    onboarding: { goal: null, genre: null, level: null, time: null },
    plan: 'free',
    drills: { eqScore: 0, eqStreak: 0, eqBest: 0, earScore: 0, earStreak: 0, earBest: 0 },
    savedBeats: [],
    likedTracks: [],
  };
}

function load(): ProgressState {
  if (typeof window === 'undefined') return initialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw);
    if (parsed?.version !== CURRENT_VERSION) return { ...initialState(), ...parsed, version: CURRENT_VERSION };
    return { ...initialState(), ...parsed };
  } catch {
    return initialState();
  }
}

interface ProgressApi {
  state: ProgressState;
  level: number;
  addXp: (amount: number) => void;
  completeLesson: (id: string, xp?: number) => void;
  isLessonDone: (id: string) => boolean;
  recordDrill: (drill: 'eq' | 'ear', correct: boolean, fast?: boolean) => void;
  recordReview: (topicId: string, correct: boolean, fast?: boolean) => void;
  dueCount: () => number;
  setOnboarding: (a: Partial<OnboardingAnswers>) => void;
  setPlan: (p: ProgressState['plan']) => void;
  saveBeat: (beat: Omit<SavedBeat, 'id' | 'createdAt'>) => void;
  deleteBeat: (id: string) => void;
  toggleLike: (id: string) => void;
  touchToday: () => void;
  reset: () => void;
  hydrated: boolean;
}

const Ctx = createContext<ProgressApi | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const skipPersist = useRef(true);

  // Cloud sync (optional): active only when Supabase is configured and a user is
  // signed in. `stateRef` gives the async sign-in handler the latest local state
  // without re-subscribing; the other refs coordinate pull/push without renders.
  const { user } = useAuth();
  const stateRef = useRef(state);
  stateRef.current = state;
  const cloudUserId = useRef<string | null>(null);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Gate pushes on a successful initial pull so a failed read never clobbers the
  // cloud. It's state (not a ref) so flipping it re-runs the push effect — edits
  // made during the reconcile window still get flushed once sync is ready.
  const [cloudReady, setCloudReady] = useState(false);

  // hydrate from storage once on the client
  useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  // persist on change (but not the initial hydration render)
  useEffect(() => {
    if (!hydrated) return;
    if (skipPersist.current) {
      skipPersist.current = false;
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota errors */
    }
  }, [state, hydrated]);

  // On sign-in: reconcile local state with the cloud. resolveSync guards against
  // cross-account bleed on shared devices — local is only merged/uploaded when it
  // belongs to this user (or nobody yet); otherwise the account's own remote wins.
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;
    // Wait for localStorage hydration first, so stateRef holds the user's real
    // local state — never the seeded demo default — before we merge/push it up.
    if (!hydrated) return;
    const uid = user?.id ?? null;
    if (uid === cloudUserId.current) return;
    cloudUserId.current = uid;
    setCloudReady(false);
    if (!uid) return; // signed out — keep local state, stop syncing
    let cancelled = false;
    (async () => {
      const pulled = await pullRemoteState(supabase, uid);
      if (cancelled) return;
      // Read failed — do not adopt or push, or we could clobber good remote data.
      if (pulled.status === 'error') return;
      const local = stateRef.current;
      const remoteFull = pulled.state
        ? ({ ...initialState(), ...(pulled.state as Partial<ProgressState>), version: CURRENT_VERSION })
        : null;
      const action = resolveSync(readCloudOwner(), uid, remoteFull !== null);
      const next =
        action === 'merge' && remoteFull
          ? mergeProgress(local, remoteFull)
          : action === 'adopt-remote' && remoteFull
            ? remoteFull
            : action === 'push-local'
              ? local
              : initialState(); // 'reset'
      setState(next);
      writeCloudOwner(uid);
      try {
        await pushRemoteState(supabase, uid, next);
      } catch {
        /* ignore transient network errors — the debounced push will retry */
      }
      if (!cancelled) setCloudReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, hydrated]);

  // While signed in, debounce-push local changes up to the cloud. Gated on
  // cloudReady (state) so a failed pull never overwrites the cloud, and so an
  // edit made during the reconcile window is flushed once sync becomes ready.
  useEffect(() => {
    if (!hydrated || !cloudReady) return;
    const uid = cloudUserId.current;
    if (!uid) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;
    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => {
      void pushRemoteState(supabase, uid, state);
    }, 1200);
    return () => {
      if (pushTimer.current) clearTimeout(pushTimer.current);
    };
  }, [state, hydrated, cloudReady]);

  const touchToday = useCallback(() => {
    setState((s) => {
      const today = dayKey(new Date());
      const upd = touchStreak(s.streak, s.lastActive, today);
      if (upd.lastActive === s.lastActive && !upd.incremented) return s;
      return { ...s, streak: upd.streak, lastActive: upd.lastActive };
    });
  }, []);

  const addXp = useCallback((amount: number) => {
    setState((s) => ({ ...s, xp: Math.max(0, s.xp + amount) }));
  }, []);

  const completeLesson = useCallback((id: string, xp = 50) => {
    setState((s) => {
      const done = s.completedLessons.includes(id);
      const today = dayKey(new Date());
      const streakUpd = touchStreak(s.streak, s.lastActive, today);
      return {
        ...s,
        xp: done ? s.xp : s.xp + xp,
        completedLessons: done ? s.completedLessons : [...s.completedLessons, id],
        streak: streakUpd.streak,
        lastActive: streakUpd.lastActive,
      };
    });
  }, []);

  const isLessonDone = useCallback((id: string) => state.completedLessons.includes(id), [state.completedLessons]);

  const recordReview = useCallback((topicId: string, correct: boolean, fast = false) => {
    setState((s) => {
      const now = Date.now();
      const existing = s.srs[topicId] ?? newSrsItem(topicId, now);
      const updated = srsReview(existing, outcomeToQuality(correct, fast), now);
      return { ...s, srs: { ...s.srs, [topicId]: updated } };
    });
  }, []);

  const recordDrill = useCallback(
    (drill: 'eq' | 'ear', correct: boolean, fast = false) => {
      setState((s) => {
        const d = { ...s.drills };
        const today = dayKey(new Date());
        const streakUpd = touchStreak(s.streak, s.lastActive, today);
        if (drill === 'eq') {
          d.eqScore += correct ? 10 : 0;
          d.eqStreak = correct ? d.eqStreak + 1 : 0;
          d.eqBest = Math.max(d.eqBest, d.eqStreak);
        } else {
          d.earScore += correct ? 10 : 0;
          d.earStreak = correct ? d.earStreak + 1 : 0;
          d.earBest = Math.max(d.earBest, d.earStreak);
        }
        return {
          ...s,
          drills: d,
          xp: correct ? s.xp + 10 : s.xp,
          streak: streakUpd.streak,
          lastActive: streakUpd.lastActive,
        };
      });
      recordReview(drill === 'eq' ? 'mix-eq' : 'theory-intervals', correct, fast);
    },
    [recordReview]
  );

  const dueCount = useCallback(() => dueItems(Object.values(state.srs), Date.now()).length, [state.srs]);

  const setOnboarding = useCallback((a: Partial<OnboardingAnswers>) => {
    setState((s) => ({ ...s, onboarding: { ...s.onboarding, ...a } }));
  }, []);

  const setPlan = useCallback((p: ProgressState['plan']) => setState((s) => ({ ...s, plan: p })), []);

  const saveBeat = useCallback((beat: Omit<SavedBeat, 'id' | 'createdAt'>) => {
    setState((s) => ({
      ...s,
      savedBeats: [{ ...beat, id: `beat-${s.savedBeats.length + 1}-${s.savedBeats.length}`, createdAt: 0 }, ...s.savedBeats].slice(0, 24),
    }));
  }, []);

  const deleteBeat = useCallback((id: string) => {
    setState((s) => ({ ...s, savedBeats: s.savedBeats.filter((b) => b.id !== id) }));
  }, []);

  const toggleLike = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      likedTracks: s.likedTracks.includes(id) ? s.likedTracks.filter((x) => x !== id) : [...s.likedTracks, id],
    }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState());
  }, []);

  const api = useMemo<ProgressApi>(
    () => ({
      state,
      level: levelForXp(state.xp),
      addXp,
      completeLesson,
      isLessonDone,
      recordDrill,
      recordReview,
      dueCount,
      setOnboarding,
      setPlan,
      saveBeat,
      deleteBeat,
      toggleLike,
      touchToday,
      reset,
      hydrated,
    }),
    [state, addXp, completeLesson, isLessonDone, recordDrill, recordReview, dueCount, setOnboarding, setPlan, saveBeat, deleteBeat, toggleLike, touchToday, reset, hydrated]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useProgress(): ProgressApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
