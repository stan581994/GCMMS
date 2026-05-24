-- callings RLS
alter table public.callings enable row level security;

create policy "callings_select"
  on public.callings for select
  to authenticated
  using (true);

create policy "callings_insert"
  on public.callings for insert
  to authenticated
  with check (
    exists (
      select 1 from public.app_users
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "callings_update"
  on public.callings for update
  to authenticated
  using (
    exists (
      select 1 from public.app_users
      where id = auth.uid() and role = 'admin'
    )
  );

-- clerk_tasks RLS
alter table public.clerk_tasks enable row level security;

create policy "clerk_tasks_select_admin"
  on public.clerk_tasks for select
  to authenticated
  using (
    exists (
      select 1 from public.app_users
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "clerk_tasks_select_clerk"
  on public.clerk_tasks for select
  to authenticated
  using (
    exists (
      select 1 from public.app_users
      where id = auth.uid() and role = 'clerk'
    )
  );

create policy "clerk_tasks_insert"
  on public.clerk_tasks for insert
  to authenticated
  with check (
    exists (
      select 1 from public.app_users
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "clerk_tasks_update"
  on public.clerk_tasks for update
  to authenticated
  using (
    exists (
      select 1 from public.app_users
      where id = auth.uid() and role = 'clerk'
    )
  );
