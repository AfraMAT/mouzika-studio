'use client';

/**
 * Lazy, browser-only Supabase client singleton. Returns `null` when Supabase is
 * not configured (or when called during SSR) so every caller degrades to the
 * offline path instead of throwing. The session is persisted and auto-refreshed
 * in the browser, so cloud sync survives reloads.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from './config';

let cached: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> | null {
  if (typeof window === 'undefined') return null; // browser-only
  if (!isSupabaseConfigured()) return null;
  if (!cached) {
    cached = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return cached;
}
