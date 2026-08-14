import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { RoleGate } from "@/components/auth/RoleGate";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyBlock, LoadingBlock } from "@/components/common/StateBlocks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-session";
import { PAYMENTS } from "@/lib/payments";
import { formatCents } from "@/lib/brand";

export const Route = createFileRoute("/checkout/$planId")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const { planId } = Route.useParams();
  const { data: user } = useCurrentUser();
  const [status, setStatus] = useState("");

  const q = useQuery({
    queryKey: ["checkout-plan", planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select(
          "id,name,description,price_cents,currency,creator_id,is_active,profiles:creator_id(display_name,username)",
        )
        .eq("id", planId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data;
    },
  });

  async function start() {
    if (!user?.user.id || !q.data) {
      return;
    }

    const { error } = await supabase.from("subscriptions").insert({
      subscriber_id: user.user.id,
      creator_id: q.data.creator_id,
      plan_id: q.data.id,
      status: "pending",
      gateway: PAYMENTS.provider,
    });

    if (error) {
      setStatus(error.message);
      return;
    }

    setStatus(
      `Assinatura criada como pendente. ${PAYMENTS.provider} ainda não está configurado; nenhum pagamento foi aprovado.`,
    );
  }

  return (
    <RoleGate allowed={["subscriber"]}>
      <AppShell title="Assinar">
        <div className="mx-auto max-w-2xl">
          {q.isLoading ? (
            <LoadingBlock />
          ) : !q.data ? (
            <EmptyBlock title="Plano não encontrado" />
          ) : (
            <div className="surface-card p-6">
              <Badge>SECRET · Checkout seguro</Badge>

              <h1 className="mt-4 text-2xl font-semibold">{q.data.name}</h1>

              <p className="mt-2 text-sm text-muted-foreground">{q.data.description}</p>

              <div className="mt-7 flex items-end justify-between gap-4 border-y border-border py-5">
                <div>
                  <p className="text-xs text-muted-foreground">Assinatura mensal</p>

                  <p className="text-3xl font-semibold">
                    {formatCents(q.data.price_cents, q.data.currency ?? PAYMENTS.defaultCurrency)}
                  </p>
                </div>

                <div className="text-right text-xs text-muted-foreground">
                  {`Moeda de referência: ${q.data.currency ?? PAYMENTS.defaultCurrency}`}
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-secondary/60 p-4">
                  <p className="font-medium">Cartão / métodos locais</p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Disponíveis quando o gateway estiver configurado.
                  </p>
                </div>

                <div className="rounded-xl bg-secondary/60 p-4">
                  <p className="font-medium">Cripto</p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Preparado para NOWPayments e confirmação por webhook.
                  </p>
                </div>
              </div>

              <Button className="mt-6 w-full" onClick={() => void start()}>
                <Lock className="mr-2 size-4" />
                Continuar para pagamento
              </Button>

              {status && (
                <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
                  {status}
                </div>
              )}

              <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="size-4" />A assinatura só será ativada após confirmação real
                do gateway.
              </div>

              <Button asChild variant="ghost" className="mt-2 w-full">
                <Link to="/explore">Voltar para Explore</Link>
              </Button>
            </div>
          )}
        </div>
      </AppShell>
    </RoleGate>
  );
}
