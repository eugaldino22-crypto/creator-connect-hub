import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, Users, UserCheck, FileText, Flag, CreditCard, Wallet } from "lucide-react";
import { RoleGate } from "@/components/auth/RoleGate";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyBlock } from "@/components/common/StateBlocks";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({ component: AdminHome });

const items = [
  ["users","Usuários",Users],["creators","Criadores",UserCheck],["posts","Publicações",FileText],["reports","Denúncias",Flag],["transactions","Transações",CreditCard],["payouts","Saques",Wallet],
] as const;

async function countRows(table: string, filter?: (query: any) => any) {
  let query = supabase.from(table as any).select("id", { count: "exact", head: true });
  if (filter) query = filter(query);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

function AdminHome(){
  const metrics = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [users, creators, openReports, payoutRequests, transactions] = await Promise.all([
        countRows("profiles"),
        countRows("creator_profiles"),
        countRows("reports", (q) => q.eq("status", "open")),
        countRows("payout_requests", (q) => q.in("status", ["requested", "processing"])),
        countRows("transactions", (q) => q.eq("status", "succeeded")),
      ]);
      return { users, creators, openReports, payoutRequests, transactions };
    },
    staleTime: 30_000,
  });

  return <RoleGate allowed={["admin","super_admin"]}><AppShell title="Administração">
    <div className="flex items-start justify-between gap-4">
      <div><h2 className="text-2xl font-semibold">Central operacional</h2><p className="mt-1 text-sm text-muted-foreground">Moderação, suporte e operações da SECRET.</p></div>
      <ShieldCheck className="size-7 text-primary"/>
    </div>

    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {[
        ["Usuários", metrics.data?.users],
        ["Criadores", metrics.data?.creators],
        ["Denúncias abertas", metrics.data?.openReports],
        ["Saques em andamento", metrics.data?.payoutRequests],
        ["Transações aprovadas", metrics.data?.transactions],
      ].map(([label,value]) => <div key={label as string} className="surface-card p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold">{metrics.isLoading ? "—" : String(value ?? 0)}</p></div>)}
    </div>

    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(([slug,label,Icon])=><Link key={slug} to="/admin/$section" params={{section:slug}} className="surface-card p-5 transition hover:border-primary/40"><Icon className="size-5 text-primary"/><h3 className="mt-4 font-semibold">{label}</h3><p className="mt-1 text-sm text-muted-foreground">Gerenciar {label.toLowerCase()}.</p></Link>)}
    </div>

    {metrics.error ? <div className="mt-6"><EmptyBlock title="Não foi possível carregar os indicadores" description="A interface continua disponível, mas o resumo operacional não pôde ser consultado." /></div> : null}
  </AppShell></RoleGate>
}
