begin;

select plan(28);

select has_table('public', 'project_assignments', 'project assignments table exists');
select has_table('public', 'activity_events', 'activity events table exists');
select ok((select relrowsecurity from pg_class where oid = 'public.project_assignments'::regclass), 'project assignments has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.activity_events'::regclass), 'activity events has RLS enabled');
select has_function('public', 'start_project', array[]::text[], 'start project function exists');

insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values
('00000000-0000-0000-0000-000000000000','71000000-0000-4000-8000-000000000001','authenticated','authenticated','start-reviewer@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','71000000-0000-4000-8000-000000000002','authenticated','authenticated','start-learner@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-8000-000000000000','71000000-0000-4000-8000-000000000003','authenticated','authenticated','start-other@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','71000000-0000-4000-8000-000000000004','authenticated','authenticated','start-outsider@example.test','',now(),'{}','{}',now(),now());

insert into public.cohorts (id,name,status)
values ('72000000-0000-4000-8000-000000000001','Start project cohort','active');

insert into public.profiles (user_id,display_name,onboarding_completed_at) values
('71000000-0000-4000-8000-000000000001','Reviewer',now()),
('71000000-0000-4000-8000-000000000002','Learner',now()),
('71000000-0000-4000-8000-000000000003','Other learner',now());

insert into public.cohort_members (cohort_id,user_id) values
('72000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000002'),
('72000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000003');

insert into private.reviewer_roles (user_id)
values ('71000000-0000-4000-8000-000000000001');

insert into public.projects (
  id,owner_id,cohort_id,title,target_user,problem_statement,core_action,
  non_features,weekly_hours,target_launch_date
) values
('73000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000002','72000000-0000-4000-8000-000000000001','Learner project','A specific learner with one concrete need','A sufficiently detailed and painful learner problem.','Complete one concrete action',array['Chat'],5,current_date + 28),
('73000000-0000-4000-8000-000000000002','71000000-0000-4000-8000-000000000003','72000000-0000-4000-8000-000000000001','Other project','Another specific learner with one concrete need','Another sufficiently detailed and painful learner problem.','Complete another action',array['Payments'],5,current_date + 28);

set local role authenticated;
select set_config('request.jwt.claim.sub','71000000-0000-4000-8000-000000000002',true);

select is(public.start_project(),'73000000-0000-4000-8000-000000000001'::uuid,'learner starts their draft project');
select results_eq(
  $$select status,curriculum_version from public.projects where id = '73000000-0000-4000-8000-000000000001'$$,
  $$values ('active'::text,'v1'::text)$$,
  'project becomes active and pins curriculum v1'
);
select is((select count(*) from public.project_assignments),10::bigint,'learner sees ten projections');
select is((select count(*) from public.project_assignments where state = 'available'),1::bigint,'exactly one projection is available');
select is((select count(*) from public.project_assignments where state = 'locked'),9::bigint,'remaining projections are locked');
select results_eq(
  $$select a.position,pa.state,pa.available_at is not null from public.project_assignments pa join public.assignments a on a.id = pa.assignment_id order by a.position$$,
  $$values (1::smallint,'available'::text,true),(2::smallint,'locked'::text,false),(3::smallint,'locked'::text,false),(4::smallint,'locked'::text,false),(5::smallint,'locked'::text,false),(6::smallint,'locked'::text,false),(7::smallint,'locked'::text,false),(8::smallint,'locked'::text,false),(9::smallint,'locked'::text,false),(10::smallint,'locked'::text,false)$$,
  'Assignment 01 alone is available in curriculum order'
);
select is((select count(*) from public.activity_events),2::bigint,'start and unlock events are recorded');
select is(public.start_project(),'73000000-0000-4000-8000-000000000001'::uuid,'valid retry returns the initialized project');
select is((select count(*) from public.project_assignments),10::bigint,'retry creates no duplicate projections');
select is((select count(*) from public.activity_events),2::bigint,'retry creates no duplicate events');
select throws_ok($$insert into public.project_assignments(project_id,assignment_id,state) values ('73000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000010','locked')$$,'42501',null,'learner cannot insert projections directly');
select throws_ok($$update public.projects set status = 'completed' where id = '73000000-0000-4000-8000-000000000001'$$,'42501',null,'learner cannot update project status directly');

select set_config('request.jwt.claim.sub','71000000-0000-4000-8000-000000000003',true);
select is((select count(*) from public.project_assignments),0::bigint,'other learner cannot read projections');
select is((select count(*) from public.activity_events),0::bigint,'other learner cannot read activity');

reset role;
update public.assignments
set position = 11
where curriculum_version = 'v1' and position = 1;
set local role authenticated;
select set_config('request.jwt.claim.sub','71000000-0000-4000-8000-000000000003',true);
select throws_ok($$select public.start_project()$$,'PT409','curriculum_not_ready','curriculum without Assignment 01 cannot start');
select results_eq(
  $$select status,curriculum_version from public.projects where id = '73000000-0000-4000-8000-000000000002'$$,
  $$values ('draft'::text,null::text)$$,
  'rejected curriculum leaves the project draft unchanged'
);

reset role;
update public.assignments
set position = 1
where curriculum_version = 'v1' and position = 11;
set local role authenticated;

select set_config('request.jwt.claim.sub','71000000-0000-4000-8000-000000000004',true);
select throws_ok($$select public.start_project()$$,'PT404','current_project_not_found','outsider cannot start a project');

select set_config('request.jwt.claim.sub','71000000-0000-4000-8000-000000000001',true);
select is((select count(*) from public.project_assignments),10::bigint,'reviewer can inspect projections');
select is((select count(*) from public.activity_events),2::bigint,'reviewer can inspect activity');
select throws_ok($$select public.start_project()$$,'PT403','learner_access_required','reviewer cannot start a learner project');

reset role;
set local role anon;
select throws_ok($$select count(*) from public.project_assignments$$,'42501',null,'anonymous cannot read projections');
select throws_ok($$select count(*) from public.activity_events$$,'42501',null,'anonymous cannot read activity');
select throws_ok($$select public.start_project()$$,'42501',null,'anonymous cannot execute start project');

select * from finish();
rollback;
