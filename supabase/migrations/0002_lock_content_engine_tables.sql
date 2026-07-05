-- ============================================================================
-- Lock down the content-engine tables (admin / service-role only).
--
-- The initial schema created content_sources, content_changes and kb_releases
-- WITHOUT row-level security, leaving them fully exposed to the anon key. These
-- tables are only ever written server-side by the content engine using the
-- service-role key (which bypasses RLS) and are never read from the browser.
-- Enabling RLS with NO anon/authenticated policies = deny-all to the public
-- roles while service_role keeps full access. Matches supabase/schema.md.
-- ============================================================================

alter table public.content_sources enable row level security;
alter table public.content_changes enable row level security;
alter table public.kb_releases     enable row level security;
