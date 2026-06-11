create table if not exists public.vendor_checklist_statuses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vendor_key text not null,
  checked boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.vendor_checklist_statuses
drop constraint if exists vendor_checklist_statuses_vendor_key_check;

alter table public.vendor_checklist_statuses
add constraint vendor_checklist_statuses_vendor_key_check
check (
  vendor_key in (
    'trouwlocatie',
    'fotograaf',
    'videograaf',
    'juwelier',
    'ceremoniemeester',
    'babs',
    'trouwjurk',
    'trouwpak',
    'taart',
    'decoratie',
    'vervoer',
    'dj',
    'zanger'
  )
);

create unique index if not exists vendor_checklist_statuses_user_vendor_key_idx
on public.vendor_checklist_statuses (user_id, vendor_key);

create index if not exists vendor_checklist_statuses_user_id_idx
on public.vendor_checklist_statuses (user_id);

drop trigger if exists set_vendor_checklist_statuses_updated_at on public.vendor_checklist_statuses;
create trigger set_vendor_checklist_statuses_updated_at
before update on public.vendor_checklist_statuses
for each row execute function public.set_updated_at();

alter table public.vendor_checklist_statuses enable row level security;

drop policy if exists "vendor checklist statuses are private per user" on public.vendor_checklist_statuses;
create policy "vendor checklist statuses are private per user"
on public.vendor_checklist_statuses
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
