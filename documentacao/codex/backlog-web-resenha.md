# Backlog Web — Resenha

## Objetivo do backlog
Este backlog organiza a evolução do Resenha para ambiente web em fases práticas, incrementais e compatíveis com o estado atual do produto.

A intenção deste documento é permitir que o Codex:
- entenda a ordem correta de execução
- trabalhe por blocos menores
- reduza risco de regressão
- preserve as regras de negócio existentes
- evite reescritas desnecessárias

---

## Diretrizes gerais
- Trabalhar por módulo e por fluxo.
- Evitar tarefas grandes demais.
- Priorizar reaproveitamento da API atual.
- Não alterar regra de negócio sem registrar impacto.
- Validar cada fase antes de iniciar a próxima.
- Tratar responsividade como requisito obrigatório, não opcional.

---

## Fase 0 — Preparação do projeto web
### Objetivo
Preparar a base do frontend web e a organização do projeto antes de construir telas de negócio.

### Tarefas
- definir estrutura base do frontend web
- definir padrão de rotas
- definir estrutura por domínio
- configurar camada de integração com API
- definir base de layout global
- definir sistema visual inicial
- definir padrão de tratamento de erro
- definir padrão de carregamento e estados vazios
- definir estratégia de autenticação no web
- definir contratos e tipos compartilhados no frontend

### Critério de pronto
- projeto web inicial sobe localmente
- rotas principais estão funcionando
- layout base existe
- integração com API pode ser iniciada
- base de componentes mínimos está pronta

### Prioridade
Altíssima

---

## Fase 1 — Autenticação e sessão
### Objetivo
Levar para o web todo o fluxo de entrada e segurança básica da conta.

### Tarefas
- criar tela de login
- criar tela de cadastro
- criar tela de esqueci minha senha
- criar tela de redefinição de senha
- implementar persistência de sessão no web
- implementar proteção de rotas autenticadas
- implementar logout
- tratar expiração de sessão e token inválido
- exibir feedback claro em sucesso/erro

### Critério de pronto
- usuário consegue cadastrar
- usuário consegue logar
- usuário consegue recuperar senha
- sessão persiste corretamente
- rotas privadas ficam protegidas

### Dependências
- fase 0 concluída

### Prioridade
Altíssima

---

## Fase 2 — Home e contexto inicial do usuário
### Objetivo
Criar a porta de entrada do sistema web.

### Tarefas
- criar dashboard inicial do usuário
- listar grupos ativos do usuário
- listar convites pendentes
- criar atalhos para ações principais
- permitir aceitar convite
- permitir recusar convite
- permitir navegação clara para grupos e partidas

### Critério de pronto
- usuário autenticado entra no sistema e entende onde está
- convites ficam visíveis
- grupos ficam acessíveis
- fluxo inicial deixa clara a próxima ação possível

### Dependências
- fase 1 concluída

### Prioridade
Alta

---

## Fase 3 — Gestão de grupos
### Objetivo
Levar a governança dos grupos para o web.

### Tarefas
- criar tela de criação de grupo
- criar listagem detalhada de grupos
- criar página de detalhes do grupo
- listar membros ativos
- listar convites pendentes do grupo
- permitir convidar membro
- permitir alterar papel do membro
- permitir remover membro
- permitir ajustar agenda do grupo
- permitir exclusão lógica do grupo quando aplicável

### Critério de pronto
- admin consegue criar e administrar grupo pelo web
- membros e convites ficam visíveis
- papéis podem ser alterados com segurança
- agenda pode ser atualizada

### Dependências
- fase 2 concluída

### Prioridade
Alta

---

## Fase 4 — Partidas e operação básica
### Objetivo
Levar a operação central das partidas para o web.

### Tarefas
- criar tela de criação de partida
- listar partidas do grupo
- criar visualização de status da partida
- implementar confirmação de presença
- implementar cancelamento de presença
- implementar marcação de ausência
- implementar remoção de ausência
- implementar adição de convidado
- criar detalhe da partida
- implementar exclusão de partida quando permitido

