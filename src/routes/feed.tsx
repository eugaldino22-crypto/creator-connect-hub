import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { RoleGate } from "@/components/auth/RoleGate";
import { AppShell } from "@/components/layout/AppShell";
import { SubscriberDashboard } from "@/components/subscriber/SubscriberDashboard";
import { useCurrentUser } from "@/hooks/use-session";

export const Route = createFileRoute("/feed")({ component: SubscriberFeedRoute });

function SubscriberFeedRoute() {
  const { data } = useCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (data?.roles.includes("creator")) {
      void navigate({ to: "/studio", replace: true });
    }
  }, [data?.roles, navigate]);

  return (
    <RoleGate allowed={["subscriber"]}>
      <AppShell title="Meu feed">
        <SubscriberDashboard />
      </AppShell>
    </RoleGate>
  );
}
