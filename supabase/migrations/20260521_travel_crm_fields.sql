-- Travel-agency CRM fields: trip type, priority, package interest.

alter table if exists public.leads
  add column if not exists trip_type text;

alter table if exists public.leads
  add column if not exists priority text default 'Normal';

alter table if exists public.leads
  add column if not exists package_interest text;

create index if not exists idx_leads_trip_type on public.leads(trip_type);
create index if not exists idx_leads_priority on public.leads(priority);
