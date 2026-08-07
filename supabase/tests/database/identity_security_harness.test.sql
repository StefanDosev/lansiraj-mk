begin;

select plan(50);

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '51000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'security-reviewer@example.test',
    '',
    now(),
    '{}',
    '{}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '51000000-0000-4000-8000-000000000002',
    'authenticated',
    'authenticated',
    'security-learner-a@example.test',
    '',
    now(),
    '{}',
    '{}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '51000000-0000-4000-8000-000000000003',
    'authenticated',
    'authenticated',
    'security-learner-b@example.test',
    '',
    now(),
    '{}',
    '{}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '51000000-0000-4000-8000-000000000004',
    'authenticated',
    'authenticated',
    'security-outsider@example.test',
    '',
    now(),
    '{}',
    '{}',
    now(),
    now()
  );

insert into public.cohorts (id, name, status) values
  ('52000000-0000-4000-8000-000000000001', 'Security cohort A', 'active'),
  ('52000000-0000-4000-8000-000000000002', 'Security cohort B', 'active');

insert into public.profiles (user_id, display_name) values
  ('51000000-0000-4000-8000-000000000001', 'Security Reviewer'),
  ('51000000-0000-4000-8000-000000000002', 'Security Learner A'),
  ('51000000-0000-4000-8000-000000000003', 'Security Learner B');

insert into public.cohort_members (id, cohort_id, user_id) values
  (
    '53000000-0000-4000-8000-000000000001',
    '52000000-0000-4000-8000-000000000001',
    '51000000-0000-4000-8000-000000000002'
  ),
  (
    '53000000-0000-4000-8000-000000000002',
    '52000000-0000-4000-8000-000000000002',
    '51000000-0000-4000-8000-000000000003'
  );

insert into private.reviewer_roles (user_id) values
  ('51000000-0000-4000-8000-000000000001');

insert into public.cohort_invites (
  id,
  cohort_id,
  email,
  expires_at,
  created_by
) values
  (
    '54000000-0000-4000-8000-000000000001',
    '52000000-0000-4000-8000-000000000001',
    'pending-a@example.test',
    now() + interval '7 days',
    '51000000-0000-4000-8000-000000000001'
  ),
  (
    '54000000-0000-4000-8000-000000000002',
    '52000000-0000-4000-8000-000000000002',
    'pending-b@example.test',
    now() + interval '7 days',
    '51000000-0000-4000-8000-000000000001'
  );

set local role anon;

select throws_ok(
  $$select count(*) from public.cohorts$$,
  '42501', null,
  'anonymous cannot read cohorts'
);
select throws_ok(
  $$select count(*) from public.cohort_invites$$,
  '42501', null,
  'anonymous cannot read invites'
);
select throws_ok(
  $$select count(*) from public.profiles$$,
  '42501', null,
  'anonymous cannot read profiles'
);
select throws_ok(
  $$select count(*) from public.cohort_members$$,
  '42501', null,
  'anonymous cannot read memberships'
);
select throws_ok(
  $$select private.is_reviewer()$$,
  '42501', null,
  'anonymous cannot execute the reviewer helper'
);
select throws_ok(
  $$insert into public.cohorts (name) values ('Anonymous cohort')$$,
  '42501', null,
  'anonymous cannot create cohorts'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '51000000-0000-4000-8000-000000000004', true);

