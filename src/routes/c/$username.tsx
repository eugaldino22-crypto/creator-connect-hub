import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  CalendarDays,
  Check,
  Heart,
  Image as ImageIcon,
  Lock,
  MessageCircle,
  Share2,
  Video,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingBlock, EmptyBlock } from "@/components/common/StateBlocks";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FollowButton } from "@/components/creators/FollowButton";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-session";
import { formatCents } from "@/lib/brand";

type SubscriptionPlan = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  is_active: boolean;
};

type CreatorProfile = {
  headline: string | null;
  category: string | null;
  about: string | null;
  is_verified: boolean;
  subscription_plans: SubscriptionPlan[] | null;
};

type CreatorPageProfile = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  creator_profiles: CreatorProfile[] | null;
};

type CreatorPost = {
  id: string;
  creator_id: string;
  title: string | null;
  body: string | null;
  visibility: string;
  like_count: number | null;
  comment_count: number | null;
  created_at: string;
};

type CreatorMedia = {
  id: string;
  bucket: string;
  storage_path: string;
  media_type: string;
  is_private: boolean;
  post_id: string;
  position: number;
};

export const Route = createFileRoute("/c/$username")({
  component: CreatorPage,
});

function MediaPreview({ media, canView }: { media: CreatorMedia; canView: boolean }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    async function load() {
      if (!canView) return;

      const { data, error } = await supabase.storage
        .from(media.bucket)
        .download(media.storage_path);

      if (error || !data || cancelled) return;

      objectUrl = URL.createObjectURL(data);
      setUrl(objectUrl);
    }

    void load();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [canView, media.bucket, media.storage_path]);

  if (!canView) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.035]">
        <div className="text-center">
          <Lock className="mx-auto size-5 text-brand" />
          <p className="mt-2 text-xs font-medium">Conteúdo exclusivo</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Assine para visualizar</p>
        </div>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="flex aspect-square animate-pulse items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.035]">
        <ImageIcon className="size-5 text-muted-foreground" />
      </div>
    );
  }

  if (media.media_type.startsWith("video")) {
    return (
      <video
        src={url}
        controls
        preload="metadata"
        className="aspect-square w-full rounded-2xl border border-white/[0.08] bg-black object-cover"
      />
    );
  }

  return (
    <img
      src={url}
      alt="Conteúdo do criador"
      className="aspect-square w-full rounded-2xl border border-white/[0.08] object-cover"
    />
  );
}

