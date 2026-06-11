alter table public.guests
add column if not exists attendance_status text not null default 'unknown';

update public.guests
set attendance_status = 'unknown'
where attendance_status is null;

alter table public.guests
drop constraint if exists guests_attendance_status_check;

alter table public.guests
add constraint guests_attendance_status_check
check (attendance_status in ('yes', 'no', 'unknown'));
