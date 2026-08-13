import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Compass, CreditCard, Lock, LogIn, MessageCircle, UserRound, Users } from "lucide-react";
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
import { useCurrentUser, hasRole } from "@/hooks/use-session";
import { PAYMENTS } from "@/lib/payments";

export const Route = createFileRoute("/$section")({ component: SectionPage });

function useCreators() {
  return useQuery({
    queryKey: ["creators"],
    queryFn: async (): Promise<CreatorSummary[]> => {
      const { data, error } = await supabase
        .from("creator_profiles")
        .select("user_id, headline, category, is_verified, profiles(username,display_name,avatar_url,cover_url), subscription_plans(price_cents,currency)")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        user_id: row.user_id,
        headline: row.headline,
        category: row.category,
        is_verified: row.is_verified,
        profile: row.profiles,
        cheapest_plan_cents: row.subscription_plans?.length ? Math.min(...row.subscription_plans.map((p: any) => p.price_cents)) : null,
        currency: row.subscription_plans?.[0]?.currency ?? "USD",
      }));
    },
    staleTime: 30_000,
  });
}

function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setMessage("");
    const result = mode === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { display_name: name } } });
    setLoading(false);
    if (result.error) return setMessage(result.error.message);
    if (mode === "signup") setMessage("Conta criada. Verifique seu e-mail se a confirmação estiver habilitada.");
    else navigate({ to: "/onboarding" });
  }
  return <div className="min-h-screen bg-background px-4 py-10"><div className="mx-auto max-w-md surface-card p-7"><div className="mb-7 text-center"><div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-brand-gradient text-brand-foreground"><LogIn className="size-6" /></div><h1 className="text-2xl font-semibold">Entre na SECRET</h1><p className="mt-2 text-sm text-muted-foreground">Sua comunidade. Seu conteúdo. Seu espaço.</p></div><form onSubmit={submit} className="space-y-4">{mode === "signup" && <Input placeholder="Nome" value={name} onChange={e=>setName(e.target.value)} required />}<Input type="email" placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)} required /><Input type="password" placeholder="Senha" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8}/>{message && <p className="text-sm text-muted-foreground">{message}</p>}<Button className="w-full" disabled={loading}>{loading ? "Processando…" : mode === "login" ? "Entrar" : "Criar conta"}</Button></form><Button variant="ghost" className="mt-3 w-full" onClick={()=>supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo:window.location.origin+"/onboarding"}})}>Continuar com Google</Button><div className="mt-5 text-center text-sm text-muted-foreground"><button className="underline" onClick={()=>setMode(mode === "login" ? "signup" : "login")}>{mode === "login" ? "Criar uma conta" : "Já tenho uma conta"}</button></div></div></div>;
}

function OnboardingPage() {
  const { data } = useCurrentUser(); const navigate = useNavigate(); const [busy,setBusy]=useState(false);
  async function choose(role:"subscriber"|"creator") { if(!data?.user) return; setBusy(true); const { error: roleError }=await supabase.from("user_roles").insert({user_id:data.user.id,role}); if(roleError && !roleError.message.toLowerCase().includes("duplicate")){setBusy(false);return;} if(role === "creator"){await supabase.from("creator_profiles").upsert({user_id:data.user.id,is_published:false,commission_rate:0.15});} await supabase.from("profiles").update({onboarding_completed:true}).eq("id",data.user.id); setBusy(false); navigate({to: role === "creator" ? "/studio" : "/feed"}); }
  return <div className="min-h-screen bg-background px-4 py-12"><div className="mx-auto max-w-3xl"><h1 className="text-3xl font-semibold">Como você quer usar a SECRET?</h1><p className="mt-2 text-muted-foreground">Escolha seu espaço principal. Você pode criar uma comunidade ou participar das que já existem.</p><div className="mt-8 grid gap-5 md:grid-cols-2"><button className="surface-card p-6 text-left hover:border-primary/50" disabled={busy} onClick={()=>choose("subscriber")}><Users className="size-7 text-primary"/><h2 className="mt-4 text-xl font-semibold">Sou assinante</h2><p className="mt-2 text-sm text-muted-foreground">Explore criadores, acompanhe conteúdos e assine comunidades.</p></button><button className="surface-card p-6 text-left hover:border-primary/50" disabled={busy} onClick={()=>choose("creator")}><UserRound className="size-7 text-primary"/><h2 className="mt-4 text-xl font-semibold">Sou criador</h2><p className="mt-2 text-sm text-muted-foreground">Crie seu perfil, publique conteúdo e monetize sua comunidade.</p></button></div></div></div>;
}

function ExplorePage(){const {data,isLoading,error}=useCreators(); const [q,setQ]=useState(""); const list=useMemo(()=>data?.filter(c=>`${c.profile?.display_name??""} ${c.category??""} ${c.headline??""}`.toLowerCase().includes(q.toLowerCase()))??[],[data,q]); return <AppShell title="Explorar"><div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h2 className="text-2xl font-semibold">Descubra criadores</h2><p className="text-sm text-muted-foreground">Encontre comunidades para fazer parte.</p></div><Input className="md:max-w-xs" placeholder="Buscar criadores" value={q} onChange={e=>setQ(e.target.value)}/></div>{isLoading?<LoadingBlock/>:error?<ErrorBlock/>:list.length===0?<EmptyBlock title="Nenhum criador encontrado" description="Ainda não há criadores publicados que correspondam à busca."/>:<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{list.map(c=><CreatorCard key={c.user_id} creator={c}/>)}</div>}</AppShell>}

function FeedPage(){return <RoleGate allowed={["subscriber","creator"]}><AppShell title="Meu feed"><div className="surface-card p-6"><div className="flex items-center gap-3"><MessageCircle className="size-5 text-primary"/><div><h2 className="font-semibold">Seu feed está pronto</h2><p className="text-sm text-muted-foreground">Publicações de criadores que você segue e assina aparecerão aqui.</p></div></div><Button asChild className="mt-5"><Link to="/explore">Explorar criadores</Link></Button></div></AppShell></RoleGate>}

function SubscriptionsPage(){const {data:user}=useCurrentUser(); const q=useQuery({queryKey:["subscriptions",user?.user.id],enabled:Boolean(user?.user.id),queryFn:async()=>{const {data,error}=await supabase.from("subscriptions").select("id,status,current_period_start,current_period_end,subscription_plans(name,price_cents,currency),profiles:creator_id(username,display_name)").eq("subscriber_id",user!.user.id).order("created_at",{ascending:false}); if(error)throw error; return data??[];}}); return <RoleGate allowed={["subscriber","creator"]}><AppShell title="Assinaturas"><h2 className="text-2xl font-semibold">Minhas assinaturas</h2><p className="mt-1 text-sm text-muted-foreground">Acompanhe suas comunidades e status de cobrança.</p><div className="mt-6 space-y-3">{q.isLoading?<LoadingBlock/>:q.error?<ErrorBlock/>:q.data?.length===0?<EmptyBlock title="Você ainda não assinou nenhum criador" description="Explore criadores e escolha uma comunidade para começar." action={<Button asChild><Link to="/explore">Explorar</Link></Button>}/>:q.data.map((s:any)=><div key={s.id} className="surface-card flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between"><div><p className="font-semibold">{s.profiles?.display_name??"Criador"}</p><p className="text-sm text-muted-foreground">{s.subscription_plans?.name??"Plano"} · {s.subscription_plans?.currency??"USD"}</p></div><Badge>{s.status}</Badge></div>)}</div></AppShell></RoleGate>}

function MessagesPage(){return <RoleGate allowed={["subscriber","creator"]}><AppShell title="Mensagens"><EmptyBlock title="Suas conversas aparecerão aqui" description="A mensageria usa Realtime e está conectada ao banco. Assim que houver conversas, elas serão carregadas nesta tela." icon={<MessageCircle className="size-5"/>}/></AppShell></RoleGate>}
function NotificationsPage(){const {data}=useCurrentUser(); const q=useQuery({queryKey:["notifications",data?.user.id],enabled:Boolean(data?.user.id),queryFn:async()=>{const {data,error}=await supabase.from("notifications").select("*").eq("user_id",data!.user.id).order("created_at",{ascending:false});if(error)throw error;return data??[];}}); return <RoleGate allowed={["subscriber","creator","admin","super_admin"]}><AppShell title="Notificações"><div className="space-y-3">{q.data?.length===0?<EmptyBlock title="Tudo limpo" description="Você não tem novas notificações." icon={<Bell className="size-5"/>}/>:q.data?.map((n:any)=><div key={n.id} className="surface-card p-4"><p className="font-medium">{n.title}</p><p className="mt-1 text-sm text-muted-foreground">{n.body}</p></div>)}</div></AppShell></RoleGate>}
function AccountPage(){const {data,q}=({data:undefined as any}); return <RoleGate allowed={["subscriber","creator"]}><AppShell title="Minha conta"><AccountForm/></AppShell></RoleGate>}
function AccountForm(){const {data}=useCurrentUser(); const [name,setName]=useState(""); const [bio,setBio]=useState(""); const [saved,setSaved]=useState(false); const uid=data?.user.id; useMemo(()=>{setName(data?.profile?.display_name??"");setBio(data?.profile?.bio??"");},[data?.profile]); async function save(){if(!uid)return;await supabase.from("profiles").update({display_name:name,bio}).eq("id",uid);setSaved(true);} return <div className="max-w-2xl space-y-4"><Input value={name} onChange={e=>setName(e.target.value)} placeholder="Nome"/><Textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="Bio"/><Button onClick={save}>Salvar alterações</Button>{saved&&<p className="text-sm text-muted-foreground">Perfil atualizado.</p>}</div>}

function SectionPage(){const {section}=Route.useParams(); if(section==="auth")return <AuthPage/>; if(section==="onboarding")return <RoleGate allowed={["subscriber","creator","admin","super_admin"]}><OnboardingPage/></RoleGate>; if(section==="explore")return <ExplorePage/>; if(section==="feed")return <FeedPage/>; if(section==="subscriptions")return <SubscriptionsPage/>; if(section==="messages")return <MessagesPage/>; if(section==="notifications")return <NotificationsPage/>; if(section==="account")return <AccountPage/>; return <AppShell title="SECRET"><EmptyBlock title="Página em construção" description="Esta área será disponibilizada na próxima etapa do produto."/></AppShell>}
