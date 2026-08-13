import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Check, LockKeyhole, Sparkles, Users } from "lucide-react";
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_18%,rgba(184,76,255,0.16),transparent_30%),radial-gradient(circle_at_20%_80%,rgba(255,79,216,0.09),transparent_28%)]" />

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
          <Link
            to="/"
            className="hidden rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground sm:inline-flex"
          >
            Para criadores
          </Link>

          <LanguageSwitcher compact />

          <Link
            to="/auth"
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold transition hover:bg-white/[0.08] sm:px-5"
          >
            Entrar
          </Link>
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-88px)] w-full max-w-7xl items-center gap-14 px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-28">
        <div className="max-w-2xl">
          <div className="mb-7 inline-flex max-w-full items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-2 text-xs font-medium text-brand">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            Uma nova forma de criar comunidades
          </div>

          <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            Conecte. Crie.
            <span className="mt-2 block text-gradient-brand">Monetize.</span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
            O espaço exclusivo onde criadores transformam audiência em comunidade,
            conteúdo e receita recorrente — com uma experiência feita para o celular.
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
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold transition hover:bg-white/[0.08]"
            >
              Conhecer a SECRET
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-brand" /> Sem mensalidade para criadores</span>
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-brand" /> 85% da receita para o criador</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[470px]">
          <div className="absolute -inset-8 rounded-[3rem] bg-brand/10 blur-3xl" />
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
                <div className="rounded-full bg-brand/10 px-3 py-1 text-[10px] font-medium text-brand">PRO</div>
              </div>

              <div className="px-5 pb-5">
                <div className="rounded-2xl bg-gradient-to-br from-violet-500/30 via-fuchsia-500/10 to-white/[0.03] p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 font-display text-lg">LM</div>
                    <div>
                      <div className="font-semibold">Luna Martins</div>
                      <div className="text-xs text-muted-foreground">@lunamartins · Criador premium</div>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-6 text-white/75">
                    Bastidores, dicas e conteúdo exclusivo para quem faz parte da minha comunidade.
                  </p>
                  <div className="mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Assinatura mensal</div>
                      <div className="mt-1 text-lg font-semibold">R$ 19,90</div>
                    </div>
                    <div className="rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-brand-foreground">Assinar</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <LockKeyhole className="h-4 w-4 text-brand" />
                    <div className="mt-3 text-sm font-medium">Conteúdo exclusivo</div>
                    <div className="mt-1 text-xs text-muted-foreground">Acesso para assinantes</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <Users className="h-4 w-4 text-brand" />
                    <div className="mt-3 text-sm font-medium">Comunidade</div>
                    <div className="mt-1 text-xs text-muted-foreground">Relacionamento direto</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-t border-white/5 bg-black/10">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-16 sm:px-6 sm:grid-cols-3 lg:px-8">
          <Feature title="Assinaturas recorrentes" text="Crie planos e transforme sua comunidade em receita previsível." />
          <Feature title="Conteúdo exclusivo" text="Publique para todos ou libere experiências especiais para assinantes." />
          <Feature title="Você fica com 85%" text="A SECRET trabalha com uma comissão de 15% sobre a receita das assinaturas." />
        </div>
      </section>

      <footer className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-3 border-t border-white/5 px-4 py-8 text-xs text-muted-foreground sm:px-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div className="tracking-[0.18em]">SECRET</div>
        <div>Sua comunidade. Seu conteúdo. Seu espaço.</div>
      </footer>
    </main>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-6">
      <h2 className="font-display text-base font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}
