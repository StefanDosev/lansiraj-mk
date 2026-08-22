begin;

select plan(51);

select has_table('public', 'reviews', 'reviews table exists');
select has_table('public', 'review_criteria', 'review criteria table exists');
select ok(
  (select relrowsecurity from pg_class where oid = 'public.reviews'::regclass),
  'reviews has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.review_criteria'::regclass),
  'review criteria has RLS enabled'
);
select has_function(
  'public',
  'review_submission',
  array['uuid', 'text', 'text', 'text', 'jsonb'],
  'atomic review function exists'
);
select ok(
  to_regclass('public.reviews_reviewer_id_idx') is not null,
  'reviewer foreign key has an index'
);
select ok(
  to_regclass('public.review_criteria_acceptance_criterion_id_idx') is not null,
  'criterion foreign key has an index'
);

insert into auth.users (
  instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
  raw_app_meta_data,raw_user_meta_data,created_at,updated_at
) values
('00000000-0000-0000-0000-000000000000','a1000000-0000-4000-8000-000000000001','authenticated','authenticated','review-flow-reviewer@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','a1000000-0000-4000-8000-000000000002','authenticated','authenticated','review-flow-learner@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','a1000000-0000-4000-8000-000000000003','authenticated','authenticated','review-flow-other@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','a1000000-0000-4000-8000-000000000004','authenticated','authenticated','review-flow-outsider@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','a1000000-0000-4000-8000-000000000005','authenticated','authenticated','review-flow-terminal@example.test','',now(),'{}','{}',now(),now());

insert into public.cohorts (id,name,status)
values ('a2000000-0000-4000-8000-000000000001','Review flow cohort','active');

insert into public.profiles (user_id,display_name,onboarding_completed_at) values
('a1000000-0000-4000-8000-000000000001','Reviewer',now()),
('a1000000-0000-4000-8000-000000000002','Learner',now()),
('a1000000-0000-4000-8000-000000000003','Other learner',now()),
('a1000000-0000-4000-8000-000000000004','Outsider',now()),
('a1000000-0000-4000-8000-000000000005','Terminal learner',now());

insert into public.cohort_members (cohort_id,user_id) values
('a2000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000002'),
('a2000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000003'),
('a2000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000005');

insert into private.reviewer_roles (user_id)
values ('a1000000-0000-4000-8000-000000000001');

insert into public.projects (
  id,owner_id,cohort_id,title,target_user,problem_statement,core_action,
  non_features,weekly_hours,target_launch_date,status,curriculum_version
) values
('a3000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000002','a2000000-0000-4000-8000-000000000001','Revision project','A specific target user','A sufficiently detailed painful problem.','Complete one clear action',array['Chat'],5,current_date + 28,'active','v1'),
('a3000000-0000-4000-8000-000000000002','a1000000-0000-4000-8000-000000000003','a2000000-0000-4000-8000-000000000001','Approval project','A specific target user','A sufficiently detailed painful problem.','Complete one clear action',array['Payments'],5,current_date + 28,'active','v1'),
('a3000000-0000-4000-8000-000000000003','a1000000-0000-4000-8000-000000000005','a2000000-0000-4000-8000-000000000001','Terminal project','A specific target user','A sufficiently detailed painful problem.','Complete one clear action',array['Accounts'],5,current_date + 28,'active','v1');

insert into public.project_assignments (
  id,project_id,assignment_id,state,available_at,submitted_at
) values
('a4000000-0000-4000-8000-000000000001','a3000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','submitted',now(),now()),
('a4000000-0000-4000-8000-000000000005','a3000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','locked',null,null),
('a4000000-0000-4000-8000-000000000002','a3000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000001','submitted',now(),now()),
('a4000000-0000-4000-8000-000000000003','a3000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002','locked',null,null),
('a4000000-0000-4000-8000-000000000004','a3000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000010','submitted',now(),now());

insert into public.project_assignments (
  project_id,assignment_id,state,available_at,submitted_at,approved_at
)
select
  'a3000000-0000-4000-8000-000000000003',
  assignment.id,
  'approved',
  now(),
  now(),
  now()
from public.assignments as assignment
where assignment.curriculum_version = 'v1'
  and assignment.position < 10;

insert into public.assignment_drafts (
  id,project_assignment_id,evidence_text,updated_at
) values (
  'a6000000-0000-4000-8000-000000000001',
  'a4000000-0000-4000-8000-000000000001',
  'Revision evidence',
  now()
);

