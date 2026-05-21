-- Enable RLS and allow authenticated/anon users to read members
alter table members enable row level security;

create policy "Allow read access to members"
  on members
  for select
  to anon, authenticated
  using (true);
