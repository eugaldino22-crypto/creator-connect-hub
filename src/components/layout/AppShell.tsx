import type { ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Compass,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Newspaper,
  Shield,
  Sparkles,
  Wallet,
  Crown,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser, hasRole } from "@/hooks/use-session";
import { UserAvatar } from "@/components/common/UserAvatar";
import { BRAND } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof Compass };

const primaryNav: NavItem[] = [
  { to: "/feed", label: "Meu feed", icon: Newspaper },
  { to: "/explore", label: "Explorar", icon: Compass },
  { to: "/messages", label: "Mensagens", icon: MessageCircle },
  { to: "/subscriptions", label: "Assinaturas", icon: Wallet },
];

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const { data } = useCurrentUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isCreator = hasRole(data?.roles, "creator");
  const isAdmin = hasRole(data?.roles, "admin");
  const isSuperAdmin = hasRole(data?.roles, "super_admin");

  const nav: NavItem[] = [
    ...primaryNav,
    ...(isCreator ? [{ to: "/studio", label: "Studio", icon: LayoutDashboard }] : []),
    ...(isAdmin ? [{ to: "/admin", label: "Administração", icon: Shield }] : []),
    ...(isSuperAdmin ? [{ to: "/super-admin", label: "Super Admin", icon: Crown }] : []),
  ];

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 lg:flex">
        <Link to="/" className="mb-8 flex items-center gap-2 px-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand-gradient text-brand-foreground">
            <Sparkles className="size-5" />
          </span>
          <span className="font-display text-lg font-semibold">{BRAND.name}</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => {
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  active && "bg-sidebar-accent text-sidebar-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-sidebar-border p-3">
          <UserAvatar name={data?.profile?.display_name} path={data?.profile?.avatar_url} className="size-9" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{data?.profile?.display_name ?? "Minha conta"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {data?.profile?.username ? `@${data.profile.username}` : data?.user.email}
            </p>
          </div>
          <Button variant="ghost" size="icon" aria-label="Sair" onClick={signOut}>
            <LogOut className="size-4" />
          </Button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand-gradient text-brand-foreground">
              <Sparkles className="size-4" />
            </span>
            <span className="font-display text-base font-semibold">{BRAND.name}</span>
          </div>
          <h1 className="hidden text-lg font-semibold lg:block">{title}</h1>
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon" aria-label="Notificações">
              <Link to="/notifications">
                <Bell className="size-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" aria-label="Sair" className="lg:hidden" onClick={signOut}>
              <LogOut className="size-5" />
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-5 lg:px-8 lg:pb-12">
          {title ? <h1 className="mb-4 text-xl font-semibold lg:hidden">{title}</h1> : null}
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div className="flex items-stretch justify-around">
          {nav.slice(0, 5).map((item) => {
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground",
                  active && "text-primary",
                )}
              >
                <item.icon className="size-5" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
