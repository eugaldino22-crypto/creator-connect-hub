import type { ReactNode } from "react";
import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoadingBlock({ label = "Carregando…" }: { label?: string }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-3 text-muted-foreground">
      <div className="flex size-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025]">
        <Loader2 className="size-5 animate-spin text-brand" />
      </div>
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyBlock({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.012))] px-6 py-16 text-center shadow-[0_24px_80px_-50px_rgba(0,0,0,0.8)]">
      <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/[0.08] blur-3xl" />

      <div className="relative mx-auto flex max-w-xl flex-col items-center">
        <div className="flex size-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.035] text-brand shadow-[0_12px_36px_-22px_rgba(184,76,255,0.7)]">
          {icon ?? <Inbox className="size-6" />}
        </div>

        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          SECRET
        </p>

        <h3 className="mt-2 text-xl font-semibold tracking-tight">{title}</h3>

        {description ? (
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}

        {action ? <div className="mt-7">{action}</div> : null}
      </div>
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-destructive/20 bg-destructive/[0.03] px-6 py-14 text-center">
      <div className="mx-auto flex max-w-xl flex-col items-center">
        <div className="flex size-14 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" />
        </div>

        <h3 className="mt-5 text-lg font-semibold">Não foi possível carregar</h3>

        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {message ?? "Tente novamente em alguns instantes."}
        </p>

        {onRetry ? (
          <Button variant="secondary" size="sm" onClick={onRetry} className="mt-6">
            Tentar novamente
          </Button>
        ) : null}
      </div>
    </div>
  );
}
