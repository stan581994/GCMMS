-- Add email column (not in original table migration which is already on prod)
alter table app_users add column if not exists email text;

-- SECURITY DEFINER helper: check if the caller is an admin without going through RLS
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from app_users where id = auth.uid() and role = 'admin'
  )
$$;

-- Allow admins to update any user profile (role changes, deactivate/reactivate)
create policy "Admins can update profiles"
  on app_users for update
  using (is_admin());

-- Allow admins to insert new user profiles
create policy "Admins can insert profiles"
  on app_users for insert
  with check (is_admin());

-- Create a new managed user (auth.users + auth.identities + app_users) — admin only
create or replace function create_managed_user(
  p_email    text,
  p_password text,
  p_full_name text,
  p_role     text
)
returns json
language plpgsql
security definer
as $$
declare
  new_id uuid := gen_random_uuid();
begin
  if not is_admin() then
    raise exception 'Unauthorized: admin role required';
  end if;

  if p_role not in ('account_specialist', 'clerk', 'ministering') then
    raise exception 'Invalid role: must be account_specialist, clerk, or ministering';
  end if;

  insert into auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, aud, role,
    confirmation_token, recovery_token,
    email_change_token_new, email_change,
    phone, phone_change, phone_change_token,
    email_change_token_current, reauthentication_token
  ) values (
    new_id, '00000000-0000-0000-0000-000000000000',
    p_email, crypt(p_password, gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    'authenticated', 'authenticated',
    '', '', '', '', null, '', '', '', ''
  );

  insert into auth.identities (
    id, user_id, provider_id, provider, identity_data,
    last_sign_in_at, created_at, updated_at
  ) values (
    new_id, new_id, p_email, 'email',
    json_build_object('sub', new_id::text, 'email', p_email),
    now(), now(), now()
  );

  insert into app_users (id, full_name, email, role, is_active)
  values (new_id, p_full_name, p_email, p_role, true);

  return json_build_object('id', new_id, 'email', p_email);
end;
$$;
