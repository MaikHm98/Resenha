# Checklist release-frontend

## Nome do checklist
Checklist release-frontend

## Objetivo do checklist
Validar se uma demanda de frontend esta realmente pronta para release, com estrutura coerente, identidade preservada, UX clara, responsividade real, desempenho compativel e ausencia de pendencia critica aberta.

## Escopo de aplicacao
Frontend.

Este checklist deve ser usado quando:
- uma demanda frontend estiver em fase final de aprovacao
- houver preparacao para release
- uma alteracao impactar tela, fluxo, componente, identidade, UX ou performance
- for necessario validar readiness tecnica e perceptiva da interface

Este checklist nao deve ser usado quando:
- a demanda ainda estiver em enquadramento inicial
- a alteracao ainda nao tiver passado pelas etapas principais do fluxo frontend
- a interface ainda estiver em definicao estrutural sem consolidacao minima

## Momento de uso
Este checklist deve ser aplicado:
- antes do encerramento formal da demanda frontend
- antes do aceite tecnico para release
- antes da publicacao de alteracoes relevantes no frontend

## Responsavel pela verificacao
Pode ser executado por:
- `agente-07-qa-ux-performance.md`
- `agente-06-lider-frontend-mobile.md`
- responsavel tecnico do frontend

Deve ser validado por:
- responsavel tecnico do frontend
- agente de QA/UX/performance, quando aplicavel

## Relacao com outros documentos
### Fluxos relacionados
- `02-fluxo-frontend.md`

### Agentes relacionados
- `agente-02-arquiteto-chefe-frontend.md`
- `agente-03-arquitetura-ui.md`
- `agente-04-ux-mobile-futebol.md`
- `agente-06-lider-frontend-mobile.md`
- `agente-07-qa-ux-performance.md`
- `agente-08-plataforma-performance-frontend.md`
- `agente-11-identidade-visual.md`

### Regras relacionadas
- `regras-design-system-frontend.md`

### Modelos relacionados
- `modelo-checklist.md`

## Itens de verificacao
Marcar cada item como:
- conforme
- nao conforme
- nao aplicavel

### Bloco 1 - validacao de escopo e fluxo
- [ ] A demanda passou pelas etapas aplicaveis do `02-fluxo-frontend.md`
- [ ] O escopo da alteracao esta claramente delimitado
- [ ] Nao existe contradicao aberta entre produto, arquitetura, UI, identidade, UX e plataforma
- [ ] Qualquer dispensa de etapa foi formalmente justificada
- [ ] O impacto real da alteracao esta registrado de forma objetiva

### Bloco 2 - validacao de estrutura e design system
- [ ] A estrutura da interface esta coerente com o design system
- [ ] Nao ha duplicidade estrutural de componente ou bloco visual sem justificativa
- [ ] A hierarquia de informacao esta clara
- [ ] O componente novo, se existir, esta devidamente justificado
- [ ] Nao ha excecao estrutural relevante sem registro formal

### Bloco 3 - validacao de identidade visual
- [ ] A tela ou fluxo permanece coerente com a identidade do produto
- [ ] Cor, contraste, tipografia e iconografia estao consistentes
- [ ] Nao ha ruptura visual relevante entre modulos ou jornadas
- [ ] A interface permanece reconhecivel como parte do mesmo sistema
- [ ] Nao ha ruido visual desnecessario

### Bloco 4 - validacao de UX e uso real
- [ ] A acao principal esta clara para o usuario
- [ ] O fluxo esta compreensivel no uso real
- [ ] A experiencia mobile-first foi considerada
- [ ] Nao ha atrito operacional relevante nao tratado
- [ ] Loading, erro, vazio e sucesso foram tratados de forma adequada

### Bloco 5 - validacao tecnica e responsividade
- [ ] A responsividade foi validada de forma real, e nao apenas visual
- [ ] Nao ha gargalo perceptivel relevante sem mitigacao
- [ ] A interface continua sustentavel em viewport menor
- [ ] O desempenho percebido esta compativel com a demanda
- [ ] Nao ha fragilidade tecnica relevante nao tratada

