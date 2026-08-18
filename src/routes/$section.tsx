import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Heart, Lock, LogIn, MessageCircle, UserRound, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/auth/RoleGate";
import { CreatorCard, type CreatorSummary } from "@/components/creators/CreatorCard";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/common/StateBlocks";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-session";
import { formatCents } from "@/lib/brand";
import { PAYMENTS } from "@/lib/payments";
import { ProtectedImage } from "@/components/media/ProtectedImage";
import { PasswordRecovery } from "@/components/auth/PasswordRecovery";

type CreatorProfile = {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
};

type CreatorPlan = {
  price_cents: number | null;
  currency: string | null;
};

type CreatorRow = {
  user_id: string;
  headline: string | null;
  category: string | null;
  is_verified: boolean;
  profiles: CreatorProfile | null;
  subscription_plans: CreatorPlan[] | null;
};

type FeedProfile = {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

type FeedMedia = {
  id: string;
  post_id: string;
  creator_id: string;
  bucket: string;
  storage_path: string;
  media_type: string;
  is_private: boolean;
  position: number;
  width: number | null;
  height: number | null;
};

type FeedPost = {
  id: string;
  creator_id: string;
  title: string | null;
  body: string | null;
  visibility: string;
  is_published: boolean;
  like_count: number | null;
  comment_count: number | null;
  created_at: string;
  profiles: FeedProfile | null;
  post_media: FeedMedia[];
};

type SubscriptionPlan = {
  name: string | null;
  price_cents: number | null;
  currency: string | null;
};

type SubscriptionProfile = {
  username: string | null;
  display_name: string | null;
};

type SubscriptionRow = {
  id: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  subscription_plans: SubscriptionPlan | null;
  profiles: SubscriptionProfile | null;
};

type ConversationProfile = {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

type ConversationRow = {
  id: string;
  creator_id: string;
  subscriber_id: string;
  last_message_at: string | null;
  profiles: ConversationProfile | null;
};

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export const Route = createFileRoute("/$section")({
  component: SectionPage,
});

function useCreators() {
  return useQuery({
    queryKey: ["creators"],
    queryFn: async (): Promise<CreatorSummary[]> => {
      const { data, error } = await supabase
        .from("creator_profiles")
        .select(
          "user_id, headline, category, is_verified, profiles(username,display_name,avatar_url,cover_url), subscription_plans(price_cents,currency)",
        )
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const rows = (data ?? []) as unknown as CreatorRow[];

      return rows.map((row) => {
        const plans = row.subscription_plans ?? [];

        return {
          user_id: row.user_id,
          headline: row.headline,
          category: row.category,
          is_verified: row.is_verified,
          profile: row.profiles,
          cheapest_plan_cents: plans.length
            ? Math.min(...plans.map((plan) => plan.price_cents ?? 0))
            : null,
          currency: plans[0]?.currency ?? PAYMENTS.defaultCurrency,
        };
      });
    },
    staleTime: 30_000,
  });
}

function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function redirectAfterLogin() {
    const { data: authData } = await supabase.auth.getUser();
    const currentUser = authData.user;

    if (!currentUser) {
      setMessage("Sessão não encontrada. Faça login novamente.");
      return;
    }

    const { data: roles, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", currentUser.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    const roleNames = (roles ?? []).map((item) => item.role);

    await queryClient.invalidateQueries({
      queryKey: ["current-user"],
    });

    if (roleNames.includes("super_admin")) {
      await navigate({ to: "/super-admin" });
      return;
    }

    if (roleNames.includes("admin")) {
      await navigate({ to: "/admin" });
      return;
    }

    if (roleNames.includes("creator")) {
      await navigate({ to: "/studio" });
      return;
    }

    if (roleNames.includes("subscriber")) {
      await navigate({ to: "/feed" });
      return;
    }

    await navigate({ to: "/studio" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({
            email,
            password,
          })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                display_name: name,
              },
            },
          });

    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === "signup") {
      if (result.data.session) {
        await queryClient.invalidateQueries({
          queryKey: ["current-user"],
        });

        await navigate({
          to: "/studio",
        });
      } else {
        setMessage("Conta criada. Verifique seu e-mail se a confirmação estiver habilitada.");
      }

      return;
    }

    await redirectAfterLogin();
  }

  async function signInWithGoogle() {
    setMessage("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/studio",
      },
    });

    if (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-md surface-card p-7">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-brand-gradient text-brand-foreground">
            <LogIn className="size-6" />
          </div>

          <h1 className="text-2xl font-semibold">Entre na SECRET</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Sua comunidade. Seu conteúdo. Seu espaço.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <Input
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <Input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />

          {forgotPassword && <PasswordRecovery />}

          {mode === "login" && (
            <button
              type="button"
              className="text-sm text-muted-foreground underline"
              onClick={() => setForgotPassword(true)}
            >
              Esqueci minha senha?
            </button>
          )}

          {message && <p className="text-sm text-muted-foreground">{message}</p>}

          <Button className="w-full" disabled={loading}>
            {loading ? "Processando…" : mode === "login" ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        <Button variant="ghost" className="mt-3 w-full" onClick={() => void signInWithGoogle()}>
          Continuar com Google
        </Button>

        <div className="mt-5 text-center text-sm text-muted-foreground">
          <button
            className="underline"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "Criar uma conta" : "Já tenho uma conta"}
          </button>
        </div>
      </div>
    </div>
  );
}

