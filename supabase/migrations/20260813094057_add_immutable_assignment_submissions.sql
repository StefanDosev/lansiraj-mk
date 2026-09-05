create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  project_assignment_id uuid not null
    references public.project_assignments(id) on delete cascade,
  version smallint not null check (version > 0),
  evidence_text text not null check (length(evidence_text) <= 10000),
  status text not null default 'submitted'
    check (status in ('submitted', 'revision_required', 'approved')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  supersedes_submission_id uuid references public.submissions(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (project_assignment_id, version),
  check (
    (version = 1 and supersedes_submission_id is null)
    or (version > 1 and supersedes_submission_id is not null)
  ),
  check (reviewed_at is null or reviewed_at >= submitted_at)
);

create unique index submissions_one_pending_per_assignment_idx
  on public.submissions(project_assignment_id)
  where status = 'submitted';

create index submissions_supersedes_submission_id_idx
  on public.submissions(supersedes_submission_id);

create table public.submission_links (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  link_type text not null check (
    link_type in ('research', 'figma', 'repository', 'preview', 'live', 'testing', 'other')
  ),
  label text not null check (length(trim(label)) between 1 and 80),
  url text not null check (length(url) <= 2048 and url ~ '^https://[^[:space:]]+$'),
  position smallint not null check (position between 1 and 10),
  created_at timestamptz not null default now(),
  unique (submission_id, position)
);

create index submission_links_submission_id_idx
  on public.submission_links(submission_id);

alter table public.submissions enable row level security;
alter table public.submission_links enable row level security;

create policy "owners and reviewers read submissions"
on public.submissions for select to authenticated
using (
  exists (
    select 1
    from public.project_assignments as pa
    join public.projects as p on p.id = pa.project_id
    where pa.id = submissions.project_assignment_id
      and (
        p.owner_id = (select auth.uid())
        or (select private.is_reviewer())
      )
  )
);

create policy "owners and reviewers read submission links"
on public.submission_links for select to authenticated
using (
  exists (
    select 1
    from public.submissions as s
    join public.project_assignments as pa on pa.id = s.project_assignment_id
    join public.projects as p on p.id = pa.project_id
    where s.id = submission_links.submission_id
      and (
        p.owner_id = (select auth.uid())
        or (select private.is_reviewer())
      )
  )
);

revoke all on public.submissions from anon, authenticated;
revoke all on public.submission_links from anon, authenticated;
grant select on public.submissions, public.submission_links to authenticated;
grant select on public.submissions, public.submission_links to service_role;

create function private.protect_submission_snapshot()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.project_assignment_id is distinct from old.project_assignment_id
    or new.version is distinct from old.version
    or new.evidence_text is distinct from old.evidence_text
    or new.submitted_at is distinct from old.submitted_at
    or new.supersedes_submission_id is distinct from old.supersedes_submission_id
    or new.created_at is distinct from old.created_at
  then
    raise exception using errcode = 'PT409', message = 'submission_snapshot_immutable';
  end if;

  return new;
end;
$$;

create trigger submissions_protect_snapshot
before update on public.submissions
for each row execute function private.protect_submission_snapshot();

create function private.prevent_submission_link_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception using errcode = 'PT409', message = 'submission_link_immutable';
end;
$$;

create trigger submission_links_prevent_update
before update on public.submission_links
for each row execute function private.prevent_submission_link_update();

create function public.submit_assignment(
  p_project_assignment_id uuid,
  p_expected_draft_updated_at timestamptz
)
returns table(submission_id uuid, version smallint, submitted_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_assignment public.project_assignments%rowtype;
  v_project_id uuid;
  v_draft public.assignment_drafts%rowtype;
  v_link_count integer;
  v_previous_submission_id uuid;
  v_next_version smallint;
  v_submission_id uuid;
  v_submitted_at timestamptz := clock_timestamp();
begin
  if v_user_id is null then
    raise exception using errcode = 'PT401', message = 'authentication_required';
  end if;

  if (select private.is_reviewer()) then
    raise exception using errcode = 'PT403', message = 'learner_access_required';
  end if;

  if p_expected_draft_updated_at is null then
    raise exception using errcode = '22023', message = 'draft_timestamp_required';
  end if;

  select pa.*
  into v_assignment
  from public.project_assignments as pa
  join public.projects as p on p.id = pa.project_id
  where pa.id = p_project_assignment_id
    and p.owner_id = v_user_id
    and p.status = 'active'
  for update of pa;

  if not found then
    raise exception using errcode = 'PT404', message = 'assignment_not_found';
  end if;

  v_project_id := v_assignment.project_id;

  if v_assignment.state = 'submitted' then
    raise exception using errcode = 'PT409', message = 'submission_already_pending';
  end if;

  if v_assignment.state not in ('available', 'revision_required') then
    raise exception using errcode = 'PT409', message = 'assignment_not_submittable';
  end if;

  select d.*
  into v_draft
  from public.assignment_drafts as d
  where d.project_assignment_id = p_project_assignment_id
  for update;

  if not found then
    raise exception using errcode = '22023', message = 'proof_required';
  end if;

  if v_draft.updated_at <> p_expected_draft_updated_at then
    raise exception using errcode = 'PT409', message = 'draft_conflict';
  end if;

  select count(*)
  into v_link_count
  from public.assignment_draft_links as link
  where link.draft_id = v_draft.id;

  if length(trim(v_draft.evidence_text)) = 0 and v_link_count = 0 then
    raise exception using errcode = '22023', message = 'proof_required';
  end if;

  if exists (
    select 1
    from public.submissions as s
    where s.project_assignment_id = p_project_assignment_id
      and s.status = 'submitted'
  ) then
    raise exception using errcode = 'PT409', message = 'submission_already_pending';
  end if;

  select s.id, (s.version + 1)::smallint
  into v_previous_submission_id, v_next_version
  from public.submissions as s
  where s.project_assignment_id = p_project_assignment_id
  order by s.version desc
  limit 1;

  if not found then
    v_previous_submission_id := null;
    v_next_version := 1;
  end if;

  insert into public.submissions (
    project_assignment_id,
    version,
    evidence_text,
    status,
    submitted_at,
    supersedes_submission_id,
    created_at
  ) values (
    p_project_assignment_id,
    v_next_version,
    v_draft.evidence_text,
    'submitted',
    v_submitted_at,
    v_previous_submission_id,
    v_submitted_at
  )
  returning id into v_submission_id;

  insert into public.submission_links (
    submission_id,
    link_type,
    label,
    url,
    position,
    created_at
  )
  select
    v_submission_id,
    link.link_type,
    link.label,
    link.url,
    link.position,
    v_submitted_at
  from public.assignment_draft_links as link
  where link.draft_id = v_draft.id
  order by link.position;

  update public.project_assignments as pa
  set state = 'submitted',
      submitted_at = v_submitted_at
  where pa.id = p_project_assignment_id;

  insert into public.activity_events (project_id, actor_id, event_type, metadata, created_at)
  values (
    v_project_id,
    v_user_id,
    'assignment_submitted',
    jsonb_build_object(
      'assignment_id', v_assignment.assignment_id,
      'submission_id', v_submission_id,
      'version', v_next_version
    ),
    v_submitted_at
  );

  return query
  select v_submission_id, v_next_version, v_submitted_at;
end;
$$;

revoke all on function public.submit_assignment(uuid, timestamptz)
  from public, anon;
grant execute on function public.submit_assignment(uuid, timestamptz)
  to authenticated;
