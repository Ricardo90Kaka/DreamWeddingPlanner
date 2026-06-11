alter table public.budget_items
add column if not exists is_paid boolean not null default false;
