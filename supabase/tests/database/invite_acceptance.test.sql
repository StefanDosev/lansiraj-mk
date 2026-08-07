begin;

select plan(22);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '61000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'invited@example.test', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '61000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'expired@example.test', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '61000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'ambiguous@example.test', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '61000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'outsider@example.test', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '61000000-0000-4000-8000-000000000005', 'authenticated', 'authenticated', 'unverified@example.test', '', null, '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '61000000-0000-4000-8000-000000000006', 'authenticated', 'authenticated', 'reviewer-access@example.test', '', now(), '{}', '{}', now(), now());

insert into public.cohorts (id, name, status) values
  ('62000000-0000-4000-8000-000000000001', 'Invite cohort A', 'active'),
  ('62000000-0000-4000-8000-000000000002', 'Invite cohort B', 'active');

insert into public.cohort_invites (id, cohort_id, email, expires_at, created_by, created_at) values
  ('63000000-0000-4000-8000-000000000001', '62000000-0000-4000-8000-000000000001', 'invited@example.test', now() + interval '1 day', '61000000-0000-4000-8000-000000000006', now()),
  ('63000000-0000-4000-8000-000000000002', '62000000-0000-4000-8000-000000000001', 'expired@example.test', now() - interval '1 second', '61000000-0000-4000-8000-000000000006', now() - interval '2 days'),
  ('63000000-0000-4000-8000-000000000003', '62000000-0000-4000-8000-000000000001', 'ambiguous@example.test', now() + interval '1 day', '61000000-0000-4000-8000-000000000006', now()),
  ('63000000-0000-4000-8000-000000000004', '62000000-0000-4000-8000-000000000002', 'ambiguous@example.test', now() + interval '1 day', '61000000-0000-4000-8000-000000000006', now());

insert into private.reviewer_roles (user_id) values
  ('61000000-0000-4000-8000-000000000006');

set local role anon;
select throws_ok(
  $$select public.accept_cohort_invite()$$,
  '42501', null,
  'anonymous cannot execute invite acceptance'
);
select throws_ok(
  $$select * from public.get_access_state()$$,
  '42501', null,
  'anonymous cannot read access state'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '61000000-0000-4000-8000-000000000001', true);

select is(public.accept_cohort_invite(), 'accepted', 'single valid invite is accepted');
select is((select count(*) from public.profiles), 1::bigint, 'acceptance creates the caller profile');
select is((select count(*) from public.cohort_members), 1::bigint, 'acceptance creates one active membership');
reset role;
select is(
  (select accepted_by from public.cohort_invites where id = '63000000-0000-4000-8000-000000000001'),
  '61000000-0000-4000-8000-000000000001'::uuid,
  'acceptance records the authenticated user'
);
set local role authenticated;
select set_config('request.jwt.claim.sub', '61000000-0000-4000-8000-000000000001', true);
select is(public.accept_cohort_invite(), 'already_enrolled', 'repeated callback is idempotent');
select results_eq(
  $$select is_reviewer, has_active_membership, onboarding_completed from public.get_access_state()$$,
  $$values (false, true, false)$$,
  'new learner routes to onboarding'
);

select set_config('request.jwt.claim.sub', '61000000-0000-4000-8000-000000000002', true);
select is(public.accept_cohort_invite(), 'no_invite', 'expired invite is rejected');
select is((select count(*) from public.profiles), 0::bigint, 'expired invite creates no visible profile');
select results_eq(
  $$select is_reviewer, has_active_membership, onboarding_completed from public.get_access_state()$$,
  $$values (false, false, false)$$,
  'expired invite user remains pending'
);

select set_config('request.jwt.claim.sub', '61000000-0000-4000-8000-000000000003', true);
select is(public.accept_cohort_invite(), 'ambiguous_invite', 'multiple valid invites are rejected');
select is((select count(*) from public.profiles), 0::bigint, 'ambiguous invites create no visible profile');
select is(
  (select count(*) from public.cohort_invites where email = 'ambiguous@example.test' and accepted_at is not null),
  0::bigint,
  'ambiguous invites stay untouched'
);

select set_config('request.jwt.claim.sub', '61000000-0000-4000-8000-000000000004', true);
select is(public.accept_cohort_invite(), 'no_invite', 'authenticated outsider is not enrolled');
select results_eq(
  $$select is_reviewer, has_active_membership, onboarding_completed from public.get_access_state()$$,
  $$values (false, false, false)$$,
  'outsider has pending access state'
);

select set_config('request.jwt.claim.sub', '61000000-0000-4000-8000-000000000005', true);
select is(public.accept_cohort_invite(), 'unverified_email', 'unverified email cannot accept an invite');

select set_config('request.jwt.claim.sub', '61000000-0000-4000-8000-000000000006', true);
select results_eq(
  $$select is_reviewer, has_active_membership, onboarding_completed from public.get_access_state()$$,
  $$values (true, false, false)$$,
  'reviewer state takes routing precedence'
);

reset role;
select is(
  (select count(*) from public.profiles where user_id = '61000000-0000-4000-8000-000000000001'),
  1::bigint,
  'accepted profile persists exactly once'
);
select is(
  (select count(*) from public.cohort_members where user_id = '61000000-0000-4000-8000-000000000001'),
  1::bigint,
  'accepted membership persists exactly once'
);
select is(
  (select count(*) from public.profiles where user_id in (
    '61000000-0000-4000-8000-000000000002',
    '61000000-0000-4000-8000-000000000003',
    '61000000-0000-4000-8000-000000000004',
    '61000000-0000-4000-8000-000000000005'
  )),
  0::bigint,
  'rejected outcomes create no profiles'
);
select is(
  (select count(*) from public.cohort_members where user_id in (
    '61000000-0000-4000-8000-000000000002',
    '61000000-0000-4000-8000-000000000003',
    '61000000-0000-4000-8000-000000000004',
    '61000000-0000-4000-8000-000000000005'
  )),
  0::bigint,
  'rejected outcomes create no memberships'
);

select * from finish();
rollback;
