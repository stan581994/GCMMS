ALTER TABLE pending_accounts ENABLE ROW LEVEL SECURITY;

  -- Allow authenticated users to read
  CREATE POLICY "Allow read for authenticated" ON pending_accounts
    FOR SELECT TO authenticated USING (true);

  -- Allow admin/clerk to insert
  CREATE POLICY "Allow insert for authenticated" ON pending_accounts
    FOR INSERT TO authenticated WITH CHECK (true);

  -- Allow admin/clerk to delete
  CREATE POLICY "Allow delete for authenticated" ON pending_accounts
    FOR DELETE TO authenticated USING (true);