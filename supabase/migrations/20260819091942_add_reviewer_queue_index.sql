create index submissions_pending_queue_idx
  on public.submissions(submitted_at, id)
  where status = 'submitted';
