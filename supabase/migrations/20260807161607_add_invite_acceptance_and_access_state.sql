create function public.accept_cohort_invite()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  current_email text;
  matching_invite_ids uuid[];
  matching_invite_id uuid;
begin
  if current_user_id is null then
    return 'unauthenticated';
  end if;

  select lower(trim(email))
  into current_email
  from auth.users
  where id = current_user_id
    and email_confirmed_at is not null;

  if current_email is null then
    return 'unverified_email';
  end if;

  if exists (
    select 1
    from public.cohort_members
    where user_id = current_user_id
      and status = 'active'
  ) then
    return 'already_enrolled';
  end if;

  select array_agg(id order by id)
  into matching_invite_ids
  from (
    select id
    from public.cohort_invites
    where email = current_email
      and accepted_at is null
      and expires_at > now()
    order by id
    for update
  ) matching_invites;

  if coalesce(cardinality(matching_invite_ids), 0) = 0 then
    if exists (
      select 1
      from public.cohort_members
      where user_id = current_user_id
        and status = 'active'
    ) then
      return 'already_enrolled';
    end if;

    return 'no_invite';
  end if;

  if cardinality(matching_invite_ids) > 1 then
    return 'ambiguous_invite';
  end if;

  matching_invite_id := matching_invite_ids[1];

  insert into public.profiles (user_id)
  values (current_user_id)
  on conflict (user_id) do nothing;

  insert into public.cohort_members (cohort_id, user_id)
  select cohort_id, current_user_id
  from public.cohort_invites
  where id = matching_invite_id;

  update public.cohort_invites
  set accepted_by = current_user_id,
      accepted_at = now()
  where id = matching_invite_id
    and accepted_at is null;

  if not found then
    raise exception using
      errcode = '40001',
      message = 'Invite acceptance conflicted with another transaction.';
  end if;

  return 'accepted';
end;
$$;

comment on function public.accept_cohort_invite() is
  'Atomically accepts the single unexpired invite matching the authenticated user verified email.';

revoke all on function public.accept_cohort_invite() from public, anon;
grant execute on function public.accept_cohort_invite() to authenticated;

create function public.get_access_state()
returns table (
  is_reviewer boolean,
  has_active_membership boolean,
  onboarding_completed boolean
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    (select private.is_reviewer()),
    exists (
      select 1
      from public.cohort_members
      where user_id = (select auth.uid())
        and status = 'active'
    ),
    exists (
      select 1
      from public.profiles
      where user_id = (select auth.uid())
        and onboarding_completed_at is not null
    );
$$;

comment on function public.get_access_state() is
  'Returns only the authenticated caller route-eligibility flags.';

revoke all on function public.get_access_state() from public, anon;
grant execute on function public.get_access_state() to authenticated;
