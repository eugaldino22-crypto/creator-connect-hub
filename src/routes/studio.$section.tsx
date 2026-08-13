import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Video, Users } from "lucide-react";
import { RoleGate } from "@/components/auth/RoleGate";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyBlock, LoadingBlock } from "@/components/common/StateBlocks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-session";
import { createVideoCall } from "@/lib/video-calls";
import { VideoCallPanel } from "@/components/video/VideoCallPanel";
import { UserAvatar } from "@/components/common/UserAvatar";

export const Route = createFileRoute("/studio/$section")({ component: StudioSection });

function StudioSection() {
  const { section } = Route.useParams();
  const { data: user } = useCurrentUser();
  if (section === "new") return <RoleGate allowed={["creator"]}><CreatePost /></RoleGate>;
  if (section === "subscribers") return <RoleGate allowed={["creator"]}><SubscriberManager /></RoleGate>;

  const table = section === "posts" ? "posts" : section === "plans" ? "subscription_plans" : section === "finance" ? "transactions" : "creator_profiles";
  const q = useQuery({
    queryKey: ["studio", table, user?.user.id],
    enabled: Boolean(user?.user.id),
    queryFn: async () => {
      const column = table === "subscription_plans" ? "creator_id" : table === "creator_profiles" ? "user_id" : "creator_id";
      const { data, error } = await supabase.from(table as any).select("*").eq(column, user!.user.id).order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  return <RoleGate allowed={["creator"]}><AppShell title={`Studio · ${section}`}>
    <div className="flex items-center justify-between gap-3">
      <div><h2 className="text-2xl font-semibold capitalize">{section}</h2><p className="mt-1 text-sm text-muted-foreground">Dados reais do seu espaço de criador.</p></div>
      {section === "posts" && <Button asChild><Link to="/studio/$section" params={{ section: "new" }}>Nova publicação</Link></Button>}
    </div>
    <div className="mt-6 surface-card overflow-hidden">
      {q.isLoading ? <LoadingBlock /> : q.error ? <EmptyBlock title="Não foi possível carregar" description="Verifique as permissões da conta." /> : q.data?.length === 0 ? <EmptyBlock title="Nada aqui ainda" description="Comece configurando seu perfil e publicando conteúdo." /> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b border-border text-left text-muted-foreground"><tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Data</th></tr></thead><tbody>{q.data.map((r:any)=><tr key={r.id} className="border-b border-border/60"><td className="px-4 py-3 font-mono text-xs">{r.id}</td><td className="px-4 py-3">{r.status??r.name??r.title??(r.is_active?"Ativo":"—")}</td><td className="px-4 py-3 text-muted-foreground">{r.created_at?new Date(r.created_at).toLocaleString("pt-BR"):"—"}</td></tr>)}</tbody></table></div>}
    </div>
  </AppShell></RoleGate>;
}

function SubscriberManager() {
  const { data: current } = useCurrentUser();
  const [callId, setCallId] = useState<string | null>(null);
  const [callOpen, setCallOpen] = useState(false);
  const [starting, setStarting] = useState<string | null>(null);
  const [callError, setCallError] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ["studio-subscribers", current?.user.id],
    enabled: Boolean(current?.user.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("id,subscriber_id,status,current_period_end,profiles:subscriber_id(username,display_name,avatar_url)")
        .eq("creator_id", current!.user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function startCall(subscriberId: string) {
    setStarting(subscriberId);
    setCallError(null);
    try {
      const result = await createVideoCall(subscriberId);
      setCallId(result.call.id);
      setCallOpen(true);
    } catch (error) {
      setCallError(error instanceof Error ? error.message : "Não foi possível iniciar a chamada.");
    } finally {
      setStarting(null);
    }
  }

  return <AppShell title="Studio · Assinantes">
    <div className="flex items-start justify-between gap-3">
      <div><h2 className="text-2xl font-semibold">Assinantes</h2><p className="mt-1 text-sm text-muted-foreground">Gerencie sua comunidade e inicie videochamadas individuais com assinantes ativos.</p></div>
      <Users className="size-7 text-primary" />
    </div>
    {callError ? <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{callError}</div> : null}
    <div className="mt-6 grid gap-3">
      {q.isLoading ? <LoadingBlock /> : q.error ? <EmptyBlock title="Não foi possível carregar os assinantes" description="Verifique as permissões da conta." /> : q.data?.length === 0 ? <EmptyBlock title="Nenhum assinante ativo" description="Quando uma assinatura for confirmada, o assinante aparecerá aqui." /> : q.data.map((item:any) => <div key={item.id} className="surface-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center"><UserAvatar name={item.profiles?.display_name} path={item.profiles?.avatar_url} className="size-11" /><div className="min-w-0 flex-1"><p className="font-semibold">{item.profiles?.display_name ?? "Assinante"}</p><p className="text-sm text-muted-foreground">{item.profiles?.username ? `@${item.profiles.username}` : "Assinante ativo"}</p></div><Button className="gap-2" disabled={starting === item.subscriber_id} onClick={() => startCall(item.subscriber_id)}><Video className="size-4" />{starting === item.subscriber_id ? "Conectando…" : "Fazer videochamada"}</Button></div>)}
    </div>
    <VideoCallPanel callId={callId} open={callOpen} onClose={() => setCallOpen(false)} />
  </AppShell>;
}

function CreatePost() {
  const { data } = useCurrentUser();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [exclusive, setExclusive] = useState(false);
  const [saved, setSaved] = useState(false);
  async function publish() {
    if (!data?.user.id) return;
    const { error } = await supabase.from("posts").insert({ creator_id: data.user.id, title, body, visibility: exclusive ? "subscribers" : "public", is_published: true });
    if (!error) setSaved(true);
  }
  return <AppShell title="Nova publicação"><div className="max-w-2xl space-y-4"><Input placeholder="Título" value={title} onChange={e=>setTitle(e.target.value)} /><Textarea placeholder="Escreva para sua comunidade…" className="min-h-48" value={body} onChange={e=>setBody(e.target.value)} /><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={exclusive} onChange={e=>setExclusive(e.target.checked)} /> Somente assinantes</label><Button onClick={publish}>Publicar</Button>{saved && <p className="text-sm text-muted-foreground">Publicação criada.</p>}</div></AppShell>;
}
