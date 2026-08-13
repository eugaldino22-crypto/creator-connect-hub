ALTER TABLE public.payout_requests ADD COLUMN IF NOT EXISTS amount_cents INTEGER;
ALTER TABLE public.payout_requests ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE public.payout_requests ADD COLUMN IF NOT EXISTS destination TEXT;
ALTER TABLE public.payout_requests ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE public.payout_requests ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE public.payout_requests ADD COLUMN IF NOT EXISTS reviewed_by UUID;
ALTER TABLE public.payout_requests ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
CREATE INDEX IF NOT EXISTS payout_requests_creator_status_idx ON public.payout_requests(creator_id,status,created_at DESC);
CREATE OR REPLACE FUNCTION public.request_creator_payout(_amount_cents INTEGER,_currency TEXT,_destination TEXT)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _creator UUID:=auth.uid(); _available INTEGER; _id UUID;
BEGIN
 IF _creator IS NULL OR _amount_cents IS NULL OR _amount_cents<=0 OR length(trim(coalesce(_destination,'')))<3 THEN RAISE EXCEPTION 'Invalid payout request'; END IF;
 SELECT coalesce(available_cents,0) INTO _available FROM public.creator_balances WHERE creator_id=_creator FOR UPDATE;
 IF coalesce(_available,0)<_amount_cents THEN RAISE EXCEPTION 'Insufficient available balance'; END IF;
 INSERT INTO public.payout_requests(creator_id,amount_cents,currency,destination,status) VALUES(_creator,_amount_cents,coalesce(_currency,'USD'),trim(_destination),'pending') RETURNING id INTO _id;
 RETURN _id;
END; $$;
