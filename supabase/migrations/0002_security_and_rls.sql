-- PersonaLab 2.0 security hardening.
-- Apply only after 0001_initial.sql. This migration has not been applied remotely yet.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.owns_idea(target_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.ideas where id = target_id and owner_id = (select auth.uid()));
$$;
create or replace function private.owns_project(target_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.projects where id = target_id and owner_id = (select auth.uid()));
$$;
create or replace function private.owns_prototype(target_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.prototype_versions pv join public.projects p on p.id = pv.project_id where pv.id = target_id and p.owner_id = (select auth.uid()));
$$;
create or replace function private.owns_round(target_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.research_rounds rr join public.projects p on p.id = rr.project_id where rr.id = target_id and p.owner_id = (select auth.uid()));
$$;
create or replace function private.owns_issue(target_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.issues i join public.projects p on p.id = i.project_id where i.id = target_id and p.owner_id = (select auth.uid()));
$$;
create or replace function private.owns_source(target_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(
    select 1 from public.research_sources rs
    join public.research_rounds rr on rr.id = rs.round_id
    join public.projects p on p.id = rr.project_id
    where rs.id = target_id and p.owner_id = (select auth.uid())
  );
$$;
create or replace function private.owns_evidence(target_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(
    select 1 from public.evidence e
    join public.research_sources rs on rs.id = e.source_id
    join public.research_rounds rr on rr.id = rs.round_id
    join public.projects p on p.id = rr.project_id
    where e.id = target_id and p.owner_id = (select auth.uid())
  );
$$;

revoke all on all functions in schema private from public;
grant execute on all functions in schema private to authenticated;

-- Ownership lookups are used by RLS policies; index every traversed foreign key.
create index if not exists idea_assessments_idea_idx on public.idea_assessments(idea_id);
create index if not exists prototype_versions_project_idx on public.prototype_versions(project_id);
create index if not exists research_rounds_project_idx on public.research_rounds(project_id);
create index if not exists research_tasks_round_idx on public.research_tasks(round_id);
create index if not exists personas_project_idx on public.personas(project_id);
create index if not exists simulation_runs_round_idx on public.simulation_runs(round_id);
create index if not exists simulation_runs_prototype_idx on public.simulation_runs(prototype_id);
create index if not exists issues_project_idx on public.issues(project_id);
create index if not exists issues_round_idx on public.issues(round_id);
create index if not exists research_sources_round_idx on public.research_sources(round_id);
create index if not exists evidence_source_idx on public.evidence(source_id);
create index if not exists issue_evidence_links_evidence_idx on public.issue_evidence_links(evidence_id);
create index if not exists action_items_project_idx on public.action_items(project_id);
create index if not exists action_items_issue_idx on public.action_items(issue_id);
create index if not exists reports_round_idx on public.reports(round_id);
create index if not exists audit_events_owner_idx on public.audit_events(owner_id);

-- Enforce that issue/round and action/issue relationships stay inside one project.
create unique index if not exists research_rounds_id_project_uidx on public.research_rounds(id, project_id);
create unique index if not exists issues_id_project_uidx on public.issues(id, project_id);
alter table public.issues
  add constraint issues_round_project_fkey foreign key (round_id, project_id)
  references public.research_rounds(id, project_id) on delete cascade;
alter table public.action_items
  add constraint action_items_issue_project_fkey foreign key (issue_id, project_id)
  references public.issues(id, project_id) on delete cascade;

alter table public.profiles enable row level security;
alter table public.ideas enable row level security;
alter table public.idea_assessments enable row level security;
alter table public.projects enable row level security;
alter table public.prototype_versions enable row level security;
alter table public.research_rounds enable row level security;
alter table public.research_tasks enable row level security;
alter table public.personas enable row level security;
alter table public.simulation_runs enable row level security;
alter table public.issues enable row level security;
alter table public.research_sources enable row level security;
alter table public.evidence enable row level security;
alter table public.issue_evidence_links enable row level security;
alter table public.action_items enable row level security;
alter table public.reports enable row level security;
alter table public.audit_events enable row level security;

revoke all on table
  public.profiles, public.ideas, public.idea_assessments, public.projects,
  public.prototype_versions, public.research_rounds, public.research_tasks,
  public.personas, public.simulation_runs, public.issues, public.research_sources,
  public.evidence, public.issue_evidence_links, public.action_items,
  public.reports, public.audit_events
from anon, authenticated;
grant select, insert, update, delete on table
  public.profiles, public.ideas, public.idea_assessments, public.projects,
  public.prototype_versions, public.research_rounds, public.research_tasks,
  public.personas, public.simulation_runs, public.issues, public.research_sources,
  public.evidence, public.issue_evidence_links, public.action_items
to authenticated;
grant select, insert on table public.reports, public.audit_events to authenticated;

drop policy if exists profiles_self on public.profiles;
drop policy if exists ideas_owner on public.ideas;
drop policy if exists projects_owner on public.projects;

create policy profiles_select on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy profiles_insert on public.profiles for insert to authenticated with check (id = (select auth.uid()));
create policy profiles_update on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy profiles_delete on public.profiles for delete to authenticated using (id = (select auth.uid()));

create policy ideas_select on public.ideas for select to authenticated using (owner_id = (select auth.uid()));
create policy ideas_insert on public.ideas for insert to authenticated with check (owner_id = (select auth.uid()));
create policy ideas_update on public.ideas for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy ideas_delete on public.ideas for delete to authenticated using (owner_id = (select auth.uid()));

create policy idea_assessments_select on public.idea_assessments for select to authenticated using (private.owns_idea(idea_id));
create policy idea_assessments_insert on public.idea_assessments for insert to authenticated with check (private.owns_idea(idea_id));
create policy idea_assessments_update on public.idea_assessments for update to authenticated using (private.owns_idea(idea_id)) with check (private.owns_idea(idea_id));
create policy idea_assessments_delete on public.idea_assessments for delete to authenticated using (private.owns_idea(idea_id));

create policy projects_select on public.projects for select to authenticated using (owner_id = (select auth.uid()));
create policy projects_insert on public.projects for insert to authenticated with check (
  owner_id = (select auth.uid()) and (source_idea_id is null or private.owns_idea(source_idea_id))
);
create policy projects_update on public.projects for update to authenticated using (owner_id = (select auth.uid())) with check (
  owner_id = (select auth.uid()) and (source_idea_id is null or private.owns_idea(source_idea_id))
);
create policy projects_delete on public.projects for delete to authenticated using (owner_id = (select auth.uid()));

create policy prototype_versions_select on public.prototype_versions for select to authenticated using (private.owns_project(project_id));
create policy prototype_versions_insert on public.prototype_versions for insert to authenticated with check (private.owns_project(project_id));
create policy prototype_versions_update on public.prototype_versions for update to authenticated using (private.owns_project(project_id)) with check (private.owns_project(project_id));
create policy prototype_versions_delete on public.prototype_versions for delete to authenticated using (private.owns_project(project_id));

create policy research_rounds_select on public.research_rounds for select to authenticated using (private.owns_project(project_id));
create policy research_rounds_insert on public.research_rounds for insert to authenticated with check (private.owns_project(project_id));
create policy research_rounds_update on public.research_rounds for update to authenticated using (private.owns_project(project_id)) with check (private.owns_project(project_id));
create policy research_rounds_delete on public.research_rounds for delete to authenticated using (private.owns_project(project_id));

create policy research_tasks_select on public.research_tasks for select to authenticated using (private.owns_round(round_id));
create policy research_tasks_insert on public.research_tasks for insert to authenticated with check (private.owns_round(round_id));
create policy research_tasks_update on public.research_tasks for update to authenticated using (private.owns_round(round_id)) with check (private.owns_round(round_id));
create policy research_tasks_delete on public.research_tasks for delete to authenticated using (private.owns_round(round_id));

create policy personas_select on public.personas for select to authenticated using (private.owns_project(project_id));
create policy personas_insert on public.personas for insert to authenticated with check (private.owns_project(project_id));
create policy personas_update on public.personas for update to authenticated using (private.owns_project(project_id)) with check (private.owns_project(project_id));
create policy personas_delete on public.personas for delete to authenticated using (private.owns_project(project_id));

create policy simulation_runs_select on public.simulation_runs for select to authenticated using (private.owns_round(round_id));
create policy simulation_runs_insert on public.simulation_runs for insert to authenticated with check (
  private.owns_round(round_id) and (prototype_id is null or private.owns_prototype(prototype_id))
);
create policy simulation_runs_update on public.simulation_runs for update to authenticated using (private.owns_round(round_id)) with check (
  private.owns_round(round_id) and (prototype_id is null or private.owns_prototype(prototype_id))
);
create policy simulation_runs_delete on public.simulation_runs for delete to authenticated using (private.owns_round(round_id));

create policy issues_select on public.issues for select to authenticated using (private.owns_project(project_id));
create policy issues_insert on public.issues for insert to authenticated with check (private.owns_project(project_id) and private.owns_round(round_id));
create policy issues_update on public.issues for update to authenticated using (private.owns_project(project_id)) with check (private.owns_project(project_id) and private.owns_round(round_id));
create policy issues_delete on public.issues for delete to authenticated using (private.owns_project(project_id));

create policy research_sources_select on public.research_sources for select to authenticated using (private.owns_round(round_id));
create policy research_sources_insert on public.research_sources for insert to authenticated with check (private.owns_round(round_id));
create policy research_sources_update on public.research_sources for update to authenticated using (private.owns_round(round_id)) with check (private.owns_round(round_id));
create policy research_sources_delete on public.research_sources for delete to authenticated using (private.owns_round(round_id));

create policy evidence_select on public.evidence for select to authenticated using (private.owns_source(source_id));
create policy evidence_insert on public.evidence for insert to authenticated with check (private.owns_source(source_id));
create policy evidence_update on public.evidence for update to authenticated using (private.owns_source(source_id)) with check (private.owns_source(source_id));
create policy evidence_delete on public.evidence for delete to authenticated using (private.owns_source(source_id));

create policy issue_evidence_links_select on public.issue_evidence_links for select to authenticated using (private.owns_issue(issue_id) and private.owns_evidence(evidence_id));
create policy issue_evidence_links_insert on public.issue_evidence_links for insert to authenticated with check (private.owns_issue(issue_id) and private.owns_evidence(evidence_id));
create policy issue_evidence_links_update on public.issue_evidence_links for update to authenticated using (private.owns_issue(issue_id) and private.owns_evidence(evidence_id)) with check (private.owns_issue(issue_id) and private.owns_evidence(evidence_id));
create policy issue_evidence_links_delete on public.issue_evidence_links for delete to authenticated using (private.owns_issue(issue_id) and private.owns_evidence(evidence_id));

create policy action_items_select on public.action_items for select to authenticated using (private.owns_project(project_id));
create policy action_items_insert on public.action_items for insert to authenticated with check (private.owns_project(project_id) and private.owns_issue(issue_id));
create policy action_items_update on public.action_items for update to authenticated using (private.owns_project(project_id)) with check (private.owns_project(project_id) and private.owns_issue(issue_id));
create policy action_items_delete on public.action_items for delete to authenticated using (private.owns_project(project_id));

create policy reports_select on public.reports for select to authenticated using (private.owns_round(round_id));
create policy reports_insert on public.reports for insert to authenticated with check (private.owns_round(round_id));

create policy audit_events_select on public.audit_events for select to authenticated using (owner_id = (select auth.uid()));
create policy audit_events_insert on public.audit_events for insert to authenticated with check (owner_id = (select auth.uid()));

-- Private attachments live under research-private/<auth.uid()>/...
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'research-private', 'research-private', false, 10485760,
  array['image/png','image/jpeg','image/webp','application/pdf','text/plain','text/csv','text/markdown']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists research_private_select on storage.objects;
drop policy if exists research_private_insert on storage.objects;
drop policy if exists research_private_update on storage.objects;
drop policy if exists research_private_delete on storage.objects;

create policy research_private_select on storage.objects for select to authenticated using (
  bucket_id = 'research-private' and (storage.foldername(name))[1] = (select auth.uid())::text
);
create policy research_private_insert on storage.objects for insert to authenticated with check (
  bucket_id = 'research-private' and (storage.foldername(name))[1] = (select auth.uid())::text
);
create policy research_private_update on storage.objects for update to authenticated using (
  bucket_id = 'research-private' and (storage.foldername(name))[1] = (select auth.uid())::text
) with check (
  bucket_id = 'research-private' and (storage.foldername(name))[1] = (select auth.uid())::text
);
create policy research_private_delete on storage.objects for delete to authenticated using (
  bucket_id = 'research-private' and (storage.foldername(name))[1] = (select auth.uid())::text
);
