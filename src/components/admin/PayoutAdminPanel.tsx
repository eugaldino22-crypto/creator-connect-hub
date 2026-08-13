import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X, WalletCards } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { formatCents } from "@/lib/brand";

export function PayoutAdminPanel() {
  const client = useQueryClient();
  const q = useQuery({ queryKey: ["admin-payouts"], queryFn: async () => { const { data, error } = await supabase.from("payout_requests").select("id,creator_id,amount_cents,currency,destination,status,created_at,reviewed_at,rejection_reason,profiles:creator_id(display_name,username)").order("created_at", { ascending: false }).limit(100); if (error) throw error; return data ?? []; } });
  async function review(id: string, decision: "approved" | "rejected", reason?: string) { const { error } = await supabase.rpc("review_creator_payout", { _payout_id: id, _decision: decision, _reason: reason ?? null }); if (error) { window.alert(error.message); return; } client.invalidateQueries({ queryKey: ["admin-payouts"] }); }
  if (q.isLoading) return <div className="surface-card p-6">Carregando solicitações…</div>;
  if (q.error) return <div className="surface-card p-6 text-sm text-destructive">Não foi possível carregar os saques.</div>;
  return <div className="space-y-4"><div className="flex items-center gap-2"><WalletCards className="size-5 text-primary" /><div><h2 className="text-xl font-semibold">Saques</h2><p className="text-sm text-muted-foreground">Revise solicitações dos criadores. Aprovar coloca o saque em processamento; nenhum pagamento externo é executado aqui.</p></div></div>{q.data.length === 0 ? <div className="surface-card p-8 text-center text-sm text-muted-foreground">Nenhuma solicitação de saque.</div> : q.data.map((p: any) => <PayoutRow key={p.id} payout={p} onReview={review} />)}</div>;
}
function PayoutRow({ payout, onReview }: { payout: any; onReview: (id: string, d: "approved" | "rejected", r?: string) => Promise<void> }) {
  const [reason, setReason] = useState("");
  const pending = payout.status === "requested";
  return <div className="surface-card p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-start"><div className="min-w-0 flex-1"><p className="font-semibold">{payout.profiles?.display_name ?? "Criador"}</p><p className="text-xs text-muted-foreground">@{payout.profiles?.username ?? "—"} · {new Date(payout.created_at).toLocaleString("pt-BR")}</p><p className="mt-3 text-2xl font-semibold">{formatCents(payout.amount_cents ?? 0, payout.currency ?? "USD")}</p><p className="mt-1 break-all text-sm text-muted-foreground">Destino: {payout.destination}</p><p className="mt-2 text-xs">Status: <span className="font-medium">{payout.status}</span></p>{payout.rejection_reason ? <p className="mt-1 text-sm text-destructive">Motivo: {payout.rejection_reason}</p> : null}</div>{pending ? <div className="w-full lg:max-w-sm"><Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Motivo (obrigatório ao rejeitar)" className="min-h-20" /><div className="mt-2 flex gap-2"><Button className="flex-1 gap-2" onClick={() => onReview(payout.id, "approved")}><Check className="size-4" />Aprovar / processar</Button><Button variant="destructive" className="flex-1 gap-2" disabled={!reason.trim()} onClick={() => onReview(payout.id, "rejected", reason)}><X className="size-4" />Rejeitar</Button></div></div> : null}</div></div>;
}
