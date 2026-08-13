-- SECRET: global platform settings and audit trail.
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.platform_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  setting_key TEXT,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "super admins manage platform settings" ON public.platform_settings;
CREATE POLICY "super admins manage platform settings" ON public.platform_settings
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "super admins read audit log" ON public.platform_audit_log;
CREATE POLICY "super admins read audit log" ON public.platform_audit_log
  FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));

INSERT INTO public.platform_settings (key,value,description) VALUES
 ('commission_rate','0.15','SECRET platform commission rate'),
 ('registrations_enabled','true','Allow new account registrations'),
 ('supported_currencies','["USD","EUR","BRL","GBP","CAD","AUD"]','Currencies enabled by the platform'),
 ('supported_regions','["BR","US","CA","GB","AU","DE","FR","ES","PT","IT","JP","MX"]','Initial supported country/region codes')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.update_platform_setting(_key TEXT, _value JSONB)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _old JSONB;
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN RAISE EXCEPTION 'Super admin access required'; END IF;
  SELECT value INTO _old FROM public.platform_settings WHERE key = _key FOR UPDATE;
  INSERT INTO public.platform_settings(key,value,updated_at,updated_by) VALUES(_key,_value,now(),auth.uid())
  ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=now(),updated_by=auth.uid();
  INSERT INTO public.platform_audit_log(actor_id,action,setting_key,old_value,new_value) VALUES(auth.uid(),'update_setting',_key,_old,_value);
  RETURN TRUE;
END;
$$;
