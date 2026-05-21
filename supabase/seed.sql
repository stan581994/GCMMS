-- Seed local auth users
-- Password for all test accounts: Ward@2024!

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
    'a1000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'admin@ward.org',
    crypt('Ward@2024!', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    'authenticated', 'authenticated',
    '', '', '', '', null, '', '', '', ''
  ),
  (
    'a1000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'specialist@ward.org',
    crypt('Ward@2024!', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    'authenticated', 'authenticated',
    '', '', '', '', null, '', '', '', ''
  ),
  (
    'a1000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'clerk@ward.org',
    crypt('Ward@2024!', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    'authenticated', 'authenticated',
    '', '', '', '', null, '', '', '', ''
  ),
  (
    'a1000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'ministering@ward.org',
    crypt('Ward@2024!', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    'authenticated', 'authenticated',
    '', '', '', '', null, '', '', '', ''
  )
on conflict (id) do nothing;

-- Each auth user needs an identity record too
insert into auth.identities (
  id, user_id, provider_id, provider, identity_data,
  last_sign_in_at, created_at, updated_at
) values
  (
    'a1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    'admin@ward.org', 'email',
    '{"sub":"a1000000-0000-0000-0000-000000000001","email":"admin@ward.org"}',
    now(), now(), now()
  ),
  (
    'a1000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000002',
    'specialist@ward.org', 'email',
    '{"sub":"a1000000-0000-0000-0000-000000000002","email":"specialist@ward.org"}',
    now(), now(), now()
  ),
  (
    'a1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000003',
    'clerk@ward.org', 'email',
    '{"sub":"a1000000-0000-0000-0000-000000000003","email":"clerk@ward.org"}',
    now(), now(), now()
  ),
  (
    'a1000000-0000-0000-0000-000000000004',
    'a1000000-0000-0000-0000-000000000004',
    'ministering@ward.org', 'email',
    '{"sub":"a1000000-0000-0000-0000-000000000004","email":"ministering@ward.org"}',
    now(), now(), now()
  )
on conflict (id) do nothing;

-- Seed app_users profiles
insert into app_users (id, full_name, role, is_active) values
  ('a1000000-0000-0000-0000-000000000001', 'Rodrigo Santos', 'admin', true),
  ('a1000000-0000-0000-0000-000000000002', 'Maria Dela Cruz', 'account_specialist', true),
  ('a1000000-0000-0000-0000-000000000003', 'Jose Reyes', 'clerk', true),
  ('a1000000-0000-0000-0000-000000000004', 'Ana Villanueva', 'ministering', true)
on conflict (id) do nothing;
