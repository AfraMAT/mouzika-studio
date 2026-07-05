'use client';

/**
 * Auth context for the optional cloud features. When Supabase is not configured
 * this provider is inert: `configured` is false, `user` stays null, and the auth
 * methods return a friendly error. The app is fully usable signed-out — auth only
 * unlocks cross-device progress sync (see src/lib/store/cloud.ts).
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';

const NOT_CONFIGURED = 'Cloud sync is not configured.';

export interface AuthApi {
  /** Whether Supabase env vars are present at all. */
  configured: boolean;
  /** True once the initial session lookup has resolved. */
  ready: boolean;
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthApi | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  // Nothing to wait for when Supabase is off — mark ready immediately.
  const [ready, setReady] = useState(!configured);

  useEffect(() => {
    if (!configured) return;
    const supabase = getSupabaseClient();
    if (!supabase) {
      setReady(true);
      return;
    }
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [configured]);

  const signIn = useCallback<AuthApi['signIn']>(async (email, password) => {
    const supabase = getSupabaseClient();
    if (!supabase) return { error: NOT_CONFIGURED };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback<AuthApi['signUp']>(async (email, password) => {
    const supabase = getSupabaseClient();
    if (!supabase) return { error: NOT_CONFIGURED, needsConfirmation: false };
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message, needsConfirmation: false };
    // When email confirmation is required, a user exists but no session is issued.
    return { error: null, needsConfirmation: !!data.user && !data.session };
  }, []);

  const signInWithGoogle = useCallback<AuthApi['signInWithGoogle']>(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return { error: NOT_CONFIGURED };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Bare origin === the Supabase Site URL, so it's always an allowed
        // redirect; on app.mouzika.studio the root rewrites to /learn post-login.
        redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback<AuthApi['signOut']>(async () => {
    const supabase = getSupabaseClient();
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  }, []);

  const api = useMemo<AuthApi>(
    () => ({ configured, ready, user, session, signIn, signUp, signInWithGoogle, signOut }),
    [configured, ready, user, session, signIn, signUp, signInWithGoogle, signOut]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
