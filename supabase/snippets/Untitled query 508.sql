create table if not exists members (
  id bigint generated always as identity primary key,
  preferred_name text not null,
  address_street1 text,
  address_street2 text,
  address_city text,
  created_at timestamptz default now()
);