select is((select private.is_reviewer()), false, 'outsider is not a reviewer');
select is((select count(*) from public.cohorts), 0::bigint, 'outsider sees no cohorts');
select is((select count(*) from public.cohort_invites), 0::bigint, 'outsider sees no invites');
select is((select count(*) from public.profiles), 0::bigint, 'outsider sees no profiles');
select is((select count(*) from public.cohort_members), 0::bigint, 'outsider sees no memberships');
select throws_ok(
  $$insert into public.cohorts (name) values ('Outsider cohort')$$,
  '42501', null,
  'outsider cannot create a cohort'
);
select throws_ok(
  $$insert into public.cohort_invites (cohort_id, email, expires_at, created_by)
    values (
      '52000000-0000-4000-8000-000000000001',
      'outsider-invite@example.test',
      now() + interval '7 days',
      '51000000-0000-4000-8000-000000000004'
    )$$,
  '42501', null,
  'outsider cannot create an invite'
);
select throws_ok(
  $$insert into public.profiles (user_id) values
    ('51000000-0000-4000-8000-000000000004')$$,
  '42501', null,
  'outsider cannot create a profile directly'
);
select throws_ok(
  $$insert into public.cohort_members (cohort_id, user_id)
    values (
      '52000000-0000-4000-8000-000000000001',
      '51000000-0000-4000-8000-000000000004'
    )$$,
  '42501', null,
  'outsider cannot enroll themselves'
);
select throws_ok(
  $$insert into private.reviewer_roles (user_id) values
    ('51000000-0000-4000-8000-000000000004')$$,
  '42501', null,
  'outsider cannot self-grant reviewer access'
);

select set_config('request.jwt.claim.sub', '51000000-0000-4000-8000-000000000002', true);

select is((select private.is_reviewer()), false, 'learner A is not a reviewer');
select results_eq(
  $$select user_id from public.profiles order by user_id$$,
  $$values ('51000000-0000-4000-8000-000000000002'::uuid)$$,
  'learner A reads only their profile'
);
select results_eq(
  $$select id from public.cohorts order by id$$,
  $$values ('52000000-0000-4000-8000-000000000001'::uuid)$$,
  'learner A reads only their cohort'
);
select results_eq(
  $$select id from public.cohort_members order by id$$,
  $$values ('53000000-0000-4000-8000-000000000001'::uuid)$$,
  'learner A reads only their membership'
);
select is((select count(*) from public.cohort_invites), 0::bigint, 'learner A sees no invites');
select lives_ok(
  $$update public.profiles set display_name = 'Learner A updated'
    where user_id = '51000000-0000-4000-8000-000000000002'$$,
  'learner A updates a permitted field on their profile'
);
select results_eq(
  $$update public.profiles set display_name = 'Cross-learner write'
    where user_id = '51000000-0000-4000-8000-000000000003'
    returning user_id$$,
  $$select null::uuid where false$$,
  'learner A cannot update learner B profile'
);
select throws_ok(
  $$update public.profiles set onboarding_completed_at = now()
    where user_id = '51000000-0000-4000-8000-000000000002'$$,
  '42501', null,
  'learner A cannot update protected onboarding state'
);
select throws_ok(
  $$insert into public.cohorts (name) values ('Learner A cohort')$$,
  '42501', null,
  'learner A cannot create a cohort'
);
select throws_ok(
  $$insert into public.cohort_members (cohort_id, user_id)
    values (
      '52000000-0000-4000-8000-000000000002',
      '51000000-0000-4000-8000-000000000002'
    )$$,
  '42501', null,
  'learner A cannot join another cohort directly'
);
select throws_ok(
  $$insert into private.reviewer_roles (user_id, granted_by)
    values (
      '51000000-0000-4000-8000-000000000002',
      '51000000-0000-4000-8000-000000000002'
    )$$,
  '42501', null,
  'learner A cannot self-grant reviewer access'
);

select set_config('request.jwt.claim.sub', '51000000-0000-4000-8000-000000000003', true);

