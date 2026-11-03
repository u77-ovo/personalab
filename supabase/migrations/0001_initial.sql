-- PersonaLab 2.0 schema draft. Not yet applied to a remote Supabase project.
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table public.ideas (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  brief_json jsonb not null, status text not null check (status in ('draft','analyzing','ready_for_review','accepted','archived')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index ideas_owner_idx on public.ideas(owner_id);

create table public.idea_assessments (
  id uuid primary key default gen_random_uuid(), idea_id uuid not null references public.ideas(id) on delete cascade,
  version integer not null check (version > 0), rubric_version text not null, scores_json jsonb not null,
  evidence_level text not null, created_at timestamptz not null default now(), unique(idea_id, version)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  source_idea_id uuid references public.ideas(id) on delete set null, title text not null,
  description text not null default '', target_users text not null default '', created_at timestamptz not null default now()
);
create index projects_owner_idx on public.projects(owner_id);

create table public.prototype_versions (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
  version_label text not null, storage_path text, created_at timestamptz not null default now(), unique(project_id, version_label)
);
create table public.research_rounds (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
  label text not null, objective text not null, status text not null default 'draft', created_at timestamptz not null default now(), unique(project_id, label)
);
create table public.research_tasks (
  id uuid primary key default gen_random_uuid(), round_id uuid not null references public.research_rounds(id) on delete cascade,
  name text not null, instruction text not null, success_criteria_json jsonb not null
);
create table public.personas (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
  config_json jsonb not null, is_template boolean not null default false
);
create table public.simulation_runs (
  id uuid primary key default gen_random_uuid(), round_id uuid not null references public.research_rounds(id) on delete cascade,
  prototype_id uuid references public.prototype_versions(id) on delete set null, state text not null, input_json jsonb not null,
  result_json jsonb, model text, created_at timestamptz not null default now()
);
create table public.issues (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
  round_id uuid not null references public.research_rounds(id) on delete cascade, title text not null,
  status text not null default 'unverified_ai_hypothesis', detail_json jsonb not null, created_at timestamptz not null default now()
);
create table public.research_sources (
  id uuid primary key default gen_random_uuid(), round_id uuid not null references public.research_rounds(id) on delete cascade,
  participant_code text not null, storage_path text, source_text text, created_at timestamptz not null default now()
);
create table public.evidence (
  id uuid primary key default gen_random_uuid(), source_id uuid not null references public.research_sources(id) on delete cascade,
  exact_quote text not null, start_offset integer not null, end_offset integer not null, line_number integer,
  tag text, review_status text not null default 'pending', created_at timestamptz not null default now(),
  check (start_offset >= 0 and end_offset > start_offset)
);
create table public.issue_evidence_links (
  issue_id uuid not null references public.issues(id) on delete cascade,
  evidence_id uuid not null references public.evidence(id) on delete cascade,
  relation text not null check (relation in ('supports','contradicts','mixed','irrelevant','uncertain')),
  rationale text, primary key(issue_id,evidence_id)
);
create table public.action_items (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
  issue_id uuid not null references public.issues(id) on delete cascade, title text not null,
  status text not null default 'proposed', detail_json jsonb not null, created_at timestamptz not null default now()
);
create table public.reports (
  id uuid primary key default gen_random_uuid(), round_id uuid not null references public.research_rounds(id) on delete cascade,
  content_md text not null, generated_at timestamptz not null default now()
);
create table public.audit_events (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null, entity_id uuid not null, changes_json jsonb not null, created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.ideas enable row level security;
alter table public.projects enable row level security;

create policy profiles_self on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy ideas_owner on public.ideas for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy projects_owner on public.projects for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Child-table RLS policies must be added and tested before production use.
