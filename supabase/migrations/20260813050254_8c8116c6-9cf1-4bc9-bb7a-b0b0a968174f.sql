
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_like_count() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_comment_count() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ensure_creator_balance() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_conversation_member(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
