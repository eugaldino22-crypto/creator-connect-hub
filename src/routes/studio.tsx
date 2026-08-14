import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  DollarSign,
  FilePlus2,
  MessageCircle,
  MoreVertical,
  PlaySquare,
  Sparkles,
  Users,
  Video,
  WalletCards,
} from "lucide-react";
import { RoleGate } from "@/components/auth/RoleGate";
import { AppShell } from "@/components/layout/AppShell";
import { formatCents } from "@/lib/brand";
import { useCurrentUser } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/studio")({ component: StudioHome });

const quickActions = [
  ["new", "Publicar conteúdo", "Compartilhe algo exclusivo com seus assinantes.", FilePlus2],
  ["plans", "Ver assinaturas", "Acompanhe seus planos e ofertas ativas.", WalletCards],
  ["subscribers", "Videochamada", "Agende chamadas com seus assinantes.", Video],
  ["finance", "Finanças", "Acompanhe seus ganhos e solicitações de saque.", DollarSign],
] as const;

const recentPosts = [
  ["Bastidores da gravação 🎬", "12 de mai. de 2025"],
  ["Novo ensaio exclusivo ✨", "10 de mai. de 2025"],
  ["Respondendo perguntas 💬", "8 de mai. de 2025"],
  ["Preview do próximo vídeo 🎥", "5 de mai. de 2025"],
] as const;

function MetricCard({
  icon: Icon,
  label,
  value,
  change,
  tone = "brand",
}: {
  icon: typeof Users;
  label: string;
  value: string;
  change: string;
  tone?: "brand" | "green" | "gold" | "blue";
}) {
  const tones = {
    brand: "bg-brand/[0.11] text-brand",
    green: "bg-emerald-500/[0.11] text-emerald-400",
    gold: "bg-amber-400/[0.10] text-amber-300",
    blue: "bg-blue-500/[0.11] text-blue-400",
  };

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 shadow-[0_18px_50px_-42px_rgba(0,0,0,0.9)]">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex size-10 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="size-5" />
        </div>
        <span className="text-[10px] font-medium text-emerald-400">{change}</span>
      </div>
      <p className="mt-4 text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-[22px] font-semibold tracking-[-0.03em] text-white">{value}</p>
    </div>
  );
}

function Sparkline({ reverse = false }: { reverse?: boolean }) {
  const points = reverse
    ? "0,26 18,23 34,25 50,18 66,20 84,12 102,15 120,7 138,10 156,3"
    : "0,22 18,25 34,17 50,21 66,13 84,16 102,7 120,11 138,5 156,8";

  return (
    <svg viewBox="0 0 156 30" className="h-8 w-full overflow-visible" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-brand"
      />
    </svg>
  );
}

