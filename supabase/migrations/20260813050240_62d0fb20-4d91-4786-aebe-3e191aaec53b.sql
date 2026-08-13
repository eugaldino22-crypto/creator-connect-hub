
-- ROLES
CREATE TYPE public.app_role AS ENUM ('subscriber', 'creator', 'admin');
CREATE TYPE public.post_visibility AS ENUM ('public', 'subscribers');
CREATE TYPE public.subscription_status AS ENUM ('pending', 'active', 'canceled', 'expired');
CREATE TYPE public.transaction_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');
CREATE TYPE public.payout_status AS ENUM ('requested', 'processing', 'paid', 'rejected');
CREATE TYPE public.report_status AS ENUM ('open', 'reviewing', 'resolved', 'dismissed');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  country TEXT,
  is_suspended BOOLEAN NOT NULL DEFAULT false,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin');
$$;

CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id OR public.is_admin()) WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "roles_self_read" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "roles_self_insert" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND role <> 'admin');

-- auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NULL
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CREATOR PROFILES
CREATE TABLE public.creator_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  headline TEXT,
  category TEXT,
  about TEXT,
  website_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  commission_rate NUMERIC(5,4) NOT NULL DEFAULT 0.1000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_creator_profiles_published ON public.creator_profiles(is_published);
