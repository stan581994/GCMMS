-- Allows any authenticated user to clear their own must_change_password flag.
-- SECURITY DEFINER bypasses RLS so the user doesn't need an update policy on app_users.
create or replace function clear_force_password_change()
returns void
language plpgsql
security definer
as $$
begin
  update app_users
  set must_change_password = false
  where id = auth.uid();
end;
$$;
