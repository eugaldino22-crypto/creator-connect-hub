import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/auth/RoleGate";
import { AppShell } from "@/components/layout/AppShell";
import { SuperAdminOverview } from "@/components/admin/SuperAdminOverview";
import { SuperAdminSettingsPanel } from "@/components/admin/SuperAdminSettingsPanel";
import { SuperAdminAuditPanel } from "@/components/admin/SuperAdminAuditPanel";

export const Route = createFileRoute("/super-admin/$section")({ component: SuperAdminSection });
function SuperAdminSection(){
 const {section}=Route.useParams();
 return <RoleGate allowed={["super_admin"]}><AppShell title={`Super Admin · ${section}`}>
  {section==="settings"?<SuperAdminSettingsPanel/>:section==="audit"?<SuperAdminAuditPanel/>:<SuperAdminOverview/>}
 </AppShell></RoleGate>;
}
