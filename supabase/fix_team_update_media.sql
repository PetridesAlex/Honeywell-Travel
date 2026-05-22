-- =============================================================================
-- Team update: image_url, link_url + Storage bucket "team-media"
-- Run in Supabase Dashboard → SQL Editor → Run (after fix_team_hub.sql)
-- =============================================================================

-- 1) Database columns (for saving posts with image/link)
alter table public.team_updates
  add column if not exists image_url text,
  add column if not exists link_url text;

-- 2) Storage bucket (fixes "Bucket not found" on Upload image)
insert into storage.buckets (id, name, public)
values ('team-media', 'team-media', true)
on conflict (id) do update set public = true;

-- Optional limits (skip if your project errors on these columns)
do $$
begin
  update storage.buckets
  set
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  where id = 'team-media';
exception when others then
  null;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Authenticated upload team-media'
  ) then
    create policy "Authenticated upload team-media"
      on storage.objects for insert to authenticated
      with check (bucket_id = 'team-media');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Public read team-media'
  ) then
    create policy "Public read team-media"
      on storage.objects for select to public
      using (bucket_id = 'team-media');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Authenticated update team-media'
  ) then
    create policy "Authenticated update team-media"
      on storage.objects for update to authenticated
      using (bucket_id = 'team-media') with check (bucket_id = 'team-media');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Authenticated delete team-media'
  ) then
    create policy "Authenticated delete team-media"
      on storage.objects for delete to authenticated
      using (bucket_id = 'team-media');
  end if;
end $$;
