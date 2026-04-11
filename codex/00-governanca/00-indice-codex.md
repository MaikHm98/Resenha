# Indice do codex

## Objetivo da pasta `codex`
A pasta `codex` e a camada oficial de governanca documental do projeto.

Seu objetivo e organizar como o time:
- define
- consulta
- evolui
- valida
- mantem

os seguintes elementos documentais:
- agentes
- regras
- checklists
- fluxos
- modelos

O `codex` nao substitui a documentacao tecnica do sistema. Sua funcao e governar a estrutura documental do projeto, indicar a fonte de verdade de cada tipo de assunto e estabelecer a forma correta de criacao, revisao, uso e manutencao dos documentos.

## Papel da governanca documental no projeto
A governanca documental existe para impedir crescimento desordenado da base de documentos e garantir consistencia entre as camadas do projeto.

Ela possui quatro funcoes principais:

- manter uma estrutura previsivel para crescimento futuro
- reduzir contradicoes entre frontend, backend, operacao e produto
- separar documento normativo, documento operacional e documento modelo
- garantir que o time saiba onde registrar cada tipo de decisao, regra ou orientacao

Sem essa camada, a documentacao tende a se degradar em:
- arquivos paralelos
- duplicidade de regra
- conflito de nomenclatura
- perda de rastreabilidade
- crescimento sem funcao estrutural clara

## Diferenca entre `codex` e `documentacao`
`codex` e `documentacao` possuem papeis complementares e nao devem ser confundidos.

### `codex`
- define a governanca documental do projeto
- organiza agentes, regras, checklists, fluxos e modelos
- estabelece como os documentos devem nascer, evoluir e ser revisados
- indica a fonte de verdade de cada tipo documental

### `documentacao`
- registra conhecimento tecnico e operacional do sistema
- descreve arquitetura, banco, deploy, fluxos de negocio, operacao e implementacao
- serve como referencia do produto, da solucao e do comportamento real do sistema

### Regra pratica
- usar `codex` para definir **como documentar e governar**
- usar `documentacao` para registrar **o sistema, sua arquitetura e sua operacao**

## O que nao pertence ao `codex`
Nao devem ser colocados no `codex`:
- documentacao tecnica detalhada da aplicacao
- explicacao de implementacao de feature
- log operacional de deploy
- passo a passo de ambiente
- dump de contexto de tarefa
- documentacao local de modulo que nao tenha papel de governanca
- anotacoes soltas sem funcao estrutural
- rascunho sem destino documental claro

Se o conteudo descreve o sistema, a implementacao ou a operacao real, ele tende a pertencer a `documentacao`, e nao ao `codex`.

## Estrutura oficial do `codex`
O `codex` esta organizado em quatro blocos permanentes.

### `00-governanca`
Bloco central de governanca.
Define:
- o indice principal
- os fluxos oficiais por dominio
- o agente guardiao da consistencia documental

### `01-frontend`
Bloco dedicado ao ecossistema de frontend.
Agrupa:
- agentes especializados
- regras normativas
- checklists operacionais

Seu foco e:
- experiencia
- interface
- plataforma
- qualidade
- motion
- UX
- performance de frontend

### `02-backend`
Bloco dedicado ao ecossistema de backend.
Agrupa:
- agentes especializados
- regras normativas
- checklists operacionais

Seu foco e:
- dominio
- API
- seguranca
- dados
- performance
- integracao
- operacao
- consistencia de backend

### `99-modelos`
Bloco de referencia para criacao de novos documentos.
Contem a estrutura base que deve ser reutilizada para novos:
- agentes
- regras
- checklists
- fluxos

## Hierarquia de governanca dentro do `codex`
A governanca do `codex` deve ser interpretada da seguinte forma:

- `00-indice-codex.md` orienta a navegacao e o uso da pasta
- `agente-arquiteto-documentacao.md` governa consistencia, escopo e qualidade documental
- os fluxos governam a ordem operacional de atuacao por dominio
- os agentes definem papeis especializados
- as regras definem obrigacoes normativas
- os checklists definem verificacoes operacionais
- os modelos definem a estrutura de novos documentos

Essa hierarquia deve permanecer clara para evitar sobreposicao de funcao entre arquivos.

## Papel de cada tipo documental
Cada tipo documental possui papel proprio e nao pode ser usado como substituto de outro.

### Agentes
Definem:
- quem atua
- com qual responsabilidade
- com qual autoridade
- dentro de quais limites
- quais entradas recebe
- quais saidas produz

### Regras
Definem:
- o que e obrigatorio obedecer
- restricoes
- excecoes
- padroes normativos
- criterios formais de aplicacao

### Checklists
Definem:
- o que precisa ser verificado
- em qual contexto
- por quem
- com qual criterio de pronto ou aceite

### Modelos
Definem:
- a estrutura padrao de novos documentos
- os campos minimos obrigatorios
- a forma esperada de consistencia documental

### Fluxos
Definem:
- a ordem de atuacao
- a sequencia de validacao
- a passagem entre etapas
- os criterios de aprovacao e encerramento

## Regra de interpretacao entre tipos documentais
Quando houver ambiguidade entre documentos, deve prevalecer a seguinte ordem de leitura e decisao:

1. fonte de verdade do assunto
2. regra normativa aplicavel
3. fluxo do dominio
4. checklist operacional
5. modelo estrutural
6. remissao auxiliar ou referencia secundaria

Nenhum checklist pode substituir uma regra.
Nenhum fluxo pode substituir um agente.
Nenhum agente pode substituir a fonte normativa do assunto.

## Relacao entre agentes, regras, checklists, modelos e fluxos
Regra de uso:

