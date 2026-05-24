create table public.callings (
  id             bigint generated always as identity primary key,
  member_id      bigint       not null references public.members(id) on delete restrict,
  position       text         not null,
  sustained_date date         null,
  is_set_apart   boolean      not null default false,
  released_date  date         null,
  status         text         not null default 'active'
                 check (status in ('active', 'released')),
  created_by     uuid         not null references auth.users(id) on delete set null,
  created_at     timestamptz  not null default now(),
  updated_at     timestamptz  not null default now()
);

create index callings_member_id_idx on public.callings(member_id);
create index callings_status_idx    on public.callings(status);
