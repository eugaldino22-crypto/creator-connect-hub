-- SECRET security hardening pass.
-- Align payout lifecycle, lock privileged RPCs, harden video-call updates,
-- and repair the platform_settings schema used by the Super Admin UI.

-- 1) Repair platform_settings schema.
ALTER TABLE public.platform_settings
  ADD COLUMN IF NOT EXISTS description TEXT;

-- 2) Privileged RPCs: callable by backend/service role, not by public clients.
REVOKE ALL ON FUNCTION public.create_notification(UUID,TEXT,TEXT,TEXT,TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.activate_subscription_from_gateway(UUID,TEXT,INTEGER,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_notification(UUID,TEXT,TEXT,TEXT,TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.activate_subscription_from_gateway(UUID,TEXT,INTEGER,TEXT) TO service_role;

-- Keep notification reads/writes user-scoped; notification rows are created by trusted triggers.
DROP POLICY IF EXISTS "notif_insert_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_own" ON public.notifications;

-- 3) Payout lifecycle is requested -> processing -> paid, or requested -> rejected.
-- Do not write 'pending'/'approved' into the enum-backed status column.
CREATE OR REPLACE FUNCTION public.request_creator_payout(
  _amount_cents INTEGER,
  _currency TEXT,
  _destination TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _creator UUID := auth.uid();
  _available INTEGER;
  _reserved INTEGER;
  _id UUID;
BEGIN
  IF _creator IS NULL OR _amount_cents IS NULL OR _amount_cents <= 0 OR length(trim(coalesce(_destination,''))) < 3 THEN
    RAISE EXCEPTION 'Invalid payout request';
  END IF;

  SELECT COALESCE(available_cents,0)
  INTO _available
  FROM public.creator_balances
  WHERE creator_id = _creator
  FOR UPDATE;

  SELECT COALESCE(SUM(amount_cents),0)
  INTO _reserved
  FROM public.payout_requests
  WHERE creator_id = _creator
    AND status IN ('requested','processing');

  IF GREATEST(COALESCE(_available,0) - COALESCE(_reserved,0),0) < _amount_cents THEN
    RAISE EXCEPTION 'Insufficient available balance';
  END IF;

  INSERT INTO public.payout_requests(creator_id,amount_cents,currency,destination,status)
  VALUES(_creator,_amount_cents,COALESCE(_currency,'USD'),trim(_destination),'requested')
  RETURNING id INTO _id;
  RETURN _id;
END;
$$;

REVOKE ALL ON FUNCTION public.request_creator_payout(INTEGER,TEXT,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_creator_payout(INTEGER,TEXT,TEXT) TO authenticated;

-- 4) Administrative payout review: approval means processing, never paid.
CREATE OR REPLACE FUNCTION public.review_creator_payout(
  _payout_id UUID,
  _decision TEXT,
  _reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _payout public.payout_requests%ROWTYPE;
  _available INTEGER;
  _reserved_other INTEGER;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  IF _decision NOT IN ('approved','rejected') THEN
    RAISE EXCEPTION 'Invalid payout decision';
  END IF;

  SELECT * INTO _payout
  FROM public.payout_requests
  WHERE id = _payout_id
  FOR UPDATE;

  IF NOT FOUND OR _payout.status <> 'requested' THEN
    RETURN FALSE;
  END IF;

  IF _decision = 'approved' THEN
    SELECT COALESCE(available_cents,0)
    INTO _available
    FROM public.creator_balances
    WHERE creator_id = _payout.creator_id
    FOR UPDATE;

    SELECT COALESCE(SUM(amount_cents),0)
    INTO _reserved_other
    FROM public.payout_requests
    WHERE creator_id = _payout.creator_id
      AND status IN ('requested','processing')
      AND id <> _payout.id;

    IF GREATEST(COALESCE(_available,0) - COALESCE(_reserved_other,0),0) < _payout.amount_cents THEN
      RAISE EXCEPTION 'Insufficient available balance';
    END IF;

    UPDATE public.payout_requests
    SET status = 'processing',
        reviewed_at = now(),
        reviewed_by = auth.uid(),
        rejection_reason = NULL
    WHERE id = _payout.id;
  ELSE
    UPDATE public.payout_requests
    SET status = 'rejected',
        reviewed_at = now(),
        reviewed_by = auth.uid(),
        rejection_reason = NULLIF(trim(COALESCE(_reason,'')), '')
    WHERE id = _payout.id;
  END IF;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.review_creator_payout(UUID,TEXT,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.review_creator_payout(UUID,TEXT,TEXT) TO authenticated;

-- 5) Harden video-call updates: participants can only change lifecycle timestamps/status,
-- and cannot rewrite participants or room identifiers.
DROP POLICY IF EXISTS "creators can end their video calls" ON public.video_calls;
DROP POLICY IF EXISTS "subscribers can update their call status" ON public.video_calls;

CREATE OR REPLACE FUNCTION public.update_video_call_status(_call_id UUID, _status TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _call public.video_calls%ROWTYPE;
BEGIN
  SELECT * INTO _call FROM public.video_calls WHERE id = _call_id FOR UPDATE;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  IF auth.uid() IS NULL OR (auth.uid() <> _call.creator_id AND auth.uid() <> _call.subscriber_id) THEN
    RAISE EXCEPTION 'Call participant required';
  END IF;
  IF _status NOT IN ('ringing','active','ended','cancelled') THEN
    RAISE EXCEPTION 'Invalid call status';
  END IF;

  UPDATE public.video_calls
  SET status = _status,
      started_at = CASE WHEN _status = 'active' THEN COALESCE(started_at, now()) ELSE started_at END,
      ended_at = CASE WHEN _status IN ('ended','cancelled') THEN COALESCE(ended_at, now()) ELSE ended_at END
  WHERE id = _call_id;
  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.update_video_call_status(UUID,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_video_call_status(UUID,TEXT) TO authenticated;

CREATE POLICY "video_call_participants_update_status" ON public.video_calls
FOR UPDATE TO authenticated
USING (auth.uid() = creator_id OR auth.uid() = subscriber_id)
WITH CHECK (
  creator_id = (SELECT vc.creator_id FROM public.video_calls vc WHERE vc.id = video_calls.id)
  AND subscriber_id = (SELECT vc.subscriber_id FROM public.video_calls vc WHERE vc.id = video_calls.id)
  AND room_name = (SELECT vc.room_name FROM public.video_calls vc WHERE vc.id = video_calls.id)
);

-- 6) Make Super Admin dashboard/query semantics match enum-backed payout statuses.
-- Frontend is updated in a separate commit.
