-- Client categories: individual vs group travelers (+ optional corporate partner link)

alter table public.clients
  add column if not exists client_type text not null default 'individual'
  check (client_type in ('individual', 'group'));

alter table public.clients
  add column if not exists corporate_group_id bigint
  references public.corporate_groups(id) on delete set null;

create index if not exists idx_clients_type on public.clients(client_type);
create index if not exists idx_clients_corporate_group on public.clients(corporate_group_id);
