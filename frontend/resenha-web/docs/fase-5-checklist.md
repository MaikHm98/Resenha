# Checklist - Fase 5 (Capitao)

Objetivo: registrar de forma objetiva o que foi entregue na Fase 5 do modulo `captain` no `resenha-web`.

## Escopo minimo entregue na fase 5

- [x] Contratos, mappers e `captainApi` tipados no frontend
- [x] Rota privada do modulo:
  - [x] `/groups/:groupId/captain`
- [x] Pagina do ciclo de capitao ancorada por grupo
- [x] Leitura do status atual do ciclo
- [x] Tratamento do estado "sem ciclo"
- [x] Abertura de ciclo para admin
- [x] Selecao de partida do grupo como contexto
- [x] Carregamento de elegiveis por partida
- [x] Escolha de desafiante pelo capitao atual
- [x] Registro do resultado do desafio por admin

## Endpoints consumidos na fase 5

- [x] `GET /api/groups/me`
- [x] `GET /api/groups/{groupId}/captain`
- [x] `POST /api/groups/{groupId}/captain/draw`
- [x] `GET /api/groups/{groupId}/matches`
- [x] `GET /api/groups/{groupId}/captain/eligible/{matchId}`
- [x] `POST /api/groups/{groupId}/captain/challenge`
- [x] `POST /api/groups/{groupId}/captain/result`

## Comportamento entregue no modulo `captain`

- [x] Entrada do fluxo a partir do detalhe do grupo
- [x] Leitura do ciclo atual em `/groups/:groupId/captain`
- [x] Estados de tela tratados:
  - [x] loading
  - [x] erro total
  - [x] erro parcial
  - [x] sem ciclo
  - [x] sucesso
- [x] Abertura de ciclo para admin com refresh apos sucesso
- [x] Selecao explicita da partida do grupo para contexto do desafio
- [x] Listagem de elegiveis devolvida pela API
- [x] Escolha de desafiante com refresh apos sucesso
- [x] Registro de resultado com refresh completo apos sucesso

## Decisoes de implementacao mantidas simples

- [x] O modulo segue ancorado no grupo
- [x] O backend permanece como fonte de verdade para elegibilidade, transicao do ciclo e mensagens
- [x] O frontend nao cria contrato novo para "sem ciclo"
- [x] O estado "sem ciclo" e derivado do erro de negocio real de `GET /api/groups/{groupId}/captain`
- [x] `GET /api/groups/{groupId}/matches` e usado apenas como contexto de selecao da partida
- [x] O frontend nao infere elegibilidade no cliente
- [x] Os valores reais preservados no frontend sao:
  - [x] ciclo: `ATIVO | ENCERRADO`
  - [x] resultado: `CAPITAO | DESAFIANTE`

## Estados e seguranca de fluxo

- [x] Usuario nao-admin nao ve a abertura de ciclo
- [x] Usuario nao-admin nao ve o registro de resultado
- [x] Apenas o capitao atual ve o fluxo de escolha de desafiante
- [x] Loading claro para abertura, carga de elegiveis, escolha de desafiante e registro de resultado
- [x] Erros claros sem quebrar a pagina
- [x] Refresh completo apos sucesso nas acoes da fase

## Fora de escopo da fase 5 (pendente)

- [ ] Desafio em andamento
- [ ] Montagem de times e picks
- [ ] Classificacao
- [ ] Votacao
- [ ] Historico dedicado do ciclo de capitao
- [ ] Testes automatizados do modulo `captain`

## Validacao tecnica da fase 5

- [x] Sem alteracao de backend
- [x] Sem alteracao de contrato da API
- [x] Sem duplicacao intencional de regra de negocio no frontend
- [x] `npm run lint` funcionando nos commits da fase
- [x] `npm run build` funcionando nos commits da fase
