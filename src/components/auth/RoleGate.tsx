import type { ReactNode } from "react";
import { useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { hasAnyRole, type AppRole, useCurrentUser } from "@/hooks/use-session";
import { LoadingBlock } from "@/components/common/StateBlocks";

const SUBSCRIBER_PATHS = new Set(["/feed", "/explore", "/subscriptions"]);

export function RoleGate({ allowed, children }: { allowed: AppRole[]; children: ReactNode }) {
  const { data, isLoading } = useCurrentUser();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const isCreator = hasAnyRole(data?.roles, ["creator"]);
  const isSubscriber = hasAnyRole(data?.roles, ["subscriber"]);
  const subscriberOnly = allowed.includes("subscriber") && !allowed.includes("creator");
  const creatorOnly = allowed.includes("creator") && !allowed.includes("subscriber");
  const subscriberPath = SUBSCRIBER_PATHS.has(pathname);
  const roleConflict = (subscriberOnly || subscriberPath) && isCreator;
  const creatorConflict = creatorOnly && isSubscriber;
  const authorized = hasAnyRole(data?.roles, allowed) && !roleConflict && !creatorConflict;

  useEffect(() => {
    if (!isLoading && !data?.user) navigate({ to: "/auth", replace: true });
  }, [data?.user, isLoading, navigate]);

  useEffect(() => {
    if (isLoading || !data?.user || authorized) return;
    if (isCreator && (subscriberOnly || subscriberPath)) {
      void navigate({ to: "/studio", replace: true });
      return;
    }
    if (isSubscriber && creatorOnly) {
      void navigate({ to: "/feed", replace: true });
      return;
    }
    void navigate({ to: "/", replace: true });
  }, [authorized, creatorOnly, data?.user, isCreator, isLoading, isSubscriber, navigate, pathname, subscriberOnly, subscriberPath]);

  if (isLoading || !data?.user || !authorized) return <LoadingBlock label="Verificando acesso…" />;
  if (data.profile?.is_suspended) return <LoadingBlock label="Conta suspensa. Entre em contato com o suporte." />;
  return <>{children}</>;
}
