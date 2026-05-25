CREATE TABLE pending_accounts (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   integer     NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  added_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (member_id)
);

ALTER TABLE pending_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read for authenticated" ON pending_accounts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insert for authenticated" ON pending_accounts
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow delete for authenticated" ON pending_accounts
  FOR DELETE TO authenticated USING (true);
