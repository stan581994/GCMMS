-- Auth users — password: GoldenCity
-- Safe to re-run: uses ON CONFLICT DO NOTHING
insert into auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, aud, role,
  confirmation_token, recovery_token,
  email_change_token_new, email_change,
  phone, phone_change, phone_change_token,
  email_change_token_current, reauthentication_token
) values
  (
    'b2000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'steven@gcw.org',
    crypt('GoldenCity', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    'authenticated', 'authenticated',
    '', '', '', '', null, '', '', '', ''
  ),
  (
    'b2000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'archie@gcw.org',
    crypt('GoldenCity', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    'authenticated', 'authenticated',
    '', '', '', '', null, '', '', '', ''
  ),
  (
    'b2000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'lehi@gcw.org',
    crypt('GoldenCity', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    'authenticated', 'authenticated',
    '', '', '', '', null, '', '', '', ''
  ),
  (
    'b2000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'saple@gcw.org',
    crypt('GoldenCity', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    'authenticated', 'authenticated',
    '', '', '', '', null, '', '', '', ''
  )
on conflict (id) do nothing;

-- Identity records (required for email/password sign-in)
insert into auth.identities (
  id, user_id, provider_id, provider, identity_data,
  last_sign_in_at, created_at, updated_at
) values
  (
    'b2000000-0000-0000-0000-000000000001',
    'b2000000-0000-0000-0000-000000000001',
    'steven@gcw.org', 'email',
    '{"sub":"b2000000-0000-0000-0000-000000000001","email":"steven@gcw.org"}',
    now(), now(), now()
  ),
  (
    'b2000000-0000-0000-0000-000000000002',
    'b2000000-0000-0000-0000-000000000002',
    'archie@gcw.org', 'email',
    '{"sub":"b2000000-0000-0000-0000-000000000002","email":"archie@gcw.org"}',
    now(), now(), now()
  ),
  (
    'b2000000-0000-0000-0000-000000000003',
    'b2000000-0000-0000-0000-000000000003',
    'lehi@gcw.org', 'email',
    '{"sub":"b2000000-0000-0000-0000-000000000003","email":"lehi@gcw.org"}',
    now(), now(), now()
  ),
  (
    'b2000000-0000-0000-0000-000000000004',
    'b2000000-0000-0000-0000-000000000004',
    'saple@gcw.org', 'email',
    '{"sub":"b2000000-0000-0000-0000-000000000004","email":"saple@gcw.org"}',
    now(), now(), now()
  )
on conflict (provider_id, provider) do nothing;

-- App user profiles
insert into app_users (id, full_name, email, role, is_active) values
  ('b2000000-0000-0000-0000-000000000001', 'Steven', 'steven@gcw.org', 'admin', true),
  ('b2000000-0000-0000-0000-000000000002', 'Archie', 'archie@gcw.org', 'clerk', true),
  ('b2000000-0000-0000-0000-000000000003', 'Lehi', 'lehi@gcw.org', 'clerk', true),
  ('b2000000-0000-0000-0000-000000000004', 'Saple', 'saple@gcw.org', 'ministering', true)
on conflict (id) do nothing;
