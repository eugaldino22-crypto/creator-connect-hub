import type { ReactNode } from "react";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { hasAnyRole, type AppRole, useCurrentUser } from "@/hooks/use-session";
import { LoadingBlock } from "@/components/common/StateBlocks";

export function RoleGate({ allowed, children }: { allowed: AppRole[]; children: ReactNode }) {
  const { data, isLoading } = useCurrentUser();
  const navigate = useNavigate();
  const authorized = hasAnyRole(data?.roles, allowed);

  useEffect(() => {
    if (!isLoading && !data?.user) navigate({ to: "/auth", replace: true });
  }, [data?.user, isLoading, navigate]);

  useEffect(() => {
    if (!isLoading && data?.user && !authorized) navigate({ to: "/", replace: true });
  }, [authorized, data?.user, isLoading, navigate]);

  if (isLoading || !data?.user || !authorized) return <LoadingBlock label="Verificando acesso…" />;
  if (data.profile?.is_suspended) return <LoadingBlock label="Conta suspensa. Entre em contato com o suporte." />;
  return <>{children}</>;
}
