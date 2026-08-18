import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyBlock } from "@/components/common/StateBlocks";
import { QA_ENABLED, QA_ROLES, useQaPreview, type QaRole } from "@/lib/qa-preview";
import { cn } from "@/lib/utils";

type Screen = {
  label: string;
  to: string;
  params?: Record<string, string>;
  note?: string;
};

type Group = { title: string; role: QaRole | null; screens: Screen[] };

const GROUPS: Group[] = [
  {
    title: "Subscriber",
    role: "subscriber",
    screens: [
      { label: "Feed", to: "/feed" },
      { label: "Explore", to: "/$section", params: { section: "explore" } },
      { label: "Mensagens", to: "/messages" },
      { label: "Assinaturas", to: "/$section", params: { section: "subscriptions" } },
      { label: "Notificações", to: "/$section", params: { section: "notifications" } },
      { label: "Conta / configurações", to: "/$section", params: { section: "account" } },
      { label: "Meu perfil", to: "/profile" },
      { label: "Perfil público do criador", to: "/c/$username", params: { username: "criadora.demo" }, note: "mock em QA" },
      { label: "Checkout", to: "/checkout/$planId", params: { planId: "qa-mock-plan" } },
    ],
  },
  {
    title: "Creator",
    role: "creator",
    screens: [
      { label: "Studio — visão geral", to: "/studio" },
      { label: "Conteúdos", to: "/studio/$section", params: { section: "posts" } },
      { label: "Nova publicação", to: "/studio/$section", params: { section: "new" } },
      { label: "Planos", to: "/studio/$section", params: { section: "plans" } },
      { label: "Assinantes", to: "/studio/$section", params: { section: "subscribers" } },
      { label: "Financeiro", to: "/studio/$section", params: { section: "finance" } },
      { label: "Analytics", to: "/studio/$section", params: { section: "analytics" } },
      { label: "Promoções", to: "/studio/$section", params: { section: "promotions" } },
      { label: "Calendário", to: "/studio/$section", params: { section: "calendar" } },
      { label: "Configurações", to: "/studio/$section", params: { section: "settings" } },
      { label: "Mensagens do Studio", to: "/studio/messages" },
      { label: "Perfil público", to: "/c/$username", params: { username: "criadora.demo" } },
    ],
  },
  {
    title: "Admin",
    role: "admin",
    screens: [
      { label: "Admin — visão geral", to: "/admin" },
      { label: "Moderação", to: "/admin/$section", params: { section: "reports" } },
      { label: "Usuários", to: "/admin/$section", params: { section: "users" } },
      { label: "Payouts", to: "/admin/$section", params: { section: "payouts" } },
    ],
  },
  {
    title: "Super Admin",
    role: "super_admin",
    screens: [
      { label: "Super Admin — visão geral", to: "/super-admin" },
      { label: "Roles", to: "/super-admin/$section", params: { section: "roles" } },
      { label: "Auditoria", to: "/super-admin/$section", params: { section: "audit" } },
      { label: "Configurações da plataforma", to: "/super-admin/$section", params: { section: "settings" } },
      { label: "Payouts", to: "/super-admin/$section", params: { section: "payouts" } },
      { label: "Segurança", to: "/super-admin/$section", params: { section: "security" } },
    ],
  },
  {
    title: "Auth e público",
    role: null,
    screens: [
      { label: "Landing", to: "/" },
      { label: "Login / cadastro / recuperação", to: "/$section", params: { section: "auth" } },
      { label: "Onboarding", to: "/$section", params: { section: "onboarding" } },
      { label: "Reset de senha", to: "/reset-password" },
    ],
  },
];

export function ScreenMap() {
  const { role, setRole } = useQaPreview();

  if (!QA_ENABLED) {
    return (
      <AppShell title="Mapa de telas">
        <EmptyBlock
          title="Disponível apenas em desenvolvimento"
          description="Este painel de QA não existe em produção."
        />
      </AppShell>
    );
  }

  return (
    <AppShell title="Mapa de telas">
      <div className="space-y-6">
        <div className="rounded-2xl border border-brand/20 bg-brand/[0.06] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">DEV / QA</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Escolha um perfil de visualização e abra qualquer tela existente. Nada aqui altera papéis
            reais, RLS ou permissões do backend.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {QA_ROLES.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setRole(role === item.value ? null : item.value)}
                className={cn(
                  "rounded-full border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground",
                  role === item.value && "border-brand/40 bg-brand/15 text-brand",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {GROUPS.map((group) => (
            <section
              key={group.title}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">{group.title}</h2>
                {group.role ? (
                  <button
                    type="button"
                    onClick={() => setRole(group.role)}
                    className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand hover:underline"
                  >
                    Visualizar como
                  </button>
                ) : null}
              </div>
              <ul className="mt-3 space-y-1">
                {group.screens.map((screen) => (
                  <li key={`${group.title}-${screen.label}`}>
                    <Link
                      to={screen.to as never}
                      params={(screen.params ?? {}) as never}
                      onClick={() => group.role && setRole(group.role)}
                      className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-[13px] text-muted-foreground transition hover:bg-white/[0.04] hover:text-foreground"
                    >
                      <span className="truncate">
                        {screen.label}
                        {screen.note ? (
                          <span className="ml-2 text-[10px] text-brand">{screen.note}</span>
                        ) : null}
                      </span>
                      <ExternalLink className="size-3.5 shrink-0 opacity-60" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
