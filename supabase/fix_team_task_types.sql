-- =============================================================================
-- Team task deadlines: adds task_type (check-in, payment, etc.)
-- Run once in Supabase → SQL Editor → Run
-- Safe to re-run. Fixes: "Could not find the 'task_type' column of 'team_tasks'"
-- =============================================================================

alter table public.team_tasks
  add column if not exists task_type text not null default 'general';

-- Backfill any nulls (should not happen with default)
update public.team_tasks
set task_type = 'general'
where task_type is null;

create index if not exists idx_team_tasks_due on public.team_tasks(due_date);
create index if not exists idx_team_tasks_client on public.team_tasks(client_id);
create index if not exists idx_team_tasks_type on public.team_tasks(task_type);

-- Refresh PostgREST so the API sees the new column immediately
notify pgrst, 'reload schema';
