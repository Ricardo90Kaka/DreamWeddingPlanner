update public.budget_items
set amount_cents = round(amount_cents / 100.0) * 100
where amount_cents % 100 <> 0;

alter table public.budget_items
drop constraint if exists budget_items_amount_cents_check;

alter table public.budget_items
drop constraint if exists budget_items_amount_cents_whole_euro_check;

alter table public.budget_items
add constraint budget_items_amount_cents_whole_euro_check
check (amount_cents >= 0 and amount_cents % 100 = 0);
