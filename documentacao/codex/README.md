# README — Pasta `documentacao/codex`

## Objetivo desta pasta
Esta pasta reúne os arquivos de contexto que devem orientar o trabalho do Codex no projeto **Resenha**.

Esses documentos não substituem o código-fonte nem a documentação principal do projeto.
Eles existem para ajudar o agente a:
- entender o estado atual do produto
- entender o estado desejado
- entender a ordem de evolução
- evitar reescritas desnecessárias
- preservar regras de negócio críticas
- trabalhar de forma incremental e segura

---

## Como o Codex deve usar esta pasta
Antes de propor mudanças grandes, o Codex deve ler os arquivos desta pasta para responder às seguintes perguntas:

1. Em que fase o produto está hoje?
2. O que já existe e deve ser preservado?
3. Qual é o alvo da evolução para web?
4. Qual a ordem correta de implementação?
5. O que está fora de escopo neste momento?

O conteúdo desta pasta serve como **contexto de decisão**, não como autorização para sair implementando tudo de uma vez.

---

## Arquivos desta pasta

## 1. `estado-atual-produto-resenha.md`
### Função
Explica o estágio atual do produto.

### O que o Codex deve extrair daqui
- classificação do estágio atual
- pontos fortes já existentes
- áreas maduras
- áreas frágeis
- leitura executiva do momento do projeto

### Quando usar
Sempre que a tarefa envolver:
- entendimento geral do projeto
- análise de maturidade
- priorização
- avaliação de risco
- decisão entre reaproveitar ou reescrever

---

## 2. `alvo-web-resenha.md`
### Função
Define o estado desejado da evolução para web.

### O que o Codex deve extrair daqui
- objetivo da versão web
- limites da migração
- módulos que devem existir
- experiência desejada
- restrições arquiteturais
- critérios de sucesso da evolução

### Quando usar
Sempre que a tarefa envolver:
- frontend web
- UX web
- navegação
- organização da nova interface
- adaptação do sistema atual para ambiente web

---

## 3. `backlog-web-resenha.md`
### Função
Quebra a evolução para web em fases e tarefas menores.

### O que o Codex deve extrair daqui
- ordem de execução
- dependências entre fases
- tarefas por módulo
- prioridade relativa
- critério de pronto

### Quando usar
Sempre que a tarefa envolver:
- planejamento
- priorização
- roadmap técnico
- definição de escopo da próxima entrega
- quebra de tarefas para implementação incremental

---

## Relação com `AGENTS.md`
O arquivo `AGENTS.md`, localizado na raiz do projeto, é a principal instrução permanente do repositório.

A pasta `documentacao/codex/` complementa esse contexto.

### Regra prática
- `AGENTS.md` = regras permanentes do projeto
- `documentacao/codex/` = contexto estratégico e operacional para evolução do produto

O Codex deve considerar ambos em conjunto.

---

## Ordem recomendada de leitura
Quando a tarefa for grande, o ideal é seguir esta ordem:

1. `AGENTS.md`
2. `documentacao/codex/estado-atual-produto-resenha.md`
3. `documentacao/codex/alvo-web-resenha.md`
4. `documentacao/codex/backlog-web-resenha.md`

---

## Regras de uso para o Codex

## 1. Não assumir greenfield
O projeto não deve ser tratado como se estivesse começando do zero.

## 2. Não reescrever por impulso
Se a base atual puder ser reaproveitada com segurança, esse caminho deve ser priorizado.

## 3. Planejar antes de tarefas grandes
Quando a tarefa for ampla, o Codex deve primeiro propor plano antes de implementar.

## 4. Trabalhar por fase
As entregas devem seguir a lógica do backlog, evitando atacar tudo ao mesmo tempo.

## 5. Preservar o domínio
As regras de negócio atuais devem ser respeitadas, especialmente:
- capitão
- desafio em andamento
- goleiros
- classificação
- votação
- histórico

---

## O que esta pasta não é
Esta pasta não é:
- a documentação completa do projeto
- substituta do código-fonte
- autorização para alterar regras do domínio
- backlog para implementação massiva em uma única rodada

---

## Estratégia recomendada de trabalho
Ao receber uma tarefa relevante, o Codex deve preferir este fluxo:

1. ler `AGENTS.md`
2. ler os arquivos relevantes desta pasta
3. resumir entendimento do contexto
4. propor plano por etapas
5. apontar riscos e dependências
6. só então implementar
7. ao final, resumir impacto e validações necessárias

---

## Critério de sucesso
O uso correto desta pasta deve ajudar o Codex a:
- reduzir respostas superficiais
- evitar reescrita desnecessária
- manter foco no objetivo real do projeto
- respeitar o estágio atual do produto
- propor mudanças com mais maturidade

---

## Próxima evolução desta pasta
No futuro, esta pasta pode crescer com:
- `prompt-mestre-codex.md`
- `regras-prioritarias.md`
- `decisoes-tecnicas-web.md`
- `checklist-validacao-web.md`

---

## Frase-síntese
A pasta `documentacao/codex/` existe para transformar contexto solto em contexto reutilizável, ajudando o Codex a trabalhar no Resenha com mais precisão, menos retrabalho e mais alinhamento com o objetivo do produto.
