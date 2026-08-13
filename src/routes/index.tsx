import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  Gift,
  Heart,
  Image as ImageIcon,
  LockKeyhole,
  MessageCircle,
  Package,
  Send,
  Sparkles,
  Users,
  Video,
  WandSparkles,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";

export const Route = createFileRoute("/")({ component: Index });

function SecretMark() {
  return (
    <img
      src="/secret-mark.svg"
      alt="SECRET"
      className="h-10 w-10 shrink-0 rounded-xl shadow-[0_0_28px_rgba(184,76,255,0.12)] sm:h-11 sm:w-11"
    />
  );
}

function Index() {
  return (
    <main className="min-h-screen overflow-hidden bg-background pt-[78px] text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(184,76,255,0.07),transparent_28%),radial-gradient(circle_at_12%_48%,rgba(255,79,216,0.025),transparent_30%)]" />

      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center" aria-label="SECRET home">
            <img src="/secret-logo-dark.svg" alt="SECRET — sua comunidade exclusiva" className="h-11 w-auto max-w-[220px] sm:h-12 sm:max-w-[260px]" />
          </Link>

          <div className="hidden items-center gap-1.5 md:flex">
            <a href="#criadores" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-white/[0.03] hover:text-foreground">
              Para criadores
            </a>
            <a href="#assinantes" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-white/[0.03] hover:text-foreground">
              Para assinantes
            </a>
            <a href="#como-funciona" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-white/[0.03] hover:text-foreground">
              Como funciona
            </a>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/auth"
              className="rounded-lg border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm font-semibold transition hover:bg-white/[0.06] sm:px-5"
            >
              Entrar
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-78px)] w-full max-w-7xl items-center gap-14 px-4 py-12 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-3.5 py-2 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            A comunidade onde conteúdo vira experiências
          </div>

          <h1 className="font-display text-5xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
            Conecte.
            <br />
            Crie.
            <br />
            <span className="text-gradient-brand">Monetize.</span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
            O espaço exclusivo onde criadores constroem comunidades, publicam conteúdo e criam experiências que vão muito além da tela.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-brand-foreground shadow-[0_16px_36px_-20px_rgba(184,76,255,0.45)] transition hover:-translate-y-0.5"
            >
              Quero ser criador
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#como-funciona" className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] px-6 py-3.5 text-sm font-semibold transition hover:bg-white/[0.05]">
              Conhecer a SECRET
            </a>
          </div>

          <div className="mt-9 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <MiniProof icon={<ImageIcon className="h-4 w-4" />} text="Conteúdo exclusivo" />
            <MiniProof icon={<Video className="h-4 w-4" />} text="Experiências" />
            <MiniProof icon={<MessageCircle className="h-4 w-4" />} text="Propostas diretas" />
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[560px]">
          <div className="absolute inset-8 rounded-[3rem] bg-brand/[0.055] blur-3xl" />
          <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.025] p-2.5 shadow-2xl backdrop-blur-xl">
            <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#0a0910]">
              <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
                <div className="flex items-center gap-3">
                  <SecretMark />
                  <div>
                    <div className="font-display text-sm font-semibold tracking-[0.2em]">SECRET</div>
                    <div className="text-[10px] text-muted-foreground">Creator community</div>
                  </div>
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-medium text-muted-foreground">EXCLUSIVO</div>
              </div>

              <div className="grid gap-4 p-4 sm:grid-cols-[1fr_0.86fr] sm:p-5">
                <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] font-display text-lg">LM</div>
                    <div>
                      <div className="font-semibold">Luna Martins</div>
                      <div className="text-xs text-muted-foreground">@lunamartins · Criadora</div>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-6 text-muted-foreground">
                    Bastidores, dicas, conteúdos exclusivos e experiências para quem faz parte da minha comunidade.
                  </p>
                  <div className="mt-5 rounded-xl border border-white/10 bg-black/15 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs text-muted-foreground">Assinatura mensal</div>
                        <div className="mt-1 text-lg font-semibold">R$ 80,00</div>
                      </div>
                      <div className="rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-brand-foreground">Assinar</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <OfferPreview icon={<Video className="h-4 w-4" />} title="Videochamada" text="30 minutos · R$ 150,00" action="Fazer proposta" />
                  <OfferPreview icon={<Package className="h-4 w-4" />} title="Item exclusivo" text="Peça única · R$ 500,00" action="Comprar" />
                  <div className="rounded-xl border border-brand/15 bg-white/[0.025] p-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <WandSparkles className="h-4 w-4 text-brand" />
                      Faça uma proposta
                    </div>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">Negocie uma experiência diretamente com o criador.</p>
                    <div className="mt-3 flex items-center justify-between rounded-lg border border-white/10 bg-black/10 px-3 py-2">
                      <span className="text-xs text-muted-foreground">Sua proposta</span>
                      <span className="text-sm font-semibold">R$ 120,00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="experiencias" className="relative z-10 border-y border-white/5 bg-white/[0.012]">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">Tudo em um só lugar</div>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">Mais que conteúdo. Experiências.</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
              A SECRET vai além das assinaturas tradicionais. Criadores e fãs podem construir relações mais próximas, ofertas e experiências únicas.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <FeatureCard icon={<ImageIcon />} title="Conteúdo exclusivo" text="Fotos e vídeos exclusivos para assinantes." />
            <FeatureCard icon={<Video />} title="Videochamadas" text="Converse ao vivo com seu criador favorito." />
            <FeatureCard icon={<Sparkles />} title="Experiências" text="Experiências personalizadas criadas para você." />
            <FeatureCard icon={<Package />} title="Produtos exclusivos" text="Itens físicos, roupas, acessórios e muito mais." />
            <FeatureCard icon={<MessageCircle />} title="Propostas" text="Faça sua proposta e negocie diretamente com o criador." />
          </div>

          <div className="mt-10 text-center">
            <a href="#como-funciona" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-6 py-3 text-sm font-semibold text-brand transition hover:border-brand/25 hover:bg-brand/[0.03]">
              Explorar todas as possibilidades
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">Como funciona</div>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Simples para criadores e fãs.</h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-5">
          <StepCard icon={<Users />} title="Descubra" text="Encontre criadores e comunidades que combinam com você." />
          <StepCard icon={<LockKeyhole />} title="Assine" text="Assine o plano que dá acesso ao conteúdo exclusivo." />
          <StepCard icon={<Send />} title="Proponha" text="Escolha uma experiência e envie sua proposta ao criador." />
          <StepCard icon={<Heart />} title="Negocie" text="Combine valores, detalhes e condições diretamente." />
          <StepCard icon={<Check />} title="Viva a experiência" text="Com pagamento seguro e tudo organizado na SECRET." />
        </div>
      </section>

      <section id="criadores" className="relative z-10 border-y border-white/5 bg-white/[0.012]">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">Para criadores</div>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">Sua comunidade. Do seu jeito.</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">Publique, crie ofertas, receba propostas, negocie e monetize sua comunidade em um só lugar.</p>
            <div className="mt-7 space-y-3">
              <CheckRow text="Crie planos de assinatura" />
              <CheckRow text="Publique fotos e vídeos exclusivos" />
              <CheckRow text="Crie experiências e ofertas personalizadas" />
              <CheckRow text="Receba propostas e negocie diretamente" />
            </div>
            <Link to="/auth" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-brand-foreground transition hover:-translate-y-0.5">
              Criar minha comunidade
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.02] p-5 sm:p-7">
            <div className="flex items-center justify-between border-b border-white/8 pb-5">
              <div>
                <div className="text-xs text-muted-foreground">Studio</div>
                <div className="mt-1 text-xl font-semibold">Suas ofertas</div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-muted-foreground">Criador</div>
            </div>
            <div className="mt-5 space-y-3">
              <DashboardOffer icon={<LockKeyhole />} title="Assinatura mensal" value="R$ 80,00 / mês" status="Ativa" />
              <DashboardOffer icon={<Video />} title="Videochamada" value="A partir de R$ 150,00" status="Disponível" />
              <DashboardOffer icon={<Gift />} title="Experiência personalizada" value="Permitir propostas" status="Negociável" />
              <DashboardOffer icon={<Package />} title="Item exclusivo" value="R$ 500,00" status="Disponível" />
            </div>
          </div>
        </div>
      </section>

      <section id="assinantes" className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">Para assinantes</div>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Faça parte. Não fique apenas olhando.</h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">Descubra comunidades, acompanhe conteúdo exclusivo e encontre novas formas de se conectar com os criadores que você gosta.</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <SubscriberCard icon={<Heart />} title="Descubra" text="Encontre criadores e comunidades que combinam com você." />
          <SubscriberCard icon={<MessageCircle />} title="Proponha" text="Faça sua própria oferta para uma experiência especial." />
          <SubscriberCard icon={<Clock3 />} title="Combine" text="Negocie os detalhes e viva a experiência." />
        </div>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.025] px-6 py-12 text-center sm:px-12">
          <Sparkles className="mx-auto h-7 w-7 text-brand" />
          <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Sua comunidade começa aqui.</h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground">Crie seu espaço na SECRET ou descubra uma comunidade da qual você realmente queira fazer parte.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/auth" className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-7 py-3.5 text-sm font-semibold text-brand-foreground transition hover:-translate-y-0.5">
              Criar minha conta
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/auth" className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] px-7 py-3.5 text-sm font-semibold transition hover:bg-white/[0.05]">Entrar na SECRET</Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-8 text-xs text-muted-foreground sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <img src="/secret-logo-dark.svg" alt="SECRET — sua comunidade exclusiva" className="h-12 w-auto max-w-[220px]" />
            </div>
            <div className="flex flex-col items-start gap-3 sm:items-end">
              <span>Uma nova forma de criar comunidades.</span>
              <LanguageSwitcher compact />
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function MiniProof({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] text-brand">{icon}</span>
      {text}
    </div>
  );
}

