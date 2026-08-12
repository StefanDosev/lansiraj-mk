create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  cohort_id uuid not null references public.cohorts(id) on delete restrict,
  title text not null check (length(trim(title)) between 3 and 120),
  target_user text not null check (length(trim(target_user)) between 20 and 400),
  problem_statement text not null check (length(trim(problem_statement)) between 30 and 600),
  core_action text not null check (length(trim(core_action)) between 10 and 300),
  non_features text[] not null check (
    cardinality(non_features) between 1 and 10
    and array_position(non_features, null) is null
  ),
  weekly_hours smallint not null check (weekly_hours between 1 and 20),
  target_launch_date date not null,
  live_url text,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (live_url is null or live_url ~ '^https://')
);

create unique index projects_one_current_per_owner_idx
  on public.projects(owner_id)
  where status in ('draft', 'active');
create index projects_owner_id_idx on public.projects(owner_id);
create index projects_cohort_id_idx on public.projects(cohort_id);

create trigger projects_set_updated_at
before update on public.projects
for each row execute function private.set_updated_at();

alter table public.projects enable row level security;

create policy "owners and reviewers read projects"
on public.projects for select to authenticated
using (
  owner_id = (select auth.uid())
  or (select private.is_reviewer())
);

revoke all on public.projects from anon, authenticated;
grant select on public.projects to authenticated;
grant select on public.projects to service_role;

create function public.complete_onboarding(
  p_display_name text,
  p_project_title text,
  p_target_user text,
  p_problem_statement text,
  p_core_action text,
  p_non_features text[],
  p_weekly_hours smallint,
  p_target_launch_date date
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_cohort_id uuid;
  v_project_id uuid;
begin
  if v_user_id is null then
    raise exception using errcode = 'PT401', message = 'authentication_required';
  end if;

  if (select private.is_reviewer()) then
    raise exception using errcode = 'PT403', message = 'learner_access_required';
  end if;

  select cm.cohort_id
  into v_cohort_id
  from public.cohort_members as cm
  where cm.user_id = v_user_id and cm.status = 'active'
  order by cm.joined_at
  limit 1;

  if v_cohort_id is null then
    raise exception using errcode = 'PT403', message = 'active_membership_required';
  end if;

  if (
    select count(*)
    from public.cohort_members as cm
    where cm.user_id = v_user_id and cm.status = 'active'
  ) <> 1 then
    raise exception using errcode = 'PT409', message = 'ambiguous_active_membership';
  end if;

  perform 1
  from public.profiles as p
  where p.user_id = v_user_id
  for update;

  if not found then
    raise exception using errcode = 'PT403', message = 'profile_required';
  end if;

  if exists (
    select 1 from public.profiles as p
    where p.user_id = v_user_id and p.onboarding_completed_at is not null
  ) then
    raise exception using errcode = 'PT409', message = 'onboarding_already_completed';
  end if;

  p_display_name := trim(p_display_name);
  p_project_title := trim(p_project_title);
  p_target_user := trim(p_target_user);
  p_problem_statement := trim(p_problem_statement);
  p_core_action := trim(p_core_action);

  if length(p_display_name) not between 2 and 80
    or length(p_project_title) not between 3 and 120
    or length(p_target_user) not between 20 and 400
    or length(p_problem_statement) not between 30 and 600
    or length(p_core_action) not between 10 and 300
    or cardinality(p_non_features) not between 1 and 10
    or exists (
      select 1 from unnest(p_non_features) as item
      where item is null or length(trim(item)) not between 3 and 160
    )
    or p_weekly_hours not between 1 and 20
    or p_target_launch_date < current_date + 1
    or p_target_launch_date > current_date + 84
  then
    raise exception using errcode = '22023', message = 'invalid_onboarding_input';
  end if;

  select array_agg(trim(item) order by ordinal)
  into p_non_features
  from unnest(p_non_features) with ordinality as values_list(item, ordinal);

  insert into public.projects (
    owner_id,
    cohort_id,
    title,
    target_user,
    problem_statement,
    core_action,
    non_features,
    weekly_hours,
    target_launch_date
  ) values (
    v_user_id,
    v_cohort_id,
    p_project_title,
    p_target_user,
    p_problem_statement,
    p_core_action,
    p_non_features,
    p_weekly_hours,
    p_target_launch_date
  )
  returning id into v_project_id;

  update public.profiles
  set display_name = p_display_name,
      onboarding_completed_at = now()
  where user_id = v_user_id;

  return v_project_id;
end;
$$;

revoke all on function public.complete_onboarding(text, text, text, text, text, text[], smallint, date)
  from public, anon;
grant execute on function public.complete_onboarding(text, text, text, text, text, text[], smallint, date)
  to authenticated;
