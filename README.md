# SECRET

A SECRET é uma plataforma própria de assinatura e comunidade para criadores. O produto foi estruturado para conectar criadores e assinantes em uma experiência premium, mobile-first e preparada para escalar.

## MVP

O produto contempla três experiências principais:

1. **Assinante** — descobrir criadores, acompanhar conteúdo e assinar comunidades.
2. **Criador** — criar perfil, definir planos, publicar conteúdo e acompanhar assinantes e receita.
3. **Administrador** — moderar usuários, criadores, conteúdo, denúncias, transações e saques.

### Fluxo principal

Criador cria perfil → define assinatura → publica conteúdo → assinante descobre → assina → acessa conteúdo exclusivo → plataforma registra receita, comissão e saldo do criador.

A SECRET trabalha com **15% de comissão sobre a receita das assinaturas**, mantendo **85% para o criador**, com taxas de processamento e demais encargos tratados de forma transparente conforme o gateway e a operação.

## Segurança

A aplicação usa Supabase para autenticação, PostgreSQL, Storage e RLS. Conteúdo exclusivo deve permanecer protegido e não pode ficar publicamente acessível apenas porque alguém conhece o caminho do arquivo.

## Design

A identidade da SECRET é própria, premium e moderna, com foco em experiência mobile, conteúdo visual e comunidades. A interface usa Sora/Inter, fundo escuro e acentos em violeta/magenta.

## Regras de produto

- Não copiar identidade, logo ou elementos proprietários de outras plataformas.
- Não criar pagamentos falsos; a integração deve permanecer desacoplada até a configuração de um gateway real.
- Não expor conteúdo privado.
- A plataforma é neutra e pode atender diferentes categorias de criadores.
- Não usar dados fictícios como se fossem dados reais de produção.
- Priorizar componentes reutilizáveis, segurança e uma experiência funcional.

## Desenvolvimento com Lovable

Este projeto é sincronizado com o [Lovable](https://lovable.dev).

Continue desenvolvendo no [editor do projeto](https://lovable.dev/projects/b78b2fec-9703-4066-84e5-331ed50f9245).

As alterações feitas no Lovable são sincronizadas com este repositório.

## Desenvolvimento local

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
