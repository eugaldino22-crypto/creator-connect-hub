import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmptyBlock, LoadingBlock } from "@/components/common/StateBlocks";

type RoleRow = {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
};

export function SuperAdminRolesPanel() {
  const q = useQuery({
    queryKey: ["super-admin-roles"],
    queryFn: async (): Promise<RoleRow[]> => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("id,user_id,role,created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data ?? []) as unknown as RoleRow[];
    },
  });

  if (q.isLoading) {
    return <LoadingBlock />;
  }

  if (q.error) {
    return (
      <EmptyBlock
        title="Papéis indisponíveis"
        description="Não foi possível carregar os acessos."
      />
    );
  }

  if (!q.data?.length) {
    return (
      <EmptyBlock
        title="Nenhum papel cadastrado"
        description="Os acessos dos usuários aparecerão aqui."
      />
    );
  }

  return (
    <div className="surface-card overflow-hidden">
      <div className="border-b border-border p-5">
        <h2 className="font-semibold">Papéis e acesso</h2>
        <p className="text-sm text-muted-foreground">Controle das permissões da plataforma.</p>
      </div>

      <div className="divide-y divide-border">
        {q.data.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{item.user_id}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(item.created_at).toLocaleString("pt-BR")}
              </p>
            </div>

            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold">
              {item.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
