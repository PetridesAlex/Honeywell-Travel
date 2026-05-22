-- Task types for agent deadlines (check-in, payment, etc.)
alter table public.team_tasks
  add column if not exists task_type text not null default 'general';

create index if not exists idx_team_tasks_due on public.team_tasks(due_date);
create index if not exists idx_team_tasks_client on public.team_tasks(client_id);
create index if not exists idx_team_tasks_type on public.team_tasks(task_type);

notify pgrst, 'reload schema';
