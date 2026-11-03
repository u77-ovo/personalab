begin;
select plan(7);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
values
  ('11111111-1111-4111-8111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner-a@example.test', '', now(), now()),
  ('22222222-2222-4222-8222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner-b@example.test', '', now(), now());

insert into public.ideas (id, owner_id, brief_json, status)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '11111111-1111-4111-8111-111111111111', '{}', 'draft'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', '22222222-2222-4222-8222-222222222222', '{}', 'draft');

insert into public.projects (id, owner_id, title)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', '11111111-1111-4111-8111-111111111111', 'Owner A project'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4', '22222222-2222-4222-8222-222222222222', 'Owner B project');

insert into public.research_rounds (id, project_id, label, objective)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'Round 1', 'A objective'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb6', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4', 'Round 1', 'B objective');

set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

select is((select count(*) from public.ideas), 1::bigint, 'owner sees only their idea');
select is((select count(*) from public.projects), 1::bigint, 'owner sees only their project');
select is((select count(*) from public.research_rounds), 1::bigint, 'child rows inherit project ownership');
select lives_ok(
  $$insert into public.ideas (owner_id, brief_json, status) values ('11111111-1111-4111-8111-111111111111', '{}', 'draft')$$,
  'owner can insert their idea'
);
select throws_ok(
  $$insert into public.ideas (owner_id, brief_json, status) values ('22222222-2222-4222-8222-222222222222', '{}', 'draft')$$,
  '42501',
  'new row violates row-level security policy for table "ideas"',
  'owner cannot insert for another user'
);
select is((select count(*) from public.audit_events), 0::bigint, 'audit log starts empty');
select lives_ok(
  $$insert into public.audit_events (owner_id, entity_type, entity_id, changes_json) values ('11111111-1111-4111-8111-111111111111', 'idea', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '{}')$$,
  'owner can append an audit event'
);

select * from finish();
rollback;
