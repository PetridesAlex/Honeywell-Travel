-- Corporate travel feedback: campaigns, questions, secure tokens, responses

create table if not exists public.feedback_campaigns (
  id uuid primary key default gen_random_uuid(),
  company_name text not null default '',
  trip_name text not null default '',
  destination text,
  travel_date_start date,
  travel_date_end date,
  status text not null default 'draft' check (status in ('draft', 'active', 'closed')),
  notes text,
  corporate_group_id bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_feedback_campaigns_status on public.feedback_campaigns (status);
create index if not exists idx_feedback_campaigns_company on public.feedback_campaigns (lower(company_name));

create table if not exists public.feedback_questions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.feedback_campaigns (id) on delete cascade,
  question_type text not null default 'textarea' check (
    question_type in ('rating_stars', 'nps', 'text', 'textarea', 'yes_no', 'select')
  ),
  label text not null default '',
  options jsonb not null default '[]'::jsonb,
  sort_order int not null default 0,
  is_required boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_feedback_questions_campaign on public.feedback_questions (campaign_id, sort_order);

create table if not exists public.feedback_tokens (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.feedback_campaigns (id) on delete cascade,
  token text not null unique,
  expires_at timestamptz,
  is_active boolean not null default true,
  submission_count int not null default 0,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_feedback_tokens_token on public.feedback_tokens (token);
create index if not exists idx_feedback_tokens_campaign on public.feedback_tokens (campaign_id);

create table if not exists public.feedback_responses (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.feedback_campaigns (id) on delete cascade,
  token_id uuid not null references public.feedback_tokens (id) on delete cascade,
  traveler_name text not null default '',
  traveler_email text,
  overall_score numeric(3, 1),
  nps_score int check (nps_score is null or (nps_score >= 0 and nps_score <= 10)),
  answers jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now()
);

create index if not exists idx_feedback_responses_campaign on public.feedback_responses (campaign_id, submitted_at desc);
create index if not exists idx_feedback_responses_token on public.feedback_responses (token_id);

alter table public.feedback_campaigns enable row level security;
alter table public.feedback_questions enable row level security;
alter table public.feedback_tokens enable row level security;
alter table public.feedback_responses enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'feedback_campaigns' and policyname = 'Authenticated can read feedback_campaigns') then
    create policy "Authenticated can read feedback_campaigns" on public.feedback_campaigns for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'feedback_campaigns' and policyname = 'Authenticated can insert feedback_campaigns') then
    create policy "Authenticated can insert feedback_campaigns" on public.feedback_campaigns for insert to authenticated with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'feedback_campaigns' and policyname = 'Authenticated can update feedback_campaigns') then
    create policy "Authenticated can update feedback_campaigns" on public.feedback_campaigns for update to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'feedback_campaigns' and policyname = 'Authenticated can delete feedback_campaigns') then
    create policy "Authenticated can delete feedback_campaigns" on public.feedback_campaigns for delete to authenticated using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'feedback_questions' and policyname = 'Authenticated can read feedback_questions') then
    create policy "Authenticated can read feedback_questions" on public.feedback_questions for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'feedback_questions' and policyname = 'Authenticated can insert feedback_questions') then
    create policy "Authenticated can insert feedback_questions" on public.feedback_questions for insert to authenticated with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'feedback_questions' and policyname = 'Authenticated can update feedback_questions') then
    create policy "Authenticated can update feedback_questions" on public.feedback_questions for update to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'feedback_questions' and policyname = 'Authenticated can delete feedback_questions') then
    create policy "Authenticated can delete feedback_questions" on public.feedback_questions for delete to authenticated using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'feedback_tokens' and policyname = 'Authenticated can read feedback_tokens') then
    create policy "Authenticated can read feedback_tokens" on public.feedback_tokens for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'feedback_tokens' and policyname = 'Authenticated can insert feedback_tokens') then
    create policy "Authenticated can insert feedback_tokens" on public.feedback_tokens for insert to authenticated with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'feedback_tokens' and policyname = 'Authenticated can update feedback_tokens') then
    create policy "Authenticated can update feedback_tokens" on public.feedback_tokens for update to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'feedback_tokens' and policyname = 'Authenticated can delete feedback_tokens') then
    create policy "Authenticated can delete feedback_tokens" on public.feedback_tokens for delete to authenticated using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'feedback_responses' and policyname = 'Authenticated can read feedback_responses') then
    create policy "Authenticated can read feedback_responses" on public.feedback_responses for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'feedback_responses' and policyname = 'Authenticated can insert feedback_responses') then
    create policy "Authenticated can insert feedback_responses" on public.feedback_responses for insert to authenticated with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'feedback_responses' and policyname = 'Authenticated can update feedback_responses') then
    create policy "Authenticated can update feedback_responses" on public.feedback_responses for update to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'feedback_responses' and policyname = 'Authenticated can delete feedback_responses') then
    create policy "Authenticated can delete feedback_responses" on public.feedback_responses for delete to authenticated using (true);
  end if;
end $$;

-- Optional link to corporate_groups when that CRM table exists (run 20260524_corporate_groups.sql first).
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'corporate_groups'
  ) and not exists (
    select 1 from pg_constraint where conname = 'feedback_campaigns_corporate_group_id_fkey'
  ) then
    alter table public.feedback_campaigns
      add constraint feedback_campaigns_corporate_group_id_fkey
      foreign key (corporate_group_id) references public.corporate_groups (id) on delete set null;
  end if;
end $$;
