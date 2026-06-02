create table public.child_record_tasks (
  id               bigint generated always as identity primary key,
  child_record_id  bigint      not null references public.child_records(id) on delete cascade,
  task_type        text        not null check (task_type in ('child_record_created')),
  description      text        not null,
  is_complete      boolean     not null default false,
  completed_at     timestamptz null,
  created_by       uuid        not null references auth.users(id) on delete set null,
  created_at       timestamptz not null default now()
);

create index child_record_tasks_is_complete_idx on public.child_record_tasks(is_complete);
