# Modo QA / Preview (somente desenvolvimento)

## 1. Arquivos alterados/criados

Novos (todos DEV-only):
- `src/lib/qa-preview.ts` — estado do modo QA (role de visualização, desbloqueio de conteúdo), guardado em `sessionStorage`.
- `src/lib/dev-mocks.ts` — dados mock isolados (criador, posts, planos, métricas) usados apenas quando o banco não retorna dados.
- `src/components/dev/QaBar.tsx` — barra discreta "DEV / QA" com seletor de perfil, alternância de conteúdo bloqueado/desbloqueado, larguras desktop/tablet/mobile e link para o Mapa de telas.
- `src/components/dev/ScreenMap.tsx` — painel "Mapa de telas" com todas as rotas existentes agrupadas por perfil.

Alterados:
- `src/hooks/use-session.ts` — as roles retornadas passam pela camada de preview (apenas em DEV).
- `src/components/layout/AppShell.tsx` — renderiza a `QaBar` em DEV.
- `src/routes/$section.tsx` — nova seção `qa` (usa a rota existente `/$section`, sem criar rota nova) que mostra o Mapa de telas.
- `src/routes/feed.tsx` — o redirect automático creator→/studio passa a respeitar o perfil de preview em DEV.
- `src/routes/c/$username.tsx` — fallback para criador mock em DEV/QA quando não existe criador publicado.

## 2. Como o QA mode é ativado
`import.meta.env.DEV` é a única condição. Em produção as flags são `false`, a barra e o mapa não renderizam e o código é eliminado no build.

## 3. Troca de perfil
A `QaBar` grava a role de visualização em `sessionStorage` e emite um evento; hooks assinam esse evento. Nada é gravado no banco e nenhuma chamada Supabase é alterada — apenas a lista de roles usada pela UI/RoleGate no cliente em DEV.

## 4. Isolamento dos mocks
Mocks vivem só em `src/lib/dev-mocks.ts` e são usados exclusivamente quando `DEV + QA ativo + consulta real vazia`. Dados reais sempre têm prioridade.

## 5. Proteção de produção
- `RoleGate` continua no lugar em todas as rotas.
- RLS, Auth, `user_roles`, políticas e Storage não são tocados.
- O preview é apenas visual: qualquer dado protegido continua bloqueado pelo backend; por isso os mocks existem para preencher telas vazias.
