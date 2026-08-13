# Creator Connect Hub

Vamos construir uma plataforma própria de assinatura de criadores, inspirada no modelo de plataformas como OnlyFans, mas com identidade e código próprios. Comece pelo MVP completo e profissional, preparado para escalar. Use React + TypeScript + Tailwind + shadcn/ui e Supabase para autenticação, PostgreSQL, Storage e RLS. A plataforma deve ter três experiências: 1) assinante, 2) criador, 3) administrador.

OBJETIVO DO MVP:
Criador cria perfil, define assinatura, publica conteúdo gratuito ou exclusivo, assinante descobre criadores, assina um plano e acessa conteúdo exclusivo. A plataforma registra receitas, comissão e saldo do criador. Pagamentos devem ficar preparados para integração com gateway depois, sem inventar credenciais ou pagamentos falsos.

TELAS INICIAIS:
- Landing page premium explicando a plataforma
- Login e cadastro
- Onboarding para escolher tipo de conta: Assinante ou Criador
- Feed/Explore de criadores
- Perfil público do criador
- Checkout/assinatura em estado pronto para integração
- Feed do assinante
- Área de assinaturas
- Área de mensagens
- Dashboard do criador
- Criar publicação
- Gestão de assinantes
- Financeiro do criador
- Configurações do criador
- Painel administrativo
- Moderação de usuários, criadores, publicações e denúncias

BANCO DE DADOS:
Modele corretamente entidades para profiles, creator_profiles, subscription_plans, subscriptions, posts, post_media, likes, comments, follows, conversations, messages, transactions, creator_balances, payout_requests, reports e notifications. Use UUIDs, timestamps, foreign keys, índices e RLS. O usuário só deve acessar os dados permitidos pelo seu papel. Conteúdo exclusivo não pode ficar publicamente acessível apenas por conhecer a URL do arquivo.

DESIGN:
Crie uma identidade própria, premium e moderna, sem copiar logo, nome ou elementos proprietários de outras plataformas. Interface mobile-first, excelente no iPhone, com navegação inferior no mobile e sidebar no desktop. Visual sofisticado, limpo e comercial, com foco em criadores e conteúdo. Use cards elegantes, avatares, capa de perfil, feed visual e estados de carregamento/vazio/erro bem feitos.

REGRAS:
- Não usar dados fictícios como se fossem reais em produção.
- Não criar pagamentos falsos; deixar integração claramente preparada.
- Não deixar conteúdo privado exposto.
- Não implementar conteúdo adulto automaticamente; a plataforma deve ser neutra e adequada para diferentes categorias de criadores.
- Criar componentes reutilizáveis e arquitetura organizada.
- Priorizar uma experiência realmente funcional, não apenas uma demonstração visual.
- Se alguma decisão de produto for necessária, escolha a opção mais simples e segura para o MVP.

Primeiro implemente a fundação completa do MVP: estrutura de rotas, autenticação, banco/Supabase, perfis e papéis, layout responsivo, Explore, perfil do criador, feed, dashboard do criador e painel administrativo. Deixe os pagamentos desacoplados e prontos para conectar a um gateway na próxima etapa. Ao final, informe exatamente o que foi implementado e o que ficou preparado para a próxima etapa.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b78b2fec-9703-4066-84e5-331ed50f9245).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
