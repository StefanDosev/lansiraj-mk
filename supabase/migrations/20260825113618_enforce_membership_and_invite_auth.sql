create function private.is_active_project_owner(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.projects as p
    join public.cohort_members as cm
      on cm.cohort_id = p.cohort_id
     and cm.user_id = p.owner_id
     and cm.status = 'active'
    where p.id = p_project_id
      and p.owner_id = (select auth.uid())
  );
$$;

comment on function private.is_active_project_owner(uuid) is
  'Returns true only when the authenticated caller owns the project and still has active cohort membership.';

revoke all on function private.is_active_project_owner(uuid) from public, anon;
grant execute on function private.is_active_project_owner(uuid) to authenticated;

drop policy "owners and reviewers read projects" on public.projects;
create policy "active owners and reviewers read projects"
on public.projects for select to authenticated
using (
  (select private.is_active_project_owner(projects.id))
  or (select private.is_reviewer())
);

drop policy "owners and reviewers read project assignments" on public.project_assignments;
create policy "active owners and reviewers read project assignments"
on public.project_assignments for select to authenticated
using (
  (select private.is_active_project_owner(project_assignments.project_id))
  or (select private.is_reviewer())
);

drop policy "owners and reviewers read activity events" on public.activity_events;
create policy "active owners and reviewers read activity events"
on public.activity_events for select to authenticated
using (
  (select private.is_active_project_owner(activity_events.project_id))
  or (select private.is_reviewer())
);

drop policy "owners and reviewers read scope assessments" on public.project_scope_assessments;
create policy "active owners and reviewers read scope assessments"
on public.project_scope_assessments for select to authenticated
using (
  (select private.is_active_project_owner(project_scope_assessments.project_id))
  or (select private.is_reviewer())
);

drop policy "owners read assignment drafts" on public.assignment_drafts;
create policy "active owners read assignment drafts"
on public.assignment_drafts for select to authenticated
using (
  exists (
    select 1
    from public.project_assignments as pa
    where pa.id = assignment_drafts.project_assignment_id
      and (select private.is_active_project_owner(pa.project_id))
  )
);

drop policy "owners read assignment draft links" on public.assignment_draft_links;
create policy "active owners read assignment draft links"
on public.assignment_draft_links for select to authenticated
using (
  exists (
    select 1
    from public.assignment_drafts as d
    join public.project_assignments as pa on pa.id = d.project_assignment_id
    where d.id = assignment_draft_links.draft_id
      and (select private.is_active_project_owner(pa.project_id))
  )
);

drop policy "owners and reviewers read submissions" on public.submissions;
create policy "active owners and reviewers read submissions"
on public.submissions for select to authenticated
using (
  exists (
    select 1
    from public.project_assignments as pa
    where pa.id = submissions.project_assignment_id
      and (
        (select private.is_active_project_owner(pa.project_id))
        or (select private.is_reviewer())
      )
  )
);

drop policy "owners and reviewers read submission links" on public.submission_links;
create policy "active owners and reviewers read submission links"
on public.submission_links for select to authenticated
using (
  exists (
    select 1
    from public.submissions as s
    join public.project_assignments as pa on pa.id = s.project_assignment_id
    where s.id = submission_links.submission_id
      and (
        (select private.is_active_project_owner(pa.project_id))
        or (select private.is_reviewer())
      )
  )
);

drop policy "owners and reviewers read reviews" on public.reviews;
create policy "active owners and reviewers read reviews"
on public.reviews for select to authenticated
using (
  exists (
    select 1
    from public.submissions as s
    join public.project_assignments as pa on pa.id = s.project_assignment_id
    where s.id = reviews.submission_id
      and (
        (select private.is_active_project_owner(pa.project_id))
        or (select private.is_reviewer())
      )
  )
);

drop policy "owners and reviewers read review criteria" on public.review_criteria;
create policy "active owners and reviewers read review criteria"
on public.review_criteria for select to authenticated
using (
  exists (
    select 1
    from public.reviews as r
    join public.submissions as s on s.id = r.submission_id
    join public.project_assignments as pa on pa.id = s.project_assignment_id
    where r.id = review_criteria.review_id
      and (
        (select private.is_active_project_owner(pa.project_id))
        or (select private.is_reviewer())
      )
  )
);

create function private.enforce_active_draft_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_project_id uuid;
  v_owner_id uuid;
begin
  if v_user_id is null then
    return new;
  end if;

  select p.id, p.owner_id
  into v_project_id, v_owner_id
  from public.project_assignments as pa
  join public.projects as p on p.id = pa.project_id
  where pa.id = new.project_assignment_id;

  if v_owner_id = v_user_id
    and not (select private.is_active_project_owner(v_project_id))
  then
    raise exception using errcode = 'PT403', message = 'active_membership_required';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_active_draft_owner() from public, anon, authenticated;

create trigger assignment_drafts_require_active_owner
before insert or update on public.assignment_drafts
for each row execute function private.enforce_active_draft_owner();

create function private.enforce_active_submission_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_project_id uuid;
  v_owner_id uuid;
begin
  if v_user_id is null then
    return new;
  end if;

  select p.id, p.owner_id
  into v_project_id, v_owner_id
  from public.project_assignments as pa
  join public.projects as p on p.id = pa.project_id
  where pa.id = new.project_assignment_id;

  if v_owner_id = v_user_id
    and not (select private.is_active_project_owner(v_project_id))
  then
    raise exception using errcode = 'PT403', message = 'active_membership_required';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_active_submission_owner() from public, anon, authenticated;

create trigger submissions_require_active_owner
before insert on public.submissions
for each row execute function private.enforce_active_submission_owner();

create function private.enforce_reviewable_membership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.submissions as s
    join public.project_assignments as pa on pa.id = s.project_assignment_id
    join public.projects as p on p.id = pa.project_id
    join public.cohort_members as cm
      on cm.cohort_id = p.cohort_id
     and cm.user_id = p.owner_id
     and cm.status = 'active'
    where s.id = new.submission_id
  ) then
    raise exception using errcode = 'PT409', message = 'submission_not_reviewable';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_reviewable_membership() from public, anon, authenticated;

create trigger reviews_require_active_membership
before insert on public.reviews
for each row execute function private.enforce_reviewable_membership();

create index cohort_invites_pending_email_idx
  on public.cohort_invites(email)
  where accepted_at is null;

create policy "auth hook reads pending invites"
on public.cohort_invites for select to supabase_auth_admin
using (accepted_at is null and expires_at > now());

grant usage on schema private to supabase_auth_admin;
grant select on public.cohort_invites to supabase_auth_admin;

create function private.before_user_created(event jsonb)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_email text := lower(trim(event -> 'user' ->> 'email'));
begin
  if v_email is not null and exists (
    select 1
    from public.cohort_invites as invite
    where invite.email = v_email
      and invite.accepted_at is null
      and invite.expires_at > now()
  ) then
    return '{}'::jsonb;
  end if;

  return jsonb_build_object(
    'error',
    jsonb_build_object(
      'http_code', 403,
      'message', 'Sign-up is not available.'
    )
  );
end;
$$;

comment on function private.before_user_created(jsonb) is
  'Allows creation of an Auth principal only when a pending, unexpired cohort invite matches the normalized email.';

revoke all on function private.before_user_created(jsonb) from public, anon, authenticated;
grant execute on function private.before_user_created(jsonb) to supabase_auth_admin;
