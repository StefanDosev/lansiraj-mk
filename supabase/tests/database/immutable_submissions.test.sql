begin;

select plan(41);

select has_table('public', 'submissions', 'submissions table exists');
select has_table('public', 'submission_links', 'submission links table exists');
select ok((select relrowsecurity from pg_class where oid = 'public.submissions'::regclass), 'submissions has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.submission_links'::regclass), 'submission links has RLS enabled');
select has_function('public', 'submit_assignment', array['uuid','timestamp with time zone'], 'submit assignment function exists');

insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values
('00000000-0000-0000-0000-000000000000','91000000-0000-4000-8000-000000000001','authenticated','authenticated','submit-reviewer@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','91000000-0000-4000-8000-000000000002','authenticated','authenticated','submit-learner@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','91000000-0000-4000-8000-000000000003','authenticated','authenticated','submit-other@example.test','',now(),'{}','{}',now(),now());

insert into public.cohorts (id,name,status)
values ('92000000-0000-4000-8000-000000000001','Submission cohort','active');

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
  non_features,weekly_hours,target_launch_date,status,curriculum_version
) values
('93000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000002','92000000-0000-4000-8000-000000000001','Submission project','A specific learner with one concrete need','A sufficiently detailed and painful learner problem.','Complete one concrete action',array['Chat'],5,current_date + 28,'active','v1'),
('93000000-0000-4000-8000-000000000002','91000000-0000-4000-8000-000000000003','92000000-0000-4000-8000-000000000001','Other project','Another specific learner with one concrete need','Another sufficiently detailed and painful learner problem.','Complete another action',array['Payments'],5,current_date + 28,'active','v1');

insert into public.project_assignments (id,project_id,assignment_id,state,available_at) values
('94000000-0000-4000-8000-000000000001','93000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','available',now()),
('94000000-0000-4000-8000-000000000002','93000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','available',now()),
('94000000-0000-4000-8000-000000000003','93000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000001','available',now());

set local role authenticated;
select set_config('request.jwt.claim.sub','91000000-0000-4000-8000-000000000002',true);

select lives_ok(
  $$select public.save_assignment_draft(
    '94000000-0000-4000-8000-000000000001',
    'Version one evidence',
    '[{"link_type":"research","label":"Notes","url":"https://example.com/notes","position":1},{"link_type":"other","label":"Summary","url":"https://example.com/summary","position":2}]'::jsonb,
    null
  )$$,
  'owner saves evidence before submitting'
);
select lives_ok(
  $$select public.submit_assignment(
    '94000000-0000-4000-8000-000000000001',
    (select updated_at from public.assignment_drafts where project_assignment_id = '94000000-0000-4000-8000-000000000001')
  )$$,
  'owner submits the saved draft atomically'
);
select is((select count(*) from public.submissions),1::bigint,'one immutable submission is visible to its owner');
select results_eq(
  $$select version,evidence_text,status from public.submissions$$,
  $$values (1::smallint,'Version one evidence'::text,'submitted'::text)$$,
  'version one freezes the saved text'
);
select is((select count(*) from public.submission_links),2::bigint,'submission freezes both saved links');
select results_eq(
  $$select link_type,label,url,position from public.submission_links order by position$$,
  $$values ('research'::text,'Notes'::text,'https://example.com/notes'::text,1::smallint),('other'::text,'Summary'::text,'https://example.com/summary'::text,2::smallint)$$,
  'submission link type label URL and order are frozen'
);
select results_eq(
  $$select state,submitted_at is not null from public.project_assignments where id = '94000000-0000-4000-8000-000000000001'$$,
  $$values ('submitted'::text,true)$$,
  'assignment becomes submitted with a timestamp'
);
select is((select count(*) from public.activity_events where event_type = 'assignment_submitted'),1::bigint,'submission activity is appended');
select ok(
  (select metadata @> jsonb_build_object('assignment_id','20000000-0000-4000-8000-000000000001'::uuid,'version',1) from public.activity_events where event_type = 'assignment_submitted'),
  'submission activity identifies the assignment and version'
);
select is((select count(*) from public.assignment_drafts where project_assignment_id = '94000000-0000-4000-8000-000000000001'),1::bigint,'mutable draft is retained after submission');
select throws_ok(
  $$insert into public.submissions(project_assignment_id,version,evidence_text) values ('94000000-0000-4000-8000-000000000001',2,'bypass')$$,
  '42501',null,'owner cannot insert submissions directly'
);
select throws_ok(
  $$update public.submissions set evidence_text = 'changed'$$,
  '42501',null,'owner cannot update submissions directly'
);
select throws_ok(
  $$delete from public.submissions$$,
  '42501',null,'owner cannot delete submissions directly'
);
select throws_ok(
  $$select public.submit_assignment('94000000-0000-4000-8000-000000000001',(select updated_at from public.assignment_drafts where project_assignment_id = '94000000-0000-4000-8000-000000000001'))$$,
  'PT409','submission_already_pending','duplicate submit is rejected clearly'
);
select is((select count(*) from public.submissions),1::bigint,'duplicate submit creates no extra version');

