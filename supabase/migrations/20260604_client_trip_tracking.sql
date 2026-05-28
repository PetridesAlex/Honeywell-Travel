-- Track when a client completed a trip (lead marked Confirmed)
alter table public.leads
  add column if not exists trip_completed_date date;

create index if not exists idx_leads_client_trip_completed
  on public.leads (client_id, trip_completed_date desc);

-- Backfill confirmed leads without a completion date
update public.leads
set trip_completed_date = coalesce(
  trip_completed_date,
  nullif(substring(travel_dates from '\d{4}-\d{2}-\d{2}'), '')::date,
  created_at::date
)
where status = 'Confirmed'
  and trip_completed_date is null;

notify pgrst, 'reload schema';
