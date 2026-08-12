begin;

select plan(16);
select has_table('public', 'projects', 'projects table exists');
select ok((select relrowsecurity from pg_class where oid = 'public.projects'::regclass), 'projects has RLS enabled');
select has_function('public', 'complete_onboarding', array['text', 'text', 'text', 'text', 'text', 'text[]', 'smallint', 'date'], 'atomic onboarding function exists');

insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values
('00000000-0000-0000-0000-000000000000','61000000-0000-4000-8000-000000000001','authenticated','authenticated','onboarding-reviewer@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','61000000-0000-4000-8000-000000000002','authenticated','authenticated','onboarding-learner@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','61000000-0000-4000-8000-000000000003','authenticated','authenticated','onboarding-outsider@example.test','',now(),'{}','{}',now(),now());
insert into public.cohorts (id,name,status) values ('62000000-0000-4000-8000-000000000001','Onboarding cohort','active');
insert into public.profiles (user_id) values ('61000000-0000-4000-8000-000000000001'),('61000000-0000-4000-8000-000000000002');
insert into public.cohort_members (cohort_id,user_id) values ('62000000-0000-4000-8000-000000000001','61000000-0000-4000-8000-000000000002');
insert into private.reviewer_roles (user_id) values ('61000000-0000-4000-8000-000000000001');

set local role authenticated;
select set_config('request.jwt.claim.sub','61000000-0000-4000-8000-000000000002',true);
select lives_ok($$select public.complete_onboarding('Ана','Мал планер','Студенти што учат самостојно','Ги губат малите задачи и не знаат што е следно.','Да ја означат следната важна задача.',array['Плаќања','Chat'],'5',current_date + 28)$$, 'valid onboarding succeeds');
select is((select count(*) from public.projects),1::bigint,'learner reads their draft project');
select is((select display_name from public.profiles where user_id = '61000000-0000-4000-8000-000000000002'),'Ана','profile name is saved');
select ok((select onboarding_completed_at is not null from public.profiles where user_id = '61000000-0000-4000-8000-000000000002'),'onboarding completion is recorded');
select results_eq($$select non_features from public.projects$$,$$values (array['Плаќања','Chat']::text[])$$,'normalized non-features persist');
select throws_ok($$select public.complete_onboarding('Ана','Мал планер','Студенти што учат самостојно','Ги губат малите задачи и не знаат што е следно.','Да ја означат следната важна задача.',array['Плаќања'],'5',current_date + 28)$$,'PT409','onboarding_already_completed','retry cannot duplicate a project');
select throws_ok($$insert into public.projects(owner_id,cohort_id,title,target_user,problem_statement,core_action,non_features,weekly_hours,target_launch_date) values ('61000000-0000-4000-8000-000000000002','62000000-0000-4000-8000-000000000001','Other','A specific target user here','A sufficiently detailed painful problem here','Complete one core action',array['Chat'],5,current_date + 28)$$,'42501',null,'learner cannot insert projects directly');

select set_config('request.jwt.claim.sub','61000000-0000-4000-8000-000000000003',true);
select is((select count(*) from public.projects),0::bigint,'outsider sees no projects');
select throws_ok($$select public.complete_onboarding('Outsider','Project','A specific target user here','A sufficiently detailed painful problem here','Complete one core action',array['Chat'],'5',current_date + 28)$$,'PT403','active_membership_required','outsider cannot complete onboarding');

select set_config('request.jwt.claim.sub','61000000-0000-4000-8000-000000000001',true);
select is((select count(*) from public.projects),1::bigint,'reviewer can inspect projects');
select throws_ok($$select public.complete_onboarding('Reviewer','Project','A specific target user here','A sufficiently detailed painful problem here','Complete one core action',array['Chat'],'5',current_date + 28)$$,'PT403','learner_access_required','reviewer cannot complete learner onboarding');

reset role;
set local role anon;
select throws_ok($$select count(*) from public.projects$$,'42501',null,'anonymous cannot read projects');
select throws_ok($$select public.complete_onboarding('Anon','Project','A specific target user here','A sufficiently detailed painful problem here','Complete one core action',array['Chat'],'5',current_date + 28)$$,'42501',null,'anonymous cannot execute onboarding');

select * from finish();
rollback;
