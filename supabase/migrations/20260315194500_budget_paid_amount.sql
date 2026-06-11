alter table public.budget_items
add column if not exists amount_paid_cents integer not null default 0;

alter table public.budget_items
drop constraint if exists budget_items_amount_paid_cents_whole_euro_check;

alter table public.budget_items
add constraint budget_items_amount_paid_cents_whole_euro_check
check (
  amount_paid_cents >= 0
  and amount_paid_cents % 100 = 0
  and amount_paid_cents <= amount_cents
);

alter table public.budget_items
drop column if exists is_paid;
