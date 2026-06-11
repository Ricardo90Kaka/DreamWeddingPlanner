alter table public.todo_items
add column if not exists notes text;

update public.todo_items
set notes = ''
where notes is null;

alter table public.todo_items
alter column notes set default '';

alter table public.todo_items
alter column notes set not null;
