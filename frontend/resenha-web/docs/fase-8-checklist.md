# Checklist - Fase 8 (Votacao)

Objetivo: registrar de forma objetiva o que foi entregue na Fase 8 do fluxo de votacao do modulo `matches` no `resenha-web`.

## Escopo minimo entregue na fase 8

- [x] Contratos, mappers e extensao do `matchesApi` para votacao
- [x] Rota privada do fluxo:
  - [x] `/matches/:matchId/vote`
- [x] Pagina dedicada de votacao ancorada em `matches`
- [x] Entrada do fluxo a partir do detalhe da partida
- [x] Leitura do status atual da votacao
- [x] Abertura conjunta da votacao para `MVP` e `BOLA_MURCHA`
- [x] Registro de voto por rodada
- [x] Encerramento/apuracao da rodada para admin
- [x] Exibicao do historico das rodadas devolvido pelo backend
- [x] Aprovacao final da votacao para admin

## Endpoints consumidos na fase 8

- [x] `GET /api/groups/me`
- [x] `GET /api/matches/{id}/details`
- [x] `GET /api/matches/{id}/vote`
- [x] `POST /api/matches/{id}/vote/open`
- [x] `POST /api/matches/{id}/vote`
- [x] `POST /api/matches/{id}/vote/close`
- [x] `POST /api/matches/{id}/vote/approve`

## Comportamento entregue no fluxo de votacao

- [x] Pagina funcional em `/matches/:matchId/vote`
- [x] Estados de tela tratados:
  - [x] loading inicial
  - [x] erro total
  - [x] erro parcial
  - [x] sucesso
- [x] Snapshot atual separado por tipo:
  - [x] `mvp`
  - [x] `bolaMurcha`
  - [x] `mvpHistorico`
  - [x] `bolaMurchaHistorico`
- [x] Leitura do estado atual exibindo, quando o backend devolver:
  - [x] rodada atual
  - [x] status da rodada
  - [x] candidatos
  - [x] contagem de votos
  - [x] vencedor provisorio
- [x] Registro de voto com payload fiel ao backend:
  - [x] `tipo`
  - [x] `idUsuarioVotado`
- [x] Encerramento/apuracao por tipo sem reconstruir empate ou nova rodada
- [x] Historico exibido em modo leitura, separado por `MVP` e `BOLA_MURCHA`
- [x] Aprovacao final por tipo, restrita ao admin

## Valores reais preservados no frontend

- [x] Tipos de votacao:
  - [x] `MVP`
  - [x] `BOLA_MURCHA`
- [x] Status da rodada:
  - [x] `ABERTA`
  - [x] `ENCERRADA`
  - [x] `APURADA`
  - [x] `APROVADA`

## Decisoes de implementacao mantidas simples

- [x] O backend permanece como fonte de verdade para abertura conjunta de `MVP` e `BOLA_MURCHA`
- [x] O frontend nao infere se o usuario ja votou antes do backend responder
- [x] O frontend nao infere elegibilidade alem do que o snapshot devolve
- [x] O frontend nao reconstrui empate, nova rodada ou historico
- [x] O frontend nao infere vencedor final alem do snapshot
- [x] O frontend nao recalcula classificacao, pontuacao ou qualquer efeito colateral da aprovacao
- [x] Cada acao faz refresh completo do snapshot apos sucesso

## Como o fluxo administrativo ficou protegido

- [x] Abertura restrita ao admin
- [x] Encerramento/apuracao restrito ao admin
- [x] Aprovacao final restrita ao admin
- [x] A visibilidade da acao administrativa continua derivada do contexto real do usuario no grupo

## Fora de escopo da fase 8 (pendente)

- [ ] Indicador estruturado de "usuario ja votou" vindo do backend
- [ ] Filtros ou abas mais ricas por tipo de votacao
- [ ] Historico detalhado fora do snapshot da votacao
- [ ] Melhorias visuais especificas para desempate alem do que o backend ja devolve
- [ ] Testes automatizados do fluxo de votacao

## Validacao tecnica da fase 8

- [x] Sem alteracao de backend
- [x] Sem alteracao de contrato da API
- [x] Sem inferencia de voto duplicado, empate, vencedor ou aprovacao fora do snapshot
- [x] Sem recalculo de classificacao no frontend
- [x] `npm run lint` funcionando nos commits da fase
- [x] `npm run build` funcionando nos commits da fase
