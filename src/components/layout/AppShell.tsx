import type { ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Compass,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Newspaper,
  Shield,
  Wallet,
  Crown,
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

  const nav: NavItem[] = [
    { to: "/feed", label: t("feed", locale), icon: Newspaper },
    { to: "/explore", label: t("explore", locale), icon: Compass },
    { to: "/messages", label: t("messages", locale), icon: MessageCircle },
    { to: "/subscriptions", label: t("subscriptions", locale), icon: Wallet },
    ...(isCreator ? [{ to: "/studio", label: t("studio", locale), icon: LayoutDashboard }] : []),
    ...(isAdmin ? [{ to: "/admin", label: t("admin", locale), icon: Shield }] : []),
    ...(isSuperAdmin ? [{ to: "/super-admin", label: t("superAdmin", locale), icon: Crown }] : []),
  ];

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-[#08090d] text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/[0.06] bg-[#0b0c11] lg:flex">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-5">
          <Link to="/" className="flex min-w-0 items-center" aria-label="SECRET home">
            <img
              src="/secret-logo-dark.svg"
              alt="SECRET — sua comunidade exclusiva"
              className="h-9 w-auto max-w-[170px]"
            />
          </Link>
        </div>

        <div className="px-4 pt-5">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.018] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Espaço
            </p>
            <p className="mt-1 text-sm font-semibold tracking-tight">{roleLabel}</p>
          </div>
        </div>

        <nav className="mt-5 flex flex-1 flex-col gap-1 px-3">
          {nav.map((item) => {
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-sidebar-foreground/65 transition hover:bg-white/[0.035] hover:text-sidebar-foreground",
                  active && "bg-white/[0.055] text-sidebar-foreground",
                )}
              >
                {active ? <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-brand" /> : null}
                <item.icon className={cn("size-4", active ? "text-brand" : "text-sidebar-foreground/55")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/[0.06] p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.018] p-3">
            <UserAvatar
              name={data?.profile?.display_name}
              path={data?.profile?.avatar_url}
              className="size-9"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {data?.profile?.display_name ?? t("account", locale)}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {data?.profile?.username ? `@${data.profile.username}` : data?.user.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("signOut", locale)}
              onClick={signOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#08090d]/90 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 px-4 py-4 lg:px-8">
            <div className="flex min-w-0 items-center gap-3 lg:hidden">
              <img src="/secret-mark.svg" alt="SECRET" className="size-8 shrink-0 rounded-lg" />
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
              <h1 className="mt-1 truncate text-lg font-semibold tracking-tight">{title}</h1>
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

        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-7 lg:px-8 lg:pb-12 lg:pt-8">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.06] bg-[#0a0b10]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <div className="flex items-stretch justify-around px-2">
          {nav.slice(0, 5).map((item) => {
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
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