### Bloco 6 - validacao final de regressao e release
- [ ] Nao ha regressao perceptivel relevante
- [ ] O fluxo principal continua funcional e claro
- [ ] As pendencias abertas foram registradas de forma objetiva
- [ ] Os riscos residuais foram declarados quando aplicavel
- [ ] A demanda esta pronta para release sem dependencia critica sem dono

## Criterio de pronto
Este checklist so pode ser considerado concluido quando:
- todos os itens bloqueantes estiverem conformes
- os itens nao aplicaveis estiverem justificados
- nao houver pendencia critica sem dono
- riscos residuais estiverem declarados
- a interface puder ser liberada com clareza funcional, visual e tecnica

## Criterio de reprovacao
O checklist deve ser considerado reprovado quando:
- houver item bloqueante nao conforme
- existir contradicao aberta entre estrutura, UX, identidade ou plataforma
- a experiencia estiver confusa, instavel ou tecnicamente fragil
- houver regressao perceptivel relevante sem tratamento

## Itens que bloqueiam aprovacao
Os itens abaixo, se nao conformes, impedem avancar:
- estrutura incoerente com o design system
- fluxo principal confuso
- acao principal pouco evidente
- estado de erro, vazio ou loading mal resolvido
- regressao perceptivel relevante
- problema relevante de responsividade
- risco tecnico relevante sem mitigacao
- pendencia critica sem dono ou sem registro

## Itens que podem gerar pendencia
Os itens abaixo, se nao conformes, podem gerar pendencia controlada:
- refinamento visual nao critico
- melhoria futura de microinteracao
- ajuste complementar de observacao de UX
- melhoria incremental de performance nao bloqueante
- refinamento secundario de alinhamento visual

## Evidencias esperadas
A execucao deste checklist deve gerar, quando aplicavel:
- registro do status de cada item
- justificativa de itens nao aplicaveis
- riscos residuais declarados
- lista de pendencias abertas
- parecer final de release frontend

## Registro de resultado
### Status final
- [ ] aprovado
- [ ] aprovado com pendencias
- [ ] reprovado
- [ ] nao aplicavel

### Observacoes
[REGISTRAR O QUE FOI ENCONTRADO, O QUE FICOU PENDENTE, O QUE BLOQUEOU E O QUE EXIGE ACAO POSTERIOR]

## Acao esperada em caso de falha
Quando houver item nao conforme, deve-se:
- interromper aprovacao de release
- registrar claramente o motivo da reprovacao
- identificar o agente ou etapa que precisa ser reaberta
- corrigir o ponto critico antes de nova validacao
- manter rastreabilidade da pendencia e da decisao tomada

## Anti-padroes a evitar
- aprovar porque "a tela esta bonita"
- marcar item como nao aplicavel sem justificativa
- usar checklist como substituto de regra
- ignorar regressao perceptivel relevante
- empurrar pendencia importante sem classificar o risco
- encerrar demanda sem validar a experiencia real de uso

## Checklist rapido de validacao do proprio checklist
- o objetivo do checklist esta claro?
- o momento de uso esta correto?
- os itens sao verificaveis?
- os itens bloqueantes estao bem definidos?
- o criterio de pronto esta objetivo?
- o criterio de reprovacao esta claro?
- as evidencias esperadas fazem sentido?
- o checklist ajuda decisao real de release?
- o checklist esta alinhado ao fluxo e a regra do frontend?
- o checklist e operacional e nao decorativo?

## Observacoes de preenchimento
- usar pt-BR sem acentos, sem cedilha e sem espacos em nomes tecnicos quando aplicavel
- evitar item generico sem verificacao objetiva
- evitar transformar checklist em texto decorativo
- separar claramente bloqueio de pendencia
- manter alinhamento com fluxo, agentes e regra do frontend