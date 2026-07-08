-- Confirmation tokens for account activation emails
create table if not exists confirmation_tokens (
  token      text primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  expires_at timestamptz default now() + interval '48 hours',
  used_at    timestamptz
);

-- Validate a confirmation token and activate the user's account
create or replace function confirm_account_token(p_token text)
returns json
language plpgsql
security definer
as $$
declare
  rec record;
begin
  select * into rec from confirmation_tokens where token = p_token;

  if not found then
    raise exception 'Invalid confirmation link.';
  end if;

  if rec.used_at is not null then
    raise exception 'This confirmation link has already been used.';
  end if;

  if rec.expires_at < now() then
    raise exception 'This confirmation link has expired.';
  end if;

  update app_users set is_active = true where id = rec.user_id;
  update confirmation_tokens set used_at = now() where token = p_token;

  return json_build_object('ok', true);
end;
$$;

-- Patch: new accounts default to inactive until email is confirmed
create or replace function create_managed_user(
  p_email     text,
  p_password  text,
  p_full_name text,
  p_role      text
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

  -- is_active = false until the user confirms via email
  insert into app_users (id, full_name, email, role, is_active)
  values (new_id, p_full_name, p_email, p_role, false);

  return json_build_object('id', new_id, 'email', p_email);
end;
$$;