insert into public.submissions (
  id,project_assignment_id,version,evidence_text,status,submitted_at
) values
('a5000000-0000-4000-8000-000000000001','a4000000-0000-4000-8000-000000000001',1,'Revision evidence','submitted',now()),
('a5000000-0000-4000-8000-000000000002','a4000000-0000-4000-8000-000000000002',1,'Approval evidence','submitted',now()),
('a5000000-0000-4000-8000-000000000003','a4000000-0000-4000-8000-000000000004',1,'Terminal evidence','submitted',now());

set local role authenticated;
select set_config('request.jwt.claim.sub','a1000000-0000-4000-8000-000000000002',true);

select throws_ok(
  $$select public.review_submission(
    'a5000000-0000-4000-8000-000000000001','approved','Looks good',null,
    '[{"criterion_id":"30000000-0000-4000-8000-000000000001","outcome":"pass"}]'::jsonb
  )$$,
  'PT403','reviewer_access_required','learner cannot review a submission'
);
select throws_ok(
  $$insert into public.reviews(submission_id,reviewer_id,decision,summary)
    values ('a5000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000002','approved','bypass')$$,
  '42501',null,'learner cannot insert a review directly'
);

select set_config('request.jwt.claim.sub','a1000000-0000-4000-8000-000000000001',true);

select throws_ok(
  $$select public.review_submission(
    'a5000000-0000-4000-8000-000000000001','revision_required','Needs focus','One correction',
    '[{"criterion_id":"30000000-0000-4000-8000-000000000001","outcome":"revise","note":"Be specific"}]'::jsonb
  )$$,
  '22023','review_criteria_incomplete','all assignment criteria are required'
);
select is((select count(*) from public.reviews),0::bigint,'failed validation writes no review');
select throws_ok(
  $$select public.review_submission(
    'a5000000-0000-4000-8000-000000000001','approved','Looks good',null,
    '[{"criterion_id":"30000000-0000-4000-8000-000000000001","outcome":"pass"},{"criterion_id":"30000000-0000-4000-8000-000000000002","outcome":"revise","note":"Clarify"},{"criterion_id":"30000000-0000-4000-8000-000000000003","outcome":"pass"}]'::jsonb
  )$$,
  '22023','approval_requires_all_pass','approval requires every criterion to pass'
);
select throws_ok(
  $$select public.review_submission(
    'a5000000-0000-4000-8000-000000000001','revision_required','Needs focus','One correction',
    '[{"criterion_id":"30000000-0000-4000-8000-000000000001","outcome":"pass"},{"criterion_id":"30000000-0000-4000-8000-000000000002","outcome":"pass"},{"criterion_id":"30000000-0000-4000-8000-000000000003","outcome":"pass"}]'::jsonb
  )$$,
  '22023','revision_requires_revise_outcome','revision requires at least one revise outcome'
);
select throws_ok(
  $$select public.review_submission(
    'a5000000-0000-4000-8000-000000000001','revision_required','Needs focus','One correction',
    '[{"criterion_id":"30000000-0000-4000-8000-000000000001","outcome":"pass"},{"criterion_id":"30000000-0000-4000-8000-000000000002","outcome":"revise"},{"criterion_id":"30000000-0000-4000-8000-000000000003","outcome":"pass"}]'::jsonb
  )$$,
  '22023','review_criteria_invalid','a revised criterion requires a note'
);
select lives_ok(
  $$select public.review_submission(
    'a5000000-0000-4000-8000-000000000001','revision_required','Two criteria pass; one needs specificity.','Name one concrete present alternative.',
    '[{"criterion_id":"30000000-0000-4000-8000-000000000001","outcome":"pass","note":"Specific user is clear."},{"criterion_id":"30000000-0000-4000-8000-000000000002","outcome":"pass"},{"criterion_id":"30000000-0000-4000-8000-000000000003","outcome":"revise","note":"The current alternative is missing."}]'::jsonb
  )$$,
  'reviewer records a complete revision decision atomically'
);
select results_eq(
  $$select decision,summary,priority_correction,reviewer_id from public.reviews where submission_id = 'a5000000-0000-4000-8000-000000000001'$$,
  $$values ('revision_required'::text,'Two criteria pass; one needs specificity.'::text,'Name one concrete present alternative.'::text,'a1000000-0000-4000-8000-000000000001'::uuid)$$,
  'revision stores the final review and reviewer'
);
select results_eq(
  $$select outcome,note from public.review_criteria where review_id = (select id from public.reviews where submission_id = 'a5000000-0000-4000-8000-000000000001') order by acceptance_criterion_id$$,
  $$values ('pass'::text,'Specific user is clear.'::text),('pass'::text,null::text),('revise'::text,'The current alternative is missing.'::text)$$,
  'criterion outcomes and notes stay attached to the review'
);
select results_eq(
  $$select status,reviewed_at is not null from public.submissions where id = 'a5000000-0000-4000-8000-000000000001'$$,
  $$values ('revision_required'::text,true)$$,
  'revision updates the immutable submission state and timestamp'
);
select is(
  (select state from public.project_assignments where id = 'a4000000-0000-4000-8000-000000000001'),
  'revision_required'::text,
  'revision reopens the assignment without unlocking another task'
);
select is(
  (select state from public.project_assignments where id = 'a4000000-0000-4000-8000-000000000005'),
  'locked'::text,
  'revision keeps the next ordered assignment locked'
);
select is(
  (select count(*) from public.activity_events where project_id = 'a3000000-0000-4000-8000-000000000001' and event_type = 'revision_requested'),
  1::bigint,
  'revision appends one activity event'
);
select throws_ok(
  $$select public.review_submission(
    'a5000000-0000-4000-8000-000000000001','revision_required','Again','Again',
    '[{"criterion_id":"30000000-0000-4000-8000-000000000001","outcome":"pass"},{"criterion_id":"30000000-0000-4000-8000-000000000002","outcome":"pass"},{"criterion_id":"30000000-0000-4000-8000-000000000003","outcome":"revise","note":"Again"}]'::jsonb
  )$$,
  'PT409','submission_already_reviewed','a final review cannot be repeated'
);
select throws_ok(
  $$update public.reviews set summary = 'changed'$$,
  '42501',null,'reviewer cannot update reviews directly'
);
select throws_ok(
  $$update public.review_criteria set note = 'changed'$$,
  '42501',null,'reviewer cannot update criterion outcomes directly'
);

