create table app_users (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  role text not null check (role in ('admin', 'account_specialist', 'clerk', 'ministering')),
  is_active boolean not null default true,
  created_at timestamptz default now()
);

alter table app_users enable row level security;

-- Users can always read their own profile
create policy "Users can read own profile"
  on app_users for select
  using (auth.uid() = id);