select is((select private.is_reviewer()), false, 'learner B is not a reviewer');
select results_eq(
  $$select user_id from public.profiles order by user_id$$,
  $$values ('51000000-0000-4000-8000-000000000003'::uuid)$$,
  'learner B reads only their profile'
);
select results_eq(
  $$select id from public.cohorts order by id$$,
  $$values ('52000000-0000-4000-8000-000000000002'::uuid)$$,
  'learner B reads only their cohort'
);
select results_eq(
  $$select id from public.cohort_members order by id$$,
  $$values ('53000000-0000-4000-8000-000000000002'::uuid)$$,
  'learner B reads only their membership'
);
select is((select count(*) from public.cohort_invites), 0::bigint, 'learner B sees no invites');
select results_eq(
  $$update public.profiles set display_name = 'Cross-learner write'
    where user_id = '51000000-0000-4000-8000-000000000002'
    returning user_id$$,
  $$select null::uuid where false$$,
  'learner B cannot update learner A profile'
);
select throws_ok(
  $$insert into public.cohort_invites (cohort_id, email, expires_at, created_by)
    values (
      '52000000-0000-4000-8000-000000000002',
      'learner-b-invite@example.test',
      now() + interval '7 days',
      '51000000-0000-4000-8000-000000000003'
    )$$,
  '42501', null,
  'learner B cannot create invites'
);
select results_eq(
  $$update public.cohorts set name = 'Learner B mutation'
    where id = '52000000-0000-4000-8000-000000000002'
    returning id$$,
  $$select null::uuid where false$$,
  'learner B cannot update their cohort'
);

select set_config('request.jwt.claim.sub', '51000000-0000-4000-8000-000000000001', true);

select is((select private.is_reviewer()), true, 'reviewer role is recognized');
select is((select count(*) from public.cohorts), 2::bigint, 'reviewer reads all cohorts');
select is((select count(*) from public.cohort_invites), 2::bigint, 'reviewer reads all invites');
select is((select count(*) from public.profiles), 3::bigint, 'reviewer reads all application profiles');
select is((select count(*) from public.cohort_members), 2::bigint, 'reviewer reads all memberships');
select lives_ok(
  $$insert into public.cohorts (name, status) values ('Reviewer cohort', 'draft')$$,
  'reviewer can create a cohort'
);
select lives_ok(
  $$update public.cohorts set name = 'Security cohort A updated'
    where id = '52000000-0000-4000-8000-000000000001'$$,
  'reviewer can update a cohort'
);
select lives_ok(
  $$insert into public.cohort_invites (cohort_id, email, expires_at, created_by)
    values (
      '52000000-0000-4000-8000-000000000001',
      'reviewer-created@example.test',
      now() + interval '7 days',
      '51000000-0000-4000-8000-000000000001'
    )$$,
  'reviewer can create a pending invite as themselves'
);
select throws_ok(
  $$insert into public.cohort_invites (cohort_id, email, expires_at, created_by)
    values (
      '52000000-0000-4000-8000-000000000001',
      'spoofed-creator@example.test',
      now() + interval '7 days',
      '51000000-0000-4000-8000-000000000002'
    )$$,
  '42501', null,
  'reviewer cannot spoof an invite creator'
);
select lives_ok(
  $$update public.cohort_invites set expires_at = now() + interval '14 days'
    where id = '54000000-0000-4000-8000-000000000001'$$,
  'reviewer can renew a pending invite'
);
select throws_ok(
  $$update public.cohort_invites
    set accepted_by = '51000000-0000-4000-8000-000000000004',
        accepted_at = now()
    where id = '54000000-0000-4000-8000-000000000001'$$,
  '42501', null,
  'reviewer cannot directly accept an invite'
);
select results_eq(
  $$update public.profiles set display_name = 'Reviewer mutation'
    where user_id = '51000000-0000-4000-8000-000000000002'
    returning user_id$$,
  $$select null::uuid where false$$,
  'reviewer cannot update a learner profile'
);
select throws_ok(
  $$insert into public.cohort_members (cohort_id, user_id)
    values (
      '52000000-0000-4000-8000-000000000001',
      '51000000-0000-4000-8000-000000000004'
    )$$,
  '42501', null,
  'reviewer cannot directly create memberships'
);
select throws_ok(
  $$insert into private.reviewer_roles (user_id, granted_by)
    values (
      '51000000-0000-4000-8000-000000000004',
      '51000000-0000-4000-8000-000000000001'
    )$$,
  '42501', null,
  'reviewer cannot directly grant another reviewer role'
);
select throws_ok(
  $$delete from public.cohorts
    where id = '52000000-0000-4000-8000-000000000002'$$,
  '42501', null,
  'reviewer cannot delete cohorts directly'
);

select * from finish();
rollback;