function OnboardingPage() {
  const { data, isLoading } = useCurrentUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function choose(role: "subscriber" | "creator") {
    if (!data?.user) {
      await navigate({
        to: "/feed",
        replace: true,
      });
      return;
    }

    setBusy(true);
    setError("");

    if (role === "creator") {
      const { error: rpcError } = await supabase.rpc("become_creator");

      if (rpcError) {
        setBusy(false);
        setError(rpcError.message);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ["current-user"] });
      await queryClient.refetchQueries({ queryKey: ["current-user"] });
      setBusy(false);
      await navigate({ to: "/studio" });
      return;
    }

    const { error: roleError } = await supabase.rpc("become_subscriber");

    if (roleError) {
      setBusy(false);
      setError(roleError.message);
      return;
    }

    await queryClient.invalidateQueries({
      queryKey: ["current-user"],
    });

    await queryClient.refetchQueries({
      queryKey: ["current-user"],
    });

    setBusy(false);

    await navigate({
      to: "/feed",
    });
  }

  if (isLoading) {
    return <LoadingBlock label="Carregando seu perfil…" />;
  }

  if (!data?.user) {
    return <LoadingBlock label="Redirecionando para o login…" />;
  }

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold">Como você quer usar a SECRET?</h1>

        <p className="mt-2 text-muted-foreground">
          Escolha seu espaço principal. Você pode criar uma comunidade ou participar das que já
          existem.
        </p>

        {error && (
          <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <button
            type="button"
            className="surface-card p-6 text-left hover:border-primary/50"
            disabled={busy}
            onClick={() => void choose("subscriber")}
          >
            <Users className="size-7 text-primary" />

            <h2 className="mt-4 text-xl font-semibold">Sou assinante</h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Explore criadores, acompanhe conteúdos e assine comunidades.
            </p>
          </button>

          <button
            type="button"
            className="surface-card p-6 text-left hover:border-primary/50"
            disabled={busy}
            onClick={() => void choose("creator")}
          >
            <UserRound className="size-7 text-primary" />

            <h2 className="mt-4 text-xl font-semibold">Sou criador</h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Crie seu perfil, publique conteúdo e monetize sua comunidade.
            </p>
          </button>
        </div>

        {busy && (
          <p className="mt-5 text-center text-sm text-muted-foreground">Configurando seu espaço…</p>
        )}
      </div>
    </div>
  );
}

