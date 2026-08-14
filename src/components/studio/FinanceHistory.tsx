import { useQuery } from "@tanstack/react-query";
import { ArrowDownLeft, ArrowUpRight, Clock3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-session";
import { formatCents } from "@/lib/brand";
import { PAYMENTS } from "@/lib/payments";
import { EmptyBlock, LoadingBlock } from "@/components/common/StateBlocks";

type SubscriptionHistoryRow = {
  id: string;
  amount_cents: number | null;
  creator_amount_cents: number | null;
  currency: string | null;
  status: string;
  created_at: string;
  paid_at: string | null;
};

type PayoutHistoryRow = {
  id: string;
  amount_cents: number | null;
  currency: string | null;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
};

type FinanceEvent = {
  id: string;
  kind: "subscription" | "payout";
  amount: number;
  currency: string;
  status: string;
  date: string;
  label: string;
  positive: boolean;
  rejection_reason?: string | null;
};

export function FinanceHistory() {
  const { data: current } = useCurrentUser();

  const q = useQuery({
    queryKey: ["finance-history", current?.user.id],
    enabled: Boolean(current?.user.id),
    queryFn: async (): Promise<FinanceEvent[]> => {
      const [subscriptionResult, payoutResult] = await Promise.all([
        supabase
          .from("subscriptions")
          .select("id,amount_cents,creator_amount_cents,currency,status,created_at,paid_at")
          .eq("creator_id", current!.user.id)
          .order("created_at", { ascending: false })
          .limit(100),

        supabase
          .from("payout_requests")
          .select("id,amount_cents,currency,status,created_at,reviewed_at,rejection_reason")
          .eq("creator_id", current!.user.id)
          .order("created_at", { ascending: false })
          .limit(100),
      ]);

      if (subscriptionResult.error) {
        throw subscriptionResult.error;
      }

      if (payoutResult.error) {
        throw payoutResult.error;
      }

      const subscriptions = (subscriptionResult.data ?? []) as SubscriptionHistoryRow[];

      const payouts = (payoutResult.data ?? []) as PayoutHistoryRow[];

      const events: FinanceEvent[] = [
        ...subscriptions.map((subscription) => ({
          id: `sub-${subscription.id}`,
          kind: "subscription" as const,
          amount: subscription.creator_amount_cents ?? 0,
          currency: subscription.currency ?? PAYMENTS.defaultCurrency,
          status: subscription.status,
          date: subscription.paid_at ?? subscription.created_at,
          label: "Receita de assinatura",
          positive: true,
        })),

        ...payouts.map((payout) => ({
          id: `payout-${payout.id}`,
          kind: "payout" as const,
          amount: payout.amount_cents ?? 0,
          currency: payout.currency ?? PAYMENTS.defaultCurrency,
          status: payout.status,
          date: payout.reviewed_at ?? payout.created_at,
          label: "Solicitação de saque",
          positive: false,
          rejection_reason: payout.rejection_reason,
        })),
      ];

      return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
  });

  if (q.isLoading) {
    return <LoadingBlock />;
  }

  if (q.error) {
    return (
      <EmptyBlock
        title="Histórico indisponível"
        description="Não foi possível carregar o histórico financeiro."
      />
    );
  }

  if (!q.data?.length) {
    return (
      <EmptyBlock
        title="Nenhuma movimentação"
        description="Suas receitas e solicitações de saque aparecerão aqui."
      />
    );
  }

  return (
    <div className="surface-card overflow-hidden">
      <div className="border-b border-border p-5">
        <h3 className="font-semibold">Histórico financeiro</h3>

        <p className="mt-1 text-xs text-muted-foreground">
          Receitas e saques registrados pela SECRET.
        </p>
      </div>

      <div className="divide-y divide-border">
        {q.data.map((event) => (
          <div key={event.id} className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-secondary p-2">
              {event.kind === "subscription" ? (
                <ArrowDownLeft className="size-4 text-primary" />
              ) : (
                <ArrowUpRight className="size-4" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-medium">{event.label}</p>

              <p className="text-xs text-muted-foreground">
                {new Date(event.date).toLocaleString("pt-BR")} · {event.status}
              </p>

              {event.rejection_reason ? (
                <p className="text-xs text-destructive">{event.rejection_reason}</p>
              ) : null}
            </div>

            <div className="text-right">
              <p className="font-semibold">
                {event.positive ? "+" : "-"}
                {formatCents(event.amount, event.currency)}
              </p>

              {event.status === "pending" ? (
                <p className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                  <Clock3 className="size-3" />
                  Pendente
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
