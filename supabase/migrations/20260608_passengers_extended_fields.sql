-- Extra passenger fields for full Excel imports

alter table public.passengers
  add column if not exists date_of_issue date,
  add column if not exists category text,
  add column if not exists national_id text;

create index if not exists idx_passengers_national_id on public.passengers(national_id);

notify pgrst, 'reload schema';
