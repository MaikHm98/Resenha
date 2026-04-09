# AGENTS.md

## Projeto
Resenha é uma plataforma para organização de rachões e partidas amadoras de futebol.

O produto centraliza:
- autenticação e perfil do jogador
- grupos, convites, membros e papéis
- criação e gestão de partidas
- presença, ausência e convidados
- ciclo de capitão
- desafio em andamento para montagem dos times
- classificação da temporada e ranking histórico
- votação de MVP e Bola Murcha
- histórico detalhado de partidas e estatísticas

## Objetivo atual do projeto
O foco atual é evoluir o produto para um ambiente web mais organizado e robusto, sem trocar a stack principal do backend neste momento.

Prioridades atuais:
1. organizar melhor a arquitetura do projeto
2. preparar a experiência para web responsiva
3. padronizar estados, contratos e nomenclaturas
4. reduzir risco de regressão
5. melhorar qualidade, testes e previsibilidade operacional

## Restrições importantes
- Não reescrever o backend sem necessidade real.
- Não trocar a linguagem do backend neste momento.
- Não alterar regras de negócio sem explicitar o impacto.
- Não criar complexidade desnecessária.
- Não inventar novas features fora do escopo sem justificar.
- Não mudar contratos críticos da API sem documentar e avaliar impacto no cliente.
- Não alterar dados sensíveis, autenticação, ranking ou fluxo de votação sem revisão cuidadosa.
- Não introduzir realtime, WebSocket ou SignalR como padrão sem decisão explícita.
- Não executar mudanças destrutivas em banco sem migration revisável e justificativa.

## Direção de arquitetura
### Backend
Manter a API principal como fonte de verdade das regras de negócio.
Preferências:
- controllers finos
- serviços/coordenadores com regra de negócio
- acesso a dados separado da camada HTTP
- validação crítica sempre no backend
- respostas consistentes
- erros previsíveis e padronizados

### Frontend
A evolução desejada é para frontend web responsivo, com boa experiência em:
- mobile
- tablet
- desktop

Preferências:
- componentes reutilizáveis
- separação entre UI, estado e integração com API
- evitar lógica de negócio espalhada em tela
- priorizar consistência visual e estados de loading/erro/vazio/sucesso

### Dados
- preservar integridade funcional
- respeitar unicidades e regras transacionais existentes
- evitar duplicidade de estados e nomes entre backend e frontend
- sempre considerar impacto em ranking, histórico, presença, votos e capitão

## Fase atual do produto
O produto está em estágio de MVP avançado / beta controlado:
- o núcleo funcional já existe
- as regras principais já estão implementadas
- o foco agora é robustez, padronização e evolução segura

## Áreas mais sensíveis do domínio
As seguintes áreas exigem atenção extra e não podem ser alteradas sem validação cuidadosa:

1. autenticação e recuperação de senha
2. grupos, convites, membros e papéis
3. criação de partidas e limite de participantes
4. presença, ausência e convidados
5. regra de goleiros
6. ciclo de capitão
7. desafio em andamento
8. classificação
9. votação e desempate
10. rollback ao excluir partida finalizada

## Regras de negócio críticas
### Usuário e autenticação
- cadastro exige dados esportivos obrigatórios definidos pelo sistema
- recuperação de senha não pode expor existência de e-mail
- troca de senha deve invalidar sessão anterior conforme regra atual

### Grupos
- o criador do grupo entra como ADMIN
- o sistema deve proteger o último administrador
- limites de grupo devem ser respeitados na entrada por convite e aceitação

### Partidas
- somente administradores podem criar partida
- não pode existir mais de uma partida não cancelada por dia no mesmo grupo
- se não houver temporada ativa, a criação da partida deve respeitar o comportamento atual
- confirmação e ausência devem respeitar a janela configurada
- presença não pode gerar overbooking
- convidados não devem quebrar as regras do grupo e da partida

### Goleiros
- no máximo 2 goleiros confirmados por partida
- o fluxo de desafio deve respeitar tratamento separado para goleiros
- nunca permitir lógica que quebre o controle visual e funcional de goleiros

### Ciclo de capitão
- apenas um ciclo ativo por grupo
- apenas o capitão atual escolhe desafiante
- desafiante precisa obedecer critérios de elegibilidade
- derrotados bloqueados no ciclo devem continuar respeitando a regra

