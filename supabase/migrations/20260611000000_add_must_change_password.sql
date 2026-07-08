-- Add must_change_password flag so new accounts are forced to change their password on first login
alter table app_users add column if not exists must_change_password boolean not null default false;

-- All existing users are already established — only new accounts created after this migration
-- will have must_change_password = true (set via the updated create_managed_user function below).

-- Update create_managed_user to insert with must_change_password = true
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

  insert into app_users (id, full_name, email, role, is_active, must_change_password)
  values (new_id, p_full_name, p_email, p_role, true, true);

  return json_build_object('id', new_id, 'email', p_email);
end;
$$;
