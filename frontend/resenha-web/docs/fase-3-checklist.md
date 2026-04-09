# Checklist - Fase 3 (Grupos e Governanca)

Objetivo: registrar de forma objetiva o que foi entregue na Fase 3 do modulo `groups` no `resenha-web`.

## Escopo minimo entregue na fase 3

- [x] Contratos de grupos e governanca tipados no frontend
- [x] `groupsApi` centralizado para consumo da API de grupos
- [x] Mappers simples e explicitos, sem regra de negocio no frontend
- [x] Rotas privadas do modulo:
  - [x] `/groups`
  - [x] `/groups/:groupId`
- [x] `GroupsPage` funcional com:
  - [x] listagem real de grupos do usuario
  - [x] criacao de grupo
  - [x] loading, erro, vazio e sucesso
- [x] `GroupDetailPage` funcional com:
  - [x] overview do grupo
  - [x] membros
  - [x] convites pendentes
  - [x] acoes administrativas restritas ao admin

## Endpoints consumidos na fase 3

- [x] `GET /api/groups/me`
- [x] `POST /api/groups`
- [x] `GET /api/groups/{id}/members`
- [x] `GET /api/groups/{id}/invites/pending`
- [x] `POST /api/groups/{id}/members`
- [x] `PATCH /api/groups/{id}/members/{memberUserId}/role`
- [x] `DELETE /api/groups/{id}/members/{memberUserId}`
- [x] `PATCH /api/groups/{id}/schedule`
- [x] `DELETE /api/groups/{id}`

## Comportamento entregue no modulo de grupos

- [x] Listagem de grupos em `/groups` carregada a partir do backend
- [x] Criacao de grupo com refresh apos sucesso
- [x] Detalhe do grupo resolvido via `GET /api/groups/me` + filtro por `groupId`
- [x] Membros carregados via endpoint dedicado do grupo
- [x] Convites pendentes carregados apenas para admin
- [x] Convite por e-mail com tratamento fiel de `ADDED` e `INVITED`
- [x] Alteracao de papel usando apenas valores reais do backend:
  - [x] `ADMIN`
  - [x] `JOGADOR`
- [x] Remocao de membro com loading por item
- [x] Ajuste de agenda com `diaSemana` e `horarioFixo`
- [x] Exclusao logica do grupo com confirmacao explicita
- [x] Retorno seguro para `/groups` apos exclusao

## Estados e seguranca de fluxo

- [x] Loading inicial tratado nas paginas de grupos e detalhe
- [x] Erro total tratado sem quebrar navegacao
- [x] Erro parcial tratado sem perder dados ja carregados
- [x] Loading por item nas acoes de membro
- [x] Feedback claro para sucesso e falha nas acoes administrativas
- [x] Usuario nao-admin nao ve nem usa agenda, exclusao e acoes administrativas de membros
- [x] Backend mantido como fonte de verdade

## Fora de escopo da fase 3 (pendente)

- [ ] Cancelar convite pendente no web
- [ ] Editar nome, descricao ou limite do grupo
- [ ] Filtros e busca na listagem de grupos
- [ ] Partidas
- [ ] Capitao
- [ ] Classificacao
- [ ] Votacao
- [ ] Historico
- [ ] Testes automatizados do modulo `groups`

## Validacao tecnica da fase 3

- [x] Sem alteracao de backend
- [x] Sem alteracao de contrato da API
- [x] Sem duplicacao intencional de regra de negocio no frontend
- [x] `npm run lint` funcionando nos commits da fase
- [x] `npm run build` funcionando nos commits da fase
