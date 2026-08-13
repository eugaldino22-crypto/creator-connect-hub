import { useQuery } from "@tanstack/react-query";
import { Wallet, Clock3, Percent, ArrowDownToLine } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-session";
import { formatCents } from "@/lib/brand";
import { LoadingBlock, EmptyBlock } from "@/components/common/StateBlocks";
import { FinanceHistory } from "@/components/studio/FinanceHistory";
import { PayoutRequestPanel } from "@/components/studio/PayoutRequestPanel";

export function FinanceDashboard() {
  const { data: current } = useCurrentUser();
  const q = useQuery({ queryKey: ["studio-finance", current?.user.id], enabled: Boolean(current?.user.id), queryFn: async () => {
    const [{ data: balance, error: balanceError }, { data: subs, error: subError }] = await Promise.all([
      supabase.from("creator_balances").select("available_cents,pending_cents").eq("creator_id", current!.user.id).maybeSingle(),
      supabase.from("subscriptions").select("id,amount_cents,creator_amount_cents,currency,status,created_at,paid_at,profiles:subscriber_id(display_name,username)").eq("creator_id", current!.user.id).order("created_at", { ascending: false }).limit(50),
    ]);
    if (balanceError) throw balanceError; if (subError) throw subError;
    const active = (subs ?? []).filter((s: any) => s.status === "active");
    const gross = active.reduce((n: number, s: any) => n + (s.amount_cents ?? 0), 0);
    const net = active.reduce((n: number, s: any) => n + (s.creator_amount_cents ?? 0), 0);
    return { balance, subs: subs ?? [], gross, net, commission: gross - net };
  }});
  if (q.isLoading) return <LoadingBlock />;
  if (q.error) return <EmptyBlock title="Financeiro indisponível" description="Não foi possível carregar seus dados financeiros." />;
  const b = q.data?.balance;
  return <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-3"><Metric icon={<Wallet className="size-4" />} label="Disponível" value={formatCents(b?.available_cents ?? 0, "USD")} /><Metric icon={<Clock3 className="size-4" />} label="Pendente" value={formatCents(b?.pending_cents ?? 0, "USD")} /><Metric icon={<Percent className="size-4" />} label="Comissão SECRET" value="15%" /></div>
    <div className="surface-card p-5"><div className="flex items-center justify-between gap-3"><div><h3 className="font-semibold">Resumo de receitas</h3><p className="text-xs text-muted-foreground">Baseado apenas em assinaturas confirmadas como ativas.</p></div><ArrowDownToLine className="size-5 text-primary" /></div><div className="mt-5 grid gap-4 sm:grid-cols-3"><Summary label="Receita bruta" value={formatCents(q.data?.gross ?? 0, "USD")} /><Summary label="Sua receita" value={formatCents(q.data?.net ?? 0, "USD")} /><Summary label="Comissão" value={formatCents(q.data?.commission ?? 0, "USD")} /></div></div>
    <PayoutRequestPanel availableCents={b?.available_cents ?? 0} onCreated={() => q.refetch()} />
    <FinanceHistory />
    <div className="surface-card overflow-hidden"><div className="border-b border-border p-5"><h3 className="font-semibold">Assinaturas recentes</h3></div>{!q.data?.subs.length ? <EmptyBlock title="Nenhuma assinatura" description="Quando houver assinaturas, elas aparecerão aqui." /> : <div className="divide-y divide-border">{q.data.subs.map((s: any) => <div key={s.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><p className="font-medium">{s.profiles?.display_name ?? "Assinante"}</p><p className="text-xs text-muted-foreground">{s.status} · {s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}</p></div><div className="text-sm sm:text-right"><p>{formatCents(s.creator_amount_cents ?? 0, s.currency ?? "USD")}</p><p className="text-xs text-muted-foreground">líquido · 15%</p></div></div>)}</div>}</div>
  </div>;
}
function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="surface-card p-4"><div className="flex items-center gap-2 text-muted-foreground">{icon}<span className="text-xs">{label}</span></div><p className="mt-2 text-xl font-semibold">{value}</p></div>; }
function Summary({ label, value }: { label: string; value: string }) { return <div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-lg font-semibold">{value}</p></div>; }
