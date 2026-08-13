-- SECRET Phase 1: notification automation
-- Keeps notification creation server-side through database triggers.

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications' AND column_name='type') THEN
    ALTER TABLE public.notifications ADD COLUMN type TEXT NOT NULL DEFAULT 'system';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications' AND column_name='title') THEN
    ALTER TABLE public.notifications ADD COLUMN title TEXT NOT NULL DEFAULT 'SECRET';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications' AND column_name='body') THEN
    ALTER TABLE public.notifications ADD COLUMN body TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications' AND column_name='link') THEN
    ALTER TABLE public.notifications ADD COLUMN link TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications' AND column_name='is_read') THEN
    ALTER TABLE public.notifications ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications' AND column_name='created_at') THEN
    ALTER TABLE public.notifications ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read, created_at DESC);

GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_read_own" ON public.notifications;
CREATE POLICY "notifications_read_own" ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id UUID,
  _type TEXT,
  _title TEXT,
  _body TEXT DEFAULT NULL,
  _link TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _id UUID;
BEGIN
  IF _user_id IS NULL OR _user_id = auth.uid() AND _type IN ('like','comment','follow','subscription') THEN
    RETURN NULL;
  END IF;
  INSERT INTO public.notifications (user_id, type, title, body, link)
  VALUES (_user_id, _type, _title, _body, _link)
  RETURNING id INTO _id;
  RETURN _id;
END;
$$;

-- Follow notification
CREATE OR REPLACE FUNCTION public.notify_follow()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _name TEXT;
BEGIN
  IF NEW.follower_id = NEW.creator_id THEN RETURN NEW; END IF;
  SELECT COALESCE(display_name, username, 'Alguém') INTO _name FROM public.profiles WHERE id = NEW.follower_id;
  PERFORM public.create_notification(NEW.creator_id, 'follow', 'Novo seguidor', COALESCE(_name, 'Alguém') || ' começou a seguir você.', '/notifications');
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_follow ON public.follows;
CREATE TRIGGER trg_notify_follow AFTER INSERT ON public.follows FOR EACH ROW EXECUTE FUNCTION public.notify_follow();

-- Like notification
CREATE OR REPLACE FUNCTION public.notify_like()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _creator UUID; _name TEXT;
BEGIN
  SELECT creator_id INTO _creator FROM public.posts WHERE id = NEW.post_id;
  IF _creator IS NULL OR _creator = NEW.user_id THEN RETURN NEW; END IF;
  SELECT COALESCE(display_name, username, 'Alguém') INTO _name FROM public.profiles WHERE id = NEW.user_id;
  PERFORM public.create_notification(_creator, 'like', 'Nova curtida', COALESCE(_name, 'Alguém') || ' curtiu sua publicação.', '/feed');
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_like ON public.likes;
CREATE TRIGGER trg_notify_like AFTER INSERT ON public.likes FOR EACH ROW EXECUTE FUNCTION public.notify_like();

-- Comment notification
CREATE OR REPLACE FUNCTION public.notify_comment()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _creator UUID; _name TEXT;
BEGIN
  SELECT creator_id INTO _creator FROM public.posts WHERE id = NEW.post_id;
  IF _creator IS NULL OR _creator = NEW.user_id THEN RETURN NEW; END IF;
  SELECT COALESCE(display_name, username, 'Alguém') INTO _name FROM public.profiles WHERE id = NEW.user_id;
  PERFORM public.create_notification(_creator, 'comment', 'Novo comentário', COALESCE(_name, 'Alguém') || ' comentou em sua publicação.', '/feed');
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_comment ON public.comments;
CREATE TRIGGER trg_notify_comment AFTER INSERT ON public.comments FOR EACH ROW EXECUTE FUNCTION public.notify_comment();

-- New message notification
CREATE OR REPLACE FUNCTION public.notify_message()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _recipient UUID; _name TEXT;
BEGIN
  SELECT CASE WHEN creator_id = NEW.sender_id THEN subscriber_id ELSE creator_id END INTO _recipient FROM public.conversations WHERE id = NEW.conversation_id;
  IF _recipient IS NULL OR _recipient = NEW.sender_id THEN RETURN NEW; END IF;
  SELECT COALESCE(display_name, username, 'Alguém') INTO _name FROM public.profiles WHERE id = NEW.sender_id;
  PERFORM public.create_notification(_recipient, 'message', 'Nova mensagem', 'Você recebeu uma nova mensagem de ' || COALESCE(_name, 'Alguém') || '.', '/messages?conversation=' || NEW.conversation_id::text);
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_message ON public.messages;
CREATE TRIGGER trg_notify_message AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.notify_message();

-- Subscription notification: only when it becomes active.
CREATE OR REPLACE FUNCTION public.notify_subscription()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _name TEXT;
BEGIN
  IF NEW.status <> 'active' OR (TG_OP = 'UPDATE' AND OLD.status = 'active') THEN RETURN NEW; END IF;
  IF NEW.subscriber_id = NEW.creator_id THEN RETURN NEW; END IF;
  SELECT COALESCE(display_name, username, 'Novo assinante') INTO _name FROM public.profiles WHERE id = NEW.subscriber_id;
  PERFORM public.create_notification(NEW.creator_id, 'subscription', 'Nova assinatura', COALESCE(_name, 'Novo assinante') || ' assinou sua comunidade.', '/studio/subscribers');
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_subscription ON public.subscriptions;
CREATE TRIGGER trg_notify_subscription AFTER INSERT OR UPDATE OF status ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.notify_subscription();

-- Video call notification for the receiving participant.
CREATE OR REPLACE FUNCTION public.notify_video_call()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _recipient UUID;
BEGIN
  IF NEW.status <> 'ringing' THEN RETURN NEW; END IF;
  _recipient := CASE WHEN NEW.creator_id = NEW.initiated_by THEN NEW.subscriber_id ELSE NEW.creator_id END;
  IF _recipient IS NULL OR _recipient = NEW.initiated_by THEN RETURN NEW; END IF;
  PERFORM public.create_notification(_recipient, 'video_call', 'Chamada de vídeo recebida', 'Você recebeu uma chamada de vídeo na SECRET.', '/video-call/' || NEW.id::text);
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_video_call ON public.video_calls;
CREATE TRIGGER trg_notify_video_call AFTER INSERT ON public.video_calls FOR EACH ROW EXECUTE FUNCTION public.notify_video_call();

-- Realtime for the notification center.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;
