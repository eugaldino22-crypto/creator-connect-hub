import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { RoleGate } from "@/components/auth/RoleGate";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyBlock, LoadingBlock } from "@/components/common/StateBlocks";
import { PayoutAdminPanel } from "@/components/admin/PayoutAdminPanel";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/$section")({
  component: AdminSection,
});

const tables = {
  users: "profiles",
  creators: "creator_profiles",
  posts: "posts",
  reports: "reports",
  transactions: "transactions",
  payouts: "payout_requests",
} as const;

type AdminTable = (typeof tables)[keyof typeof tables];

type AdminRow = {
  id: string;
  status?: string | null;
  is_suspended?: boolean | null;
  created_at?: string | null;
};

function AdminSection() {
  const { section } = Route.useParams();

  const table = tables[section as keyof typeof tables] as AdminTable | undefined;

  const isPayouts = section === "payouts";

  const q = useQuery({
    queryKey: ["admin", table],
    enabled: Boolean(table) && !isPayouts,
    queryFn: async (): Promise<AdminRow[]> => {
      if (!table) {
        return [];
      }

      const query = supabase
        .from(table)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data ?? []) as AdminRow[];
    },
  });

  return (
    <RoleGate allowed={["admin", "super_admin"]}>
      {isPayouts ? (
        <AppShell title="Admin · Saques">
          <PayoutAdminPanel />
        </AppShell>
      ) : (
        <AppShell title={`Admin · ${section}`}>
          <h2 className="text-2xl font-semibold capitalize">{section}</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Visão operacional com dados reais do banco.
          </p>

          <div className="mt-6 surface-card overflow-hidden">
            {q.isLoading ? (
              <LoadingBlock />
            ) : q.error ? (
              <EmptyBlock
                title="Não foi possível carregar"
                description="Verifique as permissões e tente novamente."
              />
            ) : q.data?.length === 0 ? (
              <EmptyBlock
                title="Nenhum registro"
                description="Ainda não existem registros nesta área."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border text-left text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Criado</th>
                    </tr>
                  </thead>

                  <tbody>
                    {q.data.map((row) => (
                      <tr key={row.id} className="border-b border-border/60 last:border-0">
                        <td className="max-w-[280px] truncate px-4 py-3 font-mono text-xs">
                          {row.id}
                        </td>

                        <td className="px-4 py-3">
                          {row.status ?? (row.is_suspended ? "suspenso" : "ativo")}
                        </td>

                        <td className="px-4 py-3 text-muted-foreground">
                          {row.created_at ? new Date(row.created_at).toLocaleString("pt-BR") : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </AppShell>
      )}
    </RoleGate>
  );
}
