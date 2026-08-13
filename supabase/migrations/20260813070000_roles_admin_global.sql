-- SECRET global role hierarchy, audit trail, platform settings, and USD defaults.

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  );
$$;

DROP POLICY IF EXISTS roles_self_insert ON public.user_roles;
DROP POLICY IF EXISTS roles_self_read ON public.user_roles;
CREATE POLICY roles_self_read ON public.user_roles
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY roles_self_insert ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND role IN ('subscriber', 'creator')
);

CREATE POLICY roles_super_admin_insert ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (public.is_super_admin());

CREATE POLICY roles_super_admin_update ON public.user_roles
FOR UPDATE TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

CREATE POLICY roles_super_admin_delete ON public.user_roles
FOR DELETE TO authenticated
USING (public.is_super_admin());

ALTER TABLE public.creator_profiles
  ALTER COLUMN commission_rate SET DEFAULT 0.1500;

ALTER TABLE public.subscription_plans
  ALTER COLUMN currency SET DEFAULT 'USD';

ALTER TABLE public.transactions
  ALTER COLUMN currency SET DEFAULT 'USD';

ALTER TABLE public.creator_balances
  ALTER COLUMN currency SET DEFAULT 'USD';

ALTER TABLE public.payout_requests
  ALTER COLUMN currency SET DEFAULT 'USD';

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_user_id, created_at DESC);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
DROP POLICY IF EXISTS audit_super_admin_read ON public.audit_logs;
CREATE POLICY audit_super_admin_read ON public.audit_logs
FOR SELECT TO authenticated USING (public.is_super_admin());
DROP POLICY IF EXISTS audit_admin_read ON public.audit_logs;
CREATE POLICY audit_admin_read ON public.audit_logs
FOR SELECT TO authenticated
USING (public.is_admin() AND action NOT ILIKE '%role%' AND action NOT ILIKE '%security%');

CREATE TABLE IF NOT EXISTS public.platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.platform_settings TO authenticated;
GRANT ALL ON public.platform_settings TO service_role;
DROP POLICY IF EXISTS platform_settings_super_admin_read ON public.platform_settings;
CREATE POLICY platform_settings_super_admin_read ON public.platform_settings
FOR SELECT TO authenticated USING (public.is_super_admin() OR public.is_admin());
DROP POLICY IF EXISTS platform_settings_super_admin_write ON public.platform_settings;
CREATE POLICY platform_settings_super_admin_write ON public.platform_settings
FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

INSERT INTO public.platform_settings (key, value, updated_by)
VALUES
  ('platform_name', '{"value":"SECRET"}'::jsonb, auth.uid()),
  ('default_currency', '{"value":"USD"}'::jsonb, auth.uid()),
  ('commission_rate', '{"value":0.15}'::jsonb, auth.uid()),
  ('crypto_provider', '{"value":"NOWPayments","configured":false}'::jsonb, auth.uid())
ON CONFLICT (key) DO NOTHING;

REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
