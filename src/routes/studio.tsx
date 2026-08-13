import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BarChart3, FilePlus2, Settings, Users, WalletCards } from "lucide-react";
import { RoleGate } from "@/components/auth/RoleGate";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/studio")({ component: StudioHome });

const items = [
  ["posts", "Publicações", "Fotos, vídeos e posts.", BarChart3],
  ["new", "Nova publicação", "Publique para sua comunidade.", FilePlus2],
  ["plans", "Planos", "Assinatura e ofertas.", WalletCards],
  ["subscribers", "Assinantes", "Sua comunidade ativa.", Users],
  ["finance", "Financeiro", "Saldo e receitas.", WalletCards],
  ["settings", "Configurações", "Perfil e preferências.", Settings],
] as const;

function StudioHome() {
  return (
    <RoleGate allowed={["creator"]}>
      <AppShell title="Studio">
        <div className="space-y-8">
          <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-gradient-to-br from-[#17152a] via-[#0f1019] to-[#0a0b11] p-7 shadow-[0_30px_80px_-48px_rgba(184,76,255,0.65)] sm:p-9">
            <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-brand/[0.12] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 left-1/3 size-80 rounded-full bg-fuchsia-500/[0.045] blur-3xl" />
            <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-brand/15 bg-brand/[0.08] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand">
                  Creator Studio
                </div>
                <h2 className="mt-5 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Sua comunidade em um só lugar.</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Publique, organize sua comunidade e crie experiências premium para seus assinantes.
                </p>
              </div>
              <Link
                to="/studio/$section"
                params={{ section: "new" }}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground shadow-[0_18px_38px_-22px_rgba(184,76,255,0.9)] transition hover:-translate-y-0.5 hover:brightness-105"
              >
                Nova publicação <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </section>

          <section>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand/80">Workspace</p>
                <h3 className="mt-1 text-xl font-semibold tracking-tight">Operação da comunidade</h3>
              </div>
              <span className="hidden text-xs text-muted-foreground sm:block">Gerencie seu ecossistema SECRET</span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map(([slug, label, description, Icon]) => (
                <Link
                  key={slug}
                  to="/studio/$section"
                  params={{ section: slug }}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-brand/25 hover:bg-white/[0.035]"
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-brand/[0.06] blur-2xl opacity-0 transition group-hover:opacity-100" />
                  <div className="relative flex items-center justify-between">
                    <div className="flex size-11 items-center justify-center rounded-xl border border-brand/10 bg-brand/[0.07] text-brand shadow-[0_10px_24px_-18px_rgba(184,76,255,0.8)]">
                      <Icon className="size-5" />
                    </div>
                    <ArrowUpRight className="size-4 text-white/20 transition group-hover:text-brand" />
                  </div>
                  <h4 className="relative mt-5 text-base font-semibold">{label}</h4>
                  <p className="relative mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </AppShell>
    </RoleGate>
  );
}
