-- ============================================================================
-- Security & performance hardening — clears Supabase advisor findings.
--   * handle_new_user() must not be a callable RPC for public roles
--   * every owner RLS policy should evaluate auth.uid() once per query
--   * add covering indexes for the foreign keys flagged as unindexed
-- ============================================================================

-- 1) handle_new_user() is a SECURITY DEFINER trigger function; revoke EXECUTE so
--    it cannot be invoked as /rest/v1/rpc/handle_new_user. The trigger on
--    auth.users still fires — triggers do not require an EXECUTE grant.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- 2) Covering indexes for the unindexed foreign keys.
create index if not exists idx_content_changes_resolved_by on public.content_changes(resolved_by);
create index if not exists idx_lesson_progress_lesson      on public.lesson_progress(lesson_id);
create index if not exists idx_mix_submissions_track       on public.mix_submissions(track_id);
create index if not exists idx_mix_submissions_user        on public.mix_submissions(user_id);
create index if not exists idx_srs_reviews_user            on public.srs_reviews(user_id);
create index if not exists idx_track_likes_track           on public.track_likes(track_id);
create index if not exists idx_user_achievements_code      on public.user_achievements(code);

-- 3) Wrap auth.uid() in a scalar subselect (evaluated once per query, not per
--    row) on every owner-scoped policy. Recreate each policy in place.
drop policy if exists "own profile"      on public.profiles;
create policy "own profile" on public.profiles
  for all using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "own progress"     on public.lesson_progress;
create policy "own progress" on public.lesson_progress
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "own srs items"    on public.srs_items;
create policy "own srs items" on public.srs_items
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "own srs reviews"  on public.srs_reviews;
create policy "own srs reviews" on public.srs_reviews
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "own xp"           on public.xp_events;
create policy "own xp" on public.xp_events
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "own achievements" on public.user_achievements;
create policy "own achievements" on public.user_achievements
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "own likes"        on public.track_likes;
create policy "own likes" on public.track_likes
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "own submissions"  on public.mix_submissions;
create policy "own submissions" on public.mix_submissions
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "own subscription" on public.subscriptions;
create policy "own subscription" on public.subscriptions
  for select using ((select auth.uid()) = user_id);

drop policy if exists "tracks owner write"  on public.tracks;
create policy "tracks owner write" on public.tracks
  for insert with check ((select auth.uid()) = user_id);

drop policy if exists "tracks owner update" on public.tracks;
create policy "tracks owner update" on public.tracks
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "tracks owner delete" on public.tracks;
create policy "tracks owner delete" on public.tracks
  for delete using ((select auth.uid()) = user_id);
