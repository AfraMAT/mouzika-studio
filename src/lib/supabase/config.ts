/**
 * Supabase runtime configuration. Every Supabase feature is OPTIONAL: when these
 * public env vars are unset the app runs exactly as before — localStorage-only
 * persistence and a rule-based tutor. See supabase/schema.md.
 *
 * Only the public (browser-safe) values live here. The service-role key is
 * server-only and must never be imported into client code.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** True when both public Supabase env vars are present. */
export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}
