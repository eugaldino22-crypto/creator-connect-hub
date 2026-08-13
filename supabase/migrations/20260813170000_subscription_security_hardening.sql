-- SECRET: subscription integrity and financial-control hardening.

-- Subscribers may create a pending subscription, but must never be able to
-- self-promote it to active or alter its creator/plan relationship.
DROP POLICY IF EXISTS "sub_update_own" ON public.subscriptions;

CREATE POLICY "sub_update_admin_only" ON public.subscriptions
FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.cancel_subscription(_subscription_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.subscriptions
  SET status = 'canceled', canceled_at = COALESCE(canceled_at, now())
  WHERE id = _subscription_id
    AND subscriber_id = auth.uid()
    AND status IN ('pending','active');
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.cancel_subscription(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_subscription(UUID) TO authenticated;

-- Ensure a subscription cannot reference a plan belonging to another creator.
CREATE OR REPLACE FUNCTION public.validate_subscription_plan_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _plan_creator UUID;
BEGIN
  IF NEW.plan_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT creator_id INTO _plan_creator
  FROM public.subscription_plans
  WHERE id = NEW.plan_id;

  IF _plan_creator IS NULL OR _plan_creator <> NEW.creator_id THEN
    RAISE EXCEPTION 'Subscription plan does not belong to creator';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_subscription_plan_owner ON public.subscriptions;
CREATE TRIGGER trg_validate_subscription_plan_owner
BEFORE INSERT OR UPDATE OF plan_id, creator_id
ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.validate_subscription_plan_owner();

-- Creator commission is a platform-controlled financial parameter.
CREATE OR REPLACE FUNCTION public.protect_creator_commission_rate()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.commission_rate IS DISTINCT FROM NEW.commission_rate
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Commission rate is controlled by the platform';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_creator_commission_rate ON public.creator_profiles;
CREATE TRIGGER trg_protect_creator_commission_rate
BEFORE UPDATE OF commission_rate
ON public.creator_profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_creator_commission_rate();

-- Active subscriptions should only be created by trusted backend activation.
-- A client can create only pending rows through the existing insert policy.
DROP POLICY IF EXISTS "sub_insert_own" ON public.subscriptions;
CREATE POLICY "sub_insert_pending_own" ON public.subscriptions
FOR INSERT TO authenticated
WITH CHECK (subscriber_id = auth.uid() AND status = 'pending');

-- Prevent direct deletion of subscriptions from client sessions.
REVOKE DELETE ON public.subscriptions FROM authenticated;
