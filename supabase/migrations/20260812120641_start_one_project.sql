alter table public.projects
add column curriculum_version text;

grant select on public.assignments to service_role;

alter table public.projects
add constraint projects_curriculum_version_matches_status_check
check (
  (status = 'draft' and curriculum_version is null)
  or (status in ('active', 'completed', 'archived') and curriculum_version is not null)
);

create table public.project_assignments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  assignment_id uuid not null references public.assignments(id) on delete restrict,
  state text not null check (state in ('locked', 'available', 'submitted', 'revision_required', 'approved')),
  available_at timestamptz,
  submitted_at timestamptz,
  approved_at timestamptz,
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, assignment_id),
  check (
    (state = 'locked' and available_at is null)
    or (state <> 'locked' and available_at is not null)
  ),
  check (submitted_at is null or available_at is not null),
  check (approved_at is null or submitted_at is not null)
);

create index project_assignments_project_id_idx
  on public.project_assignments(project_id);
create index project_assignments_assignment_id_idx
  on public.project_assignments(assignment_id);
create index project_assignments_project_state_idx
  on public.project_assignments(project_id, state);

create trigger project_assignments_set_updated_at
before update on public.project_assignments
for each row execute function private.set_updated_at();

alter table public.project_assignments enable row level security;

create policy "owners and reviewers read project assignments"
on public.project_assignments for select to authenticated
using (
  exists (
    select 1
    from public.projects as p
    where p.id = project_assignments.project_id
      and (
        p.owner_id = (select auth.uid())
        or (select private.is_reviewer())
      )
  )
);

revoke all on public.project_assignments from anon, authenticated;
grant select on public.project_assignments to authenticated;
grant select on public.project_assignments to service_role;

create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  actor_id uuid not null references auth.users(id) on delete restrict,
  event_type text not null check (
    event_type in (
      'onboarding_completed',
      'project_started',
      'assignment_submitted',
      'revision_requested',
      'assignment_approved',
      'assignment_unlocked',
      'project_launched'
    )
  ),
  metadata jsonb not null default '{}'::jsonb
    check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create index activity_events_project_created_at_idx
  on public.activity_events(project_id, created_at desc);
create index activity_events_actor_id_idx
  on public.activity_events(actor_id);

alter table public.activity_events enable row level security;

create policy "owners and reviewers read activity events"
on public.activity_events for select to authenticated
using (
  exists (
    select 1
    from public.projects as p
    where p.id = activity_events.project_id
      and (
        p.owner_id = (select auth.uid())
        or (select private.is_reviewer())
      )
  )
);

revoke all on public.activity_events from anon, authenticated;
grant select on public.activity_events to authenticated;
grant select on public.activity_events to service_role;

create function public.start_project()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_project public.projects%rowtype;
  v_assignment_count integer;
  v_projection_count integer;
  v_available_count integer;
  v_locked_count integer;
  v_first_assignment_id uuid;
begin
  if v_user_id is null then
    raise exception using errcode = 'PT401', message = 'authentication_required';
  end if;

  if (select private.is_reviewer()) then
    raise exception using errcode = 'PT403', message = 'learner_access_required';
  end if;

  select p.*
  into v_project
  from public.projects as p
  where p.owner_id = v_user_id
    and p.status in ('draft', 'active')
  for update;

  if not found then
    raise exception using errcode = 'PT404', message = 'current_project_not_found';
  end if;

  if not exists (
    select 1
    from public.cohort_members as cm
    where cm.cohort_id = v_project.cohort_id
      and cm.user_id = v_user_id
      and cm.status = 'active'
  ) then
    raise exception using errcode = 'PT403', message = 'active_membership_required';
  end if;

  if v_project.status = 'active' then
    select
      count(*),
      count(*) filter (where pa.state = 'available'),
      count(*) filter (where pa.state = 'locked')
    into v_projection_count, v_available_count, v_locked_count
    from public.project_assignments as pa
    join public.assignments as a on a.id = pa.assignment_id
    where pa.project_id = v_project.id
      and a.curriculum_version = v_project.curriculum_version;

    if v_projection_count = 10
      and v_available_count = 1
      and v_locked_count = 9
      and exists (
        select 1
        from public.project_assignments as pa
        join public.assignments as a on a.id = pa.assignment_id
        where pa.project_id = v_project.id
          and a.curriculum_version = v_project.curriculum_version
          and a.position = 1
          and pa.state = 'available'
      )
    then
      return v_project.id;
    end if;

    raise exception using errcode = 'PT409', message = 'project_initialization_inconsistent';
  end if;

  select count(*)
  into v_assignment_count
  from public.assignments as a
  where a.curriculum_version = 'v1';

  select a.id
  into v_first_assignment_id
  from public.assignments as a
  where a.curriculum_version = 'v1'
    and a.position = 1;

  if v_assignment_count <> 10 or v_first_assignment_id is null then
    raise exception using errcode = 'PT409', message = 'curriculum_not_ready';
  end if;

  update public.projects
  set status = 'active',
      curriculum_version = 'v1'
  where id = v_project.id;

  insert into public.project_assignments (
    project_id,
    assignment_id,
    state,
    available_at
  )
  select
    v_project.id,
    a.id,
    case when a.position = 1 then 'available' else 'locked' end,
    case when a.position = 1 then now() else null end
  from public.assignments as a
  where a.curriculum_version = 'v1'
  order by a.position;

  insert into public.activity_events (project_id, actor_id, event_type, metadata)
  values
    (v_project.id, v_user_id, 'project_started', jsonb_build_object('curriculum_version', 'v1')),
    (v_project.id, v_user_id, 'assignment_unlocked', jsonb_build_object('assignment_id', v_first_assignment_id));

  return v_project.id;
end;
$$;

revoke all on function public.start_project() from public, anon;
grant execute on function public.start_project() to authenticated;