### Critério de pronto
- admin cria partida no web
- jogadores conseguem confirmar presença
- convidados podem ser adicionados
- detalhe da partida fica legível
- exclusão respeita comportamento atual

### Dependências
- fase 3 concluída

### Prioridade
Altíssima

---

## Fase 5 — Capitão
### Objetivo
Trazer o ciclo de capitão para uma interface web clara e segura.

### Tarefas
- criar tela ou bloco de status do capitão atual
- implementar abertura do ciclo de capitão
- listar elegíveis para desafio
- implementar seleção de desafiante
- implementar registro de resultado do desafio
- exibir histórico básico do ciclo
- exibir bloqueios relevantes do ciclo

### Critério de pronto
- ciclo pode ser iniciado
- capitão atual fica claro
- elegíveis aparecem corretamente
- desafio pode ser configurado
- resultado pode ser registrado sem ambiguidade

### Dependências
- fase 4 concluída

### Prioridade
Alta

---

## Fase 6 — Desafio em andamento
### Objetivo
Levar a feature mais sofisticada do produto para web sem perder clareza.

### Tarefas
- criar tela dedicada de desafio em andamento
- consumir snapshot completo do backend
- mostrar etapa atual do desafio
- mostrar capitães e ordem de ação
- mostrar lista de jogadores disponíveis
- mostrar jogadores já escolhidos
- mostrar tratamento separado para goleiros
- implementar sorteio de paridade
- implementar envio de número no sorteio
- implementar picks de linha
- implementar picks de goleiro
- exibir alertas e bloqueios devolvidos pelo backend
- deixar clara a próxima ação possível

### Critério de pronto
- fluxo do desafio pode ser acompanhado no web
- quem pode agir fica claro
- picks funcionam corretamente
- etapa de goleiros funciona corretamente
- estados e permissões são respeitados

### Dependências
- fase 5 concluída

### Prioridade
Altíssima

---

## Fase 7 — Classificação
### Objetivo
Dar visibilidade clara ao ranking e desempenho.

### Tarefas
- criar tela de classificação da temporada
- criar tela de ranking histórico
- criar tela de desempenho individual
- exibir pontuação, vitórias, derrotas e presenças
- melhorar leitura visual da classificação em web
- tratar estados vazios e ausência de dados

### Critério de pronto
- ranking da temporada é facilmente consultável
- ranking histórico é acessível
- visão individual do jogador está funcional

### Dependências
- fase 4 concluída

### Prioridade
Alta

---

## Fase 8 — Votação
### Objetivo
Levar a votação de forma clara, segura e auditável para o web.

### Tarefas
- criar tela de estado atual da votação
- permitir abertura da votação quando elegível
- permitir registro de voto
- impedir voto inválido na interface
- exibir rodada atual
- exibir candidatos elegíveis
- implementar fechamento de rodada
- implementar desempate
- implementar aprovação final pelo admin
- exibir histórico das rodadas

### Critério de pronto
- votação pode ser aberta
- participantes podem votar corretamente
- desempate funciona
- aprovação final funciona
- histórico fica legível

### Dependências
- fase 4 concluída

### Prioridade
Alta

---

## Fase 9 — Histórico de partidas
### Objetivo
Valorizar o histórico do grupo e permitir consulta completa no web.

### Tarefas
- criar listagem histórica de partidas
- criar filtros básicos de histórico
- criar tela de detalhe histórico da partida
- exibir placar, times, estatísticas e premiações
- exibir dados com boa leitura em web

### Critério de pronto
- usuário consegue consultar histórico
- detalhe da partida é claro
- dados históricos ficam fáceis de navegar

### Dependências
- fase 4 concluída

### Prioridade
Média

---

## Fase 10 — Perfil e conta
### Objetivo
Trazer para o web a gestão individual da conta.

