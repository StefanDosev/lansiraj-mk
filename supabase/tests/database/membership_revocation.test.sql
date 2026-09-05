begin;

select plan(20);

insert into auth.users (
  instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
  raw_app_meta_data,raw_user_meta_data,created_at,updated_at
) values
('00000000-0000-0000-0000-000000000000','91000000-0000-4000-8000-000000000001','authenticated','authenticated','revocation-reviewer@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','91000000-0000-4000-8000-000000000002','authenticated','authenticated','revocation-learner@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','91000000-0000-4000-8000-000000000003','authenticated','authenticated','revocation-other@example.test','',now(),'{}','{}',now(),now());

insert into public.cohorts (id,name,status)
values ('92000000-0000-4000-8000-000000000001','Revocation cohort','active');

insert into public.profiles (user_id,display_name,onboarding_completed_at) values
('91000000-0000-4000-8000-000000000001','Revocation Reviewer',now()),
('91000000-0000-4000-8000-000000000002','Revocation Learner',now()),
('91000000-0000-4000-8000-000000000003','Other Learner',now());

insert into public.cohort_members (id,cohort_id,user_id,status) values
('93000000-0000-4000-8000-000000000001','92000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000002','active'),
('93000000-0000-4000-8000-000000000002','92000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000003','active');

insert into private.reviewer_roles (user_id)
values ('91000000-0000-4000-8000-000000000001');

insert into public.projects (
  id,owner_id,cohort_id,title,target_user,problem_statement,core_action,
  non_features,weekly_hours,target_launch_date,status,curriculum_version
) values (
  '94000000-0000-4000-8000-000000000001',
  '91000000-0000-4000-8000-000000000002',
  '92000000-0000-4000-8000-000000000001',
  'Revocation project',
  'A specific learner with one concrete need',
  'A sufficiently detailed and painful learner problem.',
  'Complete one concrete action',
  array['Chat'],5,current_date + 28,'active','v1'
);

insert into public.project_assignments (
  id,project_id,assignment_id,state,available_at,submitted_at
) values
('95000000-0000-4000-8000-000000000001','94000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','submitted',now(),now()),
('95000000-0000-4000-8000-000000000002','94000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','available',now(),null);

insert into public.activity_events (id,project_id,actor_id,event_type)
values ('96000000-0000-4000-8000-000000000001','94000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000002','project_started');

insert into public.project_scope_assessments (project_id,readiness,reviewed_by)
values ('94000000-0000-4000-8000-000000000001','ready','91000000-0000-4000-8000-000000000001');

insert into public.assignment_drafts (id,project_assignment_id,evidence_text,updated_at)
values ('97000000-0000-4000-8000-000000000001','95000000-0000-4000-8000-000000000002','Mutable proof','2026-08-25T10:00:00Z');

insert into public.assignment_draft_links (id,draft_id,link_type,label,url,position)
values ('98000000-0000-4000-8000-000000000001','97000000-0000-4000-8000-000000000001','research','Draft notes','https://example.com/draft',1);

insert into public.submissions (
  id,project_assignment_id,version,evidence_text,status,submitted_at,reviewed_at
) values (
  '99000000-0000-4000-8000-000000000001',
  '95000000-0000-4000-8000-000000000001',1,'Historical proof','approved',now() - interval '2 days',now() - interval '1 day'
);

insert into public.submissions (
  id,project_assignment_id,version,evidence_text,status,submitted_at,supersedes_submission_id
) values (
  '99000000-0000-4000-8000-000000000002',
  '95000000-0000-4000-8000-000000000001',2,'Pending proof','submitted',now(),'99000000-0000-4000-8000-000000000001'
);

insert into public.submission_links (id,submission_id,link_type,label,url,position)
values ('9a000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000001','research','Submitted notes','https://example.com/submitted',1);

insert into public.reviews (id,submission_id,reviewer_id,decision,summary)
values ('9b000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000001','approved','Historical approval');

insert into public.review_criteria (id,review_id,acceptance_criterion_id,outcome)
values ('9c000000-0000-4000-8000-000000000001','9b000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','pass');

set local role authenticated;
select set_config('request.jwt.claim.sub','91000000-0000-4000-8000-000000000002',true);

select is((select count(*) from public.projects),1::bigint,'active learner reads their project');
select is((select count(*) from public.project_assignments),2::bigint,'active learner reads project assignments');
select is((select count(*) from public.assignment_drafts),1::bigint,'active learner reads their mutable draft');

reset role;
update public.cohort_members
set status = 'removed'
where id = '93000000-0000-4000-8000-000000000001';

set local role authenticated;
select set_config('request.jwt.claim.sub','91000000-0000-4000-8000-000000000002',true);

select is((select count(*) from public.projects),0::bigint,'removed learner cannot read projects');
select is((select count(*) from public.project_assignments),0::bigint,'removed learner cannot read project assignments');
select is((select count(*) from public.activity_events),0::bigint,'removed learner cannot read activity events');
select is((select count(*) from public.project_scope_assessments),0::bigint,'removed learner cannot read scope assessments');
select is((select count(*) from public.assignment_drafts),0::bigint,'removed learner cannot read assignment drafts');
select is((select count(*) from public.assignment_draft_links),0::bigint,'removed learner cannot read assignment draft links');
select is((select count(*) from public.submissions),0::bigint,'removed learner cannot read submissions');
select is((select count(*) from public.submission_links),0::bigint,'removed learner cannot read submission links');
select is((select count(*) from public.reviews),0::bigint,'removed learner cannot read reviews');
select is((select count(*) from public.review_criteria),0::bigint,'removed learner cannot read review criteria');

select throws_ok(
  $$select public.save_assignment_draft(
    '95000000-0000-4000-8000-000000000002','Changed after removal','[]'::jsonb,
    '2026-08-25T10:00:00Z'
  )$$,
  'PT403','active_membership_required','removed learner cannot update a draft through the RPC'
);

select throws_ok(
  $$select public.submit_assignment(
    '95000000-0000-4000-8000-000000000002',
    '2026-08-25T10:00:00Z'
  )$$,
  'PT403','active_membership_required','removed learner cannot submit through the RPC'
);

select set_config('request.jwt.claim.sub','91000000-0000-4000-8000-000000000003',true);
select throws_ok(
  $$select public.save_assignment_draft('95000000-0000-4000-8000-000000000002','Cross owner','[]'::jsonb,null)$$,
  'PT404','assignment_not_found','an active different learner still receives the cross-owner not-found result'
);

select set_config('request.jwt.claim.sub','91000000-0000-4000-8000-000000000001',true);
select is((select count(*) from public.projects),1::bigint,'reviewer retains historical project access');
select is((select count(*) from public.submissions),2::bigint,'reviewer retains historical submission access');
select is((select count(*) from public.reviews),1::bigint,'reviewer retains historical review access');

select throws_ok(
  $$select public.review_submission(
    '99000000-0000-4000-8000-000000000002',
    'approved',
    'This decision must not be stored after learner removal.',
    '',
    '[
      {"criterion_id":"30000000-0000-4000-8000-000000000001","outcome":"pass","note":null},
      {"criterion_id":"30000000-0000-4000-8000-000000000002","outcome":"pass","note":null},
      {"criterion_id":"30000000-0000-4000-8000-000000000003","outcome":"pass","note":null}
    ]'::jsonb
  )$$,
  'PT409','submission_not_reviewable','reviewer cannot decide or unlock work after learner removal'
);

select * from finish();
rollback;
