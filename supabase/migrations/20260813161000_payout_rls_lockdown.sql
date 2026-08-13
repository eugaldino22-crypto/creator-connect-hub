-- Only the payout RPC may create requests or change payout state.
DROP POLICY IF EXISTS "payouts_insert_own" ON public.payout_requests;
DROP POLICY IF EXISTS "payouts_admin_update" ON public.payout_requests;

REVOKE INSERT, UPDATE ON public.payout_requests FROM authenticated;
REVOKE ALL ON FUNCTION public.request_creator_payout(INTEGER,TEXT,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_creator_payout(INTEGER,TEXT,TEXT) TO authenticated;
REVOKE ALL ON FUNCTION public.review_creator_payout(UUID,TEXT,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.review_creator_payout(UUID,TEXT,TEXT) TO authenticated;

-- Balance rows are read-only to clients. All balance mutations happen in trusted functions.
REVOKE INSERT, UPDATE, DELETE ON public.creator_balances FROM authenticated;

-- Gateway activation is backend-only; keep explicit for environments that re-run grants.
REVOKE ALL ON FUNCTION public.activate_subscription_from_gateway(UUID,TEXT,INTEGER,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.activate_subscription_from_gateway(UUID,TEXT,INTEGER,TEXT) TO service_role;
