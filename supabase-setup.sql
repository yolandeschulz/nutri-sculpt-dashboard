-- nutri-SCULPT Member App access table
-- Run this in the Supabase SQL editor after creating the project.

create table if not exists public.member_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  access_status text not null default 'inactive',
  subscription_status text not null default 'inactive',
  plan_name text default 'R99/month',
  paystack_customer_code text,
  paystack_subscription_code text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.member_access enable row level security;

drop policy if exists "Users can read their own member access" on public.member_access;
create policy "Users can read their own member access"
on public.member_access
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create their own inactive member access" on public.member_access;
create policy "Users can create their own inactive member access"
on public.member_access
for insert
to authenticated
with check (auth.uid() = user_id);

create or replace function public.create_member_access_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.member_access (user_id, email, access_status, subscription_status)
  values (new.id, new.email, 'inactive', 'inactive')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists create_member_access_after_signup on auth.users;
create trigger create_member_access_after_signup
after insert on auth.users
for each row execute function public.create_member_access_for_new_user();

-- Manual Phase 1 approval example:
-- update public.member_access
-- set access_status = 'active', subscription_status = 'active', updated_at = now()
-- where email = 'client@example.com';
