ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone_number text,
  ADD COLUMN IF NOT EXISTS phone_verified boolean NOT NULL DEFAULT false;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS amount_cents integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS creator_amount_cents integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

ALTER TABLE public.payout_requests
  ADD COLUMN IF NOT EXISTS destination text,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

ALTER TABLE public.platform_settings
  ADD COLUMN IF NOT EXISTS description text;

CREATE TABLE IF NOT EXISTS public.video_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscriber_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_name text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'ringing',
  initiated_by uuid,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.video_calls TO authenticated;
GRANT ALL ON public.video_calls TO service_role;

ALTER TABLE public.video_calls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS video_calls_participants_select ON public.video_calls;
CREATE POLICY video_calls_participants_select ON public.video_calls
  FOR SELECT TO authenticated
  USING (creator_id = auth.uid() OR subscriber_id = auth.uid());

CREATE INDEX IF NOT EXISTS video_calls_subscriber_idx ON public.video_calls (subscriber_id, status);
CREATE INDEX IF NOT EXISTS video_calls_creator_idx ON public.video_calls (creator_id, status);

CREATE OR REPLACE FUNCTION public.request_creator_payout(
  _amount_cents integer,
  _currency text,
  _destination text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _available integer;
  _id uuid;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Não autenticado.';
  END IF;

  IF NOT public.has_role(_uid, 'creator') THEN
    RAISE EXCEPTION 'Somente criadores podem solicitar saque.';
  END IF;

  IF _amount_cents IS NULL OR _amount_cents <= 0 THEN
    RAISE EXCEPTION 'Valor inválido.';
  END IF;

  IF _destination IS NULL OR length(btrim(_destination)) < 3 THEN
    RAISE EXCEPTION 'Destino do saque inválido.';
  END IF;

  SELECT available_cents INTO _available FROM public.creator_balances WHERE creator_id = _uid FOR UPDATE;

  IF _available IS NULL OR _available < _amount_cents THEN
    RAISE EXCEPTION 'Saldo disponível insuficiente.';
  END IF;

  INSERT INTO public.payout_requests (creator_id, amount_cents, currency, status, destination)
  VALUES (_uid, _amount_cents, COALESCE(_currency, 'USD'), 'requested', btrim(_destination))
  RETURNING id INTO _id;

  UPDATE public.creator_balances
     SET available_cents = available_cents - _amount_cents,
         pending_cents = pending_cents + _amount_cents,
         updated_at = now()
   WHERE creator_id = _uid;

  RETURN _id;
END; $$;

CREATE OR REPLACE FUNCTION public.review_creator_payout(
  _payout_id uuid,
  _decision text,
  _reason text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _payout public.payout_requests;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso restrito à administração.';
  END IF;

  IF _decision NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Decisão inválida.';
  END IF;

  SELECT * INTO _payout FROM public.payout_requests WHERE id = _payout_id FOR UPDATE;

  IF _payout.id IS NULL THEN
    RAISE EXCEPTION 'Solicitação não encontrada.';
  END IF;

  IF _payout.status <> 'requested' THEN
    RAISE EXCEPTION 'Solicitação já analisada.';
  END IF;

  IF _decision = 'approved' THEN
    UPDATE public.payout_requests
       SET status = 'processing', reviewed_at = now()
     WHERE id = _payout_id;
  ELSE
    IF _reason IS NULL OR length(btrim(_reason)) = 0 THEN
      RAISE EXCEPTION 'Informe o motivo da recusa.';
    END IF;

    UPDATE public.payout_requests
       SET status = 'rejected', reviewed_at = now(), rejection_reason = btrim(_reason)
     WHERE id = _payout_id;

    UPDATE public.creator_balances
       SET available_cents = available_cents + _payout.amount_cents,
           pending_cents = GREATEST(pending_cents - _payout.amount_cents, 0),
           updated_at = now()
     WHERE creator_id = _payout.creator_id;
  END IF;

  INSERT INTO public.audit_logs (actor_user_id, action, target_type, target_id, metadata)
  VALUES (auth.uid(), 'payout.' || _decision, 'payout_request', _payout_id,
          jsonb_build_object('amount_cents', _payout.amount_cents, 'reason', _reason));
END; $$;

CREATE OR REPLACE FUNCTION public.update_platform_setting(_key text, _value jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _old jsonb;
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Acesso restrito ao Super Admin.';
  END IF;

  SELECT value INTO _old FROM public.platform_settings WHERE key = _key;

  INSERT INTO public.platform_settings (key, value, updated_at, updated_by)
  VALUES (_key, _value, now(), auth.uid())
  ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value, updated_at = now(), updated_by = auth.uid();

  INSERT INTO public.audit_logs (actor_user_id, action, target_type, target_id, metadata)
  VALUES (auth.uid(), 'platform_setting.update', 'platform_setting', NULL,
          jsonb_build_object('key', _key, 'old_value', _old, 'new_value', _value));
END; $$;

REVOKE ALL ON FUNCTION public.request_creator_payout(integer, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.review_creator_payout(uuid, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.update_platform_setting(text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_creator_payout(integer, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_creator_payout(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_platform_setting(text, jsonb) TO authenticated;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.ensure_creator_balance() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_comment_count() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_like_count() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;