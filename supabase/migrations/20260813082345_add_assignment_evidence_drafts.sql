create table public.assignment_drafts (
  id uuid primary key default gen_random_uuid(),
  project_assignment_id uuid not null unique
    references public.project_assignments(id) on delete cascade,
  evidence_text text not null default '' check (length(evidence_text) <= 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.assignment_draft_links (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid not null references public.assignment_drafts(id) on delete cascade,
  link_type text not null check (
    link_type in ('research', 'figma', 'repository', 'preview', 'live', 'testing', 'other')
  ),
  label text not null check (length(trim(label)) between 1 and 80),
  url text not null check (length(url) <= 2048 and url ~ '^https://[^[:space:]]+$'),
  position smallint not null check (position between 1 and 10),
  created_at timestamptz not null default now(),
  unique (draft_id, position)
);

alter table public.assignment_drafts enable row level security;
alter table public.assignment_draft_links enable row level security;

create policy "owners read assignment drafts"
on public.assignment_drafts for select to authenticated
using (
  exists (
    select 1
    from public.project_assignments as pa
    join public.projects as p on p.id = pa.project_id
    where pa.id = assignment_drafts.project_assignment_id
      and p.owner_id = (select auth.uid())
  )
);

create policy "owners read assignment draft links"
on public.assignment_draft_links for select to authenticated
using (
  exists (
    select 1
    from public.assignment_drafts as d
    join public.project_assignments as pa on pa.id = d.project_assignment_id
    join public.projects as p on p.id = pa.project_id
    where d.id = assignment_draft_links.draft_id
      and p.owner_id = (select auth.uid())
  )
);

revoke all on public.assignment_drafts from anon, authenticated;
revoke all on public.assignment_draft_links from anon, authenticated;
grant select on public.assignment_drafts, public.assignment_draft_links to authenticated;
grant select on public.assignment_drafts, public.assignment_draft_links to service_role;

create function public.save_assignment_draft(
  p_project_assignment_id uuid,
  p_evidence_text text,
  p_links jsonb,
  p_expected_updated_at timestamptz default null
)
returns table(draft_id uuid, updated_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_assignment_state text;
  v_draft public.assignment_drafts%rowtype;
  v_link_count integer;
  v_saved_at timestamptz := clock_timestamp();
begin
  if v_user_id is null then
    raise exception using errcode = 'PT401', message = 'authentication_required';
  end if;

  if (select private.is_reviewer()) then
    raise exception using errcode = 'PT403', message = 'learner_access_required';
  end if;

  if p_evidence_text is null or length(p_evidence_text) > 10000 then
    raise exception using errcode = '22023', message = 'invalid_evidence_text';
  end if;

  if p_links is null or jsonb_typeof(p_links) <> 'array' then
    raise exception using errcode = '22023', message = 'invalid_evidence_links';
  end if;

  v_link_count := jsonb_array_length(p_links);
  if v_link_count > 10 then
    raise exception using errcode = '22023', message = 'too_many_evidence_links';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_links) as link(link_type text, label text, url text, position integer)
    where link.link_type is null
      or link.link_type not in ('research', 'figma', 'repository', 'preview', 'live', 'testing', 'other')
      or link.label is null
      or length(trim(link.label)) not between 1 and 80
      or link.url is null
      or length(link.url) > 2048
      or link.url !~ '^https://[^[:space:]]+$'
      or link.position is null
      or link.position not between 1 and 10
  ) then
    raise exception using errcode = '22023', message = 'invalid_evidence_link';
  end if;

  if (
    select count(distinct link.position) <> v_link_count
      or coalesce(min(link.position), 1) <> 1
      or coalesce(max(link.position), 0) <> v_link_count
    from jsonb_to_recordset(p_links) as link(position integer)
  ) then
    raise exception using errcode = '22023', message = 'duplicate_evidence_link_position';
  end if;

  select pa.state
  into v_assignment_state
  from public.project_assignments as pa
  join public.projects as p on p.id = pa.project_id
  where pa.id = p_project_assignment_id
    and p.owner_id = v_user_id
    and p.status = 'active'
  for update of pa;

  if not found then
    raise exception using errcode = 'PT404', message = 'assignment_not_found';
  end if;

  if v_assignment_state not in ('available', 'revision_required') then
    raise exception using errcode = 'PT409', message = 'assignment_not_editable';
  end if;

  select d.*
  into v_draft
  from public.assignment_drafts as d
  where d.project_assignment_id = p_project_assignment_id
  for update;

  if found then
    if p_expected_updated_at is null or v_draft.updated_at <> p_expected_updated_at then
      raise exception using errcode = 'PT409', message = 'draft_conflict';
    end if;

    update public.assignment_drafts as d
    set evidence_text = p_evidence_text,
        updated_at = v_saved_at
    where d.id = v_draft.id
    returning d.* into v_draft;

    delete from public.assignment_draft_links as link
    where link.draft_id = v_draft.id;
  else
    if p_expected_updated_at is not null then
      raise exception using errcode = 'PT409', message = 'draft_conflict';
    end if;

    insert into public.assignment_drafts (project_assignment_id, evidence_text, updated_at)
    values (p_project_assignment_id, p_evidence_text, v_saved_at)
    returning * into v_draft;
  end if;

  insert into public.assignment_draft_links (draft_id, link_type, label, url, position)
  select
    v_draft.id,
    link.link_type,
    trim(link.label),
    link.url,
    link.position::smallint
  from jsonb_to_recordset(p_links) as link(link_type text, label text, url text, position integer)
  order by link.position;

  return query select v_draft.id, v_draft.updated_at;
end;
$$;

revoke all on function public.save_assignment_draft(uuid, text, jsonb, timestamptz)
  from public, anon;
grant execute on function public.save_assignment_draft(uuid, text, jsonb, timestamptz)
  to authenticated;
