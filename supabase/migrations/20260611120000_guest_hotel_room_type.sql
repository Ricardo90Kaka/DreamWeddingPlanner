alter table public.guests
add column if not exists hotel_status text not null default 'unknown';

update public.guests
set hotel_status = 'unknown'
where hotel_status is null or hotel_status = 'yes';

alter table public.guests
drop constraint if exists guests_hotel_status_check;

alter table public.guests
add constraint guests_hotel_status_check
check (hotel_status in ('single', 'double', 'no', 'unknown'));
