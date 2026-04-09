# Alvo Web — Resenha

## Objetivo deste documento
Este documento define o estado desejado do Resenha na sua evolução para ambiente web.

Ele deve orientar decisões de arquitetura, UX, organização de código e prioridades de implementação, evitando retrabalho, reescrita desnecessária e expansão descontrolada de escopo.

---

## Objetivo principal
Evoluir o Resenha de uma experiência centrada em mobile para uma **plataforma web responsiva**, mantendo o domínio de negócio atual, reaproveitando o backend existente e fortalecendo a organização do produto.

O foco não é reinventar o sistema.
O foco é:
- melhorar organização
- melhorar padronização
- melhorar usabilidade em ambiente web
- manter regras atuais
- permitir crescimento com mais segurança

---

## O que deve permanecer
A evolução para web deve preservar:
- backend atual como base principal de regras de negócio
- modelo de dados atual como referência funcional
- fluxos centrais já implementados
- regra de capitão
- desafio em andamento
- classificação
- votação
- histórico
- autenticação e perfil
- grupos, membros, convites e papéis

O sistema web deve ser uma evolução da base existente, não um novo produto com comportamento diferente.

---

## O que não deve acontecer
### Fora de escopo neste momento
- reescrita completa do backend
- troca da linguagem principal do backend
- recriação do domínio do zero
- criação de microsserviços
- introdução obrigatória de realtime real
- expansão grande de novas funcionalidades antes de estabilizar a base
- alteração arbitrária das regras esportivas existentes

### Regra de decisão
Se uma mudança melhora a arquitetura, mas quebra o fluxo atual do produto, ela não deve ser priorizada sem justificativa clara.

---

## Visão do estado desejado
O Resenha web deve ser:
- responsivo
- claro
- organizado por domínio
- consistente entre frontend e backend
- fácil de evoluir
- estável para uso recorrente
- preparado para crescer sem virar um sistema confuso

---

## Experiência desejada no web

## 1. Navegação
O produto deve ter navegação clara, previsível e adequada para web.

### Esperado
- menu principal consistente
- rotas bem definidas
- retorno fácil entre telas
- contexto do grupo sempre visível quando necessário
- ações principais acessíveis sem excesso de cliques

### Não desejado
- navegação confusa
- excesso de telas com pouca diferença
- repetição de contexto em cada página
- fluxo dependente de comportamento puramente mobile

---

## 2. Responsividade
A plataforma deve funcionar bem em:
- celular
- tablet
- notebook
- desktop

### Regras desejadas
- layout adaptável sem quebrar conteúdo
- áreas densas devem virar cards/tabelas responsivas quando necessário
- ações críticas devem permanecer visíveis
- hierarquia visual clara em qualquer tela

---

## 3. Clareza operacional
As telas mais importantes devem deixar claro:
- estado da partida
- quem pode agir
- qual é a próxima ação possível
- o que já foi concluído
- o que está bloqueado
- o que depende de admin

O usuário não deve precisar interpretar regra de negócio “na mão”.

---

## 4. Feedback visual
Toda ação importante deve ter retorno claro:
- sucesso
- erro
- carregando
- bloqueado
- vazio
- confirmação necessária

---

## Módulos que o web deve contemplar

## 1. Autenticação
### Escopo
- login
- cadastro
- esqueci minha senha
- redefinição de senha
- manutenção de sessão

### Objetivo
Ter entrada estável, segura e simples.

---

## 2. Home / visão geral
### Escopo
- grupos do usuário
- convites pendentes
- acesso rápido aos grupos
- visão inicial do sistema

### Objetivo
Fazer a home ser ponto de entrada real do produto.

---

## 3. Grupos
### Escopo
- criar grupo
- listar grupos
- ver membros
- ver convites
- alterar papéis
- ajustar agenda
- excluir logicamente quando permitido

### Objetivo
Concentrar governança do grupo em uma área clara e previsível.

---

## 4. Partidas
### Escopo
- criar partida
- listar partidas
- confirmar presença
- marcar ausência
- adicionar convidado
- acompanhar status da partida
- ver detalhes
- excluir quando permitido

### Objetivo
Tornar a gestão da partida simples, rápida e legível.

---

## 5. Capitão
### Escopo
- abrir ciclo
- consultar capitão atual
- listar elegíveis
- escolher desafiante
- registrar resultado do desafio

### Objetivo
Preservar a regra atual, mas com melhor clareza visual e operacional.

---

## 6. Desafio em andamento
### Escopo
- visualizar snapshot do desafio
- visualizar etapa atual
- realizar escolhas quando permitido
- visualizar bloqueios e alertas
- tratar goleiros separadamente

### Objetivo
Transformar a feature mais complexa do produto em uma experiência web compreensível.

