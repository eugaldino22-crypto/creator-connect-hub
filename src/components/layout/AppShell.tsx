import type { ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  CalendarDays,
  Compass,
  Crown,
  DollarSign,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Newspaper,
  Percent,
  Settings,
  Shield,
  Users,
  Wallet,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser, hasRole } from "@/hooks/use-session";
import { UserAvatar } from "@/components/common/UserAvatar";
import { useLocale, t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { IncomingVideoCallBanner } from "@/components/video/IncomingVideoCallBanner";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof Compass };

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const { data } = useCurrentUser();
  const locale = useLocale();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isCreator = hasRole(data?.roles, "creator");
  const isSubscriber = hasRole(data?.roles, "subscriber");
  const isAdmin = hasRole(data?.roles, "admin");
  const isSuperAdmin = hasRole(data?.roles, "super_admin");

  const roleLabel = isCreator
    ? "Creator Studio"
    : isSubscriber
      ? "Sua comunidade"
      : isSuperAdmin
        ? "Super Admin"
        : isAdmin
          ? "Administração"
          : "SECRET";

  const creatorNav: NavItem[] = [
    { to: "/studio", label: "Visão geral", icon: LayoutDashboard },
    { to: "/studio/posts", label: "Conteúdos", icon: FileText },
    { to: "/studio/plans", label: "Assinaturas", icon: Wallet },
    { to: "/studio/subscribers", label: "Assinantes", icon: Users },
    { to: "/messages", label: "Mensagens", icon: MessageCircle },
    { to: "/studio/subscribers", label: "Chamadas", icon: CalendarDays },
    { to: "/studio/finance", label: "Financeiro", icon: DollarSign },
    { to: "/studio/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/studio/promotions", label: "Promoções", icon: Percent },
    { to: "/studio/calendar", label: "Calendário", icon: CalendarDays },
    { to: "/studio/settings", label: "Configurações", icon: Settings },
  ];

  const defaultNav: NavItem[] = [
    { to: "/feed", label: t("feed", locale), icon: Newspaper },
    { to: "/explore", label: t("explore", locale), icon: Compass },
    { to: "/messages", label: t("messages", locale), icon: MessageCircle },
    { to: "/subscriptions", label: t("subscriptions", locale), icon: Wallet },
    ...(isCreator ? [{ to: "/studio", label: t("studio", locale), icon: LayoutDashboard }] : []),
    ...(isAdmin ? [{ to: "/admin", label: t("admin", locale), icon: Shield }] : []),
    ...(isSuperAdmin ? [{ to: "/super-admin", label: t("superAdmin", locale), icon: Crown }] : []),
  ];

  const nav = isCreator ? creatorNav : defaultNav;

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/$section", params: { section: "auth" }, replace: true });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07080d] text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_78%_8%,rgba(184,76,255,0.075),transparent_28%),radial-gradient(circle_at_18%_42%,rgba(255,79,216,0.025),transparent_30%)]" />

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[236px] flex-col border-r border-white/[0.07] bg-[#080a11]/95 backdrop-blur-2xl lg:flex">
        <div className="border-b border-white/[0.07] px-4 py-5">
          <Link to="/" className="flex items-center" aria-label="SECRET home">
            <img
              src="/secret-logo-dark.svg"
              alt="SECRET — sua comunidade exclusiva"
              className="h-9 w-auto max-w-[165px]"
            />
          </Link>
          {isCreator ? (
            <p className="mt-1 pl-1 text-[10px] font-medium tracking-[0.12em] text-muted-foreground">
              Creator Studio
            </p>
          ) : null}
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-3 py-4">
          <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
            {nav.map((item) => {
              const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={`${item.to}-${item.label}`}
                  to={item.to}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-sidebar-foreground/65 transition-all duration-200 hover:bg-white/[0.035] hover:text-sidebar-foreground",
                    active &&
                      "bg-gradient-to-r from-brand/[0.17] to-brand/[0.035] text-white shadow-[inset_2px_0_0_rgba(184,76,255,0.95)]",
                  )}
                >
                  <item.icon
                    className={cn(
                      "size-[17px] shrink-0",
                      active ? "text-brand" : "text-sidebar-foreground/55",
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                  {item.label === "Assinantes" && isCreator ? (
                    <span className="ml-auto rounded-full bg-brand/15 px-1.5 py-0.5 text-[9px] font-semibold text-brand">
                      ATIVO
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          {isCreator ? (
            <div className="mt-3 rounded-2xl border border-brand/10 bg-gradient-to-br from-brand/[0.11] to-white/[0.018] p-3.5 shadow-[0_16px_40px_-28px_rgba(184,76,255,0.55)]">
              <p className="text-[11px] font-semibold text-brand">Aumente seus ganhos</p>
              <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                Configure promoções e ofertas exclusivas para sua comunidade.
              </p>
              <Link
                to="/studio/$section"
                params={{ section: "new" }}
                className="mt-3 flex h-8 items-center justify-center rounded-lg bg-brand/15 text-[11px] font-semibold text-brand transition hover:bg-brand/20"
              >
                Criar publicação
              </Link>
            </div>
          ) : null}
        </div>

        <div className="border-t border-white/[0.07] p-3">
          {isCreator ? (
            <div className="mb-3 rounded-2xl border border-white/[0.07] bg-white/[0.018] p-3">
              <p className="text-[10px] text-muted-foreground">Seu plano atual</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-emerald-400">Premium</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">Renova em 12 dias</p>
                </div>
                <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Crown className="size-4" />
                </div>
              </div>
              <Link
                to="/studio/$section"
                params={{ section: "finance" }}
                className="mt-2.5 flex h-8 items-center justify-center rounded-lg bg-brand/[0.12] text-[11px] font-semibold text-brand hover:bg-brand/[0.18]"
              >
                Gerenciar plano
              </Link>
            </div>
          ) : null}

          <div className="flex items-center gap-2.5 rounded-2xl border border-white/[0.07] bg-white/[0.018] p-2.5">
            <UserAvatar
              name={data?.profile?.display_name}
              path={data?.profile?.avatar_url}
              className="size-9"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">
                {data?.profile?.display_name ?? t("account", locale)}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {data?.profile?.username ? `@${data.profile.username}` : data?.user.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("signOut", locale)}
              onClick={signOut}
              className="size-8 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="relative lg:pl-[236px]">
        <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#07080d]/80 backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-3 px-4 py-3.5 lg:px-7">
            <div className="flex min-w-0 items-center gap-3 lg:hidden">
              <img
                src="/secret-mark.svg"
                alt="SECRET"
                className="size-8 shrink-0 rounded-lg shadow-[0_0_24px_rgba(184,76,255,0.18)]"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{title ?? roleLabel}</p>
                <p className="truncate text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {roleLabel}
                </p>
              </div>
            </div>

            <div className="hidden min-w-0 lg:block">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <span className="text-brand">SECRET</span>
                <span className="text-white/15">/</span>
                <span>{roleLabel}</span>
              </div>
              <h1 className="mt-1 truncate text-xl font-semibold tracking-tight">{title}</h1>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <NotificationBell />
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("signOut", locale)}
                className="lg:hidden"
                onClick={signOut}
              >
                <LogOut className="size-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1500px] px-4 pb-28 pt-6 lg:px-7 lg:pb-12 lg:pt-7">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.07] bg-[#090a10]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl lg:hidden">
        <div className="flex items-stretch justify-around px-2">
          {nav.slice(0, 5).map((item) => {
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={`${item.to}-${item.label}`}
                to={item.to}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center gap-1.5 py-2.5 text-[10px] font-medium text-muted-foreground",
                  active && "text-brand",
                )}
              >
                <item.icon className="size-5" />
                <span className="max-w-full truncate px-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {isSubscriber ? <IncomingVideoCallBanner /> : null}
    </div>
  );
}
