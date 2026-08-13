import type { ReactNode } from "react";
import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoadingBlock({ label = "Carregando…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
      <Loader2 className="size-6 animate-spin text-primary" />
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
    <div className="surface-card flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
        {icon ?? <Inbox className="size-5" />}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action}
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="surface-card flex flex-col items-center gap-3 px-6 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <AlertTriangle className="size-5" />
      </div>
      <h3 className="text-base font-semibold">Não foi possível carregar</h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        {message ?? "Tente novamente em alguns instantes."}
      </p>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      ) : null}
    </div>
  );
}