# Checklist - Fase 0 (Base Web)

Objetivo: registrar de forma objetiva o status da base tecnica inicial do `resenha-web`.

## Escopo minimo da fase 0

- [x] Scaffold web com `Vite + React + TypeScript`
- [x] Estrutura inicial `app/shared/modules`
- [x] Tailwind CSS configurado como camada base
- [x] Estilos globais e tokens visuais iniciais
- [x] PWA base com manifesto, icones, metadados e service worker simples
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
  - [x] `PasswordField`
  - [x] `Label`
  - [x] `Select`
  - [x] `Checkbox`
  - [x] `Card`
  - [x] `Dialog`
  - [x] `Spinner`
  - [x] `LoadingState`
  - [x] `Alert`
  - [x] `EmptyState`
  - [x] `ErrorState`
  - [x] `AppContainer`
  - [x] `PageHeader`
- [x] Testes unitarios base com `Vitest`
- [x] Teste estrutural de rota protegida
- [x] Estrutura E2E base com `Playwright`
- [x] CI base com lint, testes e build

## Fora de escopo da fase 0 (ainda pendente)

- [ ] Login real com backend
- [ ] Cadastro real com backend
- [ ] Recuperacao/redefinicao real de senha
- [ ] Chamadas de dominio (home, grupos, partidas, perfil)
- [ ] Tratamento de permissao por regra de negocio
- [ ] Componentes de dominio
- [ ] Shell completo de aplicacao
- [ ] Testes E2E completos dos fluxos web de negocio

## Validacao tecnica da fase 0

- [x] `npm run build` sem erro
- [x] `npm run lint` sem erro
- [x] `npm run test` sem erro
- [x] Estrutura `npm run test:e2e` preparada
- [x] Sem alteracao de contrato de API

## Observacoes tecnicas registradas

- O build Vite emite aviso de chunk acima de 500 kB. O ajuste de code splitting fica registrado para fase futura de performance, sem tuning antecipado na Fase 0.
