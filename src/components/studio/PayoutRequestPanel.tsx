import { useState } from "react";
import { ArrowUpFromLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-session";
import { formatCents } from "@/lib/brand";

export function PayoutRequestPanel({ availableCents = 0, onCreated }: { availableCents?: number; onCreated?: () => void }) {
  const { data: current } = useCurrentUser();
  const [amount, setAmount] = useState(""); const [destination, setDestination] = useState(""); const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  async function request() {
    if (!current?.user.id) return;
    const cents = Math.round(Number(amount.replace(",", ".")) * 100);
    if (!Number.isFinite(cents) || cents <= 0 || cents > availableCents) { setMessage(`Informe um valor entre US$ 0,01 e ${formatCents(availableCents, "USD")}.`); return; }
    if (destination.trim().length < 3) { setMessage("Informe o destino do saque."); return; }
    setBusy(true); setMessage("");
    const { error } = await supabase.from("payout_requests").insert({ creator_id: current.user.id, amount_cents: cents, currency: "USD", destination: destination.trim(), status: "pending" });
    setBusy(false); if (error) { setMessage(error.message); return; }
    setAmount(""); setDestination(""); setMessage("Solicitação enviada. O saque ficará pendente de análise administrativa."); onCreated?.();
  }
  return <div className="surface-card p-5"><div className="flex items-center gap-2"><ArrowUpFromLine className="size-5 text-primary"/><div><h3 className="font-semibold">Solicitar saque</h3><p className="text-xs text-muted-foreground">Disponível: {formatCents(availableCents, "USD")}</p></div></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><Input inputMode="decimal" placeholder="Valor em USD" value={amount} onChange={e=>setAmount(e.target.value)}/><Input placeholder="Destino do saque" value={destination} onChange={e=>setDestination(e.target.value)}/></div><Button className="mt-3" disabled={busy || availableCents <= 0} onClick={request}>{busy ? "Enviando…" : "Solicitar saque"}</Button>{message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}</div>;
}
