drop policy if exists "creators can create video calls" on public.video_calls;

create policy "creators can create calls with active subscribers"
  on public.video_calls for insert
  with check (
    auth.uid() = creator_id
    and exists (
      select 1
      from public.subscriptions s
      where s.creator_id = video_calls.creator_id
        and s.subscriber_id = video_calls.subscriber_id
        and s.status = 'active'
    )
  );
