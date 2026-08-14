import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Settings,
  Shield,
  Users,
  Wallet,
  CreditCard,
  FileSearch,
  Crown,
  Activity,
} from "lucide-react";
import { RoleGate } from "@/components/auth/RoleGate";
import { AppShell } from "@/components/layout/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { PAYMENTS } from "@/lib/payments";

export const Route = createFileRoute("/super-admin")({ component: SuperAdminHome });

const items = [
  ["admins", "Administradores", Users],
  ["roles", "Papéis e acesso", Shield],
  ["finance", "Financeiro global", Wallet],
  ["payments", "Pagamentos", CreditCard],
  ["security", "Segurança", Shield],
  ["audit", "Auditoria", FileSearch],
  ["settings", "Configurações", Settings],
] as const;

type CountableTable = "profiles" | "creator_profiles" | "subscriptions" | "reports" | "audit_logs";

async function countRows(table: CountableTable) {
  const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });

  if (error) throw error;
  return count ?? 0;
}

async function countByStatus(table: "subscriptions" | "reports", status: "active" | "open") {
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("status", status);

  if (error) throw error;
  return count ?? 0;
}

function SuperAdminHome() {
  const overview = useQuery({
    queryKey: ["super-admin-overview"],
    queryFn: async () => {
      const [users, creators, activeSubscriptions, openReports, auditEvents] = await Promise.all([
        countRows("profiles"),
        countRows("creator_profiles"),
        countByStatus("subscriptions", "active"),
        countByStatus("reports", "open"),
        countRows("audit_logs"),
      ]);

      return { users, creators, activeSubscriptions, openReports, auditEvents };
    },
    staleTime: 30_000,
  });

  return (
    <RoleGate allowed={["super_admin"]}>
      <AppShell title="Super Admin">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Controle global da SECRET</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Governança, segurança, finanças e configurações da plataforma.
            </p>
          </div>
          <Crown className="size-7 text-primary" />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Usuários", overview.data?.users],
            ["Criadores", overview.data?.creators],
            ["Assinaturas ativas", overview.data?.activeSubscriptions],
            ["Denúncias abertas", overview.data?.openReports],
            ["Eventos auditáveis", overview.data?.auditEvents],
          ].map(([label, value]) => (
            <div key={label as string} className="surface-card p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-2 text-2xl font-semibold">
                {overview.isLoading ? "—" : String(value ?? 0)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 surface-card p-5">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            <p className="text-sm font-medium">Infraestrutura de pagamentos</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Provider</p>
              <p className="mt-1 font-semibold">{PAYMENTS.provider}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Moeda</p>
              <p className="mt-1 font-semibold">{PAYMENTS.defaultCurrency}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Comissão</p>
              <p className="mt-1 font-semibold">
                {Math.round(PAYMENTS.defaultCommissionRate * 100)}%
              </p>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(([slug, label, Icon]) => (
            <Link
              key={slug}
              to="/super-admin/$section"
              params={{ section: slug }}
              className="surface-card p-5 transition hover:border-primary/40"
            >
              <Icon className="size-5 text-primary" />
              <h3 className="mt-4 font-semibold">{label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">Abrir {label.toLowerCase()}.</p>
            </Link>
          ))}
        </div>

        {overview.error ? (
          <p className="mt-5 text-sm text-muted-foreground">
            Alguns indicadores não puderam ser carregados; as áreas de controle continuam protegidas
            por papel e RLS.
          </p>
        ) : null}
      </AppShell>
    </RoleGate>
  );
}
