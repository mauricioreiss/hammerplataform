-- Profile changes go through server actions with the service role; clients must not write users rows.
drop policy if exists "users_update_own" on public.users;
revoke insert, update, delete, truncate on table public.users from anon, authenticated;

drop policy if exists "allow authenticated uploads 1qdy59v_0" on storage.objects;
drop policy if exists "allow authenticated uploads 1qdy59v_1" on storage.objects;
drop policy if exists "allow authenticated uploads 1qdy59v_2" on storage.objects;
drop policy if exists "allow authenticated uploads 1qdy59v_3" on storage.objects;

-- Students upload their own avatar as "<user id>.<extension>" from the browser.
create policy "avatars_manage_own" on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'avatars'
    and split_part(name, '.', 1) = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and split_part(name, '.', 1) = (select auth.uid())::text
  );

-- The trainer uploads exercise illustrations from the browser.
create policy "exercise_illustrations_manage_admin" on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'exercicios-illustracoes'
    and exists (
      select 1 from public.users
      where id = (select auth.uid()) and role = 'admin'
    )
  )
  with check (
    bucket_id = 'exercicios-illustracoes'
    and exists (
      select 1 from public.users
      where id = (select auth.uid()) and role = 'admin'
    )
  );
