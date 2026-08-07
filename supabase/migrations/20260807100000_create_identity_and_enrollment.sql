create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;

create table public.cohorts (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 120),
  status text not null default 'draft'
    check (status in ('draft', 'active', 'completed', 'archived')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table public.cohort_invites (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  email text not null
    check (
      email = lower(trim(email))
      and length(email) between 3 and 320
      and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    ),
  expires_at timestamptz not null,
  accepted_by uuid references auth.users(id) on delete restrict,
  accepted_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (cohort_id, email),
  check (expires_at > created_at),
  check ((accepted_by is null) = (accepted_at is null)),
  check (accepted_at is null or accepted_at >= created_at)
);

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (
    display_name is null or length(trim(display_name)) between 1 and 80
  ),
  locale text not null default 'mk' check (locale = 'mk'),
  timezone text not null default 'Europe/Skopje'
    check (length(trim(timezone)) between 1 and 80),
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (onboarding_completed_at is null or onboarding_completed_at >= created_at)
);

create table public.cohort_members (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'removed')),
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cohort_id, user_id)
);

create table private.reviewer_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  granted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

comment on column private.reviewer_roles.granted_by is
  'Null only for the first trusted administrative reviewer bootstrap.';

create function private.is_reviewer()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from private.reviewer_roles
    where user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_reviewer() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_reviewer() to authenticated;

create trigger cohorts_set_updated_at
before update on public.cohorts
for each row execute function private.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger cohort_members_set_updated_at
before update on public.cohort_members
for each row execute function private.set_updated_at();

create index cohort_invites_cohort_id_idx on public.cohort_invites(cohort_id);
create index cohort_invites_created_by_idx on public.cohort_invites(created_by);
create index cohort_invites_accepted_by_idx
  on public.cohort_invites(accepted_by)
  where accepted_by is not null;
create index cohort_invites_pending_expiry_idx
  on public.cohort_invites(expires_at)
  where accepted_at is null;
create index cohort_members_user_id_idx on public.cohort_members(user_id);
create index cohort_members_active_cohort_idx
  on public.cohort_members(cohort_id, user_id)
  where status = 'active';

alter table public.cohorts enable row level security;
alter table public.cohort_invites enable row level security;
alter table public.profiles enable row level security;
alter table public.cohort_members enable row level security;

create policy "members and reviewers read cohorts"
on public.cohorts for select to authenticated
using (
  (select private.is_reviewer())
  or id in (
    select cohort_id
    from public.cohort_members
    where user_id = (select auth.uid()) and status = 'active'
  )
);

create policy "reviewers create cohorts"
on public.cohorts for insert to authenticated
with check ((select private.is_reviewer()));

create policy "reviewers update cohorts"
on public.cohorts for update to authenticated
using ((select private.is_reviewer()))
with check ((select private.is_reviewer()));

create policy "reviewers read invites"
on public.cohort_invites for select to authenticated
using ((select private.is_reviewer()));

create policy "reviewers create invites"
on public.cohort_invites for insert to authenticated
with check (
  (select private.is_reviewer())
  and created_by = (select auth.uid())
  and accepted_by is null
  and accepted_at is null
);

create policy "reviewers renew pending invites"
on public.cohort_invites for update to authenticated
using ((select private.is_reviewer()) and accepted_at is null)
with check (
  (select private.is_reviewer())
  and accepted_by is null
  and accepted_at is null
);

create policy "users and reviewers read profiles"
on public.profiles for select to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_reviewer())
);

create policy "users update their profiles"
on public.profiles for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "members and reviewers read memberships"
on public.cohort_members for select to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_reviewer())
);

revoke all on public.cohorts from anon, authenticated;
revoke all on public.cohort_invites from anon, authenticated;
revoke all on public.profiles from anon, authenticated;
revoke all on public.cohort_members from anon, authenticated;

grant select on public.cohorts, public.cohort_invites, public.profiles, public.cohort_members
  to authenticated;
grant insert (name, status, starts_at, ends_at) on public.cohorts to authenticated;
grant update (name, status, starts_at, ends_at) on public.cohorts to authenticated;
grant insert (cohort_id, email, expires_at, created_by) on public.cohort_invites
  to authenticated;
grant update (expires_at) on public.cohort_invites to authenticated;
grant update (display_name, locale, timezone) on public.profiles to authenticated;

revoke all on private.reviewer_roles from public, anon, authenticated;
