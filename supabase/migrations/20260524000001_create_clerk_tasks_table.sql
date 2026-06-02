create table public.clerk_tasks (
  id           bigint generated always as identity primary key,
  calling_id   bigint      not null references public.callings(id) on delete cascade,
  task_type    text        not null check (task_type in ('calling_assigned', 'calling_released')),
  description  text        not null,
  is_complete  boolean     not null default false,
  completed_at timestamptz null,
  created_by   uuid        not null references auth.users(id) on delete restrict,
  created_at   timestamptz not null default now()
);

create index clerk_tasks_is_complete_idx on public.clerk_tasks(is_complete);
