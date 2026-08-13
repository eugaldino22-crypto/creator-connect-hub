import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Heart, Lock } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingBlock, EmptyBlock } from "@/components/common/StateBlocks";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FollowButton } from "@/components/creators/FollowButton";
import { supabase } from "@/integrations/supabase/client";
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

export const Route = createFileRoute("/c/$username")({
  component: CreatorPage,
});

function CreatorPage() {
  const { username } = Route.useParams();

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

  const posts = useQuery({
    queryKey: ["creator-posts", q.data?.id],
    enabled: Boolean(q.data?.id),
    queryFn: async (): Promise<CreatorPost[]> => {
      const { data, error } = await supabase
        .from("posts")
        .select("id,creator_id,title,body,visibility,like_count,comment_count,created_at")
        .eq("creator_id", q.data!.id)
        .eq("is_published", true)
        .eq("is_removed", false)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      return (data ?? []) as CreatorPost[];
    },
  });

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

  const creatorProfile = q.data.creator_profiles?.[0] ?? null;

  return (
    <AppShell title={q.data.display_name ?? "Criador"}>
      <div className="surface-card overflow-hidden">
        <div className="h-40 bg-brand-gradient opacity-80" />

        <div className="-mt-10 px-5 pb-6">
          <UserAvatar
            name={q.data.display_name}
            path={q.data.avatar_url}
            className="size-20 ring-4 ring-card"
          />

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">{q.data.display_name}</h1>

            {creatorProfile?.is_verified ? <BadgeCheck className="size-5 text-primary" /> : null}

            {creatorProfile?.category ? (
              <Badge variant="secondary">{creatorProfile.category}</Badge>
            ) : null}
          </div>

          <p className="mt-1 text-sm text-muted-foreground">@{q.data.username}</p>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
            {creatorProfile?.about ??
              q.data.bio ??
              creatorProfile?.headline ??
              "Este criador ainda não adicionou uma descrição."}
          </p>

          <div className="mt-4">
            <FollowButton creatorId={q.data.id} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {creatorProfile?.subscription_plans
              ?.filter((plan) => plan.is_active)
              .map((plan) => (
                <div
                  key={plan.id}
                  className="min-w-[220px] rounded-2xl border border-border bg-secondary/50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{plan.name}</p>

                      <p className="mt-1 text-xs text-muted-foreground">{plan.description}</p>
                    </div>

                    <span className="font-semibold text-primary">
                      {formatCents(plan.price_cents, plan.currency)}
                    </span>
                  </div>

                  <Button asChild className="mt-4 w-full">
                    <Link to="/checkout/$planId" params={{ planId: plan.id }}>
                      Assinar
                    </Link>
                  </Button>
                </div>
              ))}
          </div>
        </div>
      </div>

      <section className="mt-7">
        <div className="mb-4 flex items-center gap-2">
          <Heart className="size-4 text-primary" />
          <h2 className="font-semibold">Publicações</h2>
        </div>

        {posts.isLoading ? (
          <LoadingBlock />
        ) : posts.data?.length === 0 ? (
          <EmptyBlock
            title="Nenhuma publicação ainda"
            description="Este criador ainda não publicou conteúdo."
          />
        ) : (
          <div className="space-y-4">
            {posts.data?.map((post) => (
              <article key={post.id} className="surface-card p-5">
                <div className="flex items-center gap-2">
                  {post.visibility === "subscribers" && (
                    <Badge variant="secondary" className="gap-1">
                      <Lock className="size-3" />
                      Assinantes
                    </Badge>
                  )}

                  <span className="text-xs text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>

                {post.title ? <h3 className="mt-3 text-lg font-semibold">{post.title}</h3> : null}

                {post.visibility === "subscribers" ? (
                  <div className="mt-4 rounded-2xl border border-border bg-secondary/40 p-5 text-center">
                    <Lock className="mx-auto size-5 text-primary" />

                    <p className="mt-2 text-sm text-muted-foreground">
                      Esta publicação é exclusiva para assinantes.
                    </p>
                  </div>
                ) : (
                  post.body && (
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{post.body}</p>
                  )
                )}

                <div className="mt-4 text-xs text-muted-foreground">
                  {post.like_count ?? 0} curtidas · {post.comment_count ?? 0} comentários
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
