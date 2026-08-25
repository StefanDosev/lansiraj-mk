create or replace function public.complete_onboarding(
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

  insert into public.activity_events (project_id, actor_id, event_type)
  values (v_project_id, v_user_id, 'onboarding_completed');

  return v_project_id;
end;
$$;

revoke all on function public.complete_onboarding(text, text, text, text, text, text[], smallint, date)
  from public, anon;
grant execute on function public.complete_onboarding(text, text, text, text, text, text[], smallint, date)
  to authenticated;

create or replace function public.review_submission(
  p_submission_id uuid,
  p_decision text,
  p_summary text,
  p_priority_correction text,
  p_criteria jsonb
)
returns table(review_id uuid, decision text, reviewed_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reviewer_id uuid := (select auth.uid());
  v_project_assignment_id uuid;
  v_assignment public.project_assignments%rowtype;
  v_submission public.submissions%rowtype;
  v_project_id uuid;
  v_assignment_position smallint;
  v_expected_criteria_count integer;
  v_review_id uuid;
  v_reviewed_at timestamptz := clock_timestamp();
  v_next_assignment_id uuid;
  v_priority_correction text := nullif(trim(p_priority_correction), '');
begin
  if v_reviewer_id is null then
    raise exception using errcode = 'PT401', message = 'authentication_required';
  end if;

  if not (select private.is_reviewer()) then
    raise exception using errcode = 'PT403', message = 'reviewer_access_required';
  end if;

  if p_submission_id is null then
    raise exception using errcode = '22023', message = 'submission_required';
  end if;

  if p_decision not in ('approved', 'revision_required') then
    raise exception using errcode = '22023', message = 'review_decision_invalid';
  end if;

  if p_summary is null or length(trim(p_summary)) not between 1 and 3000 then
    raise exception using errcode = '22023', message = 'review_summary_invalid';
  end if;

  if p_decision = 'revision_required'
    and (v_priority_correction is null or length(v_priority_correction) > 2000)
  then
    raise exception using errcode = '22023', message = 'priority_correction_required';
  end if;

  if p_decision = 'approved' and v_priority_correction is not null then
    raise exception using errcode = '22023', message = 'priority_correction_not_allowed';
  end if;

  if p_criteria is null or jsonb_typeof(p_criteria) <> 'array' then
    raise exception using errcode = '22023', message = 'review_criteria_invalid';
  end if;

  select s.project_assignment_id
  into v_project_assignment_id
  from public.submissions as s
  where s.id = p_submission_id;

  if not found then
    raise exception using errcode = 'PT404', message = 'submission_not_found';
  end if;

  select pa.*
  into v_assignment
  from public.project_assignments as pa
  where pa.id = v_project_assignment_id
  for update;

  if not found then
    raise exception using errcode = 'PT404', message = 'submission_not_found';
  end if;

  select s.*
  into v_submission
  from public.submissions as s
  where s.id = p_submission_id
    and s.project_assignment_id = v_assignment.id
  for update;

  if not found then
    raise exception using errcode = 'PT404', message = 'submission_not_found';
  end if;

  if exists (
    select 1 from public.reviews as r where r.submission_id = p_submission_id
  ) then
    raise exception using errcode = 'PT409', message = 'submission_already_reviewed';
  end if;

  if v_submission.status <> 'submitted' or v_assignment.state <> 'submitted' then
    raise exception using errcode = 'PT409', message = 'submission_not_reviewable';
  end if;

  select p.id, a.position
  into v_project_id, v_assignment_position
  from public.projects as p
  join public.assignments as a on a.id = v_assignment.assignment_id
  where p.id = v_assignment.project_id
    and p.status = 'active';

  if not found then
    raise exception using errcode = 'PT409', message = 'project_not_reviewable';
  end if;

  select count(*)::integer
  into v_expected_criteria_count
  from public.acceptance_criteria as criterion
  where criterion.assignment_id = v_assignment.assignment_id;

  if jsonb_array_length(p_criteria) <> v_expected_criteria_count then
    raise exception using errcode = '22023', message = 'review_criteria_incomplete';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_criteria)
      as item(criterion_id text, outcome text, note text)
    where item.criterion_id is null
      or item.criterion_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      or item.outcome is null
      or item.outcome not in ('pass', 'revise')
      or length(coalesce(item.note, '')) > 2000
      or (item.note is not null and length(trim(item.note)) = 0)
      or (item.outcome = 'revise' and item.note is null)
  ) then
    raise exception using errcode = '22023', message = 'review_criteria_invalid';
  end if;

  if (
    select count(distinct item.criterion_id)
    from jsonb_to_recordset(p_criteria)
      as item(criterion_id text, outcome text, note text)
  ) <> v_expected_criteria_count then
    raise exception using errcode = '22023', message = 'review_criteria_incomplete';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_criteria)
      as item(criterion_id text, outcome text, note text)
    where not exists (
      select 1
      from public.acceptance_criteria as criterion
      where criterion.assignment_id = v_assignment.assignment_id
        and criterion.id::text = item.criterion_id
    )
  ) then
    raise exception using errcode = '22023', message = 'review_criteria_mismatch';
  end if;

  if p_decision = 'approved' and exists (
    select 1
    from jsonb_to_recordset(p_criteria)
      as item(criterion_id text, outcome text, note text)
    where item.outcome <> 'pass'
  ) then
    raise exception using errcode = '22023', message = 'approval_requires_all_pass';
  end if;

  if p_decision = 'revision_required' and not exists (
    select 1
    from jsonb_to_recordset(p_criteria)
      as item(criterion_id text, outcome text, note text)
    where item.outcome = 'revise'
  ) then
    raise exception using errcode = '22023', message = 'revision_requires_revise_outcome';
  end if;

  insert into public.reviews (
    submission_id,
    reviewer_id,
    decision,
    summary,
    priority_correction,
    created_at
  ) values (
    p_submission_id,
    v_reviewer_id,
    p_decision,
    trim(p_summary),
    case when p_decision = 'revision_required' then v_priority_correction else null end,
    v_reviewed_at
  )
  returning id into v_review_id;

  insert into public.review_criteria (
    review_id,
    acceptance_criterion_id,
    outcome,
    note
  )
  select
    v_review_id,
    item.criterion_id::uuid,
    item.outcome,
    nullif(trim(item.note), '')
  from jsonb_to_recordset(p_criteria)
    as item(criterion_id text, outcome text, note text);

  update public.submissions as s
  set status = p_decision,
      reviewed_at = v_reviewed_at
  where s.id = p_submission_id;

  if p_decision = 'revision_required' then
    update public.project_assignments as pa
    set state = 'revision_required'
    where pa.id = v_assignment.id;

    insert into public.activity_events (
      project_id,
      actor_id,
      event_type,
      metadata,
      created_at
    ) values (
      v_project_id,
      v_reviewer_id,
      'revision_requested',
      jsonb_build_object(
        'assignment_id', v_assignment.assignment_id,
        'submission_id', p_submission_id,
        'review_id', v_review_id,
        'version', v_submission.version
      ),
      v_reviewed_at
    );
  else
    update public.project_assignments as pa
    set state = 'approved',
        approved_at = v_reviewed_at
    where pa.id = v_assignment.id;

    insert into public.activity_events (
      project_id,
      actor_id,
      event_type,
      metadata,
      created_at
    ) values (
      v_project_id,
      v_reviewer_id,
      'assignment_approved',
      jsonb_build_object(
        'assignment_id', v_assignment.assignment_id,
        'submission_id', p_submission_id,
        'review_id', v_review_id,
        'version', v_submission.version
      ),
      v_reviewed_at
    );

    if v_assignment_position = 9 then
      insert into public.activity_events (
        project_id,
        actor_id,
        event_type,
        metadata,
        created_at
      ) values (
        v_project_id,
        v_reviewer_id,
        'project_launched',
        jsonb_build_object(
          'assignment_id', v_assignment.assignment_id,
          'submission_id', p_submission_id,
          'review_id', v_review_id,
          'version', v_submission.version
        ),
        v_reviewed_at
      );
    end if;

    select pa.id
    into v_next_assignment_id
    from public.project_assignments as pa
    join public.assignments as a on a.id = pa.assignment_id
    where pa.project_id = v_project_id
      and a.position > v_assignment_position
    order by a.position
    limit 1
    for update of pa;

    if found then
      if (
        select pa.state <> 'locked'
        from public.project_assignments as pa
        where pa.id = v_next_assignment_id
      ) then
        raise exception using errcode = 'PT409', message = 'next_assignment_not_locked';
      end if;

      update public.project_assignments as pa
      set state = 'available',
          available_at = v_reviewed_at
      where pa.id = v_next_assignment_id;

      insert into public.activity_events (
        project_id,
        actor_id,
        event_type,
        metadata,
        created_at
      ) values (
        v_project_id,
        v_reviewer_id,
        'assignment_unlocked',
        jsonb_build_object(
          'project_assignment_id', v_next_assignment_id,
          'unlocked_by_submission_id', p_submission_id,
          'review_id', v_review_id
        ),
        v_reviewed_at
      );
    else
      update public.projects as p
      set status = 'completed'
      where p.id = v_project_id
        and p.status = 'active';

      if not found then
        raise exception using errcode = 'PT409', message = 'project_completion_conflict';
      end if;
    end if;
  end if;

  return query select v_review_id, p_decision, v_reviewed_at;
end;
$$;

revoke all on function public.review_submission(uuid, text, text, text, jsonb)
  from public, anon;
grant execute on function public.review_submission(uuid, text, text, text, jsonb)
  to authenticated;