- agente diz **quem atua** e com qual responsabilidade
- regra diz **o que precisa ser obedecido**
- checklist diz **o que precisa ser verificado**
- fluxo diz **em que ordem a atuacao acontece**
- modelo diz **como um novo documento deve nascer**

Essas camadas devem permanecer separadas e complementares.

## Ordem recomendada de leitura
A leitura do `codex` deve seguir uma ordem que reduza ambiguidade e evite uso incorreto dos documentos.

1. Ler este indice para entender a estrutura geral.
2. Ler `agente-arquiteto-documentacao.md` para entender a politica de consistencia documental.
3. Ler o fluxo aplicavel ao dominio da demanda:
   - `01-fluxo-backend.md`
   - `02-fluxo-frontend.md`
4. Consultar os agentes do dominio envolvido.
5. Consultar as regras do dominio envolvido.
6. Consultar os checklists aplicaveis.
7. Usar os modelos apenas quando houver necessidade de criar ou revisar um documento estrutural.

## Ordem recomendada de criacao ou evolucao documental
Quando uma nova frente documental precisar ser criada, ajustada ou amadurecida, a ordem recomendada e:

1. validar se o tema pertence a governanca, frontend, backend ou modelos
2. verificar se ja existe fonte de verdade para o assunto
3. ajustar o fluxo, se a ordem de trabalho ainda nao estiver clara
4. ajustar o agente, quando o papel especializado ainda nao estiver definido
5. ajustar ou criar regra, quando houver padrao normativo recorrente
6. ajustar ou criar checklist, quando houver necessidade operacional repetivel
7. revisar remissoes, referencias cruzadas e risco de duplicidade
8. validar aderencia ao `agente-arquiteto-documentacao.md`

## Regras de uso da pasta `codex`
- nao criar arquivos soltos fora dos blocos oficiais
- nao usar `codex` para documentar detalhes tecnicos do sistema que pertencem a `documentacao`
- nao duplicar a mesma regra em mais de um arquivo
- nao registrar processo operacional dentro de arquivo de agente se ele pertence a fluxo ou checklist
- nao registrar obrigacao normativa em checklist se ela precisa ser fonte de verdade permanente
- sempre preferir atualizar um documento existente antes de criar outro paralelo para o mesmo assunto
- sempre manter coerencia entre nome do arquivo, titulo e escopo real do conteudo
- sempre revisar o impacto em frontend e backend quando o assunto atravessar mais de uma camada
- sempre preservar a rastreabilidade da fonte de verdade

## Erros comuns no uso do `codex`
Os erros abaixo devem ser evitados:

- criar documento novo sem revisar o acervo existente
- registrar implementacao tecnica no `codex`
- duplicar regra em frontend e backend sem definir fonte de verdade
- usar checklist como regra permanente
- usar fluxo como substituto de agente
- criar remissao para documento inexistente
- manter arquivo apenas por receio de editar a fonte de verdade
- transformar o `codex` em repositorio de texto solto

## Principios de consistencia documental
Toda documentacao em `codex` deve obedecer aos principios abaixo:

- fonte de verdade unica por assunto normativo
- separacao clara entre governanca, frontend, backend e modelos
- nomes descritivos, em pt-BR, sem acentos, sem cedilha e sem espacos
- ausencia de contradicao entre documentos do mesmo dominio
- ausencia de conflito semantico entre frontend e backend
- atualizacao incremental, sem reestruturacao desnecessaria
- crescimento previsivel, sem acumulacao de arquivos soltos
- remissao em vez de duplicacao
- revisao antes de criacao
- clareza de escopo antes de profundidade textual

## Criterio para criacao de novo documento
Um novo documento so deve ser criado quando pelo menos uma das condicoes abaixo for verdadeira:

- o assunto ainda nao possui fonte de verdade
- o tema nao cabe com clareza no documento atual
- a separacao aumenta rastreabilidade e manutencao
- o novo papel documental e estruturalmente diferente do existente

Nao e motivo valido para criar novo documento:
- preferencia pessoal de organizacao
- receio de editar arquivo existente
- duplicacao por conveniencia
- tentativa de registrar a mesma regra em mais de um lugar
- vontade de preservar arquivo redundante sem funcao clara

## Integracao com o restante do repositorio
A governanca documental do projeto deve observar a seguinte divisao:

- `codex`: governanca, estrutura, papeis, regras e fluxo documental
- `documentacao`: conteudo tecnico, operacional e arquitetural do sistema
- documentacao local de modulo, quando existir: contexto restrito do modulo, sem substituir governanca central

Nenhum desses blocos deve competir pelo mesmo papel.

## Criterio de manutencao futura
O `codex` deve ser mantido de forma continua, disciplinada e incremental.

Um documento precisa ser revisado quando ocorrer qualquer um dos eventos abaixo:

- mudanca de processo entre agentes
- criacao, substituicao ou desativacao de agente
- nova regra normativa com impacto recorrente
- checklist que deixou de refletir a operacao real
- divergencia entre `codex` e `documentacao`
- divergencia entre frontend e backend sobre termos, estados, contratos ou responsabilidades
- surgimento de documentos paralelos para o mesmo assunto
- alteracao relevante de nomenclatura ou escopo
- perda de aderencia ao papel estrutural do arquivo

## Critico para manutencao
- cada alteracao deve preservar a estrutura do bloco correto
- cada revisao deve indicar claramente o papel do documento
- nenhum crescimento futuro deve transformar o `codex` em repositorio de texto solto
- nenhum arquivo deve permanecer sem funcao estrutural clara
- toda evolucao deve simplificar manutencao, nunca aumenta-la artificialmente
- nenhuma revisao deve aumentar ambiguidade entre tipos documentais