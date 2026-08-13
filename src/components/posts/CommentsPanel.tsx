import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/common/UserAvatar";
import { useCurrentUser } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function CommentsPanel({ postId }: { postId: string }) {
  const { data: current } = useCurrentUser();
  const client = useQueryClient();
  const [body, setBody] = useState("");
  const q = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const { data, error } = await supabase.from("comments").select("id,body,created_at,user_id,profiles:user_id(display_name,username,avatar_url)").eq("post_id", postId).eq("is_removed", false).order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
  async function send() {
    const text = body.trim();
    if (!current?.user.id || !text) return;
    const { error } = await supabase.from("comments").insert({ post_id: postId, user_id: current.user.id, body: text });
    if (!error) { setBody(""); client.invalidateQueries({ queryKey: ["comments", postId] }); }
  }
  return <div className="mt-3 border-t border-border pt-4">
    <div className="mb-3 flex items-center gap-2 text-sm font-medium"><MessageCircle className="size-4"/>Comentários</div>
    <div className="max-h-72 space-y-3 overflow-y-auto">{q.data?.map((comment:any)=><div key={comment.id} className="flex gap-2"><UserAvatar name={comment.profiles?.display_name} path={comment.profiles?.avatar_url} className="size-8 shrink-0"/><div className="min-w-0 rounded-2xl bg-secondary/60 px-3 py-2"><p className="text-xs font-semibold">{comment.profiles?.display_name ?? "Usuário"}</p><p className="mt-0.5 text-sm whitespace-pre-wrap break-words">{comment.body}</p></div></div>)}</div>
    {current?.user.id ? <div className="mt-3 flex gap-2"><Textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Escreva um comentário…" maxLength={2000} className="min-h-10 resize-none"/><Button size="icon" onClick={send} disabled={!body.trim()} aria-label="Enviar comentário"><Send className="size-4"/></Button></div> : null}
  </div>;
}
