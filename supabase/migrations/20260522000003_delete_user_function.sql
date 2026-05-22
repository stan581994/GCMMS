-- Allow admins to delete user profiles
create policy "Admins can delete profiles"
  on app_users for delete
  using (is_admin());

-- Delete a managed user (auth.identities + auth.users + app_users) — admin only
create or replace function delete_managed_user(p_user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  if not is_admin() then
    raise exception 'Unauthorized: admin role required';
  end if;

  delete from auth.identities where user_id = p_user_id;
  delete from auth.users where id = p_user_id;
  delete from app_users where id = p_user_id;
end;
$$;