CREATE INDEX idx_creator_profiles_category ON public.creator_profiles(category);
GRANT SELECT, INSERT, UPDATE ON public.creator_profiles TO authenticated;
GRANT SELECT ON public.creator_profiles TO anon;
GRANT ALL ON public.creator_profiles TO service_role;
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_creator_profiles_updated BEFORE UPDATE ON public.creator_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "creator_profiles_read_published" ON public.creator_profiles FOR SELECT USING (is_published OR user_id = auth.uid() OR public.is_admin());
CREATE POLICY "creator_profiles_insert_own" ON public.creator_profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "creator_profiles_update_own" ON public.creator_profiles FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- PLANS
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'BRL',
  interval_months INTEGER NOT NULL DEFAULT 1 CHECK (interval_months > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_plans_creator ON public.subscription_plans(creator_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscription_plans TO authenticated;
GRANT SELECT ON public.subscription_plans TO anon;
GRANT ALL ON public.subscription_plans TO service_role;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_plans_updated BEFORE UPDATE ON public.subscription_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "plans_read" ON public.subscription_plans FOR SELECT USING (is_active OR creator_id = auth.uid() OR public.is_admin());
CREATE POLICY "plans_manage_own" ON public.subscription_plans FOR ALL TO authenticated USING (creator_id = auth.uid()) WITH CHECK (creator_id = auth.uid());

-- SUBSCRIPTIONS
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
  status public.subscription_status NOT NULL DEFAULT 'pending',
  gateway TEXT,
  gateway_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_sub_unique_active ON public.subscriptions(subscriber_id, creator_id) WHERE status IN ('pending','active');
CREATE INDEX idx_sub_creator ON public.subscriptions(creator_id, status);
CREATE INDEX idx_sub_subscriber ON public.subscriptions(subscriber_id, status);
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_sub_updated BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "sub_read_involved" ON public.subscriptions FOR SELECT TO authenticated USING (subscriber_id = auth.uid() OR creator_id = auth.uid() OR public.is_admin());
CREATE POLICY "sub_insert_own" ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (subscriber_id = auth.uid());
CREATE POLICY "sub_update_own" ON public.subscriptions FOR UPDATE TO authenticated USING (subscriber_id = auth.uid() OR public.is_admin()) WITH CHECK (subscriber_id = auth.uid() OR public.is_admin());

CREATE OR REPLACE FUNCTION public.has_active_subscription(_subscriber UUID, _creator UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE subscriber_id = _subscriber AND creator_id = _creator
      AND status = 'active'
      AND (current_period_end IS NULL OR current_period_end > now())
  );
$$;

-- POSTS
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  body TEXT,
  visibility public.post_visibility NOT NULL DEFAULT 'public',
  is_published BOOLEAN NOT NULL DEFAULT true,
  is_removed BOOLEAN NOT NULL DEFAULT false,
  like_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_posts_creator_created ON public.posts(creator_id, created_at DESC);
CREATE INDEX idx_posts_feed ON public.posts(created_at DESC) WHERE is_published AND NOT is_removed;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT SELECT ON public.posts TO anon;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_posts_updated BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "posts_read" ON public.posts FOR SELECT USING (
  creator_id = auth.uid()
  OR public.is_admin()
  OR (is_published AND NOT is_removed)
);
CREATE POLICY "posts_manage_own" ON public.posts FOR ALL TO authenticated USING (creator_id = auth.uid()) WITH CHECK (creator_id = auth.uid());
CREATE POLICY "posts_admin_update" ON public.posts FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- POST MEDIA (exclusive media rows only visible to entitled users)
CREATE TABLE public.post_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bucket TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image',
  is_private BOOLEAN NOT NULL DEFAULT false,
  width INTEGER,
  height INTEGER,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_post_media_post ON public.post_media(post_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_media TO authenticated;
GRANT SELECT ON public.post_media TO anon;
GRANT ALL ON public.post_media TO service_role;
ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "post_media_read" ON public.post_media FOR SELECT USING (
  creator_id = auth.uid()
  OR public.is_admin()
  OR NOT is_private
  OR public.has_active_subscription(auth.uid(), creator_id)
);
CREATE POLICY "post_media_manage_own" ON public.post_media FOR ALL TO authenticated USING (creator_id = auth.uid()) WITH CHECK (creator_id = auth.uid());

-- LIKES
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.likes TO authenticated;
GRANT SELECT ON public.likes TO anon;
GRANT ALL ON public.likes TO service_role;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "likes_read" ON public.likes FOR SELECT USING (true);
CREATE POLICY "likes_insert_own" ON public.likes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "likes_delete_own" ON public.likes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- COMMENTS
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  is_removed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_comments_post ON public.comments(post_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT SELECT ON public.comments TO anon;
GRANT ALL ON public.comments TO service_role;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments_read" ON public.comments FOR SELECT USING (NOT is_removed OR user_id = auth.uid() OR public.is_admin());
CREATE POLICY "comments_insert_own" ON public.comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "comments_delete_own" ON public.comments FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "comments_update_moderation" ON public.comments FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- FOLLOWS
CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (follower_id, creator_id)
);
CREATE INDEX idx_follows_creator ON public.follows(creator_id);
GRANT SELECT, INSERT, DELETE ON public.follows TO authenticated;
GRANT SELECT ON public.follows TO anon;
GRANT ALL ON public.follows TO service_role;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "follows_read" ON public.follows FOR SELECT USING (true);
CREATE POLICY "follows_insert_own" ON public.follows FOR INSERT TO authenticated WITH CHECK (follower_id = auth.uid());
CREATE POLICY "follows_delete_own" ON public.follows FOR DELETE TO authenticated USING (follower_id = auth.uid());

-- CONVERSATIONS / MESSAGES
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (creator_id, subscriber_id)
);
GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conv_read_involved" ON public.conversations FOR SELECT TO authenticated USING (creator_id = auth.uid() OR subscriber_id = auth.uid() OR public.is_admin());
CREATE POLICY "conv_insert_involved" ON public.conversations FOR INSERT TO authenticated WITH CHECK (creator_id = auth.uid() OR subscriber_id = auth.uid());
CREATE POLICY "conv_update_involved" ON public.conversations FOR UPDATE TO authenticated USING (creator_id = auth.uid() OR subscriber_id = auth.uid()) WITH CHECK (creator_id = auth.uid() OR subscriber_id = auth.uid());

CREATE OR REPLACE FUNCTION public.is_conversation_member(_conversation UUID, _user UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = _conversation AND (creator_id = _user OR subscriber_id = _user)
  );
$$;

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_conv ON public.messages(conversation_id, created_at);
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_read_member" ON public.messages FOR SELECT TO authenticated USING (public.is_conversation_member(conversation_id, auth.uid()) OR public.is_admin());
CREATE POLICY "messages_insert_member" ON public.messages FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid() AND public.is_conversation_member(conversation_id, auth.uid()));
CREATE POLICY "messages_update_member" ON public.messages FOR UPDATE TO authenticated USING (public.is_conversation_member(conversation_id, auth.uid())) WITH CHECK (public.is_conversation_member(conversation_id, auth.uid()));

-- FINANCIAL (gateway-agnostic; no simulated payments)
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  gross_cents INTEGER NOT NULL,
  fee_cents INTEGER NOT NULL DEFAULT 0,
  net_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  status public.transaction_status NOT NULL DEFAULT 'pending',
  gateway TEXT,
  gateway_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tx_creator ON public.transactions(creator_id, created_at DESC);
GRANT SELECT ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tx_read_involved" ON public.transactions FOR SELECT TO authenticated USING (creator_id = auth.uid() OR subscriber_id = auth.uid() OR public.is_admin());

CREATE TABLE public.creator_balances (
  creator_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  available_cents INTEGER NOT NULL DEFAULT 0,
  pending_cents INTEGER NOT NULL DEFAULT 0,
  lifetime_gross_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.creator_balances TO authenticated;
GRANT ALL ON public.creator_balances TO service_role;
ALTER TABLE public.creator_balances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "balance_read_own" ON public.creator_balances FOR SELECT TO authenticated USING (creator_id = auth.uid() OR public.is_admin());

CREATE TABLE public.payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency TEXT NOT NULL DEFAULT 'BRL',
  status public.payout_status NOT NULL DEFAULT 'requested',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payouts_creator ON public.payout_requests(creator_id, created_at DESC);
GRANT SELECT, INSERT ON public.payout_requests TO authenticated;
GRANT UPDATE ON public.payout_requests TO authenticated;
GRANT ALL ON public.payout_requests TO service_role;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_payouts_updated BEFORE UPDATE ON public.payout_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "payouts_read_own" ON public.payout_requests FOR SELECT TO authenticated USING (creator_id = auth.uid() OR public.is_admin());
CREATE POLICY "payouts_insert_own" ON public.payout_requests FOR INSERT TO authenticated WITH CHECK (creator_id = auth.uid());
CREATE POLICY "payouts_admin_update" ON public.payout_requests FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- REPORTS
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('post','comment','user','creator')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL CHECK (char_length(reason) BETWEEN 3 AND 1000),
  status public.report_status NOT NULL DEFAULT 'open',
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_reports_status ON public.reports(status, created_at DESC);
GRANT SELECT, INSERT, UPDATE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_reports_updated BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "reports_read" ON public.reports FOR SELECT TO authenticated USING (reporter_id = auth.uid() OR public.is_admin());
CREATE POLICY "reports_insert_own" ON public.reports FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());
CREATE POLICY "reports_admin_update" ON public.reports FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_read_own" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notif_update_own" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "notif_delete_own" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notif_insert_own" ON public.notifications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- counters
CREATE OR REPLACE FUNCTION public.sync_like_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  ELSE
    UPDATE public.posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END; $$;
CREATE TRIGGER trg_like_count AFTER INSERT OR DELETE ON public.likes FOR EACH ROW EXECUTE FUNCTION public.sync_like_count();

CREATE OR REPLACE FUNCTION public.sync_comment_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSE
    UPDATE public.posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END; $$;
CREATE TRIGGER trg_comment_count AFTER INSERT OR DELETE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.sync_comment_count();

-- creator balance row on creator profile creation
CREATE OR REPLACE FUNCTION public.ensure_creator_balance()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.creator_balances (creator_id) VALUES (NEW.user_id)
  ON CONFLICT (creator_id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_creator_balance AFTER INSERT ON public.creator_profiles FOR EACH ROW EXECUTE FUNCTION public.ensure_creator_balance();

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
