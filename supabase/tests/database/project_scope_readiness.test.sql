begin;

select plan(25);

select has_table('public', 'project_scope_assessments', 'scope assessments table exists');
select ok((select relrowsecurity from pg_class where oid = 'public.project_scope_assessments'::regclass), 'scope assessments has RLS enabled');
select has_function('public', 'assess_project_scope', array['uuid','text','text'], 'scope assessment function exists');

insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values
('00000000-0000-0000-0000-000000000000','91000000-0000-4000-8000-000000000001','authenticated','authenticated','scope-reviewer@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','91000000-0000-4000-8000-000000000002','authenticated','authenticated','scope-learner@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','91000000-0000-4000-8000-000000000003','authenticated','authenticated','scope-other@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','91000000-0000-4000-8000-000000000004','authenticated','authenticated','scope-outsider@example.test','',now(),'{}','{}',now(),now());

insert into public.cohorts (id,name,status)
values ('92000000-0000-4000-8000-000000000001','Scope cohort','active');

insert into public.profiles (user_id,display_name,onboarding_completed_at) values
('91000000-0000-4000-8000-000000000001','Reviewer',now()),
('91000000-0000-4000-8000-000000000002','Learner',now()),
('91000000-0000-4000-8000-000000000003','Other learner',now());

insert into public.cohort_members (cohort_id,user_id) values
('92000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000002'),
('92000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000003');

insert into private.reviewer_roles (user_id)
values ('91000000-0000-4000-8000-000000000001');

insert into public.projects (
  id,owner_id,cohort_id,title,target_user,problem_statement,core_action,
  non_features,weekly_hours,target_launch_date
) values
('93000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000002','92000000-0000-4000-8000-000000000001','Scope project','A specific learner with one concrete need','A sufficiently detailed and painful learner problem.','Complete one concrete action',array['Chat'],5,current_date + 28),
('93000000-0000-4000-8000-000000000002','91000000-0000-4000-8000-000000000003','92000000-0000-4000-8000-000000000001','Other scope','Another specific learner with one concrete need','Another sufficiently detailed and painful problem.','Complete another action',array['Payments'],6,current_date + 35);

set local role authenticated;
select set_config('request.jwt.claim.sub','91000000-0000-4000-8000-000000000002',true);
select is((select count(*) from public.project_scope_assessments),0::bigint,'learner initially sees no assessment');
select throws_ok($$select public.assess_project_scope('93000000-0000-4000-8000-000000000001','ready','Looks good')$$,'PT403','reviewer_access_required','learner cannot assess scope');
select throws_ok($$insert into public.project_scope_assessments(project_id,readiness,reviewed_by) values ('93000000-0000-4000-8000-000000000001','ready','91000000-0000-4000-8000-000000000002')$$,'42501',null,'learner cannot insert assessment directly');

select set_config('request.jwt.claim.sub','91000000-0000-4000-8000-000000000001',true);
select throws_ok($$select public.assess_project_scope('93000000-0000-4000-8000-000000000001','needs_reduction','short')$$,'22023','scope_correction_required','needs reduction requires a useful note');
select throws_ok($$select public.assess_project_scope('93000000-0000-4000-8000-000000000001','unknown','A sufficiently useful correction')$$,'22023','invalid_scope_readiness','unknown readiness is rejected');
select throws_ok($$select public.assess_project_scope('ffffffff-ffff-4fff-8fff-ffffffffffff','ready','')$$,'PT404','project_not_found','missing project is rejected');
select lives_ok($$select public.assess_project_scope('93000000-0000-4000-8000-000000000001','needs_reduction','Намали ја главната акција на еден јасен исход.')$$,'reviewer requests scope reduction');
select results_eq(
  $$select readiness,note,reviewed_by from public.project_scope_assessments where project_id = '93000000-0000-4000-8000-000000000001'$$,
  $$values ('needs_reduction'::text,'Намали ја главната акција на еден јасен исход.'::text,'91000000-0000-4000-8000-000000000001'::uuid)$$,
  'assessment stores decision, note, and reviewer'
);
select lives_ok($$select public.assess_project_scope('93000000-0000-4000-8000-000000000001','ready','')$$,'reviewer can reassess scope as ready');
select is((select count(*) from public.project_scope_assessments where project_id = '93000000-0000-4000-8000-000000000001'),1::bigint,'reassessment replaces the current state');
select results_eq(
  $$select readiness,note is null,reviewed_at is not null from public.project_scope_assessments where project_id = '93000000-0000-4000-8000-000000000001'$$,
  $$values ('ready'::text,true,true)$$,
  'ready assessment normalizes an empty note and keeps timestamp'
);

select set_config('request.jwt.claim.sub','91000000-0000-4000-8000-000000000002',true);
select results_eq(
  $$select readiness,note from public.project_scope_assessments$$,
  $$values ('ready'::text,null::text)$$,
  'owner reads their assessment'
);

select set_config('request.jwt.claim.sub','91000000-0000-4000-8000-000000000003',true);
select is((select count(*) from public.project_scope_assessments),0::bigint,'other learner cannot read assessment');
select throws_ok($$select public.assess_project_scope('93000000-0000-4000-8000-000000000001','ready','')$$,'PT403','reviewer_access_required','other learner cannot assess another project');

select set_config('request.jwt.claim.sub','91000000-0000-4000-8000-000000000004',true);
select is((select count(*) from public.project_scope_assessments),0::bigint,'outsider sees no assessment');
select throws_ok($$select public.assess_project_scope('93000000-0000-4000-8000-000000000001','ready','')$$,'PT403','reviewer_access_required','outsider cannot assess scope');

select set_config('request.jwt.claim.sub','91000000-0000-4000-8000-000000000001',true);
select is((select count(*) from public.project_scope_assessments),1::bigint,'reviewer reads assessment');
select is((select count(*) from public.projects),2::bigint,'reviewer can inspect both project scopes');
select lives_ok($$select public.assess_project_scope('93000000-0000-4000-8000-000000000002','ready','')$$,'reviewer can assess another project');
select is((select count(*) from public.project_assignments),0::bigint,'scope assessment does not create or change assignment progress');

reset role;
set local role anon;
select throws_ok($$select count(*) from public.project_scope_assessments$$,'42501',null,'anonymous cannot read assessments');
select throws_ok($$select public.assess_project_scope('93000000-0000-4000-8000-000000000001','ready','')$$,'42501',null,'anonymous cannot execute scope assessment');

select * from finish();
rollback;
