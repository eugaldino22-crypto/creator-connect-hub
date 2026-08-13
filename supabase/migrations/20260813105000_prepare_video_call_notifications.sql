-- Prepare video_calls before the notification trigger migration runs.
-- The notification trigger needs to know who initiated the call.

ALTER TABLE public.video_calls
  ADD COLUMN IF NOT EXISTS initiated_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

UPDATE public.video_calls
SET initiated_by = creator_id
WHERE initiated_by IS NULL;

ALTER TABLE public.video_calls
  ALTER COLUMN initiated_by SET NOT NULL;

CREATE INDEX IF NOT EXISTS video_calls_initiated_by_idx
  ON public.video_calls (initiated_by, created_at DESC);

DROP POLICY IF EXISTS "creators can create video calls" ON public.video_calls;
CREATE POLICY "creators can create video calls"
  ON public.video_calls FOR INSERT
  WITH CHECK (auth.uid() = creator_id AND initiated_by = auth.uid());

DROP POLICY IF EXISTS "subscribers can create video calls" ON public.video_calls;
CREATE POLICY "subscribers can create video calls"
  ON public.video_calls FOR INSERT
  WITH CHECK (auth.uid() = subscriber_id AND initiated_by = auth.uid());
