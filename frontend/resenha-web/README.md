# Resenha Web

Frontend web do projeto Resenha, construindo uma base incremental para evolucao das telas e fluxos ja existentes no produto, sem reescrever backend e sem alterar contratos da API.

## 1) Objetivo do `resenha-web`

- criar uma base web organizada para o produto Resenha
- reaproveitar a API atual como fonte de verdade
- separar infraestrutura (router/auth/api/ui) antes de implementar fluxos de dominio
- reduzir risco de regressao com evolucao por fases pequenas

## 2) Stack atual

- `React 19`
- `TypeScript`
- `Vite 8`
- `React Router DOM 7`
- `Axios`
- `Tailwind CSS 4`
- `ESLint 9`
- `Vitest`
- `Playwright`
- `Node.js 24`

## 3) Estrutura principal de pastas

```txt
src/
  app/
    App.tsx
    pwa/
    router/
      AppRouter.tsx
      paths.ts
      layouts/
  modules/
    auth/
      context/
      hooks/
      pages/
      routes/
      storage/
      types/
    home/
      api/
      hooks/
      mappers/
      pages/
      types/
    app/
      pages/
    system/
      pages/
  shared/
    components/
      ui/
    lib/
      api/
    styles/
  tests/
e2e/
```

### Resumo por camada

- `app/`: bootstrap e roteamento global
- `modules/`: organizacao por dominio/modulo
- `shared/`: componentes reutilizaveis, utilitarios e estilos base
- `tests/`: testes unitarios e estruturais do frontend
- `e2e/`: smoke tests web com Playwright

## 4) Como rodar localmente

### Pre-requisitos

- `Node.js 20+` (recomendado)
- `npm`

### Setup

```bash
npm install
```

### Ambiente

Crie um arquivo `.env` com base em `.env.example`:

```bash
VITE_API_BASE_URL=http://localhost:5276
VITE_API_TIMEOUT_MS=10000
```

Se o `.env` estiver ausente durante `npm run dev`, o `resenha-web` passa a usar chamadas relativas para `/api` e o proxy do Vite encaminha automaticamente para `http://localhost:5276`.

Em builds abertas localmente sem `.env`, o cliente usa `http://localhost:5276` quando estiver em `localhost` ou `127.0.0.1`. Em ambiente publicado, mantenha `VITE_API_BASE_URL` definido ou sirva o web e a API no mesmo origin.

### Execucao

```bash
npm run dev
```

