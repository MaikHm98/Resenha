# Checklist - Fase 6 (Desafio em andamento)

Objetivo: registrar de forma objetiva o que foi entregue na Fase 6 do fluxo de desafio em andamento no modulo `matches` do `resenha-web`.

## Escopo minimo entregue na fase 6

- [x] Contratos, mappers e extensao de `matchesApi` para o snapshot e acoes do desafio
- [x] Rota privada do fluxo:
  - [x] `/matches/:matchId/challenge`
- [x] Pagina dedicada do desafio separada do detalhe basico da partida
- [x] Carregamento do snapshot real via backend
- [x] Leitura do estado atual do desafio
- [x] Exibicao da etapa atual, capitao atual, desafiante e capitao da vez
- [x] Exibicao de jogadores de linha disponiveis
- [x] Exibicao de goleiros disponiveis
- [x] Exibicao dos jogadores ja escolhidos nos times
- [x] Exibicao de bloqueios e alertas
- [x] Operacao da etapa de linha:
  - [x] escolher `PAR` ou `IMPAR`
  - [x] informar numero
  - [x] fazer picks de jogadores de linha
- [x] Operacao da etapa de goleiros:
  - [x] escolher `PAR` ou `IMPAR` somente quando permitido pelo snapshot
  - [x] informar numero dos goleiros
  - [x] escolher goleiro
- [x] Tratamento de `DEFINICAO_MANUAL_GOLEIRO` como estado somente leitura

## Endpoints consumidos na fase 6

- [x] `GET /api/matches/{id}/challenge-status`
- [x] `POST /api/matches/{id}/challenge/line-draw/start`
- [x] `POST /api/matches/{id}/challenge/line-draw/number`
- [x] `POST /api/matches/{id}/challenge/line-picks`
- [x] `POST /api/matches/{id}/challenge/goalkeeper-draw/start`
- [x] `POST /api/matches/{id}/challenge/goalkeeper-draw/number`
- [x] `POST /api/matches/{id}/challenge/goalkeeper-pick`

## Comportamento entregue no fluxo de desafio

- [x] Entrada do fluxo a partir do detalhe da partida
- [x] Pagina dedicada do desafio em `/matches/:matchId/challenge`
- [x] Estados de tela tratados:
  - [x] loading inicial
  - [x] erro total
  - [x] erro parcial
  - [x] sucesso
- [x] Snapshot exibido sem inventar estados fora do que o backend devolve
- [x] Refresh completo apos cada sucesso nas acoes da linha
- [x] Refresh completo apos cada sucesso nas acoes de goleiro
- [x] Loading por item nos picks de linha
- [x] Loading por item nos picks de goleiro
- [x] Feedback claro de sucesso e erro por secao do fluxo

## Flags e valores reais preservados do backend

- [x] Status reais do desafio preservados no frontend:
  - [x] `AGUARDANDO_CONFIRMACOES`
  - [x] `PRONTA_PARA_MONTAGEM`
  - [x] `PAR_IMPAR_LINHA`
  - [x] `ESCOLHA_EM_ANDAMENTO`
  - [x] `PAR_IMPAR_GOLEIROS`
  - [x] `ESCOLHA_GOLEIRO_EM_ANDAMENTO`
  - [x] `DEFINICAO_MANUAL_GOLEIRO`
  - [x] `TIMES_FECHADOS`
- [x] Paridade real preservada no frontend:
  - [x] `PAR`
  - [x] `IMPAR`
- [x] A UI usa apenas flags reais do snapshot para mostrar ou habilitar acao:
  - [x] `usuarioPodeInteragir`
  - [x] `usuarioPodeEscolherParidade`
  - [x] `usuarioPodeInformarNumero`
  - [x] `usuarioPodeEscolherJogadorLinha`
  - [x] `usuarioPodeEscolherParidadeGoleiro`
  - [x] `usuarioPodeInformarNumeroGoleiro`
  - [x] `usuarioPodeEscolherGoleiro`
  - [x] `requerDefinicaoManualGoleiro`

## Decisoes de implementacao mantidas simples

- [x] O backend permanece como fonte de verdade para turno, bloqueio, disponibilidade e etapa atual
- [x] O frontend nao faz update otimista no desafio
- [x] O frontend nao infere elegibilidade, ordem de pick ou resolucao manual
- [x] O frontend nao expande o desafio para classificacao, votacao ou historico
- [x] `DEFINICAO_MANUAL_GOLEIRO` continua somente leitura no web
- [x] A UI nao expoe escolha de paridade de goleiro quando o snapshot nao permitir

## Fora de escopo da fase 6 (pendente)

- [ ] Resolucao manual de goleiro no web
- [ ] Classificacao
- [ ] Votacao
- [ ] Historico
- [ ] Testes automatizados do fluxo de desafio em andamento

## Validacao tecnica da fase 6

- [x] Sem alteracao de backend
- [x] Sem alteracao de contrato da API
- [x] Sem duplicacao intencional de regra de negocio no frontend
- [x] `npm run lint` funcionando nos commits da fase
- [x] `npm run build` funcionando nos commits da fase
