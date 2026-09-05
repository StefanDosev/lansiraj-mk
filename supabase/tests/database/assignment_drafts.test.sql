begin;

select plan(26);

select has_table('public', 'assignment_drafts', 'assignment drafts table exists');
select has_table('public', 'assignment_draft_links', 'assignment draft links table exists');
select ok((select relrowsecurity from pg_class where oid = 'public.assignment_drafts'::regclass), 'assignment drafts has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.assignment_draft_links'::regclass), 'assignment draft links has RLS enabled');
select has_function('public', 'save_assignment_draft', array['uuid','text','jsonb','timestamp with time zone'], 'save draft function exists');

insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values
('00000000-0000-0000-0000-000000000000','81000000-0000-4000-8000-000000000001','authenticated','authenticated','draft-reviewer@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','81000000-0000-4000-8000-000000000002','authenticated','authenticated','draft-learner@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','81000000-0000-4000-8000-000000000003','authenticated','authenticated','draft-other@example.test','',now(),'{}','{}',now(),now());

insert into public.cohorts (id,name,status)
values ('82000000-0000-4000-8000-000000000001','Draft cohort','active');

insert into public.profiles (user_id,display_name,onboarding_completed_at) values
('81000000-0000-4000-8000-000000000001','Reviewer',now()),
('81000000-0000-4000-8000-000000000002','Learner',now()),
('81000000-0000-4000-8000-000000000003','Other learner',now());

insert into public.cohort_members (cohort_id,user_id) values
('82000000-0000-4000-8000-000000000001','81000000-0000-4000-8000-000000000002'),
('82000000-0000-4000-8000-000000000001','81000000-0000-4000-8000-000000000003');

insert into private.reviewer_roles (user_id)
values ('81000000-0000-4000-8000-000000000001');

insert into public.projects (
  id,owner_id,cohort_id,title,target_user,problem_statement,core_action,
  non_features,weekly_hours,target_launch_date,status,curriculum_version
) values
('83000000-0000-4000-8000-000000000001','81000000-0000-4000-8000-000000000002','82000000-0000-4000-8000-000000000001','Draft project','A specific learner with one concrete need','A sufficiently detailed and painful learner problem.','Complete one concrete action',array['Chat'],5,current_date + 28,'active','v1'),
('83000000-0000-4000-8000-000000000002','81000000-0000-4000-8000-000000000003','82000000-0000-4000-8000-000000000001','Other project','Another specific learner with one concrete need','Another sufficiently detailed and painful learner problem.','Complete another action',array['Payments'],5,current_date + 28,'active','v1');

insert into public.project_assignments (id,project_id,assignment_id,state,available_at)
select
  case a.position
    when 1 then '84000000-0000-4000-8000-000000000001'::uuid
    else gen_random_uuid()
  end,
  '83000000-0000-4000-8000-000000000001',
  a.id,
  case when a.position = 1 then 'available' else 'locked' end,
  case when a.position = 1 then now() else null end
from public.assignments as a where a.curriculum_version = 'v1';

insert into public.project_assignments (id,project_id,assignment_id,state,available_at)
select
  case a.position
    when 1 then '84000000-0000-4000-8000-000000000002'::uuid
    else gen_random_uuid()
  end,
  '83000000-0000-4000-8000-000000000002',
  a.id,
  case when a.position = 1 then 'available' else 'locked' end,
  case when a.position = 1 then now() else null end
from public.assignments as a where a.curriculum_version = 'v1';

set local role authenticated;
select set_config('request.jwt.claim.sub','81000000-0000-4000-8000-000000000002',true);

