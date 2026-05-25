-- Run in Supabase SQL Editor if client_type / corporate_group_id columns are missing.

alter table public.clients
  add column if not exists client_type text not null default 'individual';

alter table public.clients
  drop constraint if exists clients_client_type_check;

alter table public.clients
  add constraint clients_client_type_check
  check (client_type in ('individual', 'group'));

alter table public.clients
  add column if not exists corporate_group_id bigint;

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'corporate_groups'
  ) then
    alter table public.clients
      drop constraint if exists clients_corporate_group_id_fkey;

    alter table public.clients
      add constraint clients_corporate_group_id_fkey
      foreign key (corporate_group_id) references public.corporate_groups(id) on delete set null;
  end if;
end $$;

create index if not exists idx_clients_type on public.clients(client_type);
create index if not exists idx_clients_corporate_group on public.clients(corporate_group_id);

update public.clients
set client_type = 'individual'
where client_type is null or client_type not in ('individual', 'group');

-- Refresh PostgREST schema cache so the API sees new columns immediately
notify pgrst, 'reload schema';
