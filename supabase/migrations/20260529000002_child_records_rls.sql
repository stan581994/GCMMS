-- child_records RLS
alter table public.child_records enable row level security;

create policy "child_records_select"
  on public.child_records for select
  to authenticated
  using (true);

create policy "child_records_insert"
  on public.child_records for insert
  to authenticated
  with check (
    exists (
      select 1 from public.app_users
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "child_records_update"
  on public.child_records for update
  to authenticated
  using (
    exists (
      select 1 from public.app_users
      where id = auth.uid() and role = 'admin'
    )
  );

-- child_record_tasks RLS
alter table public.child_record_tasks enable row level security;

create policy "child_record_tasks_select_admin"
  on public.child_record_tasks for select
  to authenticated
  using (
    exists (
      select 1 from public.app_users
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "child_record_tasks_select_clerk"
  on public.child_record_tasks for select
  to authenticated
  using (
    exists (
      select 1 from public.app_users
      where id = auth.uid() and role = 'clerk'
    )
  );

create policy "child_record_tasks_insert"
  on public.child_record_tasks for insert
  to authenticated
  with check (
    exists (
      select 1 from public.app_users
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "child_record_tasks_update"
  on public.child_record_tasks for update
  to authenticated
  using (
    exists (
      select 1 from public.app_users
      where id = auth.uid() and role = 'clerk'
    )
  );