### Regra de UX
A tela deve deixar evidente:
- etapa atual
- capitão da vez
- jogadores disponíveis
- jogadores já escolhidos
- goleiros
- paridade
- bloqueios
- alertas de insuficiência de confirmados

---

## 7. Classificação
### Escopo
- classificação da temporada
- ranking histórico
- desempenho individual

### Objetivo
Exibir ranking com clareza, sem ambiguidade e com boa leitura em web.

---

## 8. Votação
### Escopo
- abrir votação
- votar
- acompanhar rodada
- desempate
- aprovar resultado

### Objetivo
Deixar o fluxo de votação claro e auditável.

---

## 9. Histórico
### Escopo
- lista histórica de partidas
- detalhe da partida
- estatísticas
- vencedores e premiações

### Objetivo
Dar valor histórico ao produto e facilitar consulta posterior.

---

## Diretrizes técnicas para o frontend web

## 1. Organização por domínio
A aplicação web deve ser organizada por módulos de negócio, e não por páginas soltas.

### Estrutura esperada
- auth
- grupos
- partidas
- capitao
- desafio
- classificacao
- votacao
- historico
- perfil

---

## 2. Componentização
Criar base de componentes reutilizáveis para:
- botões
- inputs
- selects
- modais
- tabelas
- cards
- badges
- toasts
- empty states
- loading states
- painéis operacionais

### Objetivo
Reduzir repetição e manter consistência visual.

---

## 3. Integração com API
O frontend web deve reaproveitar a API atual sempre que possível.

### Regras
- não duplicar regra de negócio no cliente
- tratar backend como fonte de verdade
- isolar camada de integração da camada visual
- centralizar contratos e tipos

---

## 4. Estados e permissões
O frontend deve respeitar o que vier do backend em relação a:
- permissões
- bloqueios
- elegibilidade
- etapas do desafio
- status da partida
- estado da votação

### Objetivo
Evitar divergência de comportamento entre cliente e servidor.

---

## 5. Consistência de nomenclatura
O web deve alinhar tipos, estados e papéis com o backend.

### Regra
Não manter no frontend nomes que já divergem do contrato principal quando isso puder gerar confusão funcional.

---

## Diretrizes de qualidade

## 1. Critério de aceite por módulo
Cada módulo web só deve ser considerado pronto quando:
- estiver funcional
- estiver responsivo
- estiver alinhado à regra de negócio atual
- tiver feedback visual adequado
- não introduzir regressão óbvia

## 2. Validações mínimas
Cada entrega deve considerar:
- build sem erro
- fluxo principal validado
- estados de loading/erro/vazio tratados
- consistência visual mínima
- integração correta com API

## 3. Não aceitável
- tela “bonita” mas inconsistente com regra
- fluxo quebrado em mobile ou desktop
- duplicação desnecessária de componentes
- lógica crítica solta em componente visual
- dependência excessiva de refresh manual sem indicar ao usuário o que aconteceu

---

## Estratégia de implementação recomendada

## Fase 1 — Base do web
- definir estrutura do frontend web
- definir layout global
- definir navegação principal
- definir base visual reutilizável
- organizar camada de integração com API

## Fase 2 — Fluxos essenciais
- autenticação
- home
- grupos
- partidas
- presença/ausência
- convidados

## Fase 3 — Fluxos avançados
- capitão
- desafio em andamento
- classificação
- votação
- histórico

## Fase 4 — Consolidação
- revisar consistência geral
- reduzir duplicações
- melhorar feedbacks
- validar responsividade ampla
- reforçar checklist de qualidade

---

## Ordem de prioridade sugerida
1. autenticação
2. home
3. grupos
4. partidas
5. presença/ausência/convidados
6. capitão
7. desafio em andamento
8. classificação
9. votação
10. histórico
11. perfil

---

## Critérios de sucesso da evolução web
A evolução para web será considerada bem-sucedida quando:
- o sistema mantiver o comportamento funcional atual
- a experiência de uso estiver adequada em desktop e mobile
- a navegação estiver mais clara do que no app atual
- a base estiver mais organizada do que a versão mobile
- o frontend não depender de lógica espalhada ou confusa
- a API atual tiver sido reaproveitada com sucesso
- o projeto estiver mais preparado para manutenção contínua

---

## Decisão central
A evolução do Resenha para web deve ser tratada como **fortalecimento do produto atual**, e não como recomeço técnico.

O melhor caminho é:
- preservar o domínio
- reaproveitar a base existente
- organizar melhor a arquitetura
- melhorar a experiência de uso
- evoluir em etapas pequenas e seguras

---

## Frase-síntese do alvo web
O Resenha web deve ser uma evolução organizada, responsiva e mais madura da base atual, preservando as regras de negócio existentes e transformando o sistema em uma plataforma mais clara, mais consistente e mais preparada para crescimento sustentável.