select set_config('request.jwt.claim.sub','a1000000-0000-4000-8000-000000000002',true);
select is((select count(*) from public.reviews),1::bigint,'owner reads their final review');
select is((select count(*) from public.review_criteria),3::bigint,'owner reads their criterion outcomes');
select results_eq(
  $$select summary,priority_correction from public.reviews where submission_id = 'a5000000-0000-4000-8000-000000000001'$$,
  $$values ('Two criteria pass; one needs specificity.'::text,'Name one concrete present alternative.'::text)$$,
  'owner reads the summary and single priority correction'
);
select is(
  (select evidence_text from public.assignment_drafts where project_assignment_id = 'a4000000-0000-4000-8000-000000000001'),
  'Revision evidence'::text,
  'revision reopens the retained draft with the reviewed evidence'
);

select set_config('request.jwt.claim.sub','a1000000-0000-4000-8000-000000000003',true);
select is((select count(*) from public.reviews),0::bigint,'other learner cannot read another review');
select is((select count(*) from public.review_criteria),0::bigint,'other learner cannot read another criterion outcome');

select set_config('request.jwt.claim.sub','a1000000-0000-4000-8000-000000000002',true);
select lives_ok(
  $$select public.save_assignment_draft(
    'a4000000-0000-4000-8000-000000000001',
    'Revision evidence with a concrete alternative',
    '[{"link_type":"research","label":"Revised evidence","url":"https://example.com/revised","position":1}]'::jsonb,
    (select updated_at from public.assignment_drafts where project_assignment_id = 'a4000000-0000-4000-8000-000000000001')
  )$$,
  'owner edits the retained draft after revision'
);
select lives_ok(
  $$select public.submit_assignment(
    'a4000000-0000-4000-8000-000000000001',
    (select updated_at from public.assignment_drafts where project_assignment_id = 'a4000000-0000-4000-8000-000000000001')
  )$$,
  'owner resubmits the corrected draft'
);
select results_eq(
  $$select version,evidence_text,status from public.submissions where project_assignment_id = 'a4000000-0000-4000-8000-000000000001' order by version$$,
  $$values (1::smallint,'Revision evidence'::text,'revision_required'::text),(2::smallint,'Revision evidence with a concrete alternative'::text,'submitted'::text)$$,
  'resubmission preserves version one and creates immutable version two'
);
select ok(
  (select newer.supersedes_submission_id = older.id
   from public.submissions as newer
   join public.submissions as older on older.project_assignment_id = newer.project_assignment_id and older.version = 1
   where newer.project_assignment_id = 'a4000000-0000-4000-8000-000000000001' and newer.version = 2),
  'version two points to the reviewed version it supersedes'
);
select is(
  (select count(*) from public.reviews as review join public.submissions as submission on submission.id = review.submission_id where submission.project_assignment_id = 'a4000000-0000-4000-8000-000000000001' and submission.version = 1),
  1::bigint,
  'the revision review remains attached only to version one'
);
select is(
  (select state from public.project_assignments where id = 'a4000000-0000-4000-8000-000000000005'),
  'locked'::text,
  'resubmission still leaves the next assignment locked'
);

