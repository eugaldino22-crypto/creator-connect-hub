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
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand" />
    </svg>
  );
}

function StudioHome() {
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
                Olá, Luna! <span aria-hidden="true">👋</span>
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">Bem-vinda ao seu Creator Studio.</p>
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
            <MetricCard icon={Users} label="Assinantes" value="1.248" change="+12% este mês" />
            <MetricCard icon={DollarSign} label="Receita mensal" value="R$ 8.450,00" change="+18% este mês" tone="green" />
            <MetricCard icon={MessageCircle} label="Propostas" value="8" change="Novas propostas" />
            <MetricCard icon={PlaySquare} label="Publicações" value="24" change="Total de posts" tone="gold" />
          </section>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
            <div className="space-y-5">
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 sm:p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Ações rápidas</p>
                    <p className="mt-1 text-sm text-muted-foreground">Gerencie seu conteúdo, interaja e monitore seus resultados.</p>
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
                        <p className="mt-1 text-[10px] leading-4 text-muted-foreground">{description}</p>
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
                      <p className="text-sm font-semibold">Receita</p>
                      <p className="mt-2 text-[28px] font-semibold tracking-[-0.04em]">R$ 8.450,00</p>
                      <p className="mt-1 text-xs text-emerald-400">+18% em relação ao mês anterior</p>
                    </div>
                    <button type="button" className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[10px] font-medium text-muted-foreground">Este mês⌄</button>
                  </div>
                  <div className="mt-6 h-36 rounded-xl bg-gradient-to-b from-brand/[0.08] to-transparent p-2">
                    <svg viewBox="0 0 520 150" className="h-full w-full" preserveAspectRatio="none" aria-label="Tendência de receita">
                      <defs>
                        <linearGradient id="secretRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
                          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M0 122 C45 105 62 116 91 91 S144 82 177 96 S225 60 258 69 S307 38 338 55 S385 34 414 45 S467 18 520 24 L520 150 L0 150 Z" fill="url(#secretRevenue)" className="text-brand" />
                      <path d="M0 122 C45 105 62 116 91 91 S144 82 177 96 S225 60 258 69 S307 38 338 55 S385 34 414 45 S467 18 520 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-brand" />
                    </svg>
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {[
                      ["Ganhos líquidos", "R$ 7.210,00", "green"],
                      ["Taxas SECRET", "R$ 1.240,00", "brand"],
                      ["Solicitações", "2", "blue"],
                      ["Disponível", "R$ 3.560,00", "gold"],
                    ].map(([label, value, tone]) => (
                      <div key={label} className="rounded-xl border border-white/[0.06] bg-[#0b0d14] p-2.5">
                        <div className={`mb-2 size-2 rounded-full ${tone === "green" ? "bg-emerald-400" : tone === "blue" ? "bg-blue-400" : tone === "gold" ? "bg-amber-300" : "bg-brand"}`} />
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
                      <p className="mt-1 text-[10px] text-muted-foreground">Seu conteúdo mais recente</p>
                    </div>
                    <Link to="/studio/posts" className="text-[10px] font-semibold text-brand hover:underline">Ver todas</Link>
                  </div>
                  <div className="mt-4 space-y-2">
                    {recentPosts.map(([title, date], index) => (
                      <div key={title} className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-[#0b0d14]/80 p-2.5">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand/20 to-white/[0.03] text-brand">
                          {index === 0 ? <PlaySquare className="size-4" /> : <Sparkles className="size-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-semibold">{title}</p>
                          <p className="mt-0.5 text-[9px] text-muted-foreground">{date}</p>
                        </div>
                        <span className="rounded-full bg-brand/[0.10] px-2 py-1 text-[9px] font-medium text-brand">Publicado</span>
                        <MoreVertical className="size-3.5 text-white/25" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Insights do seu crescimento</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">Acompanhe os indicadores que mais importam.</p>
                  </div>
                  <BarChart3 className="size-4 text-brand" />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    ["Novos assinantes", "+156", "+12% este mês", false],
                    ["Taxa de retenção", "92%", "+4% este mês", true],
                    ["Engajamento", "78%", "+8% este mês", false],
                    ["Receita por assinante", "R$ 6,78", "+15% este mês", true],
                  ].map(([label, value, change, reverse]) => (
                    <div key={label} className="rounded-xl border border-white/[0.06] bg-[#0b0d14] p-3.5">
                      <p className="text-[10px] text-muted-foreground">{label}</p>
                      <p className="mt-2 text-lg font-semibold">{value}</p>
                      <p className="mt-0.5 text-[9px] text-emerald-400">{change}</p>
                      <div className="mt-2 text-brand/80"><Sparkline reverse={Boolean(reverse)} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-5">
              <div className="rounded-2xl border border-brand/15 bg-gradient-to-br from-brand/[0.12] to-white/[0.02] p-5 shadow-[0_20px_55px_-38px_rgba(184,76,255,0.65)]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">Meta do mês</p>
                  <span className="text-[10px] font-semibold text-brand">Editar meta</span>
                </div>
                <p className="mt-5 text-[26px] font-semibold tracking-[-0.04em]">R$ 12.000,00</p>
                <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>de R$ 15.000,00</span>
                  <span className="font-semibold text-emerald-400">80%</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full w-[80%] rounded-full bg-brand" /></div>
                <p className="mt-3 text-[10px] leading-4 text-muted-foreground">Faltam R$ 3.000,00 para sua meta!</p>
                <Link to="/studio/finance" className="mt-4 flex h-9 items-center justify-center rounded-lg bg-brand/[0.12] text-[10px] font-semibold text-brand">Ver finanças <ArrowRight className="ml-1.5 size-3.5" /></Link>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Atividade recente</p>
                  <span className="text-[10px] font-semibold text-brand">Ver tudo</span>
                </div>
                <div className="mt-4 space-y-4">
                  {[
                    ["Novo assinante", "@marcos.silva", "há 5 min", Users],
                    ["Proposta recebida", "Videochamada especial", "há 15 min", MessageCircle],
                    ["Pagamento recebido", "R$ 150,00", "há 1h", DollarSign],
                    ["Nova assinatura", "Plano Premium", "há 2h", WalletCards],
                    ["Proposta aceita", "Ensaio exclusivo", "há 3h", CheckCircle2],
                  ].map(([label, description, time, Icon]) => (
                    <div key={label as string} className="flex items-center gap-2.5">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand/[0.08] text-brand"><Icon className="size-3.5" /></div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[10px] font-semibold">{label as string}</p>
                        <p className="truncate text-[9px] text-muted-foreground">{description as string}</p>
                      </div>
                      <span className="shrink-0 text-[9px] text-muted-foreground">{time as string}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Próximas chamadas</p>
                  <Link to="/studio/subscribers" className="text-[10px] font-semibold text-brand">Ver agenda</Link>
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    ["Hoje, 18:00", "@gabriel_23", "Videochamada"],
                    ["Amanhã, 20:30", "@lucas.martins", "Videochamada"],
                  ].map(([when, handle, type]) => (
                    <div key={when} className="rounded-xl border border-white/[0.05] bg-[#0b0d14] p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-full bg-brand/[0.10] text-brand"><Video className="size-3.5" /></div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold">{when}</p>
                          <p className="truncate text-[9px] text-muted-foreground">{handle} · {type}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/studio/subscribers" className="mt-3 flex h-9 items-center justify-center gap-2 rounded-lg bg-brand/[0.11] text-[10px] font-semibold text-brand">
                  <CalendarDays className="size-3.5" /> Agendar chamada
                </Link>
              </div>
            </aside>
          </section>

          <section className="flex flex-col gap-3 rounded-2xl border border-amber-300/[0.10] bg-amber-300/[0.035] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-300/[0.10] text-amber-300"><Sparkles className="size-4" /></div>
              <div>
                <p className="text-[11px] font-semibold">Dica para você 💡</p>
                <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">Criadores que publicam pelo menos 3 vezes por semana ganham mais oportunidades de engajamento.</p>
              </div>
            </div>
            <Link to="/studio/$section" params={{ section: "new" }} className="inline-flex h-9 items-center justify-center rounded-lg bg-brand px-4 text-[10px] font-semibold text-brand-foreground">Criar publicação</Link>
          </section>
        </div>
      </AppShell>
    </RoleGate>
  );
}
