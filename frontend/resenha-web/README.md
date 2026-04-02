# Resenha Web

Frontend web do projeto Resenha, construindo uma base incremental para evolucao das telas e fluxos ja existentes no produto, sem reescrever backend e sem alterar contratos da API.

## 1) Objetivo do `resenha-web`

- criar uma base web organizada para o produto Resenha
- reaproveitar a API atual como fonte de verdade
- separar infraestrutura (router/auth/api/ui) antes de implementar fluxos de dominio
- reduzir risco de regressao com evolucao por fases pequenas

## 2) Stack atual

- `React 19`
- `TypeScript`
- `Vite 8`
- `React Router DOM 7`
- `Axios`
- `ESLint 9`

## 3) Estrutura principal de pastas

```txt
src/
  app/
    App.tsx
    router/
      AppRouter.tsx
      paths.ts
      layouts/
  modules/
    auth/
      context/
      hooks/
      pages/
      routes/
      storage/
      types/
    home/
      api/
      hooks/
      mappers/
      pages/
      types/
    app/
      pages/
    system/
      pages/
  shared/
    components/
      ui/
    lib/
      api/
    styles/
```

### Resumo por camada

- `app/`: bootstrap e roteamento global
- `modules/`: organizacao por dominio/modulo
- `shared/`: componentes reutilizaveis, utilitarios e estilos base

## 4) Como rodar localmente

### Pre-requisitos

- `Node.js 20+` (recomendado)
- `npm`

### Setup

```bash
npm install
```

### Ambiente

Crie um arquivo `.env` com base em `.env.example`:

```bash
VITE_API_BASE_URL=http://localhost:5000
VITE_API_TIMEOUT_MS=10000
```

### Execucao

```bash
npm run dev
```

### Validacao

```bash
npm run lint
npm run build
```

## 5) O que a Fase 0 ja entregou

- scaffold do projeto web com `Vite + React + TypeScript`
- estrutura base `app/shared/modules`
- tokens visuais e estilos globais
- roteamento base com rotas publicas e privadas placeholder:
  - `/login`
  - `/register`
  - `/forgot-password`
  - `/reset-password`
  - `/`
  - `/home`
  - `/groups`
  - `/matches`
  - `/profile`
  - `*` (not found)
- infraestrutura de sessao no frontend:
  - `AuthProvider`
  - `useAuth`
  - `PrivateRoute/PublicRoute`
  - persistencia em `localStorage`
- API client unico:
  - `baseURL` e `timeout` por variavel de ambiente
  - interceptor de token
  - normalizacao de erro para formato interno
- componentes base de UI:
  - `Button`
  - `Input`
  - `Spinner`
  - `Alert`
  - `EmptyState`

Checklist detalhado: [docs/fase-0-checklist.md](./docs/fase-0-checklist.md)

## 6) O que a Fase 1 ja entregou (auth e sessao)

### Fluxos de auth funcionais

- login funcional em `/login`
- cadastro funcional em `/register`
- solicitacao de recuperacao em `/forgot-password`
- validacao de token e redefinicao de senha em `/reset-password`

### Endpoints consumidos atualmente

- `POST /api/users/login`
- `POST /api/users/register`
- `POST /api/users/forgot-password`
- `GET /api/users/reset-password/validate?token=...`
- `POST /api/users/reset-password`

### Comportamento atual de sessao

- sessao carregada na inicializacao via `loadSessionFromStorage()`
- sessao persistida apos `login` e `register`
- sessao removida em `logout`
- storage: `localStorage` com chave `resenha.web.session.v1`
- formato interno de sessao:
  - `accessToken`
  - `userId`
  - `userName`

### Comportamento atual de rotas publicas/privadas

- `PrivateRoute`:
  - sem sessao: redireciona para `/login` e salva rota de origem em `state.from`
  - com sessao: libera rotas privadas
- `PublicRoute`:
  - com sessao: redireciona para `/home`
  - sem sessao: libera rotas publicas de auth

### Validacoes minimas ja existentes

- login:
  - email e senha obrigatorios
- cadastro:
  - `nome`, `email`, `senha`, `posicaoPrincipal`, `peDominante` obrigatorios
  - `nome` com minimo de 2 caracteres
  - `senha` com minimo de 8 caracteres
  - validacao basica de email contendo `@`
  - opcoes de `posicaoPrincipal` e `peDominante` alinhadas ao backend
- forgot password:
  - email obrigatorio
  - validacao basica de email contendo `@`
- reset password:
  - token obrigatorio
  - nova senha com minimo de 8 caracteres
  - exige validacao de token antes de permitir redefinir
  - tenta ler token da query string (`?token=...`) e validar automaticamente

Checklist detalhado: [docs/fase-1-checklist.md](./docs/fase-1-checklist.md)

## 7) O que a Fase 2 ja entregou (home e convites)

### O que a Home ja faz

- Home funcional em `/home` para usuario autenticado
- listagem de grupos do usuario
- listagem de convites pendentes
- atalhos para proximos modulos:
  - `/groups`
  - `/matches`
  - `/profile`
- `Atualizar` manual para recarregar dados da tela

### Endpoints consumidos na fase 2

- `GET /api/groups/me`
- `GET /api/groups/invites/pending`
- `POST /api/groups/invites/{inviteId}/accept`
- `POST /api/groups/invites/{inviteId}/reject`

### Como grupos e convites sao carregados

- o hook `useHomeData` carrega grupos e convites em paralelo no `mount`
- o estado da Home e centralizado em:
  - `status` (`idle | loading | success | error`)
  - `error`
  - `isLoading` (carga inicial)
  - `isRefreshing` (atualizacao manual ou pos-acao)
- o refresh e reutilizado tanto no botao de atualizar quanto apos aceitar/recusar convite

### Como aceitar/recusar convite funciona

- cada convite pendente tem botoes:
  - `Aceitar convite`
  - `Recusar convite`
- durante a acao:
  - loading por item
  - bloqueio de clique duplicado no mesmo convite
- apos sucesso:
  - refresh automatico da Home
  - consistencia entre lista de grupos e lista de convites
- em falha:
  - erro normalizado exibido na tela, sem navegacao inesperada

### Como a entrada autenticada ficou

- usuario autenticado em `/` e redirecionado para `/home`
- Home permanece a porta de entrada principal da area autenticada
- rotas publicas continuam redirecionando para `/home` quando ja existe sessao

### Estados de tela tratados na Home

- loading inicial
- erro total (sem dados)
- erro parcial (com dados anteriores ja carregados)
- vazio de grupos
- vazio de convites
- sucesso com listagens

Checklist detalhado: [docs/fase-2-checklist.md](./docs/fase-2-checklist.md)

## 8) O que ainda nao existe (proximas fases)

- evolucao dos modulos de dominio alem da Home inicial (grupos, partidas e perfil funcionais)
- componentes de dominio adicionais e estados mais detalhados por modulo
- refinamento de UX para auth (mascaras, validacoes mais robustas, textos de ajuda por campo)
- suporte aos campos opcionais de cadastro no web (`goleiro`, `timeCoracaoCodigo`)
- shell de aplicacao mais completo para area autenticada
- testes automatizados de auth e sessoes no frontend web
- testes automatizados da Home e convites no frontend web
- hardening de acessibilidade e responsividade por fluxo/modulo

## Observacoes de escopo atual

- backend nao foi alterado por esta base web
- contratos da API nao foram alterados
- regras de negocio de dominio fora de auth ainda nao foram implementadas no frontend web
