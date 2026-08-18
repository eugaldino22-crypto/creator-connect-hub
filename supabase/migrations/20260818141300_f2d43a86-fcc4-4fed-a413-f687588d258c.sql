CREATE OR REPLACE FUNCTION public.become_creator()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Não autenticado.';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_uid, 'creator')
  ON CONFLICT (user_id, role) DO NOTHING;

  DELETE FROM public.user_roles WHERE user_id = _uid AND role = 'subscriber';

  INSERT INTO public.creator_profiles (user_id, is_published, commission_rate)
  VALUES (_uid, false, 0.15)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.profiles SET onboarding_completed = true WHERE id = _uid;
END;
$$;

REVOKE ALL ON FUNCTION public.become_creator() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.become_creator() TO authenticated;