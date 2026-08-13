-- Store who initiated a video call so notification routing is explicit.
ALTER TABLE public.video_calls ADD COLUMN IF NOT EXISTS initiated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

UPDATE public.video_calls
SET initiated_by = creator_id
WHERE initiated_by IS NULL;

CREATE OR REPLACE FUNCTION public.notify_video_call()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _recipient UUID; _initiator UUID;
BEGIN
  IF NEW.status <> 'ringing' THEN RETURN NEW; END IF;
  _initiator := COALESCE(NEW.initiated_by, NEW.creator_id);
  _recipient := CASE WHEN NEW.creator_id = _initiator THEN NEW.subscriber_id ELSE NEW.creator_id END;
  IF _recipient IS NULL OR _recipient = _initiator THEN RETURN NEW; END IF;
  PERFORM public.create_notification(_recipient, 'video_call', 'Chamada de vídeo recebida', 'Você recebeu uma chamada de vídeo na SECRET.', '/video-call/' || NEW.id::text);
  RETURN NEW;
END; $$;
