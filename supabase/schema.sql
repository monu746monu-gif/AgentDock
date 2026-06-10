-- AgentDock Supabase schema
-- Run this in the Supabase SQL editor after creating a project.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamp with time zone default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text default '',
  tech_stack text default '',
  repo_url text default '',
  run_commands text default '',
  deployment_notes text default '',
  current_tasks text default '',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  content text not null,
  tags text[] default '{}',
  importance text default 'Medium',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text default '',
  instructions text default '',
  target_agent text default 'General',
  category text default 'General',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.secrets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  name text not null,
  provider text default 'Other',
  masked_value text not null,
  reference text not null,
  notes text default '',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text default 'Custom',
  provider text default 'Other',
  description text default '',
  project_id uuid references public.projects(id) on delete set null,
  memory_access text default 'No memory access',
  selected_memory_ids text[] default '{}',
  skills_access text default 'No skills access',
  selected_skill_ids text[] default '{}',
  secrets_access text default 'No secrets access',
  selected_secret_ids text[] default '{}',
  status text default 'Active',
  notes text default '',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  agent_id uuid references public.agents(id) on delete set null,
  title text not null,
  task text default '',
  prompt text default '',
  target_agent text default 'General',
  type text default 'Prompt',
  status text default 'Draft',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.generated_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  file_type text not null,
  file_name text not null,
  content text default '',
  created_at timestamp with time zone default now()
);

create table if not exists public.handoffs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  source_agent_name text not null,
  export_target text not null,
  project_id uuid references public.projects(id) on delete set null,
  content text default '',
  included_sections jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.memories enable row level security;
alter table public.skills enable row level security;
alter table public.secrets enable row level security;
alter table public.sessions enable row level security;
alter table public.agents enable row level security;
alter table public.generated_files enable row level security;
alter table public.handoffs enable row level security;

create policy "profiles select own" on public.profiles for select using (auth.uid() = id);
create policy "profiles update own" on public.profiles for update using (auth.uid() = id);

-- Reusable RLS policies: each table stores user_id and only exposes owned rows.
create policy "projects select own" on public.projects for select using (auth.uid() = user_id);
create policy "projects insert own" on public.projects for insert with check (auth.uid() = user_id);
create policy "projects update own" on public.projects for update using (auth.uid() = user_id);
create policy "projects delete own" on public.projects for delete using (auth.uid() = user_id);

create policy "memories select own" on public.memories for select using (auth.uid() = user_id);
create policy "memories insert own" on public.memories for insert with check (auth.uid() = user_id);
create policy "memories update own" on public.memories for update using (auth.uid() = user_id);
create policy "memories delete own" on public.memories for delete using (auth.uid() = user_id);

create policy "skills select own" on public.skills for select using (auth.uid() = user_id);
create policy "skills insert own" on public.skills for insert with check (auth.uid() = user_id);
create policy "skills update own" on public.skills for update using (auth.uid() = user_id);
create policy "skills delete own" on public.skills for delete using (auth.uid() = user_id);

create policy "secrets select own" on public.secrets for select using (auth.uid() = user_id);
create policy "secrets insert own" on public.secrets for insert with check (auth.uid() = user_id);
create policy "secrets update own" on public.secrets for update using (auth.uid() = user_id);
create policy "secrets delete own" on public.secrets for delete using (auth.uid() = user_id);

create policy "sessions select own" on public.sessions for select using (auth.uid() = user_id);
create policy "sessions insert own" on public.sessions for insert with check (auth.uid() = user_id);
create policy "sessions update own" on public.sessions for update using (auth.uid() = user_id);
create policy "sessions delete own" on public.sessions for delete using (auth.uid() = user_id);

create policy "agents select own" on public.agents for select using (auth.uid() = user_id);
create policy "agents insert own" on public.agents for insert with check (auth.uid() = user_id);
create policy "agents update own" on public.agents for update using (auth.uid() = user_id);
create policy "agents delete own" on public.agents for delete using (auth.uid() = user_id);

create policy "generated_files select own" on public.generated_files for select using (auth.uid() = user_id);
create policy "generated_files insert own" on public.generated_files for insert with check (auth.uid() = user_id);
create policy "generated_files update own" on public.generated_files for update using (auth.uid() = user_id);
create policy "generated_files delete own" on public.generated_files for delete using (auth.uid() = user_id);

create policy "handoffs select own" on public.handoffs for select using (auth.uid() = user_id);
create policy "handoffs insert own" on public.handoffs for insert with check (auth.uid() = user_id);
create policy "handoffs update own" on public.handoffs for update using (auth.uid() = user_id);
create policy "handoffs delete own" on public.handoffs for delete using (auth.uid() = user_id);
