import { useQuery } from "@tanstack/react-query";
import { Activity, DollarSign, Settings2, ShieldCheck, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SuperAdminSettingsPanel } from "./SuperAdminSettingsPanel";
import { SuperAdminAuditPanel } from "./SuperAdminAuditPanel";

export function SuperAdminOverview() {
  const q = useQuery({
    queryKey: ["super-admin-overview"],
    queryFn: async () => {
      const [users, creators, subs, payouts] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("creator_profiles").select("id", { count: "exact", head: true }),
        supabase
          .from("subscriptions")
          .select("id", { count: "exact", head: true })
          .eq("status", "active"),
        supabase
          .from("payout_requests")
          .select("id", { count: "exact", head: true })
          .in("status", ["requested", "processing"]),
      ]);
      return {
        users: users.count ?? 0,
        creators: creators.count ?? 0,
        subscriptions: subs.count ?? 0,
        payouts: payouts.count ?? 0,
      };
    },
  });
  const m = [
    { label: "Usuários", value: q.data?.users ?? 0, icon: Users },
    { label: "Criadores", value: q.data?.creators ?? 0, icon: ShieldCheck },
    { label: "Assinaturas ativas", value: q.data?.subscriptions ?? 0, icon: DollarSign },
    { label: "Saques em aberto", value: q.data?.payouts ?? 0, icon: Activity },
  ];
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Settings2 className="size-5 text-primary" />
          <h1 className="text-2xl font-semibold">Super Admin</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Controle global da plataforma SECRET.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {m.map(({ label, value, icon: Icon }) => (
          <div key={label} className="surface-card p-4">
            <Icon className="size-5 text-primary" />
            <p className="mt-3 text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold">{q.isLoading ? "—" : value}</p>
          </div>
        ))}
      </div>
      <SuperAdminSettingsPanel />
      <SuperAdminAuditPanel />
    </div>
  );
}
