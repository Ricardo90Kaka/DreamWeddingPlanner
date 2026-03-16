create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.budget_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  amount_cents integer not null check (amount_cents >= 0),
  is_final boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  dinner_included boolean not null default false,
  dietary_notes text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.todo_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  due_date date,
  completed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists budget_items_user_id_idx on public.budget_items (user_id);
create index if not exists guests_user_id_idx on public.guests (user_id);
create index if not exists todo_items_user_id_idx on public.todo_items (user_id);

drop trigger if exists set_budget_items_updated_at on public.budget_items;
create trigger set_budget_items_updated_at
before update on public.budget_items
for each row execute function public.set_updated_at();

drop trigger if exists set_guests_updated_at on public.guests;
create trigger set_guests_updated_at
before update on public.guests
for each row execute function public.set_updated_at();

drop trigger if exists set_todo_items_updated_at on public.todo_items;
create trigger set_todo_items_updated_at
before update on public.todo_items
for each row execute function public.set_updated_at();

alter table public.budget_items enable row level security;
alter table public.guests enable row level security;
alter table public.todo_items enable row level security;

drop policy if exists "budget items are private per user" on public.budget_items;
create policy "budget items are private per user"
on public.budget_items
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "guests are private per user" on public.guests;
create policy "guests are private per user"
on public.guests
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "todo items are private per user" on public.todo_items;
create policy "todo items are private per user"
on public.todo_items
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
