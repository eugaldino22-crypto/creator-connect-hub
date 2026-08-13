import { useState } from "react";
import { Heart, MessageCircle, Lock } from "lucide-react";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-session";
import { CommentsPanel } from "@/components/posts/CommentsPanel";
import { useQuery } from "@tanstack/react-query";

export type Post = { id: string; creator_id: string; title: string | null; body: string | null; visibility: "public" | "subscribers"; created_at: string; like_count: number; comment_count: number; creator?: { username?: string | null; display_name?: string | null; avatar_url?: string | null } | null; can_view?: boolean };

export function PostCard({ post }: { post: Post }) {
  const { data: current } = useCurrentUser();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.like_count ?? 0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const locked = post.visibility === "subscribers" && !post.can_view && post.creator_id !== current?.user.id;
  const likeState = useQuery({ queryKey: ["post-like", post.id, current?.user.id], enabled: Boolean(current?.user.id), queryFn: async () => { const { data, error } = await supabase.from("likes").select("id").eq("post_id", post.id).eq("user_id", current!.user.id).maybeSingle(); if (error) throw error; return Boolean(data); }, staleTime: 60_000 });
  async function toggleLike() { if (!current?.user.id || busy || locked) return; setBusy(true); if (likeState.data ?? liked) { await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", current.user.id); setLikes(n => Math.max(0, n - 1)); setLiked(false); } else { const { error } = await supabase.from("likes").insert({ post_id: post.id, user_id: current.user.id }); if (!error) { setLikes(n => n + 1); setLiked(true); } } setBusy(false); }
  const isLiked = likeState.data ?? liked;
  return <article className="surface-card overflow-hidden"><div className="flex items-center gap-3 p-4"><UserAvatar name={post.creator?.display_name} path={post.creator?.avatar_url}/><div className="min-w-0 flex-1"><p className="truncate font-semibold">{post.creator?.display_name ?? "Criador"}</p><p className="text-xs text-muted-foreground">@{post.creator?.username ?? "criador"} · {new Date(post.created_at).toLocaleDateString()}</p></div>{post.visibility === "subscribers" ? <Badge variant="secondary" className="gap-1"><Lock className="size-3"/> Exclusivo</Badge> : null}</div><div className="px-4 pb-4">{post.title ? <h2 className="text-lg font-semibold">{post.title}</h2> : null}{locked ? <div className="mt-3 rounded-2xl border border-border bg-secondary/40 p-8 text-center"><Lock className="mx-auto size-7 text-primary"/><p className="mt-3 font-medium">Conteúdo exclusivo para assinantes</p><p className="mt-1 text-sm text-muted-foreground">Assine este criador para desbloquear a publicação.</p></div> : <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/90">{post.body}</p>} {!locked ? <div className="mt-4 flex items-center gap-1 border-t border-border pt-2"><Button variant="ghost" size="sm" className="gap-2" disabled={!current?.user.id || busy} onClick={toggleLike}><Heart className={isLiked ? "size-4 fill-current text-primary" : "size-4"}/>{likes}</Button><Button variant="ghost" size="sm" className="gap-2" onClick={()=>setCommentsOpen(v=>!v)}><MessageCircle className="size-4"/>{post.comment_count ?? 0}</Button></div> : null}{commentsOpen && !locked ? <CommentsPanel postId={post.id}/> : null}</div></article>;
}
