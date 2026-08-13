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
          <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.07] bg-white/[0.02] p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-brand/[0.08] blur-3xl" />
            <div className="relative">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand">Creator Studio</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Sua comunidade em um só lugar.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Publique, organize sua comunidade e crie experiências premium para seus assinantes.</p>
              <Link to="/studio/$section" params={{ section: "new" }} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground">
                Nova publicação <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </section>

          <section>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Workspace</p>
            <h3 className="mt-1 text-lg font-semibold tracking-tight">Operação da comunidade</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map(([slug, label, description, Icon]) => (
                <Link key={slug} to="/studio/$section" params={{ section: slug }} className="group rounded-2xl border border-white/[0.07] bg-white/[0.018] p-5 transition hover:-translate-y-0.5 hover:border-brand/20">
                  <div className="flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-brand"><Icon className="size-4" /></div>
                    <ArrowUpRight className="size-4 text-white/20 group-hover:text-brand" />
                  </div>
                  <h4 className="mt-5 font-semibold">{label}</h4>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </AppShell>
    </RoleGate>
  );
}