select set_config('request.jwt.claim.sub','a1000000-0000-4000-8000-000000000001',true);
select lives_ok(
  $$select public.review_submission(
    'a5000000-0000-4000-8000-000000000002','approved','All three criteria are specific and sufficient.',null,
    '[{"criterion_id":"30000000-0000-4000-8000-000000000001","outcome":"pass"},{"criterion_id":"30000000-0000-4000-8000-000000000002","outcome":"pass"},{"criterion_id":"30000000-0000-4000-8000-000000000003","outcome":"pass"}]'::jsonb
  )$$,
  'reviewer approves a complete review'
);
select results_eq(
  $$select decision,priority_correction is null from public.reviews where submission_id = 'a5000000-0000-4000-8000-000000000002'$$,
  $$values ('approved'::text,true)$$,
  'approval stores no priority correction'
);
select results_eq(
  $$select status,reviewed_at is not null from public.submissions where id = 'a5000000-0000-4000-8000-000000000002'$$,
  $$values ('approved'::text,true)$$,
  'approval updates the reviewed submission'
);
select results_eq(
  $$select state,approved_at is not null from public.project_assignments where id = 'a4000000-0000-4000-8000-000000000002'$$,
  $$values ('approved'::text,true)$$,
  'approval marks the reviewed assignment approved'
);
select results_eq(
  $$select state,available_at is not null from public.project_assignments where id = 'a4000000-0000-4000-8000-000000000003'$$,
  $$values ('available'::text,true)$$,
  'approval unlocks exactly the next assignment'
);
select is(
  (select count(*) from public.activity_events where project_id = 'a3000000-0000-4000-8000-000000000002' and event_type in ('assignment_approved','assignment_unlocked')),
  2::bigint,
  'approval appends approval and unlock events'
);
select throws_ok(
  $$select public.review_submission(
    'a5000000-0000-4000-8000-000000000002','approved','Duplicate approval must lose.',null,
    '[{"criterion_id":"30000000-0000-4000-8000-000000000001","outcome":"pass"},{"criterion_id":"30000000-0000-4000-8000-000000000002","outcome":"pass"},{"criterion_id":"30000000-0000-4000-8000-000000000003","outcome":"pass"}]'::jsonb
  )$$,
  'PT409','submission_already_reviewed','a serialized second reviewer decision is rejected'
);
select is(
  (select count(*) from public.reviews where submission_id = 'a5000000-0000-4000-8000-000000000002'),
  1::bigint,
  'rejected double review creates no duplicate review'
);
select is(
  (select count(*) from public.activity_events where project_id = 'a3000000-0000-4000-8000-000000000002' and event_type in ('assignment_approved','assignment_unlocked')),
  2::bigint,
  'rejected double review creates no duplicate approval or unlock event'
);
select lives_ok(
  $$select public.review_submission(
    'a5000000-0000-4000-8000-000000000003','approved','The final reflection, case study, and next step all pass.',null,
    '[{"criterion_id":"30000000-0000-4000-8000-000000000028","outcome":"pass"},{"criterion_id":"30000000-0000-4000-8000-000000000029","outcome":"pass"},{"criterion_id":"30000000-0000-4000-8000-000000000030","outcome":"pass"}]'::jsonb
  )$$,
  'reviewer approves the terminal assignment'
);
select is(
  (select status from public.projects where id = 'a3000000-0000-4000-8000-000000000003'),
  'completed'::text,
  'terminal approval completes the project'
);
select results_eq(
  $$select state,approved_at is not null from public.project_assignments where id = 'a4000000-0000-4000-8000-000000000004'$$,
  $$values ('approved'::text,true)$$,
  'terminal assignment is approved without a nonexistent unlock'
);
select is(
  (select count(*) from public.activity_events where project_id = 'a3000000-0000-4000-8000-000000000003' and event_type = 'assignment_unlocked'),
  0::bigint,
  'terminal approval appends no unlock event'
);
select is((select count(*) from public.reviews),3::bigint,'reviewer reads every completed review');

select set_config('request.jwt.claim.sub','a1000000-0000-4000-8000-000000000004',true);
select throws_ok(
  $$select public.review_submission(
    'a5000000-0000-4000-8000-000000000002','approved','Bypass',null,'[]'::jsonb
  )$$,
  'PT403','reviewer_access_required','authenticated outsider cannot review'
);

select * from finish();
rollback;