function CreatorPage() {
  const { username } = Route.useParams();
  const { data: currentUser } = useCurrentUser();
  const [tab, setTab] = useState<"posts" | "media">("posts");
  const [shared, setShared] = useState(false);

  const q = useQuery({
    queryKey: ["creator", username],
    queryFn: async (): Promise<CreatorPageProfile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id,username,display_name,bio,avatar_url,cover_url,creator_profiles(headline,category,about,is_verified,subscription_plans(id,name,description,price_cents,currency,is_active))",
        )
        .eq("username", username)
        .maybeSingle();

      if (error) throw error;
      return (data ?? null) as CreatorPageProfile | null;
    },
  });

  const creatorId = q.data?.id;

  const posts = useQuery({
    queryKey: ["creator-posts", creatorId],
    enabled: Boolean(creatorId),
    queryFn: async (): Promise<CreatorPost[]> => {
      const { data, error } = await supabase
        .from("posts")
        .select("id,creator_id,title,body,visibility,like_count,comment_count,created_at")
        .eq("creator_id", creatorId!)
        .eq("is_published", true)
        .eq("is_removed", false)
        .order("created_at", { ascending: false })
        .limit(40);

      if (error) throw error;
      return (data ?? []) as CreatorPost[];
    },
  });

  const postCount = useQuery({
    queryKey: ["creator-post-count", creatorId],
    enabled: Boolean(creatorId),
    queryFn: async () => {
      const { count, error } = await supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("creator_id", creatorId!)
        .eq("is_published", true)
        .eq("is_removed", false);

      if (error) throw error;
      return count ?? 0;
    },
  });

  const mediaCount = useQuery({
    queryKey: ["creator-media-count", creatorId],
    enabled: Boolean(creatorId),
    queryFn: async () => {
      const { count, error } = await supabase
        .from("post_media")
        .select("id", { count: "exact", head: true })
        .eq("creator_id", creatorId!);

      if (error) throw error;
      return count ?? 0;
    },
  });

  const media = useQuery({
    queryKey: ["creator-media", creatorId],
    enabled: Boolean(creatorId) && tab === "media",
    queryFn: async (): Promise<CreatorMedia[]> => {
      const { data, error } = await supabase
        .from("post_media")
        .select("id,bucket,storage_path,media_type,is_private,post_id,position")
        .eq("creator_id", creatorId!)
        .order("created_at", { ascending: false })
        .limit(60);

      if (error) throw error;
      return (data ?? []) as CreatorMedia[];
    },
  });

  const subscription = useQuery({
    queryKey: ["creator-subscription-access", currentUser?.user.id, creatorId],
    enabled: Boolean(currentUser?.user.id && creatorId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("id,status,current_period_end")
        .eq("subscriber_id", currentUser!.user.id)
        .eq("creator_id", creatorId!);

      if (error) throw error;
      return data ?? [];
    },
  });

  const hasActiveSubscription = useMemo(() => {
    return Boolean(
      subscription.data?.some(
        (item) =>
          item.status === "active" &&
          (!item.current_period_end || new Date(item.current_period_end).getTime() > Date.now()),
      ),
    );
  }, [subscription.data]);

  if (q.isLoading) {
    return <LoadingBlock />;
  }

  if (!q.data) {
    return (
      <AppShell title="Criador">
        <EmptyBlock
          title="Criador não encontrado"
          description="Este perfil não está publicado ou não existe."
        />
      </AppShell>
    );
  }

  const profile = q.data;
  const creatorProfile = profile.creator_profiles?.[0] ?? null;
  const plans = creatorProfile?.subscription_plans?.filter((plan) => plan.is_active) ?? [];
  const firstPlan = plans.length > 0 ? plans[0] : null;
  const creatorName = profile.display_name ?? "Criador";
  const canViewSubscriberContent = hasActiveSubscription || currentUser?.user.id === creatorId;

  async function shareProfile() {
    const url = window.location.href;

    if (navigator.share) {
      await navigator.share({ title: creatorName, url });
    } else {
      await navigator.clipboard.writeText(url);
      setShared(true);
      window.setTimeout(() => setShared(false), 1800);
    }
  }

  return (
    <AppShell title={creatorName}>
      <div className="mx-auto w-full max-w-4xl pb-4">
        <section className="overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[#0b0d14] shadow-[0_24px_80px_-48px_rgba(184,76,255,0.45)]">
          <div className="relative h-48 overflow-hidden sm:h-60">
            {q.data.cover_url ? (
              <img src={q.data.cover_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-[radial-gradient(circle_at_72%_18%,rgba(184,76,255,0.35),transparent_32%),linear-gradient(135deg,#17101f,#0a0b12)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d14] via-transparent to-black/10" />
            <button
              type="button"
              onClick={() => void shareProfile()}
              className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white backdrop-blur-md transition hover:bg-black/50"
              aria-label="Compartilhar perfil"
            >
              {shared ? <Check className="size-4" /> : <Share2 className="size-4" />}
            </button>
          </div>

          <div className="relative px-5 pb-6 sm:px-7">
            <div className="-mt-12 flex items-end justify-between gap-4">
              <div className="rounded-full bg-[#0b0d14] p-1.5">
                <UserAvatar
                  name={profile.display_name}
                  path={profile.avatar_url}
                  className="size-24 ring-1 ring-white/10 sm:size-28"
                />
              </div>
              <div className="pb-1">
                <FollowButton creatorId={q.data.id} />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{creatorName}</h1>
              {creatorProfile?.is_verified ? <BadgeCheck className="size-5 text-brand" /> : null}
              {creatorProfile?.category ? (
                <Badge variant="secondary">{creatorProfile.category}</Badge>
              ) : null}
            </div>

            <p className="mt-1 text-sm text-muted-foreground">@{profile.username}</p>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
              {creatorProfile?.about ??
                q.data.bio ??
                creatorProfile?.headline ??
                "Conteúdo exclusivo e experiências para quem faz parte desta comunidade."}
            </p>

            {plans.length > 0 ? (
              <div className="mt-6 rounded-2xl border border-brand/15 bg-gradient-to-br from-brand/[0.11] via-white/[0.025] to-transparent p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                      Assinatura
                    </div>
                    <h2 className="mt-1 text-lg font-semibold">
                      {canViewSubscriberContent
                        ? "Você tem acesso a esta comunidade"
                        : "Acesso exclusivo para assinantes"}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {canViewSubscriberContent
                        ? "Conteúdos e experiências liberados para sua assinatura."
                        : (plans[0]!.description ??
                          "Assine para acessar as publicações exclusivas deste criador.")}
                    </p>
                  </div>

                  {!canViewSubscriberContent ? (
                    <Button asChild className="shrink-0 rounded-xl px-6">
                      <Link to="/checkout/$planId" params={{ planId: plans[0]!.id }}>
                        Assinar por {formatCents(plans[0]!.price_cents, plans[0]!.currency)}
                      </Link>
                    </Button>
                  ) : (
                    <div className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/10 px-4 py-2.5 text-sm font-semibold text-emerald-300">
                      <Check className="size-4" /> Assinatura ativa
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex items-center gap-2 border-b border-white/[0.08]">
              <button
                type="button"
                onClick={() => setTab("posts")}
                className={`relative flex items-center gap-2 px-3 py-3 text-sm font-semibold transition ${tab === "posts" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <span>{postCount.data ?? 0} PUBLICAÇÕES</span>
                {tab === "posts" ? (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-brand" />
                ) : null}
              </button>
              <button
                type="button"
                onClick={() => setTab("media")}
                className={`relative flex items-center gap-2 px-3 py-3 text-sm font-semibold transition ${tab === "media" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <ImageIcon className="size-4" />
                <span>{mediaCount.data ?? 0} MÍDIA</span>
                {tab === "media" ? (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-brand" />
                ) : null}
              </button>
            </div>
          </div>
        </section>

        {tab === "posts" ? (
          <section className="mt-5 space-y-4">
            {posts.isLoading ? (
              <LoadingBlock />
            ) : posts.data?.length === 0 ? (
              <EmptyBlock
                title="Nenhuma publicação ainda"
                description="Este criador ainda não publicou conteúdo."
              />
            ) : (
              posts.data?.map((post) => {
                const locked = post.visibility === "subscribers" && !canViewSubscriberContent;

                return (
                  <article
                    key={post.id}
                    className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0d14]"
                  >
                    <div className="flex items-center gap-3 px-5 pt-5">
                      <UserAvatar
                        name={profile.display_name}
                        path={profile.avatar_url}
                        className="size-9"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-sm font-semibold">{creatorName}</span>
                          {creatorProfile?.is_verified ? (
                            <BadgeCheck className="size-3.5 text-brand" />
                          ) : null}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          @{profile.username} ·{" "}
                          {new Date(post.created_at).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                      {post.visibility === "subscribers" ? (
                        <Badge variant="secondary" className="gap-1">
                          <Lock className="size-3" /> Exclusivo
                        </Badge>
                      ) : null}
                    </div>

                    <div className="px-5 pb-5 pt-4">
                      {post.title ? <h3 className="text-lg font-semibold">{post.title}</h3> : null}

                      {locked ? (
                        <div className="mt-4 flex min-h-44 items-center justify-center rounded-2xl border border-brand/10 bg-[radial-gradient(circle_at_50%_20%,rgba(184,76,255,0.11),transparent_50%)] px-6 text-center">
                          <div>
                            <div className="mx-auto flex size-11 items-center justify-center rounded-full border border-brand/15 bg-brand/10 text-brand">
                              <Lock className="size-5" />
                            </div>
                            <p className="mt-3 font-semibold">
                              Publicação exclusiva para assinantes
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Assine esta comunidade para desbloquear este conteúdo.
                            </p>
                            {plans[0] ? (
                              <Button asChild className="mt-4 rounded-xl">
                                <Link to="/checkout/$planId" params={{ planId: plans[0]!.id }}>
                                  Assinar agora
                                </Link>
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      ) : (
                        <>
                          {post.body ? (
                            <p className="whitespace-pre-wrap text-sm leading-7">{post.body}</p>
                          ) : null}
                          <div className="mt-5 flex items-center gap-5 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                              <Heart className="size-4" /> {post.like_count ?? 0}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <MessageCircle className="size-4" /> {post.comment_count ?? 0}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </section>
        ) : (
          <section className="mt-5">
            {media.isLoading ? (
              <LoadingBlock />
            ) : media.data?.length === 0 ? (
              <EmptyBlock
                title="Nenhuma mídia ainda"
                description="Este criador ainda não publicou mídia."
              />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {media.data?.map((item) => (
                  <MediaPreview
                    key={item.id}
                    media={item}
                    canView={canViewSubscriberContent || !item.is_private}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0b0d14] p-4">
            <ImageIcon className="size-4 text-brand" />
            <p className="mt-3 text-sm font-semibold">Conteúdo exclusivo</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Fotos e publicações para assinantes.
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#0b0d14] p-4">
            <Video className="size-4 text-brand" />
            <p className="mt-3 text-sm font-semibold">Experiências</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Experiências e chamadas quando disponíveis.
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#0b0d14] p-4">
            <MessageCircle className="size-4 text-brand" />
            <p className="mt-3 text-sm font-semibold">Comunidade</p>
            <p className="mt-1 text-xs text-muted-foreground">Interações com o criador.</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#0b0d14] p-4">
            <CalendarDays className="size-4 text-brand" />
            <p className="mt-3 text-sm font-semibold">Experiências ao vivo</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Disponibilidade conforme a oferta do criador.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
