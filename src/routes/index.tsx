import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Compass,
  CreditCard,
  Heart,
  Image as ImageIcon,
  LayoutDashboard,
  Lock,
  LockKeyhole,
  MessageCircle,
  Play,
  Search,
  Sparkles,
  Users,
  Video,
  Wallet,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { formatCents } from "@/lib/brand";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "SECRET — Conecte. Crie. Monetize." },
      {
        name: "description",
        content:
          "SECRET é a plataforma onde criadores constroem comunidades, publicam conteúdo exclusivo e monetizam experiências, e assinantes descobrem criadores.",
      },
      { property: "og:title", content: "SECRET — Conecte. Crie. Monetize." },
      {
        property: "og:description",
        content:
          "Comunidades, conteúdo exclusivo e experiências para criadores e assinantes, em um só lugar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

type HomePlan = {
  id: string;
  name: string | null;
  description: string | null;
  price_cents: number;
  currency: string;
  is_active: boolean;
};

type HomeCreator = {
  user_id: string;
  headline: string | null;
  category: string | null;
  is_verified: boolean;
  profiles: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  subscription_plans: HomePlan[];
};

function Index() {
  const creatorQuery = useQuery<HomeCreator | null>({
    queryKey: ["home-featured-creator"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("creator_profiles")
        .select(
          "user_id,headline,category,is_verified,profiles(username,display_name,avatar_url),subscription_plans(id,name,description,price_cents,currency,is_active)",
        )
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as HomeCreator | null;
    },
  });

  const creator = creatorQuery.data;
  const plans = creator?.subscription_plans?.filter((plan) => plan.is_active) ?? [];
  const plan = plans[0];
  const creatorName = creator?.profiles?.display_name ?? "Criador";
  const creatorUsername = creator?.profiles?.username ?? null;
  const creatorHeadline =
    creator?.headline ?? "Conteúdo exclusivo e experiências para quem faz parte da comunidade.";
  const planLabel = plan?.name || "Assinatura mensal";
  const planPrice = plan ? formatCents(plan.price_cents, plan.currency) : null;
  const creatorInitials = creatorName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <main className="relative min-h-screen overflow-hidden bg-background pt-[78px] text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[radial-gradient(circle_at_78%_8%,rgba(184,76,255,0.10),transparent_38%),radial-gradient(circle_at_8%_36%,rgba(255,79,216,0.05),transparent_34%)]" />

      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center" aria-label="SECRET">
            <img
              src="/secret-logo-dark.svg"
              alt="SECRET — sua comunidade exclusiva"
              className="h-11 w-auto max-w-[200px] sm:h-12 sm:max-w-[260px]"
            />
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <NavLink href="#comunidades">Plataforma</NavLink>
            <NavLink href="#criadores">Para criadores</NavLink>
            <NavLink href="#assinantes">Para assinantes</NavLink>
            <NavLink href="#exclusivo">Conteúdo exclusivo</NavLink>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/feed"
              className="rounded-lg border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm font-semibold transition hover:bg-white/[0.07] sm:px-5"
            >
              Entrar
            </Link>
          </div>
        </div>
      </nav>

      {/* 1. HERO */}
      <section className="relative z-10 mx-auto w-full max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-3.5 py-2 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            Comunidades, conteúdo exclusivo e experiências
          </div>

          <h1 className="font-display text-5xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
            Conecte.
            <br />
            Crie.
            <br />
            <span className="text-gradient-brand">Monetize.</span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
            O espaço exclusivo onde criadores constroem comunidades, publicam conteúdo e criam
            experiências que vão muito além da tela.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <PrimaryCta to="/onboarding">Quero ser criador</PrimaryCta>
            <GhostCta to="/explore">Explorar criadores</GhostCta>
          </div>

          <div className="mt-9 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <MiniProof icon={<ImageIcon className="h-4 w-4" />} text="Conteúdo exclusivo" />
            <MiniProof icon={<Users className="h-4 w-4" />} text="Comunidades" />
            <MiniProof icon={<CreditCard className="h-4 w-4" />} text="Assinaturas" />
          </div>
        </div>

        <div className="relative mx-auto mt-14 w-full max-w-[620px] lg:mt-0">
          <div className="absolute inset-10 rounded-[3rem] bg-brand/[0.07] blur-3xl" />
          <AppWindowMock>
            <div className="grid gap-3 p-3 sm:grid-cols-[132px_1fr] sm:p-4">
              <SidebarMock />
              <div className="space-y-3">
                <CreatorHeaderMock
                  name={creatorName}
                  username={creatorUsername}
                  initials={creatorInitials}
                  headline={creatorHeadline}
                  verified={Boolean(creator?.is_verified)}
                />
                <PlanRowMock label={planLabel} price={planPrice} />
                <PostMock locked={false} />
                <PostMock locked />
              </div>
            </div>
          </AppWindowMock>
        </div>
      </section>

      {/* 2. UMA COMUNIDADE PARA CADA EXPERIÊNCIA */}
      <section id="comunidades" className="relative z-10 border-y border-white/5 bg-white/[0.012]">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <SectionHead
            eyebrow="A plataforma"
            title="Uma comunidade para cada experiência"
            text="O SECRET reúne publicação, comunidade, assinaturas e interação direta em um único produto."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<ImageIcon />}
              title="Conteúdo exclusivo"
              text="Publique fotos, vídeos e experiências privadas para sua comunidade."
            />
            <FeatureCard
              icon={<Users />}
              title="Comunidades"
              text="Construa uma base de assinantes e mantenha sua audiência próxima."
            />
            <FeatureCard
              icon={<CreditCard />}
              title="Assinaturas"
              text="Transforme sua comunidade em uma fonte recorrente de receita."
            />
            <FeatureCard
              icon={<Sparkles />}
              title="Experiências"
              text="Crie experiências exclusivas para seus assinantes."
            />
            <FeatureCard
              icon={<MessageCircle />}
              title="Mensagens"
              text="Conecte-se diretamente com sua comunidade."
            />
            <FeatureCard
              icon={<Video />}
              title="Chamadas"
              text="Ofereça experiências ao vivo quando disponíveis."
            />
          </div>
        </div>
      </section>

      {/* 3. PARA CRIADORES */}
      <section
        id="criadores"
        className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
      >
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
              Para criadores
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Seu conteúdo. Sua comunidade. Seu negócio.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Tenha um espaço próprio para publicar, criar comunidades, oferecer assinaturas e
              transformar sua audiência em uma experiência exclusiva.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <CheckRow text="Publicação de conteúdo" />
              <CheckRow text="Planos de assinatura" />
              <CheckRow text="Gestão de assinantes" />
              <CheckRow text="Finanças" />
              <CheckRow text="Experiências" />
              <CheckRow text="Conteúdo exclusivo" />
            </div>
            <div className="mt-8">
              <PrimaryCta to="/onboarding">Criar minha comunidade</PrimaryCta>
            </div>
          </div>

          <StudioMock planLabel={planLabel} planPrice={planPrice} />
        </div>
      </section>

      {/* 4. PARA ASSINANTES */}
      <section id="assinantes" className="relative z-10 border-y border-white/5 bg-white/[0.012]">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8 lg:py-24">
          <div className="order-2 lg:order-1">
            <AppWindowMock>
              <div className="grid gap-3 p-3 sm:grid-cols-[132px_1fr] sm:p-4">
                <SidebarMock active="Meu feed" />
                <div className="space-y-3">
                  <SearchBarMock />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <CreatorMiniCard
                      name={creatorName}
                      username={creatorUsername}
                      initials={creatorInitials}
                      price={planPrice}
                    />
                    <CreatorMiniCard name="Comunidade" username={null} initials="SE" price={null} />
                  </div>
                  <PostMock locked />
                </div>
              </div>
            </AppWindowMock>
          </div>

          <div className="order-1 lg:order-2">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
              Para assinantes
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Descubra criadores que combinam com você.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Explore comunidades, acompanhe seus criadores favoritos e tenha acesso a conteúdos e
              experiências exclusivas.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {[
                "Meu feed",
                "Explorar",
                "Mensagens",
                "Assinaturas",
                "Vídeos",
                "Fotos",
                "Chamadas",
                "Ofertas",
              ].map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-white/10 bg-white/[0.025] px-3.5 py-2 text-xs font-medium text-muted-foreground"
                >
                  {chip}
                </span>
              ))}
            </div>
            <div className="mt-8">
              <PrimaryCta to="/explore">Explorar criadores</PrimaryCta>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CONTEÚDO EXCLUSIVO */}
      <section
        id="exclusivo"
        className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
      >
        <SectionHead
          eyebrow="Conteúdo exclusivo"
          title="Conteúdo que pertence à comunidade."
          text="Publicações abertas atraem novas pessoas. As exclusivas ficam reservadas para quem faz parte."
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <div className="space-y-3">
            <MockLabel>Publicação aberta</MockLabel>
            <PostMock locked={false} large />
          </div>
          <div className="space-y-3">
            <MockLabel>Publicação exclusiva</MockLabel>
            <PostMock locked large price={planPrice} />
          </div>
        </div>
      </section>

      {/* 6. ASSINATURAS */}
      <section className="relative z-10 border-y border-white/5 bg-white/[0.012]">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
              Assinaturas
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Transforme seguidores em uma comunidade.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Cada criador define seus próprios planos, benefícios e o que fica reservado para
              assinantes.
            </p>
            <div className="mt-7 space-y-3">
              <CheckRow text="Plano de assinatura definido pelo criador" />
              <CheckRow text="Benefícios e conteúdo exclusivo" />
              <CheckRow text="Comunidade e acesso contínuo" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.02] p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs text-muted-foreground">{planLabel}</div>
                <div className="mt-1 font-display text-2xl font-semibold">
                  {planPrice ?? "Definido pelo criador"}
                </div>
              </div>
              <span className="rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-[11px] font-medium text-brand">
                Comunidade
              </span>
            </div>
            <div className="mt-6 space-y-3 border-t border-white/[0.06] pt-6">
              <CheckRow text="Acesso a todo o conteúdo exclusivo" />
              <CheckRow text="Mensagens com o criador" />
              <CheckRow text="Experiências quando disponíveis" />
              <CheckRow text="Suporte à comunidade" />
            </div>
            <div className="mt-6 rounded-xl bg-brand px-5 py-3 text-center text-sm font-semibold text-brand-foreground">
              Assinar comunidade
            </div>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Valores e benefícios são definidos por cada criador.
            </p>
          </div>
        </div>
      </section>

      {/* 7. PRODUTO */}
      <section className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <SectionHead
          eyebrow="O produto"
          title="Tudo conectado em um só aplicativo."
          text="Feed, perfil do criador, publicações, assinatura e Creator Studio — a mesma experiência no desktop e no celular."
        />
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          <ProductTile title="Feed" icon={<LayoutDashboard className="h-4 w-4" />}>
            <PostMock locked={false} compact />
            <PostMock locked compact />
          </ProductTile>
          <ProductTile title="Perfil do criador" icon={<Users className="h-4 w-4" />}>
            <CreatorHeaderMock
              name={creatorName}
              username={creatorUsername}
              initials={creatorInitials}
              headline={creatorHeadline}
              verified={Boolean(creator?.is_verified)}
            />
            <PlanRowMock label={planLabel} price={planPrice} />
          </ProductTile>
          <ProductTile title="Creator Studio" icon={<Wallet className="h-4 w-4" />}>
            <StudioStatRow />
            <PlanRowMock label={planLabel} price={planPrice} />
          </ProductTile>
        </div>
      </section>

      {/* 8. CTA FINAL */}
      <section className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(184,76,255,0.16),transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.008))] px-6 py-14 text-center sm:px-12">
          <Sparkles className="mx-auto h-7 w-7 text-brand" />
          <h2 className="mx-auto mt-5 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Crie algo que as pessoas queiram fazer parte.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            Construa sua comunidade no SECRET.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <PrimaryCta to="/onboarding">Começar como criador</PrimaryCta>
            <GhostCta to="/explore">Explorar criadores</GhostCta>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="relative z-10 border-t border-white/5">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
            <div>
              <img
                src="/secret-logo-dark.svg"
                alt="SECRET — sua comunidade exclusiva"
                className="h-12 w-auto max-w-[220px]"
              />
              <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
                Uma nova forma de criar comunidades, publicar conteúdo exclusivo e viver
                experiências.
              </p>
              <div className="mt-5">
                <LanguageSwitcher compact />
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              <FooterCol title="Plataforma">
                <FooterRouteLink to="/explore">Explorar</FooterRouteLink>
                <FooterRouteLink to="/onboarding">Criadores</FooterRouteLink>
                <FooterAnchor href="#comunidades">Assinaturas</FooterAnchor>
              </FooterCol>
              <FooterCol title="SECRET">
                <FooterAnchor href="#comunidades">Sobre</FooterAnchor>
                <FooterAnchor href="#criadores">Para criadores</FooterAnchor>
                <FooterAnchor href="#assinantes">Para assinantes</FooterAnchor>
              </FooterCol>
              <FooterCol title="Legal e ajuda">
                <FooterAnchor href="#exclusivo">Termos</FooterAnchor>
                <FooterAnchor href="#exclusivo">Privacidade</FooterAnchor>
                <FooterAnchor href="#exclusivo">Suporte</FooterAnchor>
              </FooterCol>
            </div>
          </div>

          <div className="mt-10 border-t border-white/5 pt-6 text-xs text-muted-foreground">
            © {new Date().getFullYear()} SECRET. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ---------- building blocks ---------- */

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-white/[0.03] hover:text-foreground"
    >
      {children}
    </a>
  );
}

