# Checklist - Fase 4 (Partidas e Operacao Basica)

Objetivo: registrar de forma objetiva o que foi entregue na Fase 4 do modulo `matches` no `resenha-web`.

## Escopo minimo entregue na fase 4

- [x] Contratos, mappers e `matchesApi` tipados no frontend
- [x] Rotas privadas do modulo:
  - [x] `/matches`
  - [x] `/groups/:groupId/matches`
  - [x] `/matches/:matchId`
- [x] Pagina de entrada segura do modulo em `/matches`
- [x] `GroupMatchesPage` funcional com:
  - [x] listagem real de partidas do grupo
  - [x] criacao de partida
  - [x] loading, erro, vazio e sucesso
- [x] `MatchDetailPage` funcional com:
  - [x] detalhe basico em modo leitura
  - [x] acoes do jogador
  - [x] acoes de admin separadas

## Endpoints consumidos na fase 4

- [x] `GET /api/groups/me`
- [x] `GET /api/groups/{groupId}/matches`
- [x] `POST /api/matches`
- [x] `GET /api/matches/{id}/details`
- [x] `POST /api/matches/{id}/confirm`
- [x] `DELETE /api/matches/{id}/confirm`
- [x] `POST /api/matches/{id}/absent`
- [x] `DELETE /api/matches/{id}/absent`
- [x] `POST /api/matches/{id}/guests`
- [x] `DELETE /api/matches/{id}`

## Comportamento entregue no modulo `matches`

- [x] Entrada do modulo em `/matches` sem inventar listagem global inexistente
- [x] Listagem por grupo em `/groups/:groupId/matches`
- [x] Criacao de partida com refresh apos sucesso
- [x] Detalhe da partida carregado via `GET /api/matches/{id}/details`
- [x] UI do detalhe limitada ao recorte operacional da fase:
  - [x] data/hora
  - [x] status
  - [x] observacao
  - [x] limite de vagas
  - [x] total de confirmados
  - [x] listas de confirmados, ausentes e sem resposta
- [x] Acoes do jogador no detalhe:
  - [x] confirmar presenca
  - [x] cancelar presenca
  - [x] marcar ausencia
  - [x] remover ausencia
- [x] Acoes admin no detalhe:
  - [x] adicionar convidado
  - [x] excluir partida

## Decisoes de implementacao mantidas simples

- [x] O modulo segue ancorado por grupo
- [x] O frontend nao inventa regra de janela, vagas, goleiro ou permissao
- [x] O estado do usuario na partida e derivado de forma simples com:
  - [x] `GET /api/matches/{id}/details`
  - [x] `GET /api/groups/{groupId}/matches`
- [x] A permissao administrativa da partida e derivada com `GET /api/groups/me`
- [x] O backend permanece como fonte de verdade para sucesso, erro e restricoes

## Estados e seguranca de fluxo

- [x] Loading inicial tratado na listagem do grupo e no detalhe
- [x] Erro total tratado sem quebrar navegacao
- [x] Erro parcial tratado sem perder dados ja carregados
- [x] Feedback claro para acoes do jogador
- [x] Feedback claro para convidado e exclusao
- [x] Navegacao segura de volta para `/groups/:groupId/matches` apos exclusao
- [x] Usuario nao-admin nao ve nem usa acoes administrativas da partida

## Fora de escopo da fase 4 (pendente)

- [ ] Capitao
- [ ] Desafio em andamento
- [ ] Classificacao
- [ ] Votacao
- [ ] Historico
- [ ] Filtros e ordenacao na listagem de partidas
- [ ] Acoes operacionais diretamente na listagem
- [ ] Testes automatizados do modulo `matches`

## Validacao tecnica da fase 4

- [x] Sem alteracao de backend
- [x] Sem alteracao de contrato da API
- [x] Sem duplicacao intencional de regra de negocio no frontend
- [x] `npm run lint` funcionando nos commits da fase
- [x] `npm run build` funcionando nos commits da fase
