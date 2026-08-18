import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, MessageCircle, Lock, Sparkles } from "lucide-react";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-session";
import { CommentsPanel } from "@/components/posts/CommentsPanel";
import { useQuery } from "@tanstack/react-query";

export type Post = {
  id: string;
  creator_id: string;
  title: string | null;
  body: string | null;
  visibility: "public" | "subscribers";
  created_at: string;
  like_count: number;
  comment_count: number;
  creator?: {
    username?: string | null;
    display_name?: string | null;
    avatar_url?: string | null;
  } | null;
  can_view?: boolean;
};

export function PostCard({ post }: { post: Post }) {
  const { data: current } = useCurrentUser();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.like_count ?? 0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const locked =
    post.visibility === "subscribers" && !post.can_view && post.creator_id !== current?.user.id;
  const likeState = useQuery({
    queryKey: ["post-like", post.id, current?.user.id],
    enabled: Boolean(current?.user.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("likes")
        .select("id")
        .eq("post_id", post.id)
        .eq("user_id", current!.user.id)
        .maybeSingle();
      if (error) throw error;
      return Boolean(data);
    },
    staleTime: 60_000,
  });

  async function toggleLike() {
    if (!current?.user.id || busy || locked) return;
    setBusy(true);
    if (likeState.data ?? liked) {
      await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", current.user.id);
      setLikes((n) => Math.max(0, n - 1));
      setLiked(false);
    } else {
      const { error } = await supabase
        .from("likes")
        .insert({ post_id: post.id, user_id: current.user.id });
      if (!error) {
        setLikes((n) => n + 1);
        setLiked(true);
      }
    }
    setBusy(false);
  }

  const isLiked = likeState.data ?? liked;
  const username = post.creator?.username ?? "";

  return (
    <article className="group overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-[#0b0d14] shadow-[0_18px_60px_-42px_rgba(184,76,255,0.42)] transition duration-300 hover:-translate-y-0.5 hover:border-brand/20 hover:shadow-[0_24px_72px_-42px_rgba(184,76,255,0.52)]">
      <div className="relative flex items-center gap-3 border-b border-white/[0.06] px-4 py-4 sm:px-5">
        <Link
          to="/c/$username"
          params={{ username }}
          className="shrink-0 rounded-full ring-offset-2 transition hover:ring-2 hover:ring-brand/30"
        >
          <UserAvatar
            name={post.creator?.display_name}
            path={post.creator?.avatar_url}
            className="size-11"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            to="/c/$username"
            params={{ username }}
            className="block truncate text-[15px] font-semibold transition hover:text-brand"
          >
            {post.creator?.display_name ?? "Criador"}
          </Link>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>@{username || "criador"}</span>
            <span className="size-1 rounded-full bg-white/20" />
            <span>{new Date(post.created_at).toLocaleDateString("pt-BR")}</span>
          </div>
        </div>

        {post.visibility === "subscribers" ? (
          <Badge className="border-brand/15 bg-brand/10 text-brand hover:bg-brand/10">
            <Lock className="mr-1 size-3" />
            Exclusivo
          </Badge>
        ) : (
          <div className="flex size-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] text-muted-foreground">
            <Sparkles className="size-3.5" />
          </div>
        )}
      </div>

      <div className="px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
        {post.title ? (
          <h2 className="text-lg font-semibold leading-7 tracking-tight sm:text-xl">{post.title}</h2>
        ) : null}

        {locked ? (
          <div className="relative mt-4 overflow-hidden rounded-[1.15rem] border border-brand/15 bg-[radial-gradient(circle_at_50%_15%,rgba(184,76,255,0.14),transparent_48%),linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.012))] px-6 py-10 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-brand/15 bg-brand/10 text-brand shadow-[0_0_36px_-10px_rgba(184,76,255,0.6)]">
              <Lock className="size-5" />
            </div>
            <p className="mt-4 text-sm font-semibold sm:text-base">Conteúdo exclusivo para assinantes</p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">
              Assine este criador para desbloquear esta publicação e continuar acompanhando a comunidade.
            </p>
            {username ? (
              <Button asChild className="mt-5 rounded-xl px-5">
                <Link to="/c/$username" params={{ username }}>
                  Ver comunidade
                </Link>
              </Button>
            ) : null}
          </div>
        ) : (
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-foreground/90">
            {post.body}
          </p>
        )}

        {!locked ? (
          <div className="mt-5 flex items-center gap-1 border-t border-white/[0.06] pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 rounded-xl px-3 text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
              disabled={!current?.user.id || busy}
              onClick={toggleLike}
            >
              <Heart className={isLiked ? "size-4 fill-current text-brand" : "size-4"} />
              {likes}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 rounded-xl px-3 text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
              onClick={() => setCommentsOpen((v) => !v)}
            >
              <MessageCircle className="size-4" />
              {post.comment_count ?? 0}
            </Button>
          </div>
        ) : null}

        {commentsOpen && !locked ? <CommentsPanel postId={post.id} /> : null}
      </div>
    </article>
  );
}