function OfferPreview({ icon, title, text, action }: { icon: React.ReactNode; title: string; text: string; action: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-brand">{icon}</span>
        <span className="text-[10px] text-muted-foreground">{action}</span>
      </div>
      <div className="mt-3 text-sm font-medium">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground">{text}</div>
    </div>
  );
}

function FeatureCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.018] p-5 transition hover:-translate-y-0.5 hover:border-white/12">
      <div className="flex size-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.025] text-brand">{icon}</div>
      <h3 className="mt-5 font-display text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

function StepCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.018] p-5">
      <div className="flex size-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.025] text-brand">{icon}</div>
      <h3 className="mt-5 text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{text}</p>
    </div>
  );
}

function CheckRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <span className="flex size-6 items-center justify-center rounded-full bg-white/[0.04] text-brand"><Check className="h-3.5 w-3.5" /></span>
      {text}
    </div>
  );
}

function DashboardOffer({ icon, title, value, status }: { icon: React.ReactNode; title: string; value: string; status: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/10 p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/[0.025] text-brand">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{title}</div>
        <div className="mt-1 text-xs text-muted-foreground">{value}</div>
      </div>
      <div className="shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-muted-foreground">{status}</div>
    </div>
  );
}

function SubscriberCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.018] p-5">
      <div className="flex size-9 items-center justify-center rounded-xl border border-white/8 bg-white/[0.025] text-brand">{icon}</div>
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{text}</p>
      <ChevronRight className="mt-4 h-4 w-4 text-white/25" />
    </div>
  );
}