function PrimaryCta({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-brand-foreground shadow-[0_16px_36px_-20px_rgba(184,76,255,0.55)] transition hover:-translate-y-0.5"
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

function GhostCta({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] px-6 py-3.5 text-sm font-semibold transition hover:bg-white/[0.05]"
    >
      {children}
    </Link>
  );
}

function SectionHead({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">{eyebrow}</div>
      <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">{text}</p>
    </div>
  );
}

function MiniProof({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] text-brand">
        {icon}
      </span>
      {text}
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.018] p-6 transition hover:-translate-y-0.5 hover:border-brand/20">
      <div className="flex size-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-brand">
        {icon}
      </div>
      <h3 className="mt-5 font-display text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

function CheckRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
        <Check className="h-3.5 w-3.5" />
      </span>
      {text}
    </div>
  );
}

function MockLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </div>
  );
}

function AppWindowMock({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.025] p-2.5 shadow-2xl backdrop-blur-xl">
      <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#0a0910]">
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <img src="/secret-mark.svg" alt="" className="h-7 w-7 rounded-lg" />
            <span className="font-display text-xs font-semibold tracking-[0.2em]">SECRET</span>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-medium text-muted-foreground">
            EXCLUSIVO
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

const SIDEBAR_ITEMS = [
  { label: "Meu feed", icon: LayoutDashboard },
  { label: "Explorar", icon: Compass },
  { label: "Mensagens", icon: MessageCircle },
  { label: "Assinaturas", icon: CreditCard },
  { label: "Chamadas", icon: Video },
];

function SidebarMock({ active = "Explorar" }: { active?: string }) {
  return (
    <aside className="hidden rounded-2xl border border-white/[0.06] bg-white/[0.015] p-2.5 sm:block">
      <div className="space-y-1">
        {SIDEBAR_ITEMS.map(({ label, icon: Icon }) => {
          const isActive = label === active;
          return (
            <div
              key={label}
              className={
                isActive
                  ? "flex items-center gap-2 rounded-xl border border-brand/20 bg-brand/10 px-2.5 py-2 text-[11px] font-medium text-brand"
                  : "flex items-center gap-2 rounded-xl px-2.5 py-2 text-[11px] text-muted-foreground"
              }
            >
              <Icon className="size-3.5" />
              {label}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function SearchBarMock() {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2.5 text-[11px] text-muted-foreground">
      <Search className="size-3.5" />
      Buscar criadores e comunidades
    </div>
  );
}

function CreatorHeaderMock({
  name,
  username,
  initials,
  headline,
  verified,
}: {
  name: string;
  username: string | null;
  initials: string;
  headline: string;
  verified: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
      <div className="h-14 bg-[linear-gradient(120deg,rgba(184,76,255,0.35),rgba(255,79,216,0.16))]" />
      <div className="-mt-6 px-4 pb-4">
        <div className="flex size-12 items-center justify-center rounded-full border-2 border-[#0a0910] bg-white/[0.06] font-display text-sm">
          {initials || "SE"}
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold">{name}</span>
          {verified ? <BadgeCheck className="size-3.5 text-brand" /> : null}
        </div>
        <div className="text-[11px] text-muted-foreground">
          {username ? `@${username}` : "Perfil público"}
        </div>
        <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-muted-foreground">{headline}</p>
      </div>
    </div>
  );
}

function PlanRowMock({ label, price }: { label: string; price: string | null }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-black/20 p-3.5">
      <div className="min-w-0">
        <div className="text-[11px] text-muted-foreground">{label}</div>
        <div className="mt-0.5 truncate text-sm font-semibold">
          {price ?? "Definido pelo criador"}
        </div>
      </div>
      <span className="shrink-0 rounded-lg bg-brand px-3.5 py-2 text-[11px] font-semibold text-brand-foreground">
        Assinar
      </span>
    </div>
  );
}

function PostMock({
  locked,
  large = false,
  compact = false,
  price,
}: {
  locked: boolean;
  large?: boolean;
  compact?: boolean;
  price?: string | null;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0d14]">
      <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-3.5 py-3">
        <span className="flex size-8 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-semibold">
          SE
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-semibold">Publicação</div>
          <div className="text-[10px] text-muted-foreground">Comunidade SECRET</div>
        </div>
        {locked ? (
          <span className="flex items-center gap-1 rounded-full border border-brand/20 bg-brand/10 px-2 py-1 text-[10px] font-medium text-brand">
            <Lock className="size-2.5" /> Exclusivo
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full border border-white/10 px-2 py-1 text-[10px] text-muted-foreground">
            <Sparkles className="size-2.5" /> Aberto
          </span>
        )}
      </div>

      {locked ? (
        <div
          className={`relative px-5 text-center ${large ? "py-14" : compact ? "py-7" : "py-9"} bg-[radial-gradient(circle_at_50%_15%,rgba(184,76,255,0.16),transparent_52%)]`}
        >
          <div className="mx-auto flex size-11 items-center justify-center rounded-full border border-brand/20 bg-brand/10 text-brand">
            <LockKeyhole className="size-4" />
          </div>
          <p className="mt-3 text-sm font-semibold">Conteúdo exclusivo para assinantes</p>
          <p className="mx-auto mt-1 max-w-xs text-[11px] leading-5 text-muted-foreground">
            Assine a comunidade para desbloquear fotos, vídeos e experiências.
          </p>
          <span className="mt-4 inline-block rounded-xl bg-brand px-4 py-2 text-[11px] font-semibold text-brand-foreground">
            {price ? `Assinar por ${price}` : "Assinar comunidade"}
          </span>
        </div>
      ) : (
        <div className="p-3.5">
          <div
            className={`relative flex items-center justify-center overflow-hidden rounded-xl border border-white/[0.06] bg-[linear-gradient(140deg,rgba(184,76,255,0.20),rgba(10,9,16,0.9))] ${
              large ? "h-52" : compact ? "h-20" : "h-28"
            }`}
          >
            <span className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white/80">
              <Play className="size-3.5" />
            </span>
          </div>
          <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
            Bastidores, novidades e conteúdo aberto para toda a comunidade.
          </p>
          <div className="mt-3 flex items-center gap-4 border-t border-white/[0.06] pt-2.5 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="size-3" /> Curtir
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="size-3" /> Comentar
            </span>
          </div>
        </div>
      )}
    </article>
  );
}

function StudioStatRow() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {[
        { label: "Assinantes", icon: Users },
        { label: "Publicações", icon: ImageIcon },
        { label: "Finanças", icon: Wallet },
      ].map(({ label, icon: Icon }) => (
        <div
          key={label}
          className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-center"
        >
          <Icon className="mx-auto size-3.5 text-brand" />
          <div className="mt-2 text-[10px] text-muted-foreground">{label}</div>
        </div>
      ))}
    </div>
  );
}

function StudioMock({ planLabel, planPrice }: { planLabel: string; planPrice: string | null }) {
  return (
    <div className="relative">
      <div className="absolute inset-10 rounded-[3rem] bg-brand/[0.06] blur-3xl" />
      <AppWindowMock>
        <div className="space-y-3 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
            <div>
              <div className="text-[11px] text-muted-foreground">Creator Studio</div>
              <div className="mt-0.5 text-sm font-semibold">Visão geral</div>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] text-muted-foreground">
              Criador
            </span>
          </div>

          <StudioStatRow />

          <div className="grid gap-3 sm:grid-cols-2">
            <StudioItem icon={<ImageIcon className="size-3.5" />} title="Publicar conteúdo" text="Fotos, vídeos e posts exclusivos." />
            <StudioItem icon={<CreditCard className="size-3.5" />} title="Planos" text="Crie e edite assinaturas." />
            <StudioItem icon={<Users className="size-3.5" />} title="Assinantes" text="Acompanhe sua comunidade." />
            <StudioItem icon={<Sparkles className="size-3.5" />} title="Experiências" text="Ofertas exclusivas da comunidade." />
          </div>

          <PlanRowMock label={planLabel} price={planPrice} />
        </div>
      </AppWindowMock>
    </div>
  );
}

function StudioItem({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5">
      <span className="flex size-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-brand">
        {icon}
      </span>
      <div className="mt-3 text-xs font-semibold">{title}</div>
      <div className="mt-1 text-[10px] leading-4 text-muted-foreground">{text}</div>
    </div>
  );
}

function CreatorMiniCard({
  name,
  username,
  initials,
  price,
}: {
  name: string;
  username: string | null;
  initials: string;
  price: string | null;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
      <div className="h-10 bg-[linear-gradient(120deg,rgba(184,76,255,0.28),rgba(255,79,216,0.12))]" />
      <div className="-mt-5 px-3 pb-3">
        <div className="flex size-10 items-center justify-center rounded-full border-2 border-[#0a0910] bg-white/[0.06] text-[10px] font-semibold">
          {initials || "SE"}
        </div>
        <div className="mt-2 truncate text-xs font-semibold">{name}</div>
        <div className="truncate text-[10px] text-muted-foreground">
          {username ? `@${username}` : "Comunidade"}
        </div>
        <div className="mt-2 text-[10px] text-muted-foreground">
          {price ? `a partir de ${price}` : "Planos definidos pelo criador"}
        </div>
      </div>
    </div>
  );
}

function ProductTile({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.018] p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <span className="text-brand">{icon}</span>
        {title}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/80">
        {title}
      </div>
      <div className="mt-4 flex flex-col gap-2.5 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

function FooterAnchor({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="transition hover:text-foreground">
      {children}
    </a>
  );
}

function FooterRouteLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="transition hover:text-foreground">
      {children}
    </Link>
  );
}
