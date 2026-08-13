import type { ReactNode } from "react";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { hasAnyRole, type AppRole, useCurrentUser } from "@/hooks/use-session";
import { LoadingBlock } from "@/components/common/StateBlocks";

export function RoleGate({ allowed, children }: { allowed: AppRole[]; children: ReactNode }) {
  const { data, isLoading } = useCurrentUser();
  const navigate = useNavigate();
  const isCreator = hasAnyRole(data?.roles, ["creator"]);
  const isSubscriber = hasAnyRole(data?.roles, ["subscriber"]);
  const subscriberOnly = allowed.includes("subscriber") && !allowed.includes("creator");
  const creatorOnly = allowed.includes("creator") && !allowed.includes("subscriber");
  const roleConflict = (subscriberOnly && isCreator) || (creatorOnly && isSubscriber);
  const authorized = hasAnyRole(data?.roles, allowed) && !roleConflict;

  useEffect(() => {
    if (!isLoading && !data?.user) navigate({ to: "/auth", replace: true });
  }, [data?.user, isLoading, navigate]);

  useEffect(() => {
    if (isLoading || !data?.user || authorized) return;
    if (isCreator && subscriberOnly) {
      void navigate({ to: "/studio", replace: true });
      return;
    }
    if (isSubscriber && creatorOnly) {
      void navigate({ to: "/feed", replace: true });
      return;
    }
    void navigate({ to: "/", replace: true });
  }, [authorized, creatorOnly, data?.user, isCreator, isLoading, isSubscriber, navigate, subscriberOnly]);

  if (isLoading || !data?.user || !authorized) return <LoadingBlock label="Verificando acesso…" />;
  if (data.profile?.is_suspended) return <LoadingBlock label="Conta suspensa. Entre em contato com o suporte." />;
  return <>{children}</>;
}
