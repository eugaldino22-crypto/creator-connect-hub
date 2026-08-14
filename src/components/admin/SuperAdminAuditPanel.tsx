import { useQuery } from "@tanstack/react-query";
import { History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EmptyBlock, LoadingBlock } from "@/components/common/StateBlocks";

type AuditProfile = {
  display_name: string | null;
  username: string | null;
};

type AuditRow = {
  id: string;
  actor_id: string | null;
  action: string;
  setting_key: string | null;
  old_value: unknown;
  new_value: unknown;
  created_at: string;
  profiles: AuditProfile | null;
};

export function SuperAdminAuditPanel() {
  const q = useQuery({
    queryKey: ["super-admin-audit"],
    queryFn: async (): Promise<AuditRow[]> => {
      const { data, error } = await supabase
        .from("platform_audit_log")
        .select(
          "id,actor_id,action,setting_key,old_value,new_value,created_at,profiles:actor_id(display_name,username)",
        )
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;

      return (data ?? []) as unknown as AuditRow[];
    },
  });

  if (q.isLoading) {
    return <LoadingBlock />;
  }

  if (q.error) {
    return (
      <EmptyBlock
        title="Auditoria indisponível"
        description="Verifique as permissões do Super Admin e a migration de auditoria."
      />
    );
  }

  if (!(q.data ?? []).length) {
    return (
      <EmptyBlock
        title="Nenhuma alteração registrada"
        description="As alterações globais feitas pelo Super Admin aparecerão aqui."
      />
    );
  }

  return (
    <div className="surface-card overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border p-5">
        <History className="size-5 text-primary" />

        <div>
          <h2 className="font-semibold">Auditoria da plataforma</h2>

          <p className="text-xs text-muted-foreground">
            Registro das alterações nas configurações globais.
          </p>
        </div>
      </div>

      <div className="divide-y divide-border">
        {(q.data ?? []).map((row) => (
          <div key={row.id} className="p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-medium">{row.setting_key ?? row.action}</p>

                <p className="text-xs text-muted-foreground">
                  {row.profiles?.display_name ??
                    row.profiles?.username ??
                    row.actor_id ??
                    "Super Admin"}{" "}
                  · {new Date(row.created_at).toLocaleString("pt-BR")}
                </p>
              </div>

              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs">{row.action}</span>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-secondary/40 p-3">
                <p className="text-[11px] font-medium uppercase text-muted-foreground">Anterior</p>

                <pre className="mt-1 max-h-28 overflow-auto whitespace-pre-wrap break-all text-xs">
                  {JSON.stringify(row.old_value, null, 2)}
                </pre>
              </div>

              <div className="rounded-lg bg-secondary/40 p-3">
                <p className="text-[11px] font-medium uppercase text-muted-foreground">Novo</p>

                <pre className="mt-1 max-h-28 overflow-auto whitespace-pre-wrap break-all text-xs">
                  {JSON.stringify(row.new_value, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
