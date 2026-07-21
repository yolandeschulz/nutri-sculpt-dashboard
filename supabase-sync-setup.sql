-- nutri-SCULPT cross-device sync
-- Run this once in the Supabase SQL editor.
-- Safe to re-run: it creates nothing twice and drops nothing you have.

create table if not exists public.dashboard_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by_device text
);

alter table public.dashboard_state enable row level security;

-- Each signed-in person can only ever see and change their own row.
-- The anon key in the app is public by design; these policies are the
-- actual security boundary. Never put a service_role key in the app.

drop policy if exists "own dashboard state select" on public.dashboard_state;
create policy "own dashboard state select"
on public.dashboard_state for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "own dashboard state insert" on public.dashboard_state;
create policy "own dashboard state insert"
on public.dashboard_state for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "own dashboard state update" on public.dashboard_state;
create policy "own dashboard state update"
on public.dashboard_state for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
