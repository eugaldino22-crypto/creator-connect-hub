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
  Sparkles,
  Users,
  Video,
  WandSparkles,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";

export const Route = createFileRoute("/")({
  component: Index,
});

function SecretMark() {
  return (
    <img
      src="/secret-mark.svg"
      alt="SECRET"
      className="h-10 w-10 shrink-0 rounded-xl shadow-[0_0_35px_rgba(184,76,255,0.22)] sm:h-11 sm:w-11"
    />
  );
}

function Index() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_12%,rgba(184,76,255,0.18),transparent_30%),radial-gradient(circle_at_15%_55%,rgba(255,79,216,0.08),transparent_30%)]" />

      <nav className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-5 sm:gap-5 sm:px-6 sm:py-6 lg:px-8">
        <Link to="/" className="flex min-w-0 shrink items-center gap-2.5 sm:gap-3" aria-label="SECRET home">
          <SecretMark />
          <div className="min-w-0">
            <div className="font-display text-lg font-semibold tracking-[0.2em] sm:text-xl sm:tracking-[0.24em]">SECRET</div>
            <div className="hidden text-[9px] uppercase tracking-[0.34em] text-muted-foreground sm:block">
              sua comunidade exclusiva
            </div>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <a href="#criadores" className="hidden rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground sm:inline-flex">
            Para criadores
          </a>
          <a href="#experiencias" className="hidden rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground md:inline-flex">
            Experiências
          </a>
          <LanguageSwitcher compact />
          <Link
            to="/auth"
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold transition hover:bg-white/[0.08] sm:px-5"
          >
            Entrar
          </Link>
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-88px)] w-full max-w-7xl items-center gap-14 px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-24">
        <div className="max-w-2xl">
          <div className="mb-7 inline-flex max-w-full items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-2 text-xs font-medium text-brand">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            Comunidades. Conteúdo. Experiências.
          </div>

          <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            Conecte. Crie.
            <span className="mt-2 block text-gradient-brand">Monetize.</span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
            A SECRET aproxima criadores e pessoas que querem fazer parte de algo exclusivo — com conteúdo, comunidade, ofertas e experiências que vão além da tela.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-brand-foreground shadow-[0_16px_45px_-18px_rgba(184,76,255,0.75)] transition hover:-translate-y-0.5"
            >
              Quero ser criador
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold transition hover:bg-white/[0.08]"
            >
              Explorar a SECRET
            </Link>
          </div>

          <div className="mt-10 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <MiniProof icon={<ImageIcon className="h-4 w-4" />} text="Fotos e vídeos" />
            <MiniProof icon={<Video className="h-4 w-4" />} text="Experiências" />
            <MiniProof icon={<MessageCircle className="h-4 w-4" />} text="Propostas diretas" />
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[500px]">
          <div className="absolute -inset-10 rounded-[3rem] bg-brand/10 blur-3xl" />
          <div className="relative rounded-[2.25rem] border border-white/10 bg-white/[0.045] p-3 shadow-2xl backdrop-blur-xl">
            <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b0912]">
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <SecretMark />
                  <div>
                    <div className="font-display text-sm font-semibold tracking-[0.2em]">SECRET</div>
                    <div className="text-[10px] text-muted-foreground">Creator community</div>
                  </div>
                </div>
                <div className="rounded-full bg-brand/10 px-3 py-1 text-[10px] font-medium text-brand">EXCLUSIVO</div>
              </div>

              <div className="px-5 pb-5">
                <div className="rounded-2xl bg-gradient-to-br from-violet-500/30 via-fuchsia-500/10 to-white/[0.03] p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 font-display text-lg">LM</div>
                    <div>
                      <div className="font-semibold">Luna Martins</div>
                      <div className="text-xs text-muted-foreground">@lunamartins · Criadora</div>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-6 text-white/75">
                    Bastidores, dicas, conteúdos exclusivos e experiências para quem faz parte da minha comunidade.
                  </p>

                  <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs text-muted-foreground">Comunidade</div>
                        <div className="mt-1 text-lg font-semibold">R$ 19,90 / mês</div>
                      </div>
                      <div className="rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-brand-foreground">Assinar</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <OfferPreview icon={<Video className="h-4 w-4" />} title="Videochamada" text="A partir de R$ 89,90" />
                  <OfferPreview icon={<Gift className="h-4 w-4" />} title="Oferta exclusiva" text="Comprar ou propor" />
                </div>

                <div className="mt-3 rounded-xl border border-brand/20 bg-brand/[0.06] p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <WandSparkles className="h-4 w-4 text-brand" />
                    Faça uma proposta
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Quer uma experiência diferente? Envie sua proposta e converse diretamente com o criador.
                  </p>
                  <div className="mt-3 flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                    <span className="text-xs text-muted-foreground">Sua proposta</span>
                    <span className="text-sm font-semibold">R$ 120,00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="experiencias" className="relative z-10 border-y border-white/5 bg-black/10">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">Mais que conteúdo</div>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Na SECRET, você não precisa apenas assistir.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
              Entre na comunidade, descubra ofertas e proponha experiências diretamente aos criadores que você acompanha.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard icon={<ImageIcon />} title="Conteúdo" text="Fotos e vídeos públicos ou exclusivos para membros." />
            <FeatureCard icon={<Video />} title="Experiências" text="Videochamadas, encontros e experiências personalizadas." />
            <FeatureCard icon={<MessageCircle />} title="Propostas" text="Faça uma oferta, negocie e encontre um acordo com o criador." />
            <FeatureCard icon={<Package />} title="Ofertas" text="Produtos e itens exclusivos disponibilizados pelo criador." />
          </div>
        </div>
      </section>

      <section id="criadores" className="relative z-10 mx-auto grid w-full max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-28">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">Para criadores</div>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Sua comunidade. Do seu jeito.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Crie seu espaço, escolha o que oferecer e defina como quer se relacionar com sua comunidade. Você decide os planos, ofertas, preços e experiências.
          </p>

          <div className="mt-7 space-y-3">
            <CheckRow text="Crie planos de assinatura" />
            <CheckRow text="Publique fotos e vídeos exclusivos" />
            <CheckRow text="Crie experiências e ofertas personalizadas" />
            <CheckRow text="Receba propostas e negocie diretamente" />
          </div>

          <Link
            to="/auth"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-brand-foreground transition hover:-translate-y-0.5"
          >
            Criar minha comunidade
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 sm:p-7">
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div>
              <div className="text-xs text-muted-foreground">Studio</div>
              <div className="mt-1 text-xl font-semibold">Suas ofertas</div>
            </div>
            <div className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">Criador</div>
          </div>

          <div className="mt-5 space-y-3">
            <DashboardOffer icon={<LockKeyhole />} title="Assinatura mensal" value="R$ 19,90 / mês" status="Ativa" />
            <DashboardOffer icon={<Video />} title="Videochamada" value="A partir de R$ 89,90" status="Disponível" />
            <DashboardOffer icon={<Gift />} title="Experiência personalizada" value="Permitir propostas" status="Negociável" />
            <DashboardOffer icon={<Package />} title="Item exclusivo" value="R$ 249,90" status="Disponível" />
          </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-white/5 bg-white/[0.015]">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">Para assinantes</div>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Faça parte. Não fique apenas olhando.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Assine comunidades, acompanhe conteúdo exclusivo e encontre novas formas de se conectar com os criadores.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <SubscriberCard icon={<Heart />} title="Descubra" text="Encontre criadores e comunidades que combinam com você." />
            <SubscriberCard icon={<MessageCircle />} title="Proponha" text="Faça sua própria oferta para uma experiência." />
            <SubscriberCard icon={<Clock3 />} title="Combine" text="Negocie os detalhes e viva a experiência." />
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-3xl rounded-[2.5rem] border border-brand/15 bg-brand/[0.045] px-6 py-12 shadow-[0_30px_100px_-50px_rgba(184,76,255,0.45)] sm:px-12">
          <Sparkles className="mx-auto h-7 w-7 text-brand" />
          <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Sua comunidade começa aqui.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            Crie seu espaço na SECRET ou descubra uma comunidade da qual você realmente queira fazer parte.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-brand-foreground transition hover:-translate-y-0.5"
            >
              Começar agora
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-7 py-3.5 text-sm font-semibold transition hover:bg-white/[0.08]"
            >
              Entrar na SECRET
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-3 border-t border-white/5 px-4 py-8 text-xs text-muted-foreground sm:px-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div className="tracking-[0.18em]">SECRET</div>
        <div>Sua comunidade. Seu conteúdo. Seu espaço.</div>
      </footer>
    </main>
  );
}

function MiniProof({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-brand">{icon}</span>
      {text}
    </div>
  );
}

function OfferPreview({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-brand">{icon}</div>
      <div className="mt-3 text-sm font-medium">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground">{text}</div>
    </div>
  );
}

function FeatureCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-6 transition hover:-translate-y-0.5 hover:border-brand/20">
      <div className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">{icon}</div>
      <h3 className="mt-5 font-display text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

function CheckRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <span className="flex size-6 items-center justify-center rounded-full bg-brand/10 text-brand">
        <Check className="h-3.5 w-3.5" />
      </span>
      {text}
    </div>
  );
}

function DashboardOffer({ icon, title, value, status }: { icon: React.ReactNode; title: string; value: string; status: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/10 p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">{icon}</div>
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
    <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-5">
      <div className="flex size-9 items-center justify-center rounded-xl bg-brand/10 text-brand">{icon}</div>
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{text}</p>
      <ChevronRight className="mt-4 h-4 w-4 text-brand" />
    </div>
  );
}