### Tarefas
- criar tela de perfil
- permitir edição de dados esportivos
- permitir troca de senha
- refletir dados corretamente na sessão
- tratar mensagens de sucesso e erro

### Critério de pronto
- usuário consegue editar o perfil
- usuário consegue trocar senha
- sessão continua consistente após alteração

### Dependências
- fase 1 concluída

### Prioridade
Média

---

## Fase 11 — Padronização e consolidação
### Objetivo
Melhorar consistência, qualidade visual e previsibilidade de manutenção.

### Tarefas
- revisar duplicações de componentes
- revisar nomenclaturas divergentes
- revisar estados e tipos
- unificar padrões de feedback visual
- unificar loading, erro e vazio
- revisar acessibilidade básica
- revisar responsividade geral
- revisar consistência entre módulos

### Critério de pronto
- o projeto fica mais consistente visual e tecnicamente
- menos duplicação
- menos divergência entre módulos
- experiência mais uniforme

### Dependências
- fases principais já funcionalmente concluídas

### Prioridade
Alta

---

## Fase 12 — QA e estabilização
### Objetivo
Consolidar a qualidade da versão web antes de considerá-la pronta para uso mais amplo.

### Tarefas
- revisar fluxos críticos ponta a ponta
- validar autenticação
- validar grupos
- validar partidas
- validar capitão
- validar desafio
- validar classificação
- validar votação
- validar histórico
- validar perfil
- revisar erros de integração com API
- revisar comportamento em mobile e desktop
- revisar mensagens e feedbacks

### Critério de pronto
- fluxos principais validados
- regressões críticas corrigidas
- experiência mínima aceitável em dispositivos principais

### Dependências
- fases funcionais concluídas

### Prioridade
Altíssima

---

## Tarefas transversais
Estas tarefas podem acontecer em paralelo ou distribuídas ao longo das fases:
- criar biblioteca base de componentes
- organizar sistema de tipos
- criar helpers de integração com API
- criar padrão de tratamento de erros
- revisar permissões por rota
- revisar responsividade global
- alinhar nomenclaturas entre backend e frontend
- melhorar documentação técnica
- registrar decisões arquiteturais importantes

---

## Tarefas que exigem cuidado extra
As seguintes entregas não devem ser tratadas como tarefas triviais:
- qualquer mudança no fluxo do desafio em andamento
- qualquer mudança no cálculo da classificação
- qualquer mudança no fluxo de votação
- qualquer alteração que mude contrato crítico da API
- qualquer alteração que afete presença, convidados ou goleiros
- qualquer mudança em autenticação e recuperação de senha

---

## Estratégia de execução recomendada para o Codex
### Regra principal
Sempre trabalhar por uma fase ou subfase, nunca por todo o backlog de uma vez.

### Exemplo de ritmo saudável
1. fase 0
2. fase 1
3. validação
4. fase 2
5. validação
6. fase 3
7. validação

### Motivo
Isso reduz retrabalho, facilita revisão e evita que a base web cresça desorganizada.

---

## Critério de priorização
Quando houver dúvida sobre o que fazer primeiro, seguir esta ordem:
1. destrava uso real do sistema
2. reduz risco técnico
3. melhora clareza operacional
4. melhora consistência
5. melhora estética

---

## Definição de pronto por task
Cada tarefa só deve ser considerada pronta quando:
- objetivo funcional foi cumprido
- não houve quebra evidente de regra de negócio
- integração com API funciona
- estados principais foram tratados
- risco foi apontado quando existir

---

## Próxima ação recomendada
A partir deste backlog, o Codex deve ser instruído a:
1. analisar a fase 0
2. propor plano detalhado da fase 0
3. listar arquivos esperados
4. só então começar implementação

---

## Frase-síntese do backlog
O backlog web do Resenha deve ser executado em etapas pequenas, com forte reaproveitamento do backend atual, priorizando fluxo funcional, clareza operacional, consistência entre camadas e evolução segura para ambiente web.