function StudioHome() {
  type StudioSubscription = {
    id: string;
    subscriber_id: string;
    amount_cents: number;
    creator_amount_cents: number;
    currency: string;
    status: string;
    created_at: string;
    paid_at: string | null;
    profiles: {
      display_name: string | null;
      username: string | null;
    } | null;
  };

  const { data: current } = useCurrentUser();
  const creatorId = current?.user.id;

  const overviewQuery = useQuery({
    queryKey: ["studio-overview", creatorId],
    enabled: Boolean(creatorId),
    queryFn: async () => {
      if (!creatorId) {
        return null;
      }

      const [
        profileResult,
        subscriptionsResult,
        postsResult,
        balanceResult,
        callsResult,
        payoutsResult,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name,username,avatar_url")
          .eq("id", creatorId)
          .maybeSingle(),

        supabase
          .from("subscriptions")
          .select(
            "id,subscriber_id,amount_cents,creator_amount_cents,currency,status,created_at,paid_at,profiles:subscriber_id(display_name,username)",
          )
          .eq("creator_id", creatorId)
          .order("created_at", { ascending: false })
          .limit(100),

        supabase
          .from("posts")
          .select("id,title,created_at,is_published,is_removed,like_count,comment_count", {
            count: "exact",
          })
          .eq("creator_id", creatorId)
          .eq("is_removed", false)
          .order("created_at", { ascending: false })
          .limit(5),

        supabase
          .from("creator_balances")
          .select("available_cents,pending_cents,lifetime_gross_cents,currency,updated_at")
          .eq("creator_id", creatorId)
          .maybeSingle(),

        Promise.resolve({ data: [], error: null }),

        supabase
          .from("payout_requests")
          .select("id,amount_cents,currency,status,created_at,updated_at")
          .eq("creator_id", creatorId)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      for (const result of [
        profileResult,
        subscriptionsResult,
        postsResult,
        balanceResult,
        callsResult,
        payoutsResult,
      ]) {
        if (result.error) throw result.error;
      }

      const subscriptions = (subscriptionsResult.data ?? []) as unknown as StudioSubscription[];
      const activeSubscriptions = subscriptions.filter(
        (subscription) => subscription.status === "active",
      );

      const gross = activeSubscriptions.reduce(
        (total, subscription) => total + (subscription.amount_cents ?? 0),
        0,
      );

      const net = activeSubscriptions.reduce(
        (total, subscription) => total + (subscription.creator_amount_cents ?? 0),
        0,
      );

      return {
        profile: profileResult.data,
        subscriptions,
        activeSubscriptions,
        posts: postsResult.data ?? [],
        postCount: postsResult.count ?? 0,
        balance: balanceResult.data,
        calls: callsResult.data ?? [],
        payouts: payoutsResult.data ?? [],
        gross,
        net,
        commission: gross - net,
      };
    },
  });

  const overview = overviewQuery.data ?? {
    profile: null,
    subscriptions: [],
    activeSubscriptions: [],
    posts: [],
    postCount: 0,
    balance: null,
    calls: [] as { id: string; status: string; created_at: string }[],
    payouts: [],
    gross: 0,
    net: 0,
    commission: 0,
  };
  const creatorName = overview?.profile?.display_name ?? "Criador";
  const currency = overview?.balance?.currency ?? "BRL";
  const subscriberCount = overview?.activeSubscriptions.length ?? 0;
  const postCount = overview?.postCount ?? 0;
  const revenue = overview?.balance?.lifetime_gross_cents ?? 0;
  const available = overview?.balance?.available_cents ?? 0;

  return (
    <RoleGate allowed={["creator"]}>
      <AppShell title="Visão geral">
        <div className="space-y-5">
          <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand">
                Creator Studio
                <span className="h-px w-8 bg-brand/30" />
              </div>
              <h2 className="mt-2 text-[30px] font-semibold tracking-[-0.04em] sm:text-[34px]">
                {`Olá, ${creatorName}!`} <span aria-hidden="true">👋</span>
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Bem-vinda ao seu Creator Studio.
              </p>
            </div>

            <Link
              to="/studio/$section"
              params={{ section: "new" }}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-brand-foreground shadow-[0_16px_35px_-20px_rgba(184,76,255,0.9)] transition hover:-translate-y-0.5 hover:brightness-105"
            >
              <FilePlus2 className="size-4" />
              Nova publicação
              <ArrowUpRight className="size-4 opacity-70" />
            </Link>
          </section>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={Users}
              label="Assinantes"
              value={String(subscriberCount)}
              change={
                subscriberCount === 1
                  ? "1 assinatura ativa"
                  : `${subscriberCount} assinaturas ativas`
              }
            />

            <MetricCard
              icon={DollarSign}
              label="Receita acumulada"
              value={formatCents(revenue, currency)}
              change={revenue > 0 ? "Dados reais da plataforma" : "Nenhuma receita registrada"}
              tone="green"
            />

            <MetricCard
              icon={MessageCircle}
              label="Propostas"
              value="0"
              change="Nenhuma proposta registrada"
            />

            <MetricCard
              icon={PlaySquare}
              label="Publicações"
              value={String(postCount)}
              change={postCount === 1 ? "1 publicação" : `${postCount} publicações`}
              tone="gold"
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
            <div className="space-y-5">
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 sm:p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Ações rápidas
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Gerencie seu conteúdo, interaja e monitore seus resultados.
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                  {quickActions.map(([slug, label, description, Icon]) => (
                    <Link
                      key={slug}
                      to="/studio/$section"
                      params={{ section: slug }}
                      className="group flex min-h-[92px] items-center gap-3 rounded-xl border border-white/[0.06] bg-[#0c0e15]/70 p-3.5 transition hover:-translate-y-0.5 hover:border-brand/20 hover:bg-brand/[0.035]"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/[0.09] text-brand">
                        <Icon className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold">{label}</p>
                        <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                          {description}
                        </p>
                      </div>
                      <ArrowRight className="size-4 shrink-0 text-white/25 transition group-hover:text-brand" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">Receita acumulada</p>
                      <p className="mt-2 text-[28px] font-semibold tracking-[-0.04em]">
                        {formatCents(revenue, currency)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Valor bruto registrado no saldo do criador.
                      </p>
                    </div>

                    <Link
                      to="/studio/$section"
                      params={{ section: "finance" }}
                      className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[10px] font-medium text-muted-foreground transition hover:text-foreground"
                    >
                      Ver financeiro
                    </Link>
                  </div>

                  <div className="mt-6 flex h-36 items-center justify-center rounded-xl border border-white/[0.05] bg-black/10 px-6 text-center">
                    <div>
                      <p className="text-sm font-medium">
                        {revenue > 0
                          ? "Histórico de receita disponível"
                          : "Ainda não há histórico de receita"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        O gráfico será exibido quando houver dados históricos suficientes no
                        Supabase.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-xl border border-white/[0.06] bg-[#0b0d14] p-2.5">
                      <p className="truncate text-[9px] text-muted-foreground">Receita líquida</p>
                      <p className="mt-0.5 truncate text-[11px] font-semibold">
                        {formatCents(overview?.net ?? 0, currency)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/[0.06] bg-[#0b0d14] p-2.5">
                      <p className="truncate text-[9px] text-muted-foreground">Comissão SECRET</p>
                      <p className="mt-0.5 truncate text-[11px] font-semibold">
                        {formatCents(overview?.commission ?? 0, currency)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/[0.06] bg-[#0b0d14] p-2.5">
                      <p className="truncate text-[9px] text-muted-foreground">Disponível</p>
                      <p className="mt-0.5 truncate text-[11px] font-semibold">
                        {formatCents(available, currency)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {[
                      {
                        label: "Ganhos líquidos",
                        value: formatCents(overview?.net ?? 0, currency),
                        tone: "green",
                      },
                      {
                        label: "Taxas SECRET",
                        value: formatCents(overview?.commission ?? 0, currency),
                        tone: "brand",
                      },
                      {
                        label: "Solicitações",
                        value: String(overview?.payouts.length ?? 0),
                        tone: "blue",
                      },
                      {
                        label: "Disponível",
                        value: formatCents(available, currency),
                        tone: "gold",
                      },
                    ].map(({ label, value, tone }) => (
                      <div
                        key={label}
                        className="rounded-xl border border-white/[0.06] bg-[#0b0d14] p-2.5"
                      >
                        <div
                          className={`mb-2 size-2 rounded-full ${tone === "green" ? "bg-emerald-400" : tone === "blue" ? "bg-blue-400" : tone === "gold" ? "bg-amber-300" : "bg-brand"}`}
                        />
                        <p className="truncate text-[9px] text-muted-foreground">{label}</p>
                        <p className="mt-0.5 truncate text-[11px] font-semibold">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">Publicações recentes</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        Seu conteúdo mais recente
                      </p>
                    </div>
                    <Link
                      to="/studio/$section"
                      params={{ section: "posts" }}
                      className="text-[10px] font-semibold text-brand hover:underline"
                    >
                      Ver todas
                    </Link>
                  </div>
                  <div className="mt-4 space-y-2">
                    {recentPosts.map(([title, date], index) => (
                      <div
                        key={title}
                        className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-[#0b0d14]/80 p-2.5"
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand/20 to-white/[0.03] text-brand">
                          {index === 0 ? (
                            <PlaySquare className="size-4" />
                          ) : (
                            <Sparkles className="size-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-semibold">{title}</p>
                          <p className="mt-0.5 text-[9px] text-muted-foreground">{date}</p>
                        </div>
                        <span className="rounded-full bg-brand/[0.10] px-2 py-1 text-[9px] font-medium text-brand">
                          Publicado
                        </span>
                        <MoreVertical className="size-3.5 text-white/25" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Indicadores</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Dados reais registrados no Supabase.
                    </p>
                  </div>
                  <BarChart3 className="size-4 text-brand" />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    {
                      label: "Assinaturas ativas",
                      value: String(subscriberCount),
                      description:
                        subscriberCount === 1
                          ? "1 assinante ativo"
                          : `${subscriberCount} assinantes ativos`,
                    },
                    {
                      label: "Publicações",
                      value: String(postCount),
                      description:
                        postCount === 1
                          ? "1 publicação registrada"
                          : `${postCount} publicações registradas`,
                    },
                    {
                      label: "Receita acumulada",
                      value: formatCents(revenue, currency),
                      description:
                        revenue > 0 ? "Valor bruto registrado" : "Nenhuma receita registrada",
                    },
                    {
                      label: "Saldo disponível",
                      value: formatCents(available, currency),
                      description:
                        available > 0 ? "Disponível para saque" : "Nenhum saldo disponível",
                    },
                  ].map(({ label, value, description }) => (
                    <div
                      key={label}
                      className="rounded-xl border border-white/[0.06] bg-[#0b0d14] p-3.5"
                    >
                      <p className="text-[10px] text-muted-foreground">{label}</p>
                      <p className="mt-2 text-lg font-semibold">{value}</p>
                      <p className="mt-0.5 text-[9px] text-muted-foreground">{description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-5">
              <div className="rounded-2xl border border-brand/15 bg-gradient-to-br from-brand/[0.12] to-white/[0.02] p-5 shadow-[0_20px_55px_-38px_rgba(184,76,255,0.65)]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">Saldo disponível</p>
                  <Link
                    to="/studio/$section"
                    params={{ section: "finance" }}
                    className="text-[10px] font-semibold text-brand"
                  >
                    Ver finanças
                  </Link>
                </div>
                <p className="mt-5 text-[26px] font-semibold tracking-[-0.04em]">
                  {formatCents(available, currency)}
                </p>
                <p className="mt-2 text-[10px] leading-4 text-muted-foreground">
                  {available > 0
                    ? "Valor atualmente disponível para saque."
                    : "Nenhum saldo disponível para saque."}
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Atividade recente</p>
                  <Link
                    to="/studio/$section"
                    params={{ section: "finance" }}
                    className="text-[10px] font-semibold text-brand"
                  >
                    Ver tudo
                  </Link>
                </div>

                <div className="mt-4 space-y-4">
                  {[
                    ...overview.subscriptions.slice(0, 3).map((subscription) => ({
                      label:
                        subscription.status === "active"
                          ? "Nova assinatura"
                          : "Assinatura atualizada",
                      description:
                        subscription.profiles?.display_name ??
                        subscription.profiles?.username ??
                        "Assinante",
                      time: new Date(subscription.created_at).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }),
                      Icon: Users,
                    })),
                    ...overview.payouts.slice(0, 2).map((payout) => ({
                      label: "Solicitação de saque",
                      description: formatCents(payout.amount_cents, payout.currency ?? currency),
                      time: new Date(payout.created_at).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }),
                      Icon: WalletCards,
                    })),
                  ].length ? (
                    [
                      ...overview.subscriptions.slice(0, 3).map((subscription) => ({
                        label:
                          subscription.status === "active"
                            ? "Nova assinatura"
                            : "Assinatura atualizada",
                        description:
                          subscription.profiles?.display_name ??
                          subscription.profiles?.username ??
                          "Assinante",
                        time: new Date(subscription.created_at).toLocaleString("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        }),
                        Icon: Users,
                      })),
                      ...overview.payouts.slice(0, 2).map((payout) => ({
                        label: "Solicitação de saque",
                        description: formatCents(payout.amount_cents, payout.currency ?? currency),
                        time: new Date(payout.created_at).toLocaleString("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        }),
                        Icon: WalletCards,
                      })),
                    ]
                      .slice(0, 5)
                      .map(({ label, description, time, Icon }) => (
                        <div key={`${label}-${time}`} className="flex items-center gap-2.5">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand/[0.08] text-brand">
                            <Icon className="size-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[10px] font-semibold">{label}</p>
                            <p className="truncate text-[9px] text-muted-foreground">
                              {description}
                            </p>
                          </div>
                          <span className="shrink-0 text-[9px] text-muted-foreground">{time}</span>
                        </div>
                      ))
                  ) : (
                    <div className="rounded-xl bg-white/[0.025] p-4 text-center text-xs text-muted-foreground">
                      Nenhuma atividade registrada.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Chamadas</p>
                  <Link
                    to="/studio/$section"
                    params={{ section: "calls" }}
                    className="text-[10px] font-semibold text-brand"
                  >
                    Ver chamadas
                  </Link>
                </div>

                <div className="mt-4 space-y-3">
                  {overview.calls.length ? (
                    overview.calls.slice(0, 3).map((call) => (
                      <div
                        key={call.id}
                        className="rounded-xl border border-white/[0.05] bg-[#0b0d14] p-3"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex size-8 items-center justify-center rounded-full bg-brand/[0.10] text-brand">
                            <Video className="size-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-[10px] font-semibold">Videochamada</p>
                            <p className="truncate text-[9px] text-muted-foreground">
                              Status: {call.status}
                            </p>
                          </div>
                        </div>
                        <p className="mt-2 text-[9px] text-muted-foreground">
                          Registrada em{" "}
                          {new Date(call.created_at).toLocaleString("pt-BR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl bg-white/[0.025] p-4 text-center text-xs text-muted-foreground">
                      Nenhuma chamada registrada.
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </section>

          <section className="flex flex-col gap-3 rounded-2xl border border-amber-300/[0.10] bg-amber-300/[0.035] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-300/[0.10] text-amber-300">
                <Sparkles className="size-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold">Dica para você 💡</p>
                <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">
                  Criadores que publicam pelo menos 3 vezes por semana ganham mais oportunidades de
                  engajamento.
                </p>
              </div>
            </div>
            <Link
              to="/studio/$section"
              params={{ section: "new" }}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-brand px-4 text-[10px] font-semibold text-brand-foreground"
            >
              Criar publicação
            </Link>
          </section>
        </div>
      </AppShell>
    </RoleGate>
  );
}
