create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique
    references public.submissions(id) on delete cascade,
  reviewer_id uuid not null
    references auth.users(id) on delete restrict,
  decision text not null
    check (decision in ('approved', 'revision_required')),
  summary text not null
    check (length(trim(summary)) between 1 and 3000),
  priority_correction text,
  created_at timestamptz not null default now(),
  check (
    (decision = 'approved' and priority_correction is null)
    or (
      decision = 'revision_required'
      and priority_correction is not null
      and length(trim(priority_correction)) between 1 and 2000
    )
  )
);

create index reviews_reviewer_id_idx on public.reviews(reviewer_id);

create table public.review_criteria (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null
    references public.reviews(id) on delete cascade,
  acceptance_criterion_id uuid not null
    references public.acceptance_criteria(id) on delete restrict,
  outcome text not null check (outcome in ('pass', 'revise')),
  note text,
  created_at timestamptz not null default now(),
  unique (review_id, acceptance_criterion_id),
  check (note is null or length(trim(note)) between 1 and 2000),
  check (outcome = 'pass' or note is not null)
);

create index review_criteria_acceptance_criterion_id_idx
  on public.review_criteria(acceptance_criterion_id);

alter table public.reviews enable row level security;
alter table public.review_criteria enable row level security;

create policy "owners and reviewers read reviews"
on public.reviews for select to authenticated
using (
  exists (
    select 1
    from public.submissions as s
    join public.project_assignments as pa on pa.id = s.project_assignment_id
    join public.projects as p on p.id = pa.project_id
    where s.id = reviews.submission_id
      and (
        p.owner_id = (select auth.uid())
        or (select private.is_reviewer())
      )
  )
);

create policy "owners and reviewers read review criteria"
on public.review_criteria for select to authenticated
using (
  exists (
    select 1
    from public.reviews as r
    join public.submissions as s on s.id = r.submission_id
    join public.project_assignments as pa on pa.id = s.project_assignment_id
    join public.projects as p on p.id = pa.project_id
    where r.id = review_criteria.review_id
      and (
        p.owner_id = (select auth.uid())
        or (select private.is_reviewer())
      )
  )
);

revoke all on public.reviews from anon, authenticated;
revoke all on public.review_criteria from anon, authenticated;
grant select on public.reviews, public.review_criteria to authenticated;
grant select on public.reviews, public.review_criteria to service_role;

create function public.review_submission(
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