### Validacao

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```

## 5) O que a Fase 0 ja entregou

- scaffold do projeto web com `Vite + React + TypeScript`
- estrutura base `app/shared/modules`
- Tailwind CSS como camada base
- tokens visuais e estilos globais
- PWA base com manifesto, icones, metadados e service worker simples
- roteamento base com rotas publicas e privadas placeholder:
  - `/login`
  - `/register`
  - `/forgot-password`
  - `/reset-password`
  - `/`
  - `/home`
  - `/groups`
  - `/matches`
  - `/profile`
  - `*` (not found)
- infraestrutura de sessao no frontend:
  - `AuthProvider`
  - `useAuth`
  - `PrivateRoute/PublicRoute`
  - persistencia em `localStorage`
- API client unico:
  - `baseURL` e `timeout` por variavel de ambiente
  - interceptor de token
  - normalizacao de erro para formato interno
- componentes base de UI:
  - `Button`
  - `Input`
  - `PasswordField`
  - `Label`
  - `Select`
  - `Checkbox`
  - `Card`
  - `Dialog`
  - `Spinner`
  - `LoadingState`
  - `Alert`
  - `EmptyState`
  - `ErrorState`
  - `AppContainer`
  - `PageHeader`
- testes base:
  - componentes reutilizaveis
  - protecao estrutural de rota
  - smoke E2E da rota publica
- CI base com lint, testes, build e smoke E2E

Checklist detalhado: [docs/fase-0-checklist.md](./docs/fase-0-checklist.md)

## 6) O que a Fase 1 ja entregou (auth e sessao)

### Fluxos de auth funcionais

- login funcional em `/login`
- cadastro funcional em `/register`
- solicitacao de recuperacao em `/forgot-password`
- validacao de token e redefinicao de senha em `/reset-password`

### Endpoints consumidos atualmente

- `POST /api/users/login`
- `POST /api/users/register`
- `POST /api/users/forgot-password`
- `GET /api/users/reset-password/validate?token=...`
- `POST /api/users/reset-password`

### Comportamento atual de sessao

- sessao carregada na inicializacao via `loadSessionFromStorage()`
- sessao persistida apos `login` e `register`
- sessao removida em `logout`
- storage: `localStorage` com chave `resenha.web.session.v1`
- formato interno de sessao:
  - `accessToken`
  - `userId`
  - `userName`
  - `userEmail`
  - `goleiro`
  - `timeCoracaoCodigo`
  - `timeCoracaoNome`
  - `timeCoracaoEscudoUrl`
  - `posicaoPrincipal`
  - `peDominante`

### Comportamento atual de rotas publicas/privadas

- `PrivateRoute`:
  - sem sessao: redireciona para `/login` e salva rota de origem em `state.from`
  - com sessao: libera rotas privadas
- `PublicRoute`:
  - com sessao: redireciona para `/home`
  - sem sessao: libera rotas publicas de auth

### Validacoes minimas ja existentes

- login:
  - email e senha obrigatorios
- cadastro:
  - `nome`, `email`, `senha`, `posicaoPrincipal`, `peDominante` obrigatorios
  - `nome` com minimo de 2 caracteres
  - `senha` com minimo de 8 caracteres
  - validacao basica de email contendo `@`
  - opcoes de `posicaoPrincipal` e `peDominante` alinhadas ao backend
- forgot password:
  - email obrigatorio
  - validacao basica de email contendo `@`
- reset password:
  - token obrigatorio
  - nova senha com minimo de 8 caracteres
  - exige validacao de token antes de permitir redefinir
  - tenta ler token da query string (`?token=...`) e validar automaticamente

Checklist detalhado: [docs/fase-1-checklist.md](./docs/fase-1-checklist.md)

## 7) O que a Fase 2 ja entregou (home e convites)

### O que a Home ja faz

- Home funcional em `/home` para usuario autenticado
- listagem de grupos do usuario
- listagem de convites pendentes
- atalhos para proximos modulos:
  - `/groups`
  - `/matches`
  - `/profile`
- `Atualizar` manual para recarregar dados da tela

### Endpoints consumidos na fase 2

- `GET /api/groups/me`
- `GET /api/groups/invites/pending`
- `POST /api/groups/invites/{inviteId}/accept`
- `POST /api/groups/invites/{inviteId}/reject`

### Como grupos e convites sao carregados

- o hook `useHomeData` carrega grupos e convites em paralelo no `mount`
- o estado da Home e centralizado em:
  - `status` (`idle | loading | success | error`)
  - `error`
  - `isLoading` (carga inicial)
  - `isRefreshing` (atualizacao manual ou pos-acao)
- o refresh e reutilizado tanto no botao de atualizar quanto apos aceitar/recusar convite

### Como aceitar/recusar convite funciona

- cada convite pendente tem botoes:
  - `Aceitar convite`
  - `Recusar convite`
- durante a acao:
  - loading por item
  - bloqueio de clique duplicado no mesmo convite
- apos sucesso:
  - refresh automatico da Home
  - consistencia entre lista de grupos e lista de convites
- em falha:
  - erro normalizado exibido na tela, sem navegacao inesperada

### Como a entrada autenticada ficou

- usuario autenticado em `/` e redirecionado para `/home`
- Home permanece a porta de entrada principal da area autenticada
- rotas publicas continuam redirecionando para `/home` quando ja existe sessao

### Estados de tela tratados na Home

- loading inicial
- erro total (sem dados)
- erro parcial (com dados anteriores ja carregados)
- vazio de grupos
- vazio de convites
- sucesso com listagens

Checklist detalhado: [docs/fase-2-checklist.md](./docs/fase-2-checklist.md)

## 8) O que a Fase 3 ja entregou (grupos e governanca)

### Rotas e paginas do modulo

- modulo `groups` funcional no frontend web
- rotas privadas ativas:
  - `/groups`
  - `/groups/:groupId`
- ownership do fluxo dentro de `src/modules/groups`

### O que o modulo de grupos ja faz

- listagem real dos grupos do usuario em `/groups`
- criacao de grupo via formulario conectado ao backend
- detalhe funcional de grupo em `/groups/:groupId`
- overview do grupo com agenda, papel e metadados
- listagem de membros do grupo
- listagem de convites pendentes para admin
- convite de membro por e-mail para admin
- alteracao de papel de membro para admin
- remocao de membro para admin
- ajuste de agenda do grupo para admin
- exclusao logica do grupo para admin

### Endpoints consumidos na fase 3

- `GET /api/groups/me`
- `POST /api/groups`
- `GET /api/groups/{id}/members`
- `GET /api/groups/{id}/invites/pending`
- `POST /api/groups/{id}/members`
- `PATCH /api/groups/{id}/members/{memberUserId}/role`
- `DELETE /api/groups/{id}/members/{memberUserId}`
- `PATCH /api/groups/{id}/schedule`
- `DELETE /api/groups/{id}`

### Como a criacao de grupo funciona

- a pagina `/groups` carrega a lista do usuario via `GET /api/groups/me`
- o formulario envia `nome`, `descricao`, `limiteJogadores`, `diaSemana` e `horarioFixo`
- apos sucesso:
  - o grupo criado entra na lista local
  - a pagina faz refresh da lista
  - o backend permanece como fonte de verdade
- estados tratados:
  - loading inicial
  - erro total
  - erro parcial
  - vazio
  - sucesso

### Como o detalhe do grupo funciona

- o backend ainda nao expoe `GET /api/groups/{id}`
- por isso, o detalhe resolve o grupo com `GET /api/groups/me` + filtro por `groupId`
- depois disso, a tela carrega:
  - membros via `GET /api/groups/{id}/members`
  - convites pendentes via `GET /api/groups/{id}/invites/pending` apenas para admin
- usuario nao-admin nao ve acoes administrativas

### Como convite por e-mail funciona

- apenas admin ve o formulario de convite
- o frontend envia `POST /api/groups/{id}/members` com `email`
- o retorno do backend e respeitado sem duplicar regra de negocio:
  - `ADDED`
  - `INVITED`
- apos sucesso:
  - feedback claro na tela
  - refresh automatico do detalhe

### Como alteracao de papel e remocao funcionam

- apenas admin ve as acoes por membro
- os valores reais de papel usados pelo backend e pelo frontend sao:
  - `ADMIN`
  - `JOGADOR`
- troca de papel usa `PATCH /api/groups/{id}/members/{memberUserId}/role`
- remocao usa `DELETE /api/groups/{id}/members/{memberUserId}`
- cada linha da lista tem loading por item e erro inline
- apos sucesso, a lista e recarregada a partir do backend

### Como agenda e exclusao logica funcionam

- apenas admin ve os blocos de agenda e exclusao
- agenda usa `PATCH /api/groups/{id}/schedule` com:
  - `diaSemana`
  - `horarioFixo`
- exclusao logica usa `DELETE /api/groups/{id}`
- a exclusao exige confirmacao explicita digitando o nome do grupo
- apos exclusao bem-sucedida:
  - navegacao segura para `/groups`
  - sem manter a tela do grupo excluido no fluxo imediato

### O que ainda nao foi implementado no modulo

- cancelamento de convite pendente pelo web
- edicao de nome/descricao/limite do grupo
- filtros, busca e ordenacao na listagem de grupos
- pagina dedicada de historico detalhado do ecossistema de grupos no web
- testes automatizados do modulo `groups`

Checklist detalhado: [docs/fase-3-checklist.md](./docs/fase-3-checklist.md)

## 9) O que a Fase 4 ja entregou (partidas e operacao basica)

### Rotas e paginas do modulo

- modulo `matches` funcional no frontend web
- rotas privadas ativas:
  - `/matches`
  - `/groups/:groupId/matches`
  - `/matches/:matchId`
- ownership do fluxo dentro de `src/modules/matches`

### O que o modulo `matches` ja faz

- entrada segura do modulo em `/matches`
- listagem real de partidas por grupo em `/groups/:groupId/matches`
- criacao de partida via formulario conectado ao backend
- detalhe basico de partida em `/matches/:matchId`
- leitura operacional da partida:
  - data/hora
  - status
  - observacao
  - limite de vagas
  - total de confirmados
  - listas de confirmados, ausentes e quem ainda nao respondeu
- acoes do jogador no detalhe:
  - confirmar presenca
  - cancelar presenca
  - marcar ausencia
  - remover ausencia
- acoes administrativas no detalhe:
  - adicionar convidado
  - excluir partida

### Rotas ativas e comportamento atual

- `/matches`
  - pagina de entrada do modulo
  - explica que a operacao continua ancorada por grupo
  - nao inventa listagem global inexistente no backend
- `/groups/:groupId/matches`
  - carrega as partidas reais do grupo
  - permite criar nova partida
  - trata loading, erro, vazio e sucesso
- `/matches/:matchId`
  - carrega o detalhe real da partida
  - exibe overview operacional, participacao e acoes do jogador
  - exibe acoes admin apenas quando o usuario pode gerenciar a partida

### Endpoints consumidos na fase 4

- `GET /api/groups/me`
- `GET /api/groups/{groupId}/matches`
- `POST /api/matches`
- `GET /api/matches/{id}/details`
- `POST /api/matches/{id}/confirm`
- `DELETE /api/matches/{id}/confirm`
- `POST /api/matches/{id}/absent`
- `DELETE /api/matches/{id}/absent`
- `POST /api/matches/{id}/guests`
- `DELETE /api/matches/{id}`

### Como a listagem por grupo funciona

- a pagina `/groups/:groupId/matches` e o fluxo principal de operacao
- a listagem usa `GET /api/groups/{groupId}/matches`
- o estado da pagina e centralizado em `useGroupMatchesData`
- estados tratados:
  - loading inicial
  - erro total
  - erro parcial
  - vazio
  - sucesso
- o detalhe da partida continua acessivel a partir de cada card da lista

### Como a criacao de partida funciona

- o formulario envia:
  - `idGrupo`
  - `dataHoraJogo`
  - `limiteVagas`
  - `observacao`
- o frontend faz validacao minima de contrato:
  - data/hora obrigatoria
  - limite entre `2` e `100`
  - observacao ate `255` caracteres
- regras de negocio continuam no backend:
  - permissao de admin
  - uma partida por dia
  - limite do grupo
  - temporada ativa
- apos sucesso:
  - a lista local e atualizada
  - a pagina faz refresh
  - o backend permanece como fonte de verdade

### Como o detalhe basico funciona

- o detalhe usa `GET /api/matches/{id}/details`
- a UI da fase 4 limita o uso desse endpoint ao recorte operacional:
  - data/hora
  - status
  - observacao
  - limite de vagas
  - total de confirmados
  - listas de confirmados, ausentes e sem resposta
- embora o endpoint devolva mais dados, o frontend web nao expande nesta fase para:
  - capitao
  - times
  - premio
  - votacao
  - historico

### Como funcionam as acoes do jogador

- as acoes ficam no detalhe da partida
- endpoints usados:
  - `POST /api/matches/{id}/confirm`
  - `DELETE /api/matches/{id}/confirm`
  - `POST /api/matches/{id}/absent`
  - `DELETE /api/matches/{id}/absent`
- o frontend nao antecipa regras de:
  - janela de confirmacao
  - limite de vagas
  - limite de goleiros
  - permissao por status
- o estado atual do usuario na partida e derivado de forma simples com:
  - `GET /api/matches/{id}/details`
  - `GET /api/groups/{groupId}/matches`
- apos sucesso:
  - feedback claro no painel
  - refresh automatico do detalhe

### Como funcionam convidado e exclusao

- as acoes admin ficam separadas das acoes do jogador
- o frontend deriva se o usuario pode gerenciar a partida usando `GET /api/groups/me`
- apenas admin ve:
  - formulario de convidado
  - bloco de exclusao
- convidado:
  - usa `POST /api/matches/{id}/guests`
  - envia apenas `nome`
  - faz refresh do detalhe apos sucesso
- exclusao:
  - usa `DELETE /api/matches/{id}`
  - exige confirmacao explicita digitando `EXCLUIR`
  - apos sucesso, navega com seguranca para `/groups/:groupId/matches`

### O que ainda nao foi implementado no modulo `matches`

- filtros e ordenacao na listagem de partidas
- acoes operacionais diretamente na listagem
- indicador mais rico do status do usuario na card da listagem
- historico detalhado da partida alem do snapshot de votacao
- testes automatizados do modulo `matches`

Checklist detalhado: [docs/fase-4-checklist.md](./docs/fase-4-checklist.md)

## 10) O que a Fase 5 ja entregou (capitao)

### Rotas e paginas do modulo

- modulo `captain` funcional no frontend web
- rota privada ativa:
  - `/groups/:groupId/captain`
- ownership do fluxo dentro de `src/modules/captain`
- ponto de entrada do fluxo a partir do detalhe do grupo

### O que o modulo `captain` ja faz

- leitura do ciclo atual do grupo
- tratamento seguro do estado "sem ciclo"
- abertura de ciclo para admin
- selecao de partida do grupo como contexto do desafio
- listagem de elegiveis devolvida pelo backend para a partida selecionada
- escolha de desafiante pelo capitao atual
- registro do resultado do desafio por admin

### Endpoints consumidos na fase 5

- `GET /api/groups/me`
- `GET /api/groups/{groupId}/captain`
- `POST /api/groups/{groupId}/captain/draw`
- `GET /api/groups/{groupId}/matches`
- `GET /api/groups/{groupId}/captain/eligible/{matchId}`
- `POST /api/groups/{groupId}/captain/challenge`
- `POST /api/groups/{groupId}/captain/result`

### Como funciona o estado "sem ciclo"

- o backend nao expoe contrato dedicado para ausencia de ciclo
- quando `GET /api/groups/{groupId}/captain` devolve erro de negocio indicando que nao ha capitao ativo, o frontend web trata isso como estado valido de tela
- o frontend nao inventa um novo payload para esse caso
- admin ve o estado vazio com CTA para abrir ciclo
- usuario nao-admin ve apenas a mensagem informativa, sem acao indevida

### Como funciona a abertura de ciclo

- apenas admin pode iniciar o ciclo pelo web
- a acao usa `POST /api/groups/{groupId}/captain/draw`
- apos sucesso:
  - a pagina atualiza o snapshot local
  - faz refresh completo
  - mantem o backend como fonte de verdade
- os valores reais de status do ciclo preservados no frontend sao:
  - `ATIVO`
  - `ENCERRADO`

### Como funciona a selecao de partida

- a rota `/groups/:groupId/captain` continua ancorada no grupo
- as partidas do grupo sao carregadas apenas como contexto de selecao com `GET /api/groups/{groupId}/matches`
- o frontend nao tenta inferir "melhor partida" nem elegibilidade
- a selecao e explicita na tela e prepara a busca de elegiveis

### Como funciona a escolha de desafiante

- o frontend busca elegiveis com `GET /api/groups/{groupId}/captain/eligible/{matchId}`
- a UI mostra exatamente a lista devolvida pelo backend
- o frontend nao replica regra de elegibilidade no cliente
- a acao de lancar desafio usa `POST /api/groups/{groupId}/captain/challenge` com:
  - `idDesafiante`
  - `idPartida`
- apenas o capitao atual ve e usa esse fluxo
- apos sucesso, a pagina faz refresh completo

### Como funciona o registro de resultado

- apenas admin ve o bloco de registro
- o frontend envia `POST /api/groups/{groupId}/captain/result` com o valor real aceito pelo backend:
  - `CAPITAO`
  - `DESAFIANTE`
- apos sucesso, a pagina faz refresh completo
- quando o desafiante vence, a transicao do ciclo continua sendo decidida exclusivamente pelo backend

### O que ainda nao foi implementado no modulo `captain`

- historico dedicado do ciclo de capitao
- refinamentos de navegacao cruzada entre capitao, desafio, classificacao e votacao
- testes automatizados do modulo `captain`

Checklist detalhado: [docs/fase-5-checklist.md](./docs/fase-5-checklist.md)

## 11) O que a Fase 6 ja entregou (desafio em andamento)

### Rota ativa do fluxo de desafio

- rota privada ativa:
  - `/matches/:matchId/challenge`
- ownership do fluxo dentro de `src/modules/matches`
- ponto de entrada do fluxo a partir do detalhe da partida em `/matches/:matchId`

### O que o fluxo de desafio ja faz

- leitura real do snapshot do desafio em andamento
- exibicao da etapa atual do desafio
- exibicao do capitao atual, desafiante e capitao da vez
- exibicao de jogadores de linha disponiveis
- exibicao de goleiros disponiveis
- exibicao dos jogadores ja escolhidos em cada time
- exibicao de bloqueios e alertas devolvidos pelo backend
- operacao da etapa de linha:
  - escolha de `PAR` ou `IMPAR` quando liberado
  - envio de numero da linha quando liberado
  - picks de jogadores de linha quando liberados
- operacao da etapa de goleiros:
  - escolha de `PAR` ou `IMPAR` somente quando o snapshot permitir
  - envio de numero dos goleiros quando liberado
  - escolha de goleiro quando liberada
- tratamento do estado `DEFINICAO_MANUAL_GOLEIRO` como somente leitura

### Endpoints consumidos na fase 6

- `GET /api/matches/{id}/challenge-status`
- `POST /api/matches/{id}/challenge/line-draw/start`
- `POST /api/matches/{id}/challenge/line-draw/number`
- `POST /api/matches/{id}/challenge/line-picks`
- `POST /api/matches/{id}/challenge/goalkeeper-draw/start`
- `POST /api/matches/{id}/challenge/goalkeeper-draw/number`
- `POST /api/matches/{id}/challenge/goalkeeper-pick`

### Como funciona o snapshot em leitura

- a pagina `/matches/:matchId/challenge` usa `GET /api/matches/{id}/challenge-status`
- o frontend exibe exatamente o snapshot devolvido pelo backend, sem inferir turno, bloqueio, disponibilidade ou resolucao manual
- a tela trata:
  - loading inicial
  - erro total
  - erro parcial
  - sucesso
- os valores reais preservados no frontend para `statusDesafio` sao:
  - `AGUARDANDO_CONFIRMACOES`
  - `PRONTA_PARA_MONTAGEM`
  - `PAR_IMPAR_LINHA`
  - `ESCOLHA_EM_ANDAMENTO`
  - `PAR_IMPAR_GOLEIROS`
  - `ESCOLHA_GOLEIRO_EM_ANDAMENTO`
  - `DEFINICAO_MANUAL_GOLEIRO`
  - `TIMES_FECHADOS`
- os valores reais preservados para paridade sao:
  - `PAR`
  - `IMPAR`

### Como funciona a etapa de linha

- a UI so habilita acoes quando o snapshot liberar
- endpoints usados:
  - `POST /api/matches/{id}/challenge/line-draw/start`
  - `POST /api/matches/{id}/challenge/line-draw/number`
  - `POST /api/matches/{id}/challenge/line-picks`
- a escolha de paridade da linha so aparece quando `usuarioPodeEscolherParidade` vier `true`
- o envio de numero da linha so aparece quando `usuarioPodeInformarNumero` vier `true`
- o pick de jogador de linha so aparece quando `usuarioPodeEscolherJogadorLinha` vier `true`
- apos cada sucesso:
  - o frontend nao faz update otimista
  - a pagina executa refresh completo do snapshot

### Como funciona a etapa de goleiros

- a UI continua usando apenas o snapshot para decidir se mostra ou habilita acao
- endpoints usados:
  - `POST /api/matches/{id}/challenge/goalkeeper-draw/start`
  - `POST /api/matches/{id}/challenge/goalkeeper-draw/number`
  - `POST /api/matches/{id}/challenge/goalkeeper-pick`
- a escolha de paridade de goleiro so aparece quando `usuarioPodeEscolherParidadeGoleiro` vier `true`
- o envio de numero dos goleiros so aparece quando `usuarioPodeInformarNumeroGoleiro` vier `true`
- a escolha de goleiro so aparece quando `usuarioPodeEscolherGoleiro` vier `true`
- apos cada sucesso:
  - o frontend nao faz update otimista
  - a pagina executa refresh completo do snapshot

### Como funciona `DEFINICAO_MANUAL_GOLEIRO`

- quando o backend sinaliza `DEFINICAO_MANUAL_GOLEIRO`, o web entra em estado bloqueado/somente leitura
- o frontend nao inventa endpoint nem acao nova para resolver essa etapa
- a lista de goleiros continua visivel apenas para leitura
- bloqueios e alertas continuam sendo exibidos normalmente

### Quais flags do backend controlam a UI

- `usuarioPodeInteragir`
- `usuarioPodeEscolherParidade`
- `usuarioPodeInformarNumero`
- `usuarioPodeEscolherJogadorLinha`
- `usuarioPodeEscolherParidadeGoleiro`
- `usuarioPodeInformarNumeroGoleiro`
- `usuarioPodeEscolherGoleiro`
- `requerDefinicaoManualGoleiro`

### O que ainda nao foi implementado no fluxo de desafio

- resolucao manual de goleiro no web
- historico detalhado do desafio alem do snapshot operacional
- testes automatizados do fluxo de desafio em andamento

Checklist detalhado: [docs/fase-6-checklist.md](./docs/fase-6-checklist.md)

## 12) O que a Fase 7 ja entregou (classificacao)

### Rota ativa do modulo

- rota privada ativa:
  - `/groups/:groupId/classification`
- ownership do fluxo dentro de `src/modules/classification`
- ponto de entrada do fluxo a partir do detalhe do grupo

### O que o modulo `classification` ja faz

- leitura da classificacao da temporada do grupo
- leitura do desempenho individual do usuario no contexto do grupo
- leitura do ranking historico do grupo
- tratamento seguro do estado "sem temporada ativa"
- consolidacao da pagina para continuar utilizavel mesmo quando a temporada nao estiver disponivel

### Endpoints consumidos na fase 7

- `GET /api/groups/{groupId}/classification`
- `GET /api/groups/{groupId}/classification/all-time`
- `GET /api/groups/{groupId}/classification/me`

### Como funciona a classificacao da temporada

- a pagina `/groups/:groupId/classification` usa `GET /api/groups/{groupId}/classification`
- a tabela exibe em modo leitura, no minimo:
  - `posicao`
  - `nome`
  - `pontos`
  - `vitorias`
  - `derrotas`
  - `presencas`
- o frontend nao recalcula pontuacao
- o frontend nao reordena ranking
- o frontend nao reconstrui `posicao`
- a ordem exibida permanece exatamente como veio do backend

### Como funciona o desempenho individual

- o painel individual usa `GET /api/groups/{groupId}/classification/me`
- a leitura mostra, quando disponivel:
  - estatisticas da temporada atual
  - estatisticas gerais no grupo
- o painel exibe, no minimo:
  - `posicao`
  - `pontos`
  - `vitorias`
  - `derrotas`
  - `presencas`
- falha dessa secao nao derruba a pagina inteira
- o frontend continua apenas refletindo os dados devolvidos pela API

### Como funciona o ranking historico

- o ranking historico usa `GET /api/groups/{groupId}/classification/all-time`
- a secao historica funciona separadamente da temporada atual
- a leitura do ranking historico continua disponivel mesmo quando nao ha temporada ativa
- a ordem e a `posicao` do historico tambem sao exibidas exatamente como vieram do backend

### Como e tratado o caso sem temporada ativa

- o backend nao expoe payload especial para esse estado
- quando `GET /api/groups/{groupId}/classification` devolve erro de negocio indicando ausencia de temporada ativa, o frontend trata isso como estado valido da pagina
- o frontend nao inventa contrato novo para "sem temporada ativa"
- nesse cenario:
  - a secao da temporada entra em estado seguro de indisponibilidade
  - o painel individual tambem entra em estado seguro
  - o ranking historico continua podendo carregar normalmente

### O que ainda nao foi implementado no modulo `classification`

- destaque do usuario logado nas tabelas
- busca, filtro ou ordenacao local de classificacao
- visual mobile alternativo em cards para ranking
- historico detalhado
- testes automatizados do modulo `classification`

Checklist detalhado: [docs/fase-7-checklist.md](./docs/fase-7-checklist.md)

## 13) O que a Fase 8 ja entregou (votacao)

### Rota ativa do fluxo de votacao

- rota privada ativa:
  - `/matches/:matchId/vote`
- ownership do fluxo dentro de `src/modules/matches`
- ponto de entrada do fluxo a partir do detalhe da partida em `/matches/:matchId`

### O que o fluxo de votacao ja faz

- leitura real do status atual da votacao por partida
- leitura separada de `MVP` e `BOLA_MURCHA`
- abertura conjunta da votacao para admin
- registro de voto por rodada
- encerramento/apuracao da rodada para admin
- exibicao do historico das rodadas devolvido pelo backend
- aprovacao final da votacao para admin

### Endpoints consumidos na fase 8

- `GET /api/groups/me`
- `GET /api/matches/{id}/details`
- `GET /api/matches/{id}/vote`
- `POST /api/matches/{id}/vote/open`
- `POST /api/matches/{id}/vote`
- `POST /api/matches/{id}/vote/close`
- `POST /api/matches/{id}/vote/approve`

### Como funciona o status atual

- a pagina `/matches/:matchId/vote` usa `GET /api/matches/{id}/vote`
- o snapshot continua separado por tipo:
  - `mvp`
  - `bolaMurcha`
  - `mvpHistorico`
  - `bolaMurchaHistorico`
- para cada tipo, a UI mostra quando o backend devolver:
  - rodada atual
  - status da rodada
  - candidatos
  - contagem de votos
  - vencedor provisorio
- os valores reais preservados no frontend para tipo sao:
  - `MVP`
  - `BOLA_MURCHA`
- os valores reais preservados no frontend para status da rodada sao:
  - `ABERTA`
  - `ENCERRADA`
  - `APURADA`
  - `APROVADA`

### Como funciona a abertura

- apenas admin ve a acao de abertura
- o frontend deriva se o usuario pode gerenciar a votacao com:
  - `GET /api/matches/{id}/details`
  - `GET /api/groups/me`
- a abertura usa `POST /api/matches/{id}/vote/open`
- a abertura continua conjunta para `MVP` e `BOLA_MURCHA`
- apos sucesso:
  - o snapshot local e atualizado
  - a pagina faz refresh completo
  - o backend permanece como fonte de verdade

### Como funciona o registro de voto

- o registro usa `POST /api/matches/{id}/vote`
- o payload enviado pelo frontend permanece fiel ao backend:
  - `tipo`
  - `idUsuarioVotado`
- a UI mostra exatamente os candidatos devolvidos no snapshot atual
- o frontend nao infere:
  - se o usuario ja votou
  - elegibilidade alem do snapshot
  - auto-voto
  - voto duplicado
- apos sucesso:
  - feedback claro no bloco da acao
  - refresh completo do snapshot

### Como funciona o encerramento/apuracao

- apenas admin ve a acao de encerramento/apuracao
- o frontend usa `POST /api/matches/{id}/vote/close`
- a acao fica disponivel quando a rodada atual do tipo esta `ABERTA`
- empate, nova rodada e vencedor continuam sendo decididos apenas pelo backend
- quando o backend devolve nova rodada no snapshot, a pagina apenas passa a refletir esse retorno sem reconstruir nada localmente

### Como funciona o historico das rodadas

- o historico e exibido em modo leitura na mesma rota de votacao
- `MVP` e `BOLA_MURCHA` continuam separados visualmente
- o frontend usa exatamente:
  - `mvpHistorico`
  - `bolaMurchaHistorico`
- o cliente nao reconstrui:
  - empate
  - rodada seguinte
  - vencedor
  - ordem do historico

### Como funciona a aprovacao final

- apenas admin ve a acao de aprovacao final
- o frontend usa `POST /api/matches/{id}/vote/approve`
- a acao so aparece quando o snapshot atual do tipo estiver `APURADA`
- se o backend ja devolver `APROVADA`, a UI fica em modo somente leitura para aquele tipo
- apos sucesso:
  - feedback claro no bloco da acao
  - refresh completo do snapshot
- o frontend nao recalcula classificacao, pontuacao ou qualquer efeito colateral da aprovacao

### O que ainda nao foi implementado no fluxo de votacao

- destaque explicito de "usuario ja votou" com base em contrato estruturado do backend
- filtros ou abas mais ricas por tipo de votacao
- historico detalhado fora do snapshot da propria votacao
- testes automatizados do fluxo de votacao

Checklist detalhado: [docs/fase-8-checklist.md](./docs/fase-8-checklist.md)

## 14) O que a Fase 9 ja entregou (historico de partidas)

### Rotas ativas do fluxo historico

- rotas privadas ativas:
  - `/groups/:groupId/matches/history`
  - `/matches/:matchId/history`
- ownership do fluxo dentro de `src/modules/matches`
- pontos de entrada a partir do detalhe do grupo e da pagina operacional de partidas do grupo

### O que o fluxo historico ja faz

- listagem historica de partidas por grupo
- filtros locais basicos na listagem historica
- detalhe historico read-only da partida
- leitura clara de placar, vencedor, times, capitaes, estatisticas, premiacoes e participacao
- separacao explicita entre historico e detalhe operacional da Fase 4

### Endpoints consumidos na fase 9

- `GET /api/groups/{groupId}/matches/history`
- `GET /api/matches/{id}/details`

### Como o historico funciona

- a listagem usa apenas `GET /api/groups/{groupId}/matches/history`
- os filtros sao locais sobre a lista carregada:
  - `status`
  - busca textual simples
- o detalhe usa apenas `GET /api/matches/{id}/details`
- o frontend continua sem recalcular:
  - placar
  - vencedor
  - estatisticas
  - premiacoes

Checklist detalhado: [docs/fase-9-checklist.md](./docs/fase-9-checklist.md)

## 15) O que a Fase 10 ja entregou (perfil e conta)

### Rotas ativas do fluxo

- rotas privadas ativas:
  - `/profile`
  - `/profile/change-password`
- ownership do fluxo em:
  - `src/modules/app/pages/ProfilePage.tsx`
  - `src/modules/auth/pages/ChangePasswordPage.tsx`

### O que o fluxo de perfil e conta ja faz

- leitura funcional do snapshot autenticado em `/profile`
- edicao funcional de perfil com os campos suportados pelo backend:
  - `nome`
  - `goleiro`
  - `timeCoracaoCodigo`
  - `posicaoPrincipal`
  - `peDominante`
- email visivel apenas em leitura
- carga de clubes via endpoint ja existente
- troca de senha em rota dedicada de seguranca
- persistencia imediata do novo token apos `changePassword`
- sessao mantida valida apos troca de senha bem-sucedida

### Endpoints consumidos na fase 10

- `GET /api/users/clubs`
- `PATCH /api/users/profile`
- `PATCH /api/users/change-password`

### Como a sessao ficou no web

- sessoes antigas continuam compativeis com a chave `resenha.web.session.v1`
- metadados novos podem entrar como `null` quando a sessao antiga ainda nao os tiver
- update de perfil:
  - preserva o token atual quando o backend devolver token vazio
- troca de senha:
  - persiste o novo token valido retornado pelo backend
  - mantem a sessao ativa sem logout automatico

Checklist detalhado: [docs/fase-10-checklist.md](./docs/fase-10-checklist.md)

## 16) O que ainda nao existe (proximas fases)

- evolucao dos modulos de dominio ainda pendentes no web (`matches` ja possui fluxo funcional basico, desafio em andamento, historico e votacao; `captain` ja possui fluxo funcional basico; `classification` ja possui leitura funcional; `profile` e `conta` ja possuem fluxo funcional base)
- componentes de dominio adicionais e estados mais detalhados por modulo
- refinamento de UX para auth (mascaras, validacoes mais robustas, textos de ajuda por campo)
- suporte aos campos opcionais de cadastro no web (`goleiro`, `timeCoracaoCodigo`)
- shell de aplicacao mais completo para area autenticada
- testes automatizados de auth e sessoes no frontend web
- testes automatizados da Home e convites no frontend web
- testes automatizados do modulo de grupos e governanca
- testes automatizados do modulo de partidas e operacao basica
- testes automatizados do fluxo de desafio em andamento
- testes automatizados do modulo de capitao
- testes automatizados do fluxo de perfil e conta
- hardening de acessibilidade e responsividade por fluxo/modulo

## Observacoes de escopo atual

- backend nao foi alterado por esta base web
- contratos da API nao foram alterados
- regras de negocio permanecem no backend; o frontend web apenas consome e reflete os fluxos ja existentes
