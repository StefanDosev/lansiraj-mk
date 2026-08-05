begin;

select plan(10);

select is((select count(*) from public.curriculum_stages where curriculum_version = 'v1'), 6::bigint, 'v1 has six stages');
select is((select count(*) from public.assignments where curriculum_version = 'v1'), 10::bigint, 'v1 has ten assignments');
select is((select count(*) from public.acceptance_criteria c join public.assignments a on a.id = c.assignment_id where a.curriculum_version = 'v1'), 30::bigint, 'v1 has thirty criteria');
select is((select min(position) from public.curriculum_stages where curriculum_version = 'v1'), 1::smallint, 'stage positions begin at one');
select is((select max(position) from public.curriculum_stages where curriculum_version = 'v1'), 6::smallint, 'stage positions end at six');
select is((select min(position) from public.assignments where curriculum_version = 'v1'), 1::smallint, 'assignment positions begin at one');
select is((select max(position) from public.assignments where curriculum_version = 'v1'), 10::smallint, 'assignment positions end at ten');
select is((select count(*) from public.assignments where curriculum_version = 'v1' and requires_review), 10::bigint, 'every beta assignment requires review');
select is((select count(distinct slug) from public.assignments where curriculum_version = 'v1'), 10::bigint, 'assignment slugs are unique');
select is((select count(*) from (select assignment_id from public.acceptance_criteria group by assignment_id having array_agg(position order by position) <> array[1,2,3]::smallint[]) gaps), 0::bigint, 'criteria positions are contiguous');

select * from finish();
rollback;
