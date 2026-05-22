-- Optional image and link on team news/updates

alter table public.team_updates
  add column if not exists image_url text,
  add column if not exists link_url text;
