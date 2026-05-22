-- Store lead first and last name separately (surname = last_name in UI).

alter table if exists public.leads
  add column if not exists first_name text;

alter table if exists public.leads
  add column if not exists last_name text;

create index if not exists idx_leads_first_name on public.leads(first_name);
create index if not exists idx_leads_last_name on public.leads(last_name);
