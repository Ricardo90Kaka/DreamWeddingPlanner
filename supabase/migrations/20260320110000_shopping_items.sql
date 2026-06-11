create table if not exists public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  checked boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists shopping_items_user_id_idx on public.shopping_items (user_id);

drop trigger if exists set_shopping_items_updated_at on public.shopping_items;
create trigger set_shopping_items_updated_at
before update on public.shopping_items
for each row execute function public.set_updated_at();

alter table public.shopping_items enable row level security;

drop policy if exists "shopping items are private per user" on public.shopping_items;
create policy "shopping items are private per user"
on public.shopping_items
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
