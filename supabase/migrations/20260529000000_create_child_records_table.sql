create table public.child_records (
  id                        bigint generated always as identity primary key,

  -- Individual Information
  child_name                text         not null,
  gender                    text         not null check (gender in ('male', 'female')),
  birth_date                date         not null,
  place_of_birth            text         not null,
  born_in_covenant          boolean      not null default false,
  address                   text         null,

  -- Parents
  father_name               text         null,
  father_is_member          boolean      not null default false,
  father_record_or_birthdate text        null,
  mother_maiden_name        text         null,
  mother_is_member          boolean      not null default false,
  mother_record_or_birthdate text        null,
  parents_ward_branch       text         null,
  parents_unit_number       text         null,
  guardian_name             text         null,
  guardian_is_member        boolean      not null default false,
  guardian_record_or_birthdate text      null,

  -- Blessing Information
  blessing_date             date         null,
  blessing_performer_name   text         null,
  blessing_priesthood_office text        null,
  blessing_performer_record_or_birthdate text null,

  created_by                uuid         not null references auth.users(id) on delete restrict,
  created_at                timestamptz  not null default now(),
  updated_at                timestamptz  not null default now()
);

create index child_records_child_name_idx on public.child_records(child_name);
create index child_records_created_at_idx on public.child_records(created_at);
