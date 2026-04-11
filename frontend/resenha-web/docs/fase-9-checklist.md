# Checklist - Fase 9 (Historico de Partidas)

Objetivo: registrar de forma objetiva o que foi entregue na Fase 9 do fluxo historico do modulo `matches` no `resenha-web`.

## Escopo minimo entregue na fase 9

- [x] Contratos, mappers e extensao do `matchesApi` para historico
- [x] Rotas privadas do fluxo:
  - [x] `/groups/:groupId/matches/history`
  - [x] `/matches/:matchId/history`
- [x] Entrada do historico a partir do detalhe do grupo
- [x] Entrada do historico a partir da pagina operacional de partidas do grupo
- [x] Pagina dedicada de listagem historica por grupo
- [x] Filtros locais basicos na listagem historica
- [x] Pagina dedicada de detalhe historico da partida
- [x] Leitura historica clara de:
  - [x] placar
  - [x] vencedor
  - [x] times
  - [x] capitaes
  - [x] estatisticas por jogador
  - [x] premiacoes
  - [x] participacao

## Endpoints consumidos na fase 9

- [x] `GET /api/groups/{groupId}/matches/history`
- [x] `GET /api/matches/{id}/details`

## Comportamento entregue no fluxo historico

- [x] Pagina funcional em `/groups/:groupId/matches/history`
- [x] Pagina funcional em `/matches/:matchId/history`
- [x] Estados de tela tratados na listagem:
  - [x] loading inicial
  - [x] erro total
  - [x] erro parcial em refresh
  - [x] vazio
  - [x] sucesso
- [x] Estados de tela tratados no detalhe:
  - [x] loading inicial
  - [x] erro total
  - [x] erro parcial em refresh
  - [x] vazio seguro
  - [x] sucesso
- [x] Cards da listagem exibindo, no minimo:
  - [x] data
  - [x] status
  - [x] placar
  - [x] capitaes
  - [x] vencedor
  - [x] ocupacao da partida
- [x] Filtro local por `status`
- [x] Busca textual simples sobre a lista carregada
- [x] Acao clara para limpar filtros
- [x] Detalhe historico exibindo, quando disponivel:
  - [x] placar
  - [x] vencedor
  - [x] times e capitaes
  - [x] gols e assistencias por jogador
  - [x] premiacoes
  - [x] confirmados, ausentes e sem resposta

## Decisoes de implementacao mantidas simples

- [x] O backend permanece como fonte de verdade do historico
- [x] O frontend nao recalcula placar
- [x] O frontend nao recalcula vencedor
- [x] O frontend nao recalcula estatisticas
- [x] O frontend nao reconstrui premiacoes
- [x] O frontend nao filtra via nova chamada de API
- [x] Os filtros atuam apenas sobre a lista ja carregada
- [x] O detalhe historico permanece totalmente read-only
- [x] O fluxo historico ficou separado do detalhe operacional da Fase 4

## Como os estados incompletos ficaram seguros

- [x] Partida sem placar continua legivel
- [x] Partida sem times fechados continua legivel
- [x] Partida sem premiacoes continua legivel
- [x] O detalhe historico nao quebra quando algum bloco vier vazio no snapshot

## Acabamento e responsividade da fase

- [x] Leitura historica ajustada para mobile, tablet e desktop
- [x] Consistencia visual entre listagem historica e detalhe historico
- [x] Estados vazios e de erro mantidos claros
- [x] Ajustes visuais isolados ao fluxo historico

## Fora de escopo da fase 9 (pendente)

- [ ] Acoes operacionais no historico
- [ ] Aprovacao, edicao ou exclusao pelo detalhe historico
- [ ] Filtros dependentes do backend
- [ ] Visao global de historico fora do contexto do grupo
- [ ] Testes automatizados especificos do fluxo historico

## Validacao tecnica da fase 9

- [x] Sem alteracao de backend
- [x] Sem alteracao de contrato da API
- [x] Sem recalculo de historico no frontend
- [x] Sem exposicao de acoes operacionais no fluxo historico
- [x] `npm run lint` funcionando nos commits da fase
- [x] `npm run build` funcionando nos commits da fase
