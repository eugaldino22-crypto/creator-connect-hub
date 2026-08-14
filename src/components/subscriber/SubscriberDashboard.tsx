import {
  LucideIcon,
  ArrowRight,
  Bell,
  Bookmark,
  Compass,
  Heart,
  Image,
  Lock,
  Play,
  Search,
  Tag,
  Users,
  Video,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-session";
import { formatCents } from "@/lib/brand";

type Creator = {
  user_id: string;
  profiles: {
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
  category: string | null;
  subscription_plans: { price_cents: number | null }[] | null;
};

type Subscription = {
  id: string;
  current_period_end: string | null;
  profiles: { display_name: string | null; avatar_url: string | null } | null;
};

function Avatar({
  name,
  src,
  large = false,
}: {
  name?: string | null | undefined;
  src?: string | null | undefined;
  large?: boolean | undefined;
}) {
  const size = large ? "size-16" : "size-9";
  return src ? (
    <img src={src} alt="" className={`${size} rounded-full border border-white/10 object-cover`} />
  ) : (
    <div
      className={`${size} flex items-center justify-center rounded-full border border-white/10 bg-white/[0.07] text-xs font-semibold`}
    >
      {(name ?? "S")[0]}
    </div>
  );
}

export function SubscriberDashboard() {
  const { data: current } = useCurrentUser();
  const id = current?.user.id;
  const creators = useQuery({
    queryKey: ["subscriber-dashboard-creators"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("creator_profiles")
        .select(
          "user_id,category,profiles(display_name,username,avatar_url),subscription_plans(price_cents)",
        )
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return (data ?? []) as unknown as Creator[];
    },
    staleTime: 30000,
  });
  const subscriptions = useQuery({
    queryKey: ["subscriber-dashboard-subscriptions", id],
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) return [] as Subscription[];
      const { data, error } = await supabase
        .from("subscriptions")
        .select("id,current_period_end,profiles:creator_id(display_name,avatar_url)")
        .eq("subscriber_id", id)
        .eq("status", "active")
        .limit(6);
      if (error) throw error;
      return (data ?? []) as unknown as Subscription[];
    },
    staleTime: 30000,
  });
  const list = creators.data ?? [];
  const subs = subscriptions.data ?? [];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-gradient-to-br from-[#17132a] via-[#0e0f18] to-[#08090e] p-6 lg:p-7">
        <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-brand/[0.13] blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand">
              Sua comunidade
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">Meu feed</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Aqui você acompanha tudo dos seus criadores favoritos.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl border border-white/[0.08] bg-black/20 px-3 py-2.5 sm:flex">
              <Search className="size-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Buscar criadores, conteúdos…</span>
            </div>
            <button
              className="relative flex size-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025]"
              aria-label="Notificações"
            >
              <Bell className="size-4" />
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-brand text-[9px] font-bold">
                2
              </span>
            </button>
          </div>
        </div>
      </section>
      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {(
          [
            ["Todos", "Para você", Compass],
            ["Favoritos", "Seus criadores", Heart],
            ["Vídeos", "Conteúdo exclusivo", Play],
            ["Fotos", "Galerias privadas", Image],
            ["Chamadas", "Agende com criadores", Video],
            ["Ofertas", "Propostas e experiências", Tag],
          ] as [string, string, LucideIcon][]
        ).map(([label, caption, Icon], i) => (
          <button
            key={String(label)}
            className={`rounded-2xl border p-4 text-left transition hover:border-brand/25 ${i === 0 ? "border-brand/20 bg-brand/[0.09]" : "border-white/[0.07] bg-white/[0.018]"}`}
          >
            <Icon className="size-4 text-brand" />
            <p className="mt-3 text-sm font-semibold">{label}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{caption}</p>
          </button>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="relative min-h-[260px] overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-gradient-to-br from-[#21152e] via-[#11101b] to-[#090a10] p-7">
            <div className="relative max-w-xl">
              <p className="text-xs text-white/55">Continue de onde parou</p>
              <h3 className="mt-3 text-2xl font-semibold">Conteúdo exclusivo para você</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Volte para suas comunidades favoritas e continue acompanhando os conteúdos que você
                assinou.
              </p>
              <div className="mt-6 flex gap-3">
                <Link
                  to="/feed"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold"
                >
                  Explorar criadores <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/feed"
                  className="inline-flex rounded-xl border border-white/[0.1] px-4 py-2.5 text-sm"
                >
                  Minhas assinaturas
                </Link>
              </div>
            </div>
            <Lock className="absolute bottom-8 right-10 size-20 text-brand/20" />
          </section>
          <section>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand/80">
                  Descoberta
                </p>
                <h3 className="mt-1 text-xl font-semibold">Recomendados para você</h3>
              </div>
              <Link to="/feed" className="text-xs text-brand">
                Ver todos
              </Link>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {list.slice(0, 4).map((c) => {
                const name = c.profiles?.display_name ?? "Criador";
                const price = c.subscription_plans?.[0]?.price_cents ?? 0;
                return (
                  <article
                    key={c.user_id}
                    className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.018]"
                  >
                    <div className="flex h-28 items-center justify-center bg-gradient-to-br from-brand/[0.12] to-black/20">
                      <Avatar name={name} src={c.profiles?.avatar_url} large />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2">
                        <Avatar name={name} src={c.profiles?.avatar_url} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{name}</p>
                          <p className="truncate text-[10px] text-muted-foreground">
                            @{c.profiles?.username ?? "creator"}
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 truncate text-xs text-muted-foreground">
                        {c.category ?? "Conteúdo exclusivo"}
                      </p>
                      <Link
                        to="/feed"
                        className="mt-3 flex h-9 items-center justify-center rounded-lg bg-brand text-xs font-semibold"
                      >
                        {price ? `Assinar ${formatCents(price, "BRL")}/mês` : "Ver criador"}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
        <aside className="space-y-5">
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.018] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Descubra criadores</p>
                <h3 className="mt-1 text-base font-semibold">Novas comunidades</h3>
              </div>
              <Users className="size-4 text-brand" />
            </div>
            <div className="mt-4 space-y-3">
              {list.slice(0, 3).map((c) => (
                <div key={c.user_id} className="flex items-center gap-3">
                  <Avatar name={c.profiles?.display_name} src={c.profiles?.avatar_url} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {c.profiles?.display_name ?? "Criador"}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {c.category ?? "Conteúdo exclusivo"}
                    </p>
                  </div>
                  <Link
                    to="/feed"
                    className="rounded-lg border border-brand/30 px-2.5 py-1.5 text-[10px] font-semibold text-brand"
                  >
                    Seguir
                  </Link>
                </div>
              ))}
            </div>
            <Link to="/feed" className="mt-4 flex justify-center text-xs font-medium text-brand">
              Ver todos os criadores <ArrowRight className="ml-1 size-3" />
            </Link>
          </section>
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.018] p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Suas assinaturas</h3>
              <Link to="/feed" className="text-xs text-brand">
                Ver todas
              </Link>
            </div>
            {subs.length ? (
              <div className="mt-4 space-y-3">
                {subs.slice(0, 4).map((s) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <Avatar name={s.profiles?.display_name} src={s.profiles?.avatar_url} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {s.profiles?.display_name ?? "Criador"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {s.current_period_end
                          ? `Renova em ${new Date(s.current_period_end).toLocaleDateString("pt-BR")}`
                          : "Assinatura ativa"}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[9px] font-semibold text-emerald-300">
                      Ativo
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-xl bg-white/[0.025] p-4 text-xs text-muted-foreground">
                Você ainda não possui assinaturas ativas.
              </div>
            )}
          </section>
          <section className="rounded-2xl border border-brand/15 bg-gradient-to-br from-brand/[0.12] to-white/[0.018] p-5">
            <Bookmark className="size-5 text-brand" />
            <h3 className="mt-4 text-base font-semibold">Assinante Premium</h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Aproveite benefícios exclusivos e apoie seus criadores favoritos.
            </p>
            <Link
              to="/feed"
              className="mt-4 flex justify-center rounded-xl bg-brand px-4 py-2.5 text-xs font-semibold"
            >
              Gerenciar assinaturas
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
