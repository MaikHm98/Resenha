# Checklist - Fase 2 (Home e Convites)

Objetivo: registrar de forma objetiva o que foi entregue na Fase 2 da Home autenticada no `resenha-web`.

## Escopo minimo da fase 2

- [x] Contratos da Home e convites tipados no frontend
- [x] Servico `homeApi` com endpoints de grupos e convites
- [x] Hook `useHomeData` para estado da Home com:
  - [x] carga inicial de grupos e convites
  - [x] refresh manual
  - [x] estados previsiveis (`loading`, `error`, `success`)
  - [x] acoes de aceitar/recusar convite
- [x] Home funcional em `modules/home/pages/HomePage.tsx`
- [x] Listagem de grupos do usuario
- [x] Listagem de convites pendentes
- [x] Acoes por convite:
  - [x] aceitar convite
  - [x] recusar convite
  - [x] loading por item
  - [x] bloqueio de clique duplicado no mesmo convite
  - [x] refresh apos sucesso
- [x] Tratamento de estados de tela:
  - [x] loading inicial
  - [x] erro total
  - [x] erro parcial
  - [x] vazio
  - [x] sucesso
- [x] Entrada autenticada revisada:
  - [x] `/` redireciona para `/home` quando usuario autenticado
  - [x] Home como porta de entrada principal
  - [x] atalhos claros para `/groups`, `/matches` e `/profile`

## Endpoints consumidos na fase 2

- [x] `GET /api/groups/me`
- [x] `GET /api/groups/invites/pending`
- [x] `POST /api/groups/invites/{inviteId}/accept`
- [x] `POST /api/groups/invites/{inviteId}/reject`

## Comportamento da Home e convites

- [x] Grupos e convites carregam em paralelo no `mount`
- [x] Botao `Atualizar` recarrega dados sem resetar arquitetura
- [x] Aceitar/recusar convite nao gera navegacao inesperada
- [x] Mensagens de erro usam normalizacao padrao do frontend

## Fora de escopo da fase 2 (pendente)

- [ ] CRUD completo de grupos
- [ ] Fluxos de partidas
- [ ] Fluxos de perfil
- [ ] Filtros/ordenacoes avancadas na Home
- [ ] Testes automatizados da Home e convites
- [ ] Shell completo da area autenticada

## Validacao tecnica da fase 2

- [x] Sem alteracao de backend
- [x] Sem alteracao de contrato da API
- [x] Build e lint funcionando nos commits da fase
