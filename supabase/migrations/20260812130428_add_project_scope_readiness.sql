create table public.project_scope_assessments (
  project_id uuid primary key references public.projects(id) on delete cascade,
  readiness text not null check (readiness in ('ready', 'needs_reduction')),
  note text,
  reviewed_by uuid not null references auth.users(id) on delete restrict,
  reviewed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (note is null or length(trim(note)) between 1 and 600),
  check (readiness <> 'needs_reduction' or length(trim(note)) between 10 and 600)
);

create index project_scope_assessments_reviewed_by_idx
  on public.project_scope_assessments(reviewed_by);

create trigger project_scope_assessments_set_updated_at
before update on public.project_scope_assessments
for each row execute function private.set_updated_at();

alter table public.project_scope_assessments enable row level security;

create policy "owners and reviewers read scope assessments"
on public.project_scope_assessments for select to authenticated
using (
  exists (
    select 1
    from public.projects as p
    where p.id = project_scope_assessments.project_id
      and (
        p.owner_id = (select auth.uid())
        or (select private.is_reviewer())
      )
  )
);

revoke all on public.project_scope_assessments from anon, authenticated;
grant select on public.project_scope_assessments to authenticated;
grant select on public.project_scope_assessments to service_role;

create function public.assess_project_scope(
  p_project_id uuid,
  p_readiness text,
  p_note text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reviewer_id uuid := (select auth.uid());
begin
  if v_reviewer_id is null then
    raise exception using errcode = 'PT401', message = 'authentication_required';
  end if;

  if not (select private.is_reviewer()) then
    raise exception using errcode = 'PT403', message = 'reviewer_access_required';
  end if;

  if p_readiness not in ('ready', 'needs_reduction') then
    raise exception using errcode = '22023', message = 'invalid_scope_readiness';
  end if;

  p_note := nullif(trim(p_note), '');

  if p_note is not null and length(p_note) > 600 then
    raise exception using errcode = '22023', message = 'invalid_scope_note';
  end if;

  if p_readiness = 'needs_reduction'
    and (p_note is null or length(p_note) < 10)
  then
    raise exception using errcode = '22023', message = 'scope_correction_required';
  end if;

  perform 1
  from public.projects as p
  where p.id = p_project_id;

  if not found then
    raise exception using errcode = 'PT404', message = 'project_not_found';
  end if;

  insert into public.project_scope_assessments (
    project_id,
    readiness,
    note,
    reviewed_by,
    reviewed_at
  ) values (
    p_project_id,
    p_readiness,
    p_note,
    v_reviewer_id,
    now()
  )
  on conflict (project_id) do update
  set readiness = excluded.readiness,
      note = excluded.note,
      reviewed_by = excluded.reviewed_by,
      reviewed_at = excluded.reviewed_at;
end;
$$;

revoke all on function public.assess_project_scope(uuid, text, text) from public, anon;
grant execute on function public.assess_project_scope(uuid, text, text) to authenticated;
