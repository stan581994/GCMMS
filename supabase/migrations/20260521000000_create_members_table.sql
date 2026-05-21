drop table if exists members;

create table members (
  id bigint generated always as identity primary key,
  preferred_name text not null,
  address_street1 text,
  address_street2 text,
  address_city text,
  status text default null check (status in ('Active', 'Unknown', 'Transferred', 'Moved Out')),
  new_address text default null,
  assigned_person text default null,
  created_at timestamptz default now(),
  updated_at timestamptz default null
);
