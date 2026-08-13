create table if not exists public.video_calls (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  subscriber_id uuid not null references public.profiles(id) on delete cascade,
  room_name text not null unique,
  status text not null default 'ringing' check (status in ('ringing','active','ended','cancelled')),
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  check (creator_id <> subscriber_id)
);

create index if not exists video_calls_creator_idx on public.video_calls (creator_id, created_at desc);
create index if not exists video_calls_subscriber_idx on public.video_calls (subscriber_id, created_at desc);
create index if not exists video_calls_status_idx on public.video_calls (status, created_at desc);

alter table public.video_calls enable row level security;

create policy "participants can view their video calls"
  on public.video_calls for select
  using (auth.uid() = creator_id or auth.uid() = subscriber_id);

create policy "creators can create video calls"
  on public.video_calls for insert
  with check (auth.uid() = creator_id);

create policy "creators can end their video calls"
  on public.video_calls for update
  using (auth.uid() = creator_id)
  with check (auth.uid() = creator_id);

create policy "subscribers can update their call status"
  on public.video_calls for update
  using (auth.uid() = subscriber_id)
  with check (auth.uid() = subscriber_id);

comment on table public.video_calls is 'One-to-one creator/subscriber video call sessions. Tokens are issued server-side; do not expose LiveKit secrets to the client.';
