-- Allow authenticated users to update member records.
-- App-level role checks (canEdit / canEditStatusOnly) control
-- which fields each user can actually change in the UI.
create policy "Allow authenticated users to update members"
  on members
  for update
  to authenticated
  using (true)
  with check (true);