select lives_ok(
  $$select public.save_assignment_draft(
    '84000000-0000-4000-8000-000000000001',
    'Interview notes',
    '[{"link_type":"research","label":"Notes","url":"https://example.com/notes","position":1},{"link_type":"other","label":"Summary","url":"https://example.com/summary","position":2}]'::jsonb,
    null
  )$$,
  'owner creates a draft atomically'
);
select is((select count(*) from public.assignment_drafts),1::bigint,'owner reads one draft');
select is((select evidence_text from public.assignment_drafts),'Interview notes','draft text is saved');
select is((select count(*) from public.assignment_draft_links),2::bigint,'draft links are saved');
select results_eq(
  $$select link_type,label,position from public.assignment_draft_links order by position$$,
  $$values ('research'::text,'Notes'::text,1::smallint),('other'::text,'Summary'::text,2::smallint)$$,
  'link type label and ordering are preserved'
);

select lives_ok(
  $$select public.save_assignment_draft(
    '84000000-0000-4000-8000-000000000001',
    '',
    '[]'::jsonb,
    (select updated_at from public.assignment_drafts where project_assignment_id = '84000000-0000-4000-8000-000000000001')
  )$$,
  'owner can save a completely blank draft'
);
select is((select evidence_text from public.assignment_drafts),''::text,'blank text replaces prior text');
select is((select count(*) from public.assignment_draft_links),0::bigint,'atomic replacement removes prior links');

select throws_ok(
  $$select public.save_assignment_draft('84000000-0000-4000-8000-000000000001','stale','[]'::jsonb,'2000-01-01T00:00:00Z')$$,
  'PT409','draft_conflict','stale save is rejected'
);
select is((select evidence_text from public.assignment_drafts),''::text,'stale save leaves the draft unchanged');
select throws_ok(
  $$select public.save_assignment_draft('84000000-0000-4000-8000-000000000001','invalid','[{"link_type":"research","label":"Bad","url":"http://example.com","position":1}]'::jsonb,(select updated_at from public.assignment_drafts limit 1))$$,
  '22023','invalid_evidence_link','non-HTTPS link is rejected'
);
select throws_ok(
  $$select public.save_assignment_draft('84000000-0000-4000-8000-000000000001','invalid','[{"link_type":"research","label":"One","url":"https://example.com/1","position":1},{"link_type":"other","label":"Two","url":"https://example.com/2","position":1}]'::jsonb,(select updated_at from public.assignment_drafts limit 1))$$,
  '22023','duplicate_evidence_link_position','duplicate link positions are rejected'
);
select throws_ok(
  $$select public.save_assignment_draft((select pa.id from public.project_assignments pa join public.assignments a on a.id = pa.assignment_id where pa.project_id = '83000000-0000-4000-8000-000000000001' and a.position = 2),'locked','[]'::jsonb,null)$$,
  'PT409','assignment_not_editable','locked assignment cannot save a draft'
);

select set_config('request.jwt.claim.sub','81000000-0000-4000-8000-000000000003',true);
select is((select count(*) from public.assignment_drafts),0::bigint,'other learner cannot read drafts');
select is((select count(*) from public.assignment_draft_links),0::bigint,'other learner cannot read draft links');
select throws_ok(
  $$select public.save_assignment_draft('84000000-0000-4000-8000-000000000001','cross-owner','[]'::jsonb,null)$$,
  'PT404','assignment_not_found','other learner cannot save owner draft'
);

select set_config('request.jwt.claim.sub','81000000-0000-4000-8000-000000000001',true);
select is((select count(*) from public.assignment_drafts),0::bigint,'reviewer cannot read mutable drafts');
select throws_ok(
  $$select public.save_assignment_draft('84000000-0000-4000-8000-000000000001','reviewer','[]'::jsonb,null)$$,
  'PT403','learner_access_required','reviewer cannot save learner draft'
);

reset role;
set local role anon;
select throws_ok($$select count(*) from public.assignment_drafts$$,'42501',null,'anonymous cannot read drafts');
select throws_ok($$select count(*) from public.assignment_draft_links$$,'42501',null,'anonymous cannot read draft links');
select throws_ok($$select public.save_assignment_draft('84000000-0000-4000-8000-000000000001','','[]'::jsonb,null)$$,'42501',null,'anonymous cannot execute save draft');

select * from finish();
rollback;
