-- 1) Remove broad self-insert on user_roles; replace with controlled RPC
DROP POLICY IF EXISTS "roles_self_insert" ON public.user_roles;

CREATE OR REPLACE FUNCTION public.become_subscriber()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Não autenticado.';
  END IF;

  IF public.has_role(_uid, 'creator') THEN
    RAISE EXCEPTION 'Conta já é de criador.';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_uid, 'subscriber')
  ON CONFLICT (user_id, role) DO NOTHING;

  UPDATE public.profiles SET onboarding_completed = true WHERE id = _uid;
END;
$$;

REVOKE ALL ON FUNCTION public.become_subscriber() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.become_subscriber() TO authenticated;

-- 2) Restrict likes/follows reads to signed-in users
DROP POLICY IF EXISTS "likes_read" ON public.likes;
CREATE POLICY "likes_read" ON public.likes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "follows_read" ON public.follows;
CREATE POLICY "follows_read" ON public.follows FOR SELECT TO authenticated USING (true);

REVOKE SELECT ON public.likes FROM anon;
REVOKE SELECT ON public.follows FROM anon;

-- 3) Lock down SECURITY DEFINER function execution
REVOKE ALL ON FUNCTION public.become_creator() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.become_creator() TO authenticated;

REVOKE ALL ON FUNCTION public.request_creator_payout(integer, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_creator_payout(integer, text, text) TO authenticated;

REVOKE ALL ON FUNCTION public.review_creator_payout(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_creator_payout(uuid, text, text) TO authenticated;

REVOKE ALL ON FUNCTION public.update_platform_setting(text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_platform_setting(text, jsonb) TO authenticated;

-- Policy helper predicates: needed by authenticated for RLS evaluation, never by anon
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_super_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.has_active_subscription(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid, uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_conversation_member(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_conversation_member(uuid, uuid) TO authenticated, service_role;

-- Trigger-only functions must never be callable through the API
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.ensure_creator_balance() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_like_count() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_comment_count() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;