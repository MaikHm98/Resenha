# Checklist - Fase 0 (Base Web)

Objetivo: registrar de forma objetiva o status da base tecnica inicial do `resenha-web`.

## Escopo minimo da fase 0

- [x] Scaffold web com `Vite + React + TypeScript`
- [x] Estrutura inicial `app/shared/modules`
- [x] Estilos globais e tokens visuais iniciais
- [x] Roteamento base com rotas publicas e privadas placeholder
- [x] `AuthProvider` + `useAuth` + `PrivateRoute/PublicRoute` (infra de sessao)
- [x] API client unico com:
  - [x] `baseURL` por env
  - [x] `timeout` padrao
  - [x] interceptor de token
  - [x] normalizacao de erro
- [x] Componentes base reutilizaveis:
  - [x] `Button`
  - [x] `Input`
  - [x] `Spinner`
  - [x] `Alert`
  - [x] `EmptyState`

## Fora de escopo da fase 0 (ainda pendente)

- [ ] Login real com backend
- [ ] Cadastro real com backend
- [ ] Recuperacao/redefinicao real de senha
- [ ] Chamadas de dominio (home, grupos, partidas, perfil)
- [ ] Tratamento de permissao por regra de negocio
- [ ] Componentes de dominio
- [ ] Shell completo de aplicacao
- [ ] Testes de integracao E2E dos fluxos web

## Validacao tecnica da fase 0

- [x] `npm run build` sem erro
- [x] `npm run lint` sem erro
- [x] Sem alteracao de backend
- [x] Sem alteracao de contrato de API
