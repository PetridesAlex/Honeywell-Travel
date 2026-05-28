-- Add company contact fields to service profiles.

alter table public.corporate_service_profiles add column if not exists company_name text;
alter table public.corporate_service_profiles add column if not exists contact_name text;
alter table public.corporate_service_profiles add column if not exists email text;
alter table public.corporate_service_profiles add column if not exists phone text;
alter table public.corporate_service_profiles add column if not exists country text default 'Cyprus';