select lives_ok(
  $$select public.save_assignment_draft('94000000-0000-4000-8000-000000000002','','[]'::jsonb,null)$$,
  'a completely blank working draft can still be saved'
);
select throws_ok(
  $$select public.submit_assignment('94000000-0000-4000-8000-000000000002',(select updated_at from public.assignment_drafts where project_assignment_id = '94000000-0000-4000-8000-000000000002'))$$,
  '22023','proof_required','blank draft cannot be submitted'
);
select is((select state from public.project_assignments where id = '94000000-0000-4000-8000-000000000002'),'available'::text,'failed proof leaves assignment available');
select lives_ok(
  $$select public.save_assignment_draft(
    '94000000-0000-4000-8000-000000000002',
    'Now ready',
    '[]'::jsonb,
    (select updated_at from public.assignment_drafts where project_assignment_id = '94000000-0000-4000-8000-000000000002')
  )$$,
  'blank draft can be completed later'
);
select throws_ok(
  $$select public.submit_assignment('94000000-0000-4000-8000-000000000002','2000-01-01T00:00:00Z')$$,
  'PT409','draft_conflict','stale draft timestamp cannot be submitted'
);

reset role;
select throws_ok(
  $$update public.submissions set evidence_text = 'database bypass' where project_assignment_id = '94000000-0000-4000-8000-000000000001'$$,
  'PT409','submission_snapshot_immutable','snapshot trigger prevents privileged evidence mutation'
);
select throws_ok(
  $$update public.submission_links set label = 'database bypass'$$,
  'PT409','submission_link_immutable','link trigger prevents privileged link mutation'
);
update public.submissions
set status = 'revision_required', reviewed_at = clock_timestamp()
where project_assignment_id = '94000000-0000-4000-8000-000000000001';
update public.project_assignments
set state = 'revision_required'
where id = '94000000-0000-4000-8000-000000000001';

set local role authenticated;
select set_config('request.jwt.claim.sub','91000000-0000-4000-8000-000000000002',true);
select lives_ok(
  $$select public.save_assignment_draft(
    '94000000-0000-4000-8000-000000000001',
    'Version two evidence',
    '[{"link_type":"testing","label":"Revised test","url":"https://example.com/revised","position":1}]'::jsonb,
    (select updated_at from public.assignment_drafts where project_assignment_id = '94000000-0000-4000-8000-000000000001')
  )$$,
  'revision reopens the retained draft for editing'
);
select lives_ok(
  $$select public.submit_assignment(
    '94000000-0000-4000-8000-000000000001',
    (select updated_at from public.assignment_drafts where project_assignment_id = '94000000-0000-4000-8000-000000000001')
  )$$,
  'revision creates the next immutable version'
);
select results_eq(
  $$select version,evidence_text,status from public.submissions order by version$$,
  $$values (1::smallint,'Version one evidence'::text,'revision_required'::text),(2::smallint,'Version two evidence'::text,'submitted'::text)$$,
  'submission versions preserve both snapshots'
);
select ok(
  (select newer.supersedes_submission_id = older.id from public.submissions newer join public.submissions older on older.project_assignment_id = newer.project_assignment_id and older.version = 1 where newer.version = 2),
  'version two points to the version it supersedes'
);
select is((select count(*) from public.submissions where status = 'submitted'),1::bigint,'only one version is pending review');
select is((select evidence_text from public.submissions where version = 1),'Version one evidence'::text,'editing the retained draft never changes version one');

select set_config('request.jwt.claim.sub','91000000-0000-4000-8000-000000000003',true);
select is((select count(*) from public.submissions),0::bigint,'other learner cannot read submissions');
select throws_ok(
  $$select public.submit_assignment('94000000-0000-4000-8000-000000000001','2000-01-01T00:00:00Z')$$,
  'PT404','assignment_not_found','other learner cannot submit owner assignment'
);

select set_config('request.jwt.claim.sub','91000000-0000-4000-8000-000000000001',true);
select is((select count(*) from public.submissions),2::bigint,'reviewer can read immutable submission history');
select is((select count(*) from public.submission_links),3::bigint,'reviewer can read frozen submission links');
select throws_ok(
  $$select public.submit_assignment('94000000-0000-4000-8000-000000000001','2000-01-01T00:00:00Z')$$,
  'PT403','learner_access_required','reviewer cannot submit learner evidence'
);

reset role;
set local role anon;
select throws_ok($$select count(*) from public.submissions$$,'42501',null,'anonymous cannot read submissions');
select throws_ok($$select count(*) from public.submission_links$$,'42501',null,'anonymous cannot read submission links');
select throws_ok($$select public.submit_assignment('94000000-0000-4000-8000-000000000001','2000-01-01T00:00:00Z')$$,'42501',null,'anonymous cannot execute submit assignment');

select * from finish();
rollback;