### Desafio em andamento
- mínimo de confirmados para liberar a montagem deve ser preservado
- picks alternados devem ser preservados
- a etapa de goleiros deve continuar separada
- o backend é a fonte de verdade do estado do desafio
- o frontend deve apenas refletir o snapshot devolvido pela API

### Classificação
- pontuação, vitórias, derrotas, presença e histórico devem seguir a regra atual
- exclusão de partida finalizada deve manter rollback consistente
- não alterar cálculo de ranking sem explicitar o impacto

### Votação
- apenas participantes elegíveis votam
- não permitir voto em si mesmo
- empate deve seguir fluxo de desempate
- aprovação final deve continuar respeitando regra administrativa

## Convenções de implementação
### Regras gerais
- prefira mudanças pequenas, seguras e revisáveis
- antes de mudanças grandes, apresente plano
- ao mexer em fluxo crítico, documente risco de regressão
- reutilize código existente antes de criar novo
- remova duplicações quando fizer sentido
- evite acoplamento desnecessário entre módulos

### Nomeação
- use nomes consistentes com o domínio
- evite criar sinônimos para a mesma regra
- alinhe nomes entre backend, frontend, testes e documentação
- priorize clareza sobre abreviação excessiva

### Estados e tipos
- não criar novos estados sem revisar impacto geral
- sempre verificar compatibilidade entre:
  - backend
  - frontend
  - testes
  - documentação
- quando possível, reduzir risco de drift entre strings literais e contratos

### API
- preservar rotas e payloads críticos quando possível
- se mudar contrato, documentar claramente:
  - o que mudou
  - por que mudou
  - quais telas/fluxos impacta
- manter consistência nas respostas de erro

### Banco e migrations
- nunca alterar schema sem migration revisável
- toda migration deve explicar impacto
- proteger dados históricos
- evitar scripts manuais sem necessidade
- nunca apagar histórico relevante sem validação explícita

## Qualidade mínima esperada
Toda tarefa deve buscar:
- build sem erro
- código legível
- sem duplicação desnecessária
- sem quebra de contrato não documentada
- sem quebra de regra de negócio
- sem introduzir insegurança óbvia
- com validação compatível com a criticidade da mudança

## Testes
### Sempre que possível
- testar regra de negócio alterada
- testar cenários de sucesso e falha
- validar fluxos críticos quando houver impacto indireto

### Fluxos prioritários para validação
1. login
2. cadastro
3. recuperação de senha
4. criar grupo
5. entrar em grupo por convite
6. criar partida
7. confirmar presença
8. cancelar presença / marcar ausência
9. adicionar convidado
10. abrir desafio
11. picks de linha
12. picks de goleiro
13. finalizar partida
14. classificação
15. votação
16. exclusão de partida com rollback

## Estratégia para tarefas complexas
Quando a tarefa for grande, ambígua ou de alto risco:
1. primeiro entender o contexto
2. depois propor plano por etapas
3. só então implementar
4. ao final, resumir:
   - o que foi alterado
   - riscos
   - pontos que precisam ser testados

## Entregáveis esperados do agente
Ao concluir uma tarefa, informe de forma objetiva:
- resumo das mudanças
- arquivos impactados
- riscos
- validações realizadas
- pendências ou dúvidas relevantes

## O que evitar
- não agir como se o sistema fosse greenfield
- não sugerir reescrita completa por padrão
- não mover muita coisa ao mesmo tempo sem necessidade
- não quebrar fluxos atuais para “melhorar arquitetura”
- não propor abstrações excessivas para um problema simples
- não esconder impacto de mudança estrutural

## Documentação viva
Sempre que perceber desvio repetido entre:
- código
- documentação
- testes
- frontend
- backend

propor atualização da documentação e/ou padronização correspondente.

## Critério de pronto
Uma tarefa só deve ser considerada pronta quando:
- o objetivo foi atendido
- as regras de negócio críticas continuam preservadas
- o impacto foi avaliado
- os pontos principais de validação foram indicados
- a solução está coerente com a fase atual do produto

## Contexto especial da evolução para web
Ao trabalhar em tarefas relacionadas à versão web:
- priorizar reaproveitamento da API existente
- adaptar a experiência sem reescrever a regra de negócio
- separar claramente o que é ajuste visual do que é regra funcional
- garantir responsividade
- mapear diferenças entre fluxo mobile e fluxo web
- não assumir realtime real se ele não existir no backend