function ExplorePage() {
  const { data, isLoading, error } = useCreators();

  const [q, setQ] = useState("");

  const list = useMemo(
    () =>
      data?.filter((creator) =>
        `${creator.profile?.display_name ?? ""} ${creator.category ?? ""} ${creator.headline ?? ""}`
          .toLowerCase()
          .includes(q.toLowerCase()),
      ) ?? [],
    [data, q],
  );

  return (
    <AppShell title="Explorar">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Descubra criadores</h2>

          <p className="text-sm text-muted-foreground">Encontre comunidades para fazer parte.</p>
        </div>

        <Input
          className="md:max-w-xs"
          placeholder="Buscar criadores"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {isLoading ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorBlock />
      ) : list.length === 0 ? (
        <EmptyBlock
          title="Nenhum criador encontrado"
          description="Ainda não há criadores publicados que correspondam à busca."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((creator) => (
            <CreatorCard key={creator.user_id} creator={creator} />
          ))}
        </div>
      )}
    </AppShell>
  );
}

function FeedPage() {
  const { data: user } = useCurrentUser();

  const q = useQuery({
    queryKey: ["feed", user?.user.id],
    enabled: Boolean(user?.user.id),
    queryFn: async (): Promise<FeedPost[]> => {
      const [subs, follows] = await Promise.all([
        supabase
          .from("subscriptions")
          .select("creator_id")
          .eq("subscriber_id", user!.user.id)
          .eq("status", "active"),

        supabase.from("follows").select("creator_id").eq("follower_id", user!.user.id),
      ]);

      const subscriptionIds = (subs.data ?? []).map((row) => row.creator_id);

      const followIds = (follows.data ?? []).map((row) => row.creator_id);

      const ids = Array.from(new Set([...subscriptionIds, ...followIds]));

      if (!ids.length) return [];

      const { data, error } = await supabase
        .from("posts")
        .select(
          "id,creator_id,title,body,visibility,is_published,like_count,comment_count,created_at,profiles:creator_id(username,display_name,avatar_url),post_media(id,post_id,creator_id,bucket,storage_path,media_type,is_private,position,width,height)",
        )
        .in("creator_id", ids)
        .eq("is_published", true)
        .eq("is_removed", false)
        .order("created_at", {
          ascending: false,
        })
        .limit(50);

      if (error) throw error;

      return (data ?? []) as unknown as FeedPost[];
    },
  });

  return (
    <RoleGate allowed={["subscriber", "creator"]}>
      <AppShell title="Meu feed">
        <div className="mx-auto max-w-2xl space-y-5">
          {q.isLoading ? (
            <LoadingBlock />
          ) : q.error ? (
            <ErrorBlock />
          ) : !q.data?.length ? (
            <EmptyBlock
              title="Seu feed está vazio"
              description="Siga ou assine criadores para começar a receber publicações."
              action={
                <Button asChild>
                  <Link to="/feed">Explorar criadores</Link>
                </Button>
              }
            />
          ) : (
            q.data.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </AppShell>
    </RoleGate>
  );
}

function PostCard({ post }: { post: FeedPost }) {
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  async function toggleLike() {
    const { data: user } = await supabase.auth.getUser();

    if (!user.user) return;

    setBusy(true);

    try {
      if (liked) {
        await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", user.user.id);

        setLiked(false);
      } else {
        await supabase.from("likes").insert({
          post_id: post.id,
          user_id: user.user.id,
        });

        setLiked(true);
      }
    } finally {
      setBusy(false);
    }
  }

  const locked = post.visibility === "subscribers";

  return (
    <article className="surface-card overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <UserAvatar
          name={post.profiles?.display_name}
          path={post.profiles?.avatar_url}
          className="size-10"
        />

        <div className="min-w-0">
          <Link
            className="font-semibold hover:underline"
            to="/c/$username"
            params={{
              username: post.profiles?.username ?? "",
            }}
          >
            {post.profiles?.display_name ?? "Criador"}
          </Link>

          <p className="text-xs text-muted-foreground">
            {new Date(post.created_at).toLocaleString()}
          </p>
        </div>

        {locked && (
          <Badge variant="secondary" className="ml-auto gap-1">
            <Lock className="size-3" />
            Assinantes
          </Badge>
        )}
      </div>

      <div className="px-4 pb-4">
        {post.title && <h2 className="text-lg font-semibold">{post.title}</h2>}

        {locked ? (
          <div className="mt-3 rounded-2xl border border-border bg-secondary/40 p-6 text-center">
            <Lock className="mx-auto size-6 text-primary" />

            <p className="mt-2 text-sm text-muted-foreground">
              Conteúdo exclusivo para assinantes.
            </p>

            <Button asChild className="mt-4">
              <Link
                to="/c/$username"
                params={{
                  username: post.profiles?.username ?? "",
                }}
              >
                Ver comunidade
              </Link>
            </Button>
          </div>
        ) : (
          post.body && <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{post.body}</p>
        )}

        {post.post_media?.length ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {post.post_media
              .filter((media) => media.media_type === "image")
              .sort((a, b) => a.position - b.position)
              .map((media) => (
                <ProtectedImage
                  key={media.id}
                  bucket={media.bucket}
                  path={media.storage_path}
                  alt={post.title ?? "Imagem da publicação"}
                  premium={media.is_private}
                  watermark={media.is_private}
                  viewerLabel={post.profiles?.username ?? "Usuário"}
                  className="aspect-square w-full rounded-2xl border border-border bg-secondary/30"
                />
              ))}
          </div>
        ) : null}

        <div className="mt-4 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={() => void toggleLike()}
            className="gap-2"
          >
            <Heart className={liked ? "size-4 fill-current" : "size-4"} />

            {(post.like_count ?? 0) + (liked ? 1 : 0)}
          </Button>

          <span className="text-xs text-muted-foreground">
            {post.comment_count ?? 0} comentários
          </span>
        </div>
      </div>
    </article>
  );
}

function SubscriptionsPage() {
  const { data: user } = useCurrentUser();

  const q = useQuery({
    queryKey: ["subscriptions", user?.user.id],
    enabled: Boolean(user?.user.id),
    queryFn: async (): Promise<SubscriptionRow[]> => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select(
          "id,status,current_period_start,current_period_end,subscription_plans(name,price_cents,currency),profiles:creator_id(username,display_name)",
        )
        .eq("subscriber_id", user!.user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      return (data ?? []) as unknown as SubscriptionRow[];
    },
  });

  return (
    <RoleGate allowed={["subscriber", "creator"]}>
      <AppShell title="Assinaturas">
        <h2 className="text-2xl font-semibold">Minhas assinaturas</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Acompanhe suas comunidades e status de cobrança.
        </p>

        <div className="mt-6 space-y-3">
          {q.isLoading ? (
            <LoadingBlock />
          ) : q.error ? (
            <ErrorBlock />
          ) : !q.data?.length ? (
            <EmptyBlock
              title="Você ainda não assinou nenhum criador"
              description="Explore criadores e escolha uma comunidade para começar."
              action={
                <Button asChild>
                  <Link to="/feed">Explorar</Link>
                </Button>
              }
            />
          ) : (
            q.data.map((subscription) => (
              <div
                key={subscription.id}
                className="surface-card flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold">
                    {subscription.profiles?.display_name ?? "Criador"}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {subscription.subscription_plans?.name ?? "Plano"} ·{" "}
                    {subscription.subscription_plans?.currency ?? PAYMENTS.defaultCurrency}
                  </p>
                </div>

                <Badge>{subscription.status}</Badge>
              </div>
            ))
          )}
        </div>
      </AppShell>
    </RoleGate>
  );
}

function MessagesPage() {
  const { data: user } = useCurrentUser();

  const q = useQuery({
    queryKey: ["conversations", user?.user.id],
    enabled: Boolean(user?.user.id),
    queryFn: async (): Promise<ConversationRow[]> => {
      const { data, error } = await supabase
        .from("conversations")
        .select(
          "id,creator_id,subscriber_id,last_message_at,profiles:creator_id(username,display_name,avatar_url)",
        )
        .or(`creator_id.eq.${user!.user.id},subscriber_id.eq.${user!.user.id}`)
        .order("last_message_at", {
          ascending: false,
        });

      if (error) throw error;

      return (data ?? []) as unknown as ConversationRow[];
    },
  });

  return (
    <RoleGate allowed={["subscriber", "creator"]}>
      <AppShell title="Mensagens">
        <div className="mx-auto max-w-2xl">
          {q.isLoading ? (
            <LoadingBlock />
          ) : q.error ? (
            <ErrorBlock />
          ) : !q.data?.length ? (
            <EmptyBlock
              title="Nenhuma conversa ainda"
              description="Quando você iniciar uma conversa com um criador, ela aparecerá aqui."
              icon={<MessageCircle className="size-5" />}
            />
          ) : (
            <div className="space-y-3">
              {q.data.map((conversation) => (
                <div key={conversation.id} className="surface-card flex items-center gap-3 p-4">
                  <UserAvatar
                    name={conversation.profiles?.display_name}
                    path={conversation.profiles?.avatar_url}
                    className="size-11"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {conversation.profiles?.display_name ?? "Conversa"}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {conversation.last_message_at
                        ? new Date(conversation.last_message_at).toLocaleString()
                        : "Nova conversa"}
                    </p>
                  </div>

                  <Button variant="outline">Abrir</Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </RoleGate>
  );
}

function NotificationsPage() {
  const { data } = useCurrentUser();

  const q = useQuery({
    queryKey: ["notifications", data?.user.id],
    enabled: Boolean(data?.user.id),
    queryFn: async (): Promise<NotificationRow[]> => {
      const { data: notifications, error } = await supabase
        .from("notifications")
        .select("id,type,title,body,link,is_read,created_at")
        .eq("user_id", data!.user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      return (data ?? []) as unknown as NotificationRow[];
    },
  });

  return (
    <RoleGate allowed={["subscriber", "creator", "admin", "super_admin"]}>
      <AppShell title="Notificações">
        <div className="space-y-3">
          {q.isLoading ? (
            <LoadingBlock />
          ) : q.error ? (
            <ErrorBlock />
          ) : !q.data?.length ? (
            <EmptyBlock
              title="Tudo limpo"
              description="Você não tem novas notificações."
              icon={<Bell className="size-5" />}
            />
          ) : (
            q.data?.map((notification) => (
              <div key={notification.id} className="surface-card p-4">
                <p className="font-medium">{notification.title}</p>

                <p className="mt-1 text-sm text-muted-foreground">{notification.body}</p>
              </div>
            ))
          )}
        </div>
      </AppShell>
    </RoleGate>
  );
}

function AccountPage() {
  return (
    <RoleGate allowed={["subscriber", "creator"]}>
      <AppShell title="Minha conta">
        <AccountForm />
      </AppShell>
    </RoleGate>
  );
}

function AccountForm() {
  const { data } = useCurrentUser();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);

  const uid = data?.user.id;

  useEffect(() => {
    setName(data?.profile?.display_name ?? "");
    setBio(data?.profile?.bio ?? "");
  }, [data?.profile]);

  async function save() {
    if (!uid) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: name,
        bio,
      })
      .eq("id", uid);

    if (!error) {
      setSaved(true);
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" />

      <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Bio" />

      <Button onClick={() => void save()}>Salvar alterações</Button>

      {saved && <p className="text-sm text-muted-foreground">Perfil atualizado.</p>}
    </div>
  );
}

function SectionPage() {
  const { section } = Route.useParams();

  if (section === "auth") {
    return <AuthPage />;
  }

  if (section === "onboarding") {
    return <OnboardingPage />;
  }

  if (section === "explore") {
    return <ExplorePage />;
  }

  if (section === "feed") {
    return <FeedPage />;
  }

  if (section === "subscriptions") {
    return <SubscriptionsPage />;
  }

  if (section === "messages") {
    return <MessagesPage />;
  }

  if (section === "notifications") {
    return <NotificationsPage />;
  }

  if (section === "account") {
    return <AccountPage />;
  }

  return (
    <AppShell title="SECRET">
      <EmptyBlock
        title="Página em construção"
        description="Esta área será disponibilizada na próxima etapa do produto."
      />
    </AppShell>
  );
}
