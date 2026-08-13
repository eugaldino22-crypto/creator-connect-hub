-- SECRET Phase 2: admin payout workflow. No gateway is connected.
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
DECLARE _payout public.payout_requests%ROWTYPE; _available INTEGER;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Admin access required'; END IF;
  IF _decision NOT IN ('approved','rejected') THEN RAISE EXCEPTION 'Invalid payout decision'; END IF;
  SELECT * INTO _payout FROM public.payout_requests WHERE id = _payout_id FOR UPDATE;
  IF NOT FOUND OR _payout.status <> 'pending' THEN RETURN FALSE; END IF;

  IF _decision = 'approved' THEN
    SELECT COALESCE(available_cents,0) INTO _available FROM public.creator_balances WHERE creator_id = _payout.creator_id FOR UPDATE;
    IF COALESCE(_available,0) < _payout.amount_cents THEN RAISE EXCEPTION 'Insufficient available balance'; END IF;
    UPDATE public.creator_balances SET available_cents = available_cents - _payout.amount_cents, updated_at = now() WHERE creator_id = _payout.creator_id;
  END IF;

  UPDATE public.payout_requests
  SET status = _decision,
      reviewed_at = now(),
      reviewed_by = auth.uid(),
      rejection_reason = CASE WHEN _decision = 'rejected' THEN NULLIF(trim(COALESCE(_reason,'')), '') ELSE NULL END
  WHERE id = _payout_id;
  RETURN TRUE;
END;
$$;

CREATE INDEX IF NOT EXISTS payout_requests_status_created_idx ON public.payout_requests(status, created_at DESC);
