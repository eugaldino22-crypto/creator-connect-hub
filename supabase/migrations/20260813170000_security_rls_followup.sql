-- SECRET security follow-up: remove direct financial writes, constrain conversations/messages,
-- and make subscription creation validate the selected plan and creator relationship.

-- 1) Financial tables are read-only to clients. Mutations go through trusted RPCs/admin workflows.
REVOKE INSERT, UPDATE, DELETE ON public.creator_balances FROM authenticated;
REVOKE INSERT, UPDATE ON public.payout_requests FROM authenticated;
DROP POLICY IF EXISTS "payouts_insert_own" ON public.payout_requests;
DROP POLICY IF EXISTS "payouts_admin_update" ON public.payout_requests;

-- 2) Subscription creation: client may request only a pending subscription for an active plan,
-- and the selected plan must belong to the same creator referenced by the request.
DROP POLICY IF EXISTS "sub_insert_own" ON public.subscriptions;
CREATE POLICY "sub_insert_own_pending" ON public.subscriptions
FOR INSERT TO authenticated
WITH CHECK (
  subscriber_id = auth.uid()
  AND subscriber_id <> creator_id
  AND status = 'pending'
  AND EXISTS (
    SELECT 1
    FROM public.subscription_plans p
    WHERE p.id = plan_id
      AND p.creator_id = creator_id
      AND p.is_active = true
  )
);

-- Clients cannot alter subscriber/creator/plan/gateway/amount fields by direct update.
-- Subscription state changes are handled by dedicated trusted operations.
REVOKE UPDATE ON public.subscriptions FROM authenticated;

-- 3) Conversation creation must represent a real creator/subscriber relationship.
DROP POLICY IF EXISTS "conv_insert_involved" ON public.conversations;
CREATE POLICY "conv_insert_related_users" ON public.conversations
FOR INSERT TO authenticated
WITH CHECK (
  (creator_id = auth.uid() OR subscriber_id = auth.uid())
  AND creator_id <> subscriber_id
  AND (
    public.has_active_subscription(subscriber_id, creator_id)
    OR public.is_admin()
  )
);

-- Participants should not be able to rewrite conversation ownership.
DROP POLICY IF EXISTS "conv_update_involved" ON public.conversations;
REVOKE UPDATE ON public.conversations FROM authenticated;

-- 4) Messages: only sender can create; only recipient can mark a message read.
DROP POLICY IF EXISTS "messages_update_member" ON public.messages;
REVOKE UPDATE ON public.messages FROM authenticated;

CREATE OR REPLACE FUNCTION public.mark_message_read(_message_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _message public.messages%ROWTYPE;
BEGIN
  SELECT m.* INTO _message
  FROM public.messages m
  WHERE m.id = _message_id
  FOR UPDATE;

  IF NOT FOUND THEN RETURN FALSE; END IF;
  IF NOT public.is_conversation_member(_message.conversation_id, auth.uid()) THEN
    RAISE EXCEPTION 'Conversation member required';
  END IF;
  IF _message.sender_id = auth.uid() THEN
    RETURN FALSE;
  END IF;

  UPDATE public.messages
  SET read_at = COALESCE(read_at, now())
  WHERE id = _message_id;
  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_message_read(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_message_read(UUID) TO authenticated;

-- 5) Media integrity: media metadata must match its post owner.
DROP POLICY IF EXISTS "post_media_manage_own" ON public.post_media;
CREATE POLICY "post_media_insert_own" ON public.post_media
FOR INSERT TO authenticated
WITH CHECK (
  creator_id = auth.uid()
  AND EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.creator_id = auth.uid())
);
CREATE POLICY "post_media_update_own" ON public.post_media
FOR UPDATE TO authenticated
USING (creator_id = auth.uid())
WITH CHECK (
  creator_id = auth.uid()
  AND EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.creator_id = auth.uid())
);
CREATE POLICY "post_media_delete_own" ON public.post_media
FOR DELETE TO authenticated
USING (creator_id = auth.uid());

-- 6) Public profile fields are intentionally public, but suspension/operational state is not useful
-- to anonymous clients. UI/API should rely on published creator/profile queries for discovery.
