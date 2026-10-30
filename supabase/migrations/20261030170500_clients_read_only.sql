set lock_timeout = '5s';

-- Browser clients only read; every table write goes through server actions with the service role.
revoke insert, update, delete, truncate on all tables in schema public from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke insert, update, delete, truncate on tables from anon, authenticated;

drop policy if exists "exercise_logs_insert_own" on public.exercise_logs;
drop policy if exists "exercise_logs_delete_own" on public.exercise_logs;
drop policy if exists "notifications_update_own" on public.notifications;

-- Students upload a single avatar named exactly "<user id>.<extension>".
drop policy if exists "avatars_manage_own" on storage.objects;
create policy "avatars_manage_own" on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'avatars'
    and name ~ ('^' || (select auth.uid())::text || '\.[a-z0-9]+$')
  )
  with check (
    bucket_id = 'avatars'
    and name ~ ('^' || (select auth.uid())::text || '\.[a-z0-9]+$')
  );
