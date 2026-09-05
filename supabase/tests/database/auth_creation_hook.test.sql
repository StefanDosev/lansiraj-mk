begin;

select plan(9);

select has_function(
  'private',
  'before_user_created',
  array['jsonb'],
  'before-user-created hook exists'
);

select ok(
  has_function_privilege(
    'supabase_auth_admin',
    'private.before_user_created(jsonb)',
    'execute'
  ),
  'Supabase Auth administrator can execute the hook'
);

insert into auth.users (
  instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
  raw_app_meta_data,raw_user_meta_data,created_at,updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  'a1000000-0000-4000-8000-000000000001',
  'authenticated','authenticated','hook-reviewer@example.test','',now(),'{}','{}',now(),now()
);

insert into public.cohorts (id,name,status)
values ('a2000000-0000-4000-8000-000000000001','Hook cohort','active');

insert into public.cohort_invites (id,cohort_id,email,expires_at,created_by) values
('a3000000-0000-4000-8000-000000000001','a2000000-0000-4000-8000-000000000001','invited@example.test',now() + interval '1 day','a1000000-0000-4000-8000-000000000001'),
('a3000000-0000-4000-8000-000000000002','a2000000-0000-4000-8000-000000000001','expired@example.test',now() + interval '1 second','a1000000-0000-4000-8000-000000000001');

update public.cohort_invites
set expires_at = now() - interval '1 second',
    created_at = now() - interval '1 day'
where id = 'a3000000-0000-4000-8000-000000000002';

select is(
  private.before_user_created('{"user":{"email":" Invited@Example.Test "}}'::jsonb),
  '{}'::jsonb,
  'hook allows a normalized pending invite'
);

select is(
  private.before_user_created('{"user":{"email":"outsider@example.test"}}'::jsonb),
  '{"error":{"http_code":403,"message":"Sign-up is not available."}}'::jsonb,
  'hook rejects an uninvited email'
);

select is(
  private.before_user_created('{"user":{"email":"expired@example.test"}}'::jsonb),
  '{"error":{"http_code":403,"message":"Sign-up is not available."}}'::jsonb,
  'hook rejects an expired invite'
);

select is(
  private.before_user_created('{"user":{}}'::jsonb),
  '{"error":{"http_code":403,"message":"Sign-up is not available."}}'::jsonb,
  'hook rejects a user without an email'
);

set local role authenticated;

select throws_ok(
  $$select private.before_user_created('{"user":{"email":"invited@example.test"}}'::jsonb)$$,
  '42501',null,'authenticated users cannot execute the Auth hook'
);

reset role;
set local role anon;

select throws_ok(
  $$select private.before_user_created('{"user":{"email":"invited@example.test"}}'::jsonb)$$,
  '42501',null,'anonymous users cannot execute the Auth hook'
);

select throws_ok(
  $$select count(*) from public.cohort_invites$$,
  '42501',null,'anonymous users still cannot read invites'
);

select * from finish();
rollback;
