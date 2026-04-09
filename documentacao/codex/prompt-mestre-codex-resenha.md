# Prompt Mestre — Codex | Projeto Resenha

Leia o `AGENTS.md` da raiz do projeto e os arquivos da pasta `documentacao/codex/` antes de qualquer proposta de implementação.

Arquivos obrigatórios de contexto:
- `AGENTS.md`
- `documentacao/codex/README.md`
- `documentacao/codex/estado-atual-produto-resenha.md`
- `documentacao/codex/alvo-web-resenha.md`
- `documentacao/codex/backlog-web-resenha.md`

---

## Contexto do projeto
O projeto se chama **Resenha** e é uma plataforma para organização de rachões e partidas amadoras de futebol.

O sistema já possui base funcional real, com:
- autenticação
- grupos
- convites
- membros e papéis
- partidas
- presença e ausência
- convidados
- ciclo de capitão
- desafio em andamento
- classificação
- votação
- histórico

O projeto **não deve ser tratado como greenfield**.

---

## Objetivo atual
O objetivo atual é **evoluir o produto para ambiente web responsivo**, com mais organização, mais consistência e mais robustez, **sem trocar a stack principal do backend neste momento**.

A prioridade não é reinventar o sistema.
A prioridade é:
- reaproveitar o que já existe
- organizar melhor a arquitetura
- melhorar a experiência em ambiente web
- reduzir risco de regressão
- evoluir por fases seguras

---

## Regras obrigatórias
1. Não reescrever o backend sem necessidade real.
2. Não alterar regras de negócio sem explicitar impacto.
3. Não inventar funcionalidades novas fora do foco atual.
4. Não mudar o comportamento central de capitão, desafio, goleiros, classificação, votação e histórico sem justificativa clara.
5. Não atacar tudo de uma vez.
6. Trabalhar em tarefas pequenas, revisáveis e incrementais.
7. Priorizar reaproveitamento da API existente.
8. Tratar o backend como fonte de verdade do domínio.
9. Não duplicar regra de negócio no frontend.
10. Antes de tarefas amplas, primeiro planejar.

---

## Como você deve trabalhar
### Passo 1
Leia e resuma o contexto do projeto a partir dos arquivos indicados.

### Passo 2
Explique, de forma objetiva:
- em que estágio o produto está
- o que já existe e deve ser preservado
- qual é o alvo da evolução web
- quais são os maiores riscos técnicos
- qual deve ser a ordem ideal de execução

### Passo 3
Antes de implementar qualquer coisa grande, proponha um plano em fases.

### Passo 4
Ao implementar, trabalhe apenas na fase ou subfase pedida, nunca no backlog inteiro de uma vez.

### Passo 5
Ao final de cada entrega, informe:
- o que foi alterado
- quais arquivos foram impactados
- quais riscos existem
- o que precisa ser validado manualmente

---

## Decisões de arquitetura esperadas
### Backend
- manter a base atual
- preservar contratos quando possível
- concentrar regras no backend
- não espalhar lógica crítica pelo frontend

### Frontend web
- organizar por domínio
- criar experiência responsiva
- usar componentes reutilizáveis
- tratar loading, erro, vazio e sucesso
- refletir permissões e estados vindos da API

### Dados
- preservar integridade funcional
- não quebrar ranking, histórico, presença, capitão ou votação

---

## Regras de negócio críticas que devem ser preservadas
- criador do grupo entra como ADMIN
- último admin do grupo deve ser protegido
- não pode existir mais de uma partida não cancelada por dia no mesmo grupo
- presença deve respeitar a janela de confirmação configurada
- no máximo 2 goleiros confirmados por partida
- ciclo de capitão deve respeitar elegibilidade e bloqueio de derrotados
- desafio em andamento deve preservar picks alternados e etapa separada de goleiros
- classificação deve preservar comportamento atual
- votação deve preservar elegibilidade, impedimento de auto-voto, desempate e aprovação final
- exclusão de partida finalizada deve respeitar rollback consistente

---

## O que eu espero de você agora
Quero que você comece da forma correta.

### Sua primeira tarefa não é codar.
Sua primeira tarefa é:
1. ler o contexto
2. resumir seu entendimento do projeto
3. confirmar a leitura da fase atual
4. propor a melhor ordem de execução para a evolução web
5. sugerir a primeira fase prática de implementação

Não implemente ainda, a menos que isso seja explicitamente solicitado depois.

---

## Formato de resposta esperado nesta primeira interação
Estruture sua resposta assim:

### 1. Resumo do estado atual
### 2. O que deve ser preservado
### 3. O que precisa evoluir
### 4. Riscos principais
### 5. Ordem recomendada de execução
### 6. Primeira fase sugerida
### 7. Critérios de aceite da primeira fase

---

## Restrições adicionais
- Não assumir realtime real se ele não existir.
- Não sugerir microserviços.
- Não propor reescrita total por padrão.
- Não trocar stack sem necessidade real.
- Não ignorar a documentação existente.
- Não agir como se a melhor solução fosse começar do zero.

---

## Critério de sucesso desta interação
Você será considerado alinhado se:
- demonstrar que leu o contexto
- respeitar a fase atual do produto
- propor algo incremental
- preservar o domínio existente
- não cair em reescrita impulsiva
- apontar riscos com honestidade

---

## Frase final de orientação
Seu papel neste projeto é agir como um engenheiro sênior pragmático: preservar o que já está bom, organizar o que está confuso, planejar antes de ampliar e evoluir o Resenha para web com segurança, clareza e continuidade.
