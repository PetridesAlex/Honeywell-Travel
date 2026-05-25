-- Link voucher receivers to CRM clients

alter table public.voucher_receivers
  add column if not exists client_id bigint references public.clients(id) on delete set null;

create index if not exists idx_voucher_receivers_client on public.voucher_receivers(client_id);
