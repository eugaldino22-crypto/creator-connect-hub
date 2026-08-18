import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Eye, EyeOff, FlaskConical, Map, Monitor, Smartphone, Tablet, X } from "lucide-react";
import { QA_ENABLED, QA_ROLES, useQaPreview } from "@/lib/qa-preview";
import { cn } from "@/lib/utils";

type Width = "desktop" | "tablet" | "mobile";

const WIDTHS: { value: Width; label: string; px: number | null; icon: typeof Monitor }[] = [
  { value: "desktop", label: "Desktop", px: null, icon: Monitor },
  { value: "tablet", label: "Tablet", px: 834, icon: Tablet },
  { value: "mobile", label: "Mobile", px: 402, icon: Smartphone },
];

const STYLE_ID = "qa-viewport-style";

function applyWidth(width: Width) {
  if (!QA_ENABLED || typeof document === "undefined") return;
  const px = WIDTHS.find((item) => item.value === width)?.px ?? null;
  let el = document.getElementById(STYLE_ID);
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = px
    ? `body{max-width:${px}px;margin:0 auto;overflow-x:hidden;box-shadow:0 0 0 1px rgba(255,255,255,0.08)}`
    : "";
}

export function QaBar() {
  const { enabled, role, unlocked, setRole, setUnlocked } = useQaPreview();
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState<Width>("desktop");

  useEffect(() => {
    applyWidth(width);
  }, [width]);

  if (!enabled) return null;

  return (
    <div className="fixed bottom-20 right-3 z-[60] lg:bottom-4">
      {open ? (
        <div className="w-[268px] rounded-2xl border border-brand/25 bg-[#0b0d14]/95 p-3 shadow-[0_24px_70px_-32px_rgba(184,76,255,0.6)] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">
              <FlaskConical className="size-3.5" /> DEV / QA
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar painel QA"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <p className="mt-3 text-[10px] text-muted-foreground">Visualizando como</p>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            {QA_ROLES.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setRole(role === item.value ? null : item.value)}
                className={cn(
                  "rounded-lg border border-white/[0.08] px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition hover:text-foreground",
                  role === item.value && "border-brand/40 bg-brand/15 text-brand",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[9px] leading-4 text-muted-foreground">
            Apenas visual. Papéis reais, RLS e permissões não são alterados.
          </p>

          <p className="mt-3 text-[10px] text-muted-foreground">Conteúdo exclusivo</p>
          <button
            type="button"
            onClick={() => setUnlocked(!unlocked)}
            className={cn(
              "mt-1.5 flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.08] px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition hover:text-foreground",
              unlocked && "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
            )}
          >
            {unlocked ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
            {unlocked ? "Desbloqueado (preview)" : "Bloqueado (preview)"}
          </button>

          <p className="mt-3 text-[10px] text-muted-foreground">Largura</p>
          <div className="mt-1.5 grid grid-cols-3 gap-1.5">
            {WIDTHS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setWidth(item.value)}
                aria-label={item.label}
                className={cn(
                  "flex items-center justify-center rounded-lg border border-white/[0.08] py-1.5 text-muted-foreground transition hover:text-foreground",
                  width === item.value && "border-brand/40 bg-brand/15 text-brand",
                )}
              >
                <item.icon className="size-3.5" />
              </button>
            ))}
          </div>

          <Link
            to="/$section"
            params={{ section: "qa" }}
            className="mt-3 flex h-8 items-center justify-center gap-1.5 rounded-lg bg-brand/15 text-[11px] font-semibold text-brand transition hover:bg-brand/25"
          >
            <Map className="size-3.5" /> Mapa de telas
          </Link>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 rounded-full border border-brand/30 bg-[#0b0d14]/90 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand shadow-[0_18px_50px_-30px_rgba(184,76,255,0.8)] backdrop-blur-xl"
        >
          <FlaskConical className="size-3.5" />
          DEV / QA
          {role ? <span className="normal-case tracking-normal text-white/70">· {role}</span> : null}
        </button>
      )}
    </div>
  );
}
