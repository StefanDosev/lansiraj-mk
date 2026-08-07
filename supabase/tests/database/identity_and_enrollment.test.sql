begin;

select plan(27);

select has_table('public', 'cohorts', 'cohorts table exists');
select has_table('public', 'cohort_invites', 'cohort invites table exists');
select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'cohort_members', 'cohort members table exists');
select has_table('private', 'reviewer_roles', 'reviewer roles stay in private schema');

select ok(
  (select bool_and(relrowsecurity)
   from pg_class
   where oid in (
     'public.cohorts'::regclass,
     'public.cohort_invites'::regclass,
     'public.profiles'::regclass,
     'public.cohort_members'::regclass
   )),
  'RLS is enabled on every exposed identity table'
);

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
    '41000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'reviewer@example.test',
    '',
    now(),
    '{}',
    '{}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '41000000-0000-4000-8000-000000000002',
    'authenticated',
    'authenticated',
    'learner-a@example.test',
    '',
    now(),
    '{}',
    '{}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '41000000-0000-4000-8000-000000000003',
    'authenticated',
    'authenticated',
    'learner-b@example.test',
    '',
    now(),
    '{}',
    '{}',
    now(),
    now()
  );

insert into public.cohorts (id, name, status, starts_at, ends_at) values (
  '42000000-0000-4000-8000-000000000001',
  'Beta 01',
  'active',
  now(),
  now() + interval '30 days'
);

insert into public.profiles (user_id, display_name) values
  ('41000000-0000-4000-8000-000000000001', 'Reviewer'),
  ('41000000-0000-4000-8000-000000000002', 'Learner A'),
  ('41000000-0000-4000-8000-000000000003', 'Learner B');

insert into public.cohort_members (cohort_id, user_id) values (
  '42000000-0000-4000-8000-000000000001',
  '41000000-0000-4000-8000-000000000002'
);

insert into private.reviewer_roles (user_id, granted_by) values (
  '41000000-0000-4000-8000-000000000001',
  null
);

insert into public.cohort_invites (
  id,
  cohort_id,
  email,
  expires_at,
  created_by
) values (
  '43000000-0000-4000-8000-000000000001',
  '42000000-0000-4000-8000-000000000001',
  'learner-b@example.test',
  now() + interval '7 days',
  '41000000-0000-4000-8000-000000000001'
);

select throws_ok(
  $$insert into public.cohort_invites (cohort_id, email, expires_at, created_by)
    values (
      '42000000-0000-4000-8000-000000000001',
      ' Learner-C@Example.Test ',
      now() + interval '7 days',
      '41000000-0000-4000-8000-000000000001'
    )$$,
  '23514',
  null,
  'invite email must already be normalized'
);

select throws_ok(
  $$insert into public.cohort_invites (cohort_id, email, expires_at, created_by)
    values (
      '42000000-0000-4000-8000-000000000001',
      'learner-b@example.test',
      now() + interval '7 days',
      '41000000-0000-4000-8000-000000000001'
    )$$,
  '23505',
  null,
  'a cohort and normalized email have one durable invite'
);

select throws_ok(
  $$insert into public.cohort_members (cohort_id, user_id)
    values (
      '42000000-0000-4000-8000-000000000001',
      '41000000-0000-4000-8000-000000000002'
    )$$,
  '23505',
  null,
  'a user has one membership per cohort'
);

select throws_ok(
  $$insert into public.cohorts (name, starts_at, ends_at)
    values ('Invalid dates', now(), now() - interval '1 day')$$,
  '23514',
  null,
  'cohort end must follow its start'
);

select throws_ok(
  $$update public.cohort_invites
    set accepted_by = '41000000-0000-4000-8000-000000000003'
    where id = '43000000-0000-4000-8000-000000000001'$$,
  '23514',
  null,
  'invite acceptance identity and timestamp are paired'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '41000000-0000-4000-8000-000000000002', true);

select is((select private.is_reviewer()), false, 'learner is not a reviewer');
select is((select count(*) from public.profiles), 1::bigint, 'learner reads only their profile');
select is((select count(*) from public.cohorts), 1::bigint, 'active member reads their cohort');
select is((select count(*) from public.cohort_members), 1::bigint, 'learner reads only their membership');
select is((select count(*) from public.cohort_invites), 0::bigint, 'learner cannot read invites');

select lives_ok(
  $$update public.profiles set display_name = 'Learner A updated'
    where user_id = '41000000-0000-4000-8000-000000000002'$$,
  'learner can update permitted fields on their profile'
);

select results_eq(
  $$update public.profiles set display_name = 'Not allowed'
    where user_id = '41000000-0000-4000-8000-000000000003'
    returning 1$$,
  $$values (null::integer) limit 0$$,
  'learner cannot update another profile'
);

select throws_ok(
  $$insert into private.reviewer_roles (user_id, granted_by)
    values (
      '41000000-0000-4000-8000-000000000002',
      '41000000-0000-4000-8000-000000000002'
    )$$,
  '42501',
  null,
  'learner cannot self-grant reviewer access'
);

select throws_ok(
  $$insert into public.cohort_members (cohort_id, user_id)
    values (
      '42000000-0000-4000-8000-000000000001',
      '41000000-0000-4000-8000-000000000003'
    )$$,
  '42501',
  null,
  'learner cannot create memberships directly'
);

select set_config('request.jwt.claim.sub', '41000000-0000-4000-8000-000000000001', true);

select is((select private.is_reviewer()), true, 'bootstrapped reviewer is recognized');
select is((select count(*) from public.profiles), 3::bigint, 'reviewer reads all profiles');
select is((select count(*) from public.cohort_invites), 1::bigint, 'reviewer reads invites');

select lives_ok(
  $$update public.cohort_invites
    set expires_at = now() + interval '14 days'
    where id = '43000000-0000-4000-8000-000000000001'$$,
  'reviewer can renew a pending invite'
);

select throws_ok(
  $$update public.cohort_invites
    set accepted_by = '41000000-0000-4000-8000-000000000003',
        accepted_at = now()
    where id = '43000000-0000-4000-8000-000000000001'$$,
  '42501',
  null,
  'reviewer cannot directly mutate protected acceptance fields'
);

reset role;
set local role anon;

select throws_ok(
  $$select count(*) from public.cohorts$$,
  '42501',
  null,
  'anonymous users cannot read cohorts'
);

select throws_ok(
  $$select count(*) from public.profiles$$,
  '42501',
  null,
  'anonymous users cannot read profiles'
);

select * from finish();
rollback;
