create table if not exists password_reset_tokens (
  token      text primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '1 hour'),
  used_at    timestamptz
);

-- Only the service role (server.js) needs to touch this table — no RLS needed for anon/user access.
alter table password_reset_tokens enable row level security;
