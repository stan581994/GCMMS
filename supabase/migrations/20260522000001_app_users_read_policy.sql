-- Allow any authenticated user to read all app_user profiles.
-- Required so features like "Assigned to Person" can list users by role.
create policy "Authenticated users can read all profiles"
  on app_users for select
  using (auth.role() = 'authenticated');
