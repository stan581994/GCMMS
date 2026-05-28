CREATE TABLE activity_log (
  id BIGSERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  performed_by_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read activity log"
  ON activity_log FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert own activity"
  ON activity_log FOR INSERT TO authenticated
  WITH CHECK (performed_by = auth.uid());
