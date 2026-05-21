-- Reset: remove all existing auth users (cascades to identities and app_users)
delete from auth.users;

-- Auth users — password: GoldenCity
insert into auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, aud, role
) values
  (
    'b2000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'steven@gcw.org',
    crypt('GoldenCity', gen_salt('bf')),
    now(), now(), now(),
    '{}', '{}',
    'authenticated', 'authenticated'
  ),
  (
    'b2000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'archie@gcw.org',
    crypt('GoldenCity', gen_salt('bf')),
    now(), now(), now(),
    '{}', '{}',
    'authenticated', 'authenticated'
  ),
  (
    'b2000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'lehi@gcw.org',
    crypt('GoldenCity', gen_salt('bf')),
    now(), now(), now(),
    '{}', '{}',
    'authenticated', 'authenticated'
  ),
  (
    'b2000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'saple@gcw.org',
    crypt('GoldenCity', gen_salt('bf')),
    now(), now(), now(),
    '{}', '{}',
    'authenticated', 'authenticated'
  );

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
  );

-- App user profiles
insert into app_users (id, full_name, role, is_active) values
  ('b2000000-0000-0000-0000-000000000001', 'Steven', 'admin', true),
  ('b2000000-0000-0000-0000-000000000002', 'Archie', 'clerk', true),
  ('b2000000-0000-0000-0000-000000000003', 'Lehi', 'clerk', true),
  ('b2000000-0000-0000-0000-000000000004', 'Saple', 'ministering', true);
