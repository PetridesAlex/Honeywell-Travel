-- Optional images for corporate feedback forms

alter table public.feedback_campaigns
  add column if not exists cover_image_url text;

alter table public.feedback_questions
  add column if not exists image_url text;
