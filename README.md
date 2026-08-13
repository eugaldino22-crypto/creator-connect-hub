# SECRET

A SECRET é uma plataforma global de assinatura e comunidade para criadores. O produto conecta criadores e assinantes em uma experiência premium, mobile-first e preparada para escalar.

## Produto

O projeto contempla quatro experiências principais:

1. **Assinante** — descobrir criadores, acompanhar conteúdo, assinar comunidades e conversar.
2. **Criador** — criar perfil, definir planos, publicar conteúdo, acompanhar assinantes e administrar receita.
3. **Admin** — operar moderação, suporte, denúncias, transações e saques.
4. **Super Admin** — governança global, papéis, auditoria, segurança, configurações e pagamentos.

A SECRET trabalha com **15% de comissão sobre a receita das assinaturas**, mantendo **85% para o criador**, antes de taxas de processamento e demais encargos aplicáveis e transparentemente divulgados.

## Plataforma

- React + TypeScript + TanStack Start
- Tailwind CSS + shadcn/ui
- Supabase Auth + PostgreSQL + Storage + RLS
- CI com GitHub Actions para lint e build
- Internacionalização com 32 locales e suporte RTL
- Moeda de referência global: USD
- Pagamentos desacoplados, com NOWPayments planejado para cripto e webhooks reais

## Segurança

Conteúdo exclusivo deve permanecer protegido e não pode ficar publicamente acessível apenas por conhecer o caminho do arquivo. Papéis administrativos são protegidos por RLS e guards de rota. Credenciais, chaves privadas, service-role keys e segredos de webhook nunca devem ser armazenados no Git.

## Identidade

A marca oficial do produto é **SECRET**. A identidade visual usa Sora/Inter, fundo escuro e acentos em violeta/magenta, com elementos próprios e sem copiar identidades proprietárias de terceiros.

## Desenvolvimento com Lovable

O projeto é sincronizado com [Lovable](https://lovable.dev). Alterações feitas na branch conectada podem ser sincronizadas com o editor do projeto.

## Desenvolvimento local

```sh
bun install
bun run dev
```

Configure as variáveis de ambiente a partir de `.env.example`.

## Auditoria do repositório

A estrutura atual foi revisada para manter somente arquivos relacionados à SECRET, ao stack da aplicação, ao Supabase, à CI e à integração com Lovable. O registro da auditoria está em `docs/REPOSITORY_AUDIT.md`.
