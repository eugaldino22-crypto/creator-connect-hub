CREATE TABLE public.dev_role_grants (
  email text PRIMARY KEY,
  roles app_role[] NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dev_role_grants TO authenticated;
GRANT ALL ON public.dev_role_grants TO service_role;

ALTER TABLE public.dev_role_grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dev_role_grants_super_admin_all"
ON public.dev_role_grants FOR ALL TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

INSERT INTO public.dev_role_grants (email, roles, note) VALUES
  ('johnesgaldino48@gmail.com', ARRAY['subscriber','creator','admin','super_admin']::app_role[], 'Conta de desenvolvimento e testes'),
  ('eugaldino22@gmail.com', ARRAY['subscriber']::app_role[], 'Conta de testes de assinante');

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _role app_role;
BEGIN
  INSERT INTO public.profiles (id, display_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NULL
  ) ON CONFLICT (id) DO NOTHING;

  FOR _role IN
    SELECT unnest(g.roles)
    FROM public.dev_role_grants g
    WHERE lower(g.email) = lower(NEW.email)
  LOOP
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, _role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END LOOP;

  RETURN NEW;
END; $function$;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, r.role
FROM auth.users u
JOIN public.dev_role_grants g ON lower(g.email) = lower(u.email)
CROSS JOIN LATERAL unnest(g.roles) AS r(role)
ON CONFLICT (user_id, role) DO NOTHING;