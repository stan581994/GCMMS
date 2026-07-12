-- Add 'secretary' to the allowed roles in app_users
alter table app_users
  drop constraint if exists app_users_role_check;

alter table app_users
  add constraint app_users_role_check
  check (role in ('admin', 'account_specialist', 'clerk', 'ministering', 'secretary'));

-- Update create_managed_user to allow secretary role
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

  if p_role not in ('account_specialist', 'clerk', 'ministering', 'secretary') then
    raise exception 'Invalid role: must be account_specialist, clerk, ministering, or secretary';
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

-- Secretary can read callings
create policy "Secretaries can read callings"
  on callings for select
  using (
    exists (select 1 from app_users where id = auth.uid() and role = 'secretary')
  );

-- Secretary can insert/update/delete callings
create policy "Secretaries can manage callings"
  on callings for all
  using (
    exists (select 1 from app_users where id = auth.uid() and role = 'secretary')
  )
  with check (
    exists (select 1 from app_users where id = auth.uid() and role = 'secretary')
  );

-- Secretary can read clerk_tasks (needed to see calling task status)
create policy "Secretaries can read clerk tasks"
  on clerk_tasks for select
  using (
    exists (select 1 from app_users where id = auth.uid() and role = 'secretary')
  );

-- Secretary can update clerk_tasks
create policy "Secretaries can update clerk tasks"
  on clerk_tasks for update
  using (
    exists (select 1 from app_users where id = auth.uid() and role = 'secretary')
  );
