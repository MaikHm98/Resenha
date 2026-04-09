# Checklist - Fase 7 (Classificacao)

Objetivo: registrar de forma objetiva o que foi entregue na Fase 7 do modulo `classification` do `resenha-web`.

## Escopo minimo entregue na fase 7

- [x] Contratos, mappers e `classificationApi` para leitura de classificacao
- [x] Rota privada do fluxo:
  - [x] `/groups/:groupId/classification`
- [x] Pagina dedicada de classificacao ancorada por grupo
- [x] Entrada do fluxo a partir do detalhe do grupo
- [x] Leitura da classificacao da temporada
- [x] Leitura do desempenho individual do usuario no grupo
- [x] Leitura do ranking historico do grupo
- [x] Tratamento seguro do estado sem temporada ativa
- [x] Consolidacao da pagina para continuar utilizavel mesmo quando a temporada estiver indisponivel

## Endpoints consumidos na fase 7

- [x] `GET /api/groups/{groupId}/classification`
- [x] `GET /api/groups/{groupId}/classification/all-time`
- [x] `GET /api/groups/{groupId}/classification/me`

## Comportamento entregue no modulo `classification`

- [x] Pagina funcional em `/groups/:groupId/classification`
- [x] Estados de tela tratados:
  - [x] loading inicial
  - [x] erro total
  - [x] erro parcial
  - [x] sucesso
  - [x] temporada indisponivel
- [x] Tabela da temporada exibindo, no minimo:
  - [x] `posicao`
  - [x] `nome`
  - [x] `pontos`
  - [x] `vitorias`
  - [x] `derrotas`
  - [x] `presencas`
- [x] Painel individual exibindo, quando disponivel:
  - [x] `temporada`
  - [x] `geral`
- [x] Ranking historico separado da temporada
- [x] Ranking historico funcionando mesmo quando a temporada ativa nao existe

## Decisoes de implementacao mantidas simples

- [x] O backend permanece como fonte de verdade para ordem, `posicao` e pontuacao
- [x] O frontend nao recalcula ranking
- [x] O frontend nao reordena classificacao
- [x] O frontend nao reconstrui `posicao`
- [x] O frontend nao inventa payload novo para o estado sem temporada ativa
- [x] A indisponibilidade da temporada nao derruba a secao de historico
- [x] Falha do desempenho individual nao derruba a pagina inteira

## Como o estado sem temporada ativa foi tratado

- [x] O frontend deriva esse estado a partir do erro real de `GET /api/groups/{groupId}/classification`
- [x] A secao da temporada entra em estado seguro de indisponibilidade
- [x] O painel individual tambem entra em estado seguro
- [x] O ranking historico continua podendo carregar normalmente

## Fora de escopo da fase 7 (pendente)

- [ ] Destaque do usuario logado nas tabelas
- [ ] Busca, filtro ou ordenacao local de classificacao
- [ ] Visual mobile alternativo em cards para ranking
- [ ] Votacao
- [ ] Historico detalhado
- [ ] Testes automatizados do modulo `classification`

## Validacao tecnica da fase 7

- [x] Sem alteracao de backend
- [x] Sem alteracao de contrato da API
- [x] Sem recalculo, reorder ou inferencia de ranking no frontend
- [x] `npm run lint` funcionando nos commits da fase
- [x] `npm run build` funcionando nos commits da fase
