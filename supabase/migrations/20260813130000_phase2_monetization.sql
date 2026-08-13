-- SECRET Phase 2: monetization foundation.
-- No payment is considered successful until a trusted gateway webhook confirms it.

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS amount_cents INTEGER,
  ADD COLUMN IF NOT EXISTS currency TEXT,
  ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5,4) NOT NULL DEFAULT 0.1500,
  ADD COLUMN IF NOT EXISTS creator_amount_cents INTEGER,
  ADD COLUMN IF NOT EXISTS gateway_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS subscriptions_gateway_payment_idx
  ON public.subscriptions(gateway, gateway_payment_id);

-- Backfill pending/current rows from their plan where possible.
UPDATE public.subscriptions s
SET amount_cents = COALESCE(s.amount_cents, p.price_cents),
    currency = COALESCE(s.currency, p.currency, 'USD'),
    creator_amount_cents = COALESCE(s.creator_amount_cents, ROUND(COALESCE(p.price_cents, 0) * (1 - s.commission_rate))::INTEGER)
FROM public.subscription_plans p
WHERE p.id = s.plan_id;

CREATE OR REPLACE FUNCTION public.activate_subscription_from_gateway(
  _subscription_id UUID,
  _gateway_payment_id TEXT,
  _amount_cents INTEGER,
  _currency TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _rate NUMERIC(5,4); _creator_amount INTEGER;
BEGIN
  SELECT commission_rate INTO _rate FROM public.subscriptions WHERE id = _subscription_id FOR UPDATE;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  _creator_amount := ROUND(_amount_cents * (1 - COALESCE(_rate, 0.1500)))::INTEGER;

  UPDATE public.subscriptions
  SET status = 'active', amount_cents = _amount_cents, currency = _currency,
      creator_amount_cents = _creator_amount, gateway_payment_id = _gateway_payment_id,
      paid_at = COALESCE(paid_at, now())
  WHERE id = _subscription_id;
  RETURN TRUE;
END;
$$;

-- Creator balance is derived from confirmed active subscriptions, keeping pending
-- checkouts out of available earnings.
CREATE OR REPLACE FUNCTION public.refresh_creator_balance(_creator_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.creator_balances (creator_id, available_cents, pending_cents, updated_at)
  VALUES (
    _creator_id,
    COALESCE((SELECT SUM(creator_amount_cents) FROM public.subscriptions WHERE creator_id = _creator_id AND status = 'active'), 0),
    COALESCE((SELECT SUM(creator_amount_cents) FROM public.subscriptions WHERE creator_id = _creator_id AND status = 'pending'), 0),
    now()
  )
  ON CONFLICT (creator_id) DO UPDATE SET
    available_cents = EXCLUDED.available_cents,
    pending_cents = EXCLUDED.pending_cents,
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_creator_balance_from_subscription()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.refresh_creator_balance(COALESCE(NEW.creator_id, OLD.creator_id));
  IF TG_OP = 'UPDATE' AND OLD.creator_id IS DISTINCT FROM NEW.creator_id THEN
    PERFORM public.refresh_creator_balance(OLD.creator_id);
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_sync_creator_balance_subscription ON public.subscriptions;
CREATE TRIGGER trg_sync_creator_balance_subscription
AFTER INSERT OR UPDATE OF status, amount_cents, creator_amount_cents, creator_id
ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.sync_creator_balance_from_subscription();
