# Checklist release-backend

## Nome do checklist
Checklist release-backend

## Objetivo do checklist
Validar se uma demanda de backend esta realmente pronta para release, com escopo claro, risco conhecido, comportamento previsivel, configuracao tratada e ausencia de pendencia critica aberta.

## Escopo de aplicacao
Backend.

Este checklist deve ser usado quando:
- uma demanda backend estiver em fase final de aprovacao
- houver preparacao para release
- uma alteracao impactar contrato, dados, seguranca, integracao ou operacao
- for necessario validar readiness tecnica e operacional

Este checklist nao deve ser usado quando:
- a demanda ainda estiver em enquadramento inicial
- a alteracao ainda nao tiver passado pelas etapas principais do fluxo backend

## Momento de uso
Este checklist deve ser aplicado:
- antes do encerramento formal da demanda backend
- antes do aceite tecnico para release
- antes da publicacao de alteracoes relevantes no backend

## Responsavel pela verificacao
Pode ser executado por:
- `agente-05-qa-confiabilidade-seguranca-api.md`
- `agente-06-plataforma-cloud-devops.md`
- lider tecnico responsavel pela demanda

Deve ser validado por:
- responsavel tecnico do backend
- agente de QA/confiabilidade, quando aplicavel

## Relacao com outros documentos
### Fluxos relacionados
- `01-fluxo-backend.md`

### Agentes relacionados
- `agente-01-arquiteto-chefe-backend.md`
- `agente-05-qa-confiabilidade-seguranca-api.md`
- `agente-06-plataforma-cloud-devops.md`
- `agente-08-seguranca-backend.md`

### Regras relacionadas
- `regras-api-backend.md`
- `regras-dominio-backend.md`
- `regras-seguranca-backend.md`
- `regras-plataforma-operacao-backend.md`
- `regras-observabilidade-backend.md`

### Modelos relacionados
- `modelo-checklist.md`

## Itens de verificacao
Marcar cada item como:
- conforme
- nao conforme
- nao aplicavel

### Bloco 1 - validacao de escopo e fluxo
- [ ] A demanda passou pelas etapas aplicaveis do `01-fluxo-backend.md`
- [ ] O escopo da demanda esta claramente delimitado
- [ ] Nao existe contradicao aberta entre arquitetura, dominio, contrato, dados e operacao
- [ ] Qualquer dispensa de etapa foi formalmente justificada
- [ ] O impacto tecnico da demanda esta registrado de forma objetiva

### Bloco 2 - validacao de dominio e contrato
- [ ] A regra de negocio foi validada
- [ ] Nao existe contradicao funcional aberta
- [ ] O contrato da API esta coerente com a regra de negocio
- [ ] O impacto sobre consumidores foi avaliado quando aplicavel
- [ ] Nao ha quebra silenciosa de contrato sendo introduzida

### Bloco 3 - validacao de dados e persistencia
- [ ] O impacto em dados persistidos foi avaliado
- [ ] A necessidade ou dispensa de migration foi registrada
- [ ] Historico, ranking ou rastreabilidade foram considerados quando aplicavel
- [ ] Nao existe risco relevante de integridade sem tratamento
- [ ] A alteracao em leitura e escrita esta coerente com a demanda

### Bloco 4 - validacao de seguranca
- [ ] A demanda foi avaliada sob a perspectiva de seguranca quando aplicavel
- [ ] Nao ha exposicao indevida de dados
- [ ] Autenticacao e autorizacao foram tratadas quando necessarias
- [ ] Erros e respostas nao vazam informacao sensivel
- [ ] Risco relevante de seguranca possui mitigacao ou registro formal

### Bloco 5 - validacao de performance e confiabilidade
- [ ] O risco de performance foi avaliado quando aplicavel
- [ ] Nao ha gargalo previsivel sem mitigacao registrada
- [ ] O comportamento em sucesso, erro e falha foi considerado
- [ ] O risco de regressao foi avaliado
- [ ] Os criterios minimos de validacao ficaram claros

### Bloco 6 - validacao de integracao e operacao
- [ ] Dependencias externas foram avaliadas quando aplicavel
- [ ] Timeout, falha e contingencia foram considerados quando aplicavel
- [ ] Variaveis, secrets e configuracoes necessarias foram identificados
- [ ] Existe readiness minima para deploy e release
- [ ] O impacto operacional foi registrado quando aplicavel

### Bloco 7 - validacao de observabilidade e sustentacao
- [ ] Existe observabilidade minima para diagnostico quando aplicavel
- [ ] Nao ha dependencia operacional critica sem dono definido
- [ ] Riscos residuais foram declarados
- [ ] Pendencias abertas foram registradas de forma objetiva
- [ ] A demanda pode ser acompanhada em ambiente sem cegueira operacional relevante

## Criterio de pronto
Este checklist so pode ser considerado concluido quando:
- todos os itens bloqueantes estiverem conformes
- os itens nao aplicaveis estiverem justificados
- nao houver pendencia critica sem dono
- riscos residuais estiverem declarados
- a demanda puder ser liberada com clareza tecnica e operacional

## Criterio de reprovacao
O checklist deve ser considerado reprovado quando:
- houver item bloqueante nao conforme
- existir contradicao aberta entre camadas da demanda
- a release depender de suposicao nao validada
- houver risco critico sem mitigacao ou registro formal

## Itens que bloqueiam aprovacao
Os itens abaixo, se nao conformes, impedem avancar:
- escopo nao delimitado
- contrato incoerente com a regra de negocio
- risco relevante de seguranca sem tratamento
- migration ou impacto em dados sem avaliacao
- dependencia externa critica sem leitura de falha
- readiness operacional insuficiente
- risco residual critico nao declarado

## Itens que podem gerar pendencia
Os itens abaixo, se nao conformes, podem gerar pendencia controlada:
- melhoria de observabilidade nao critica
- ajuste futuro de refinamento de performance nao bloqueante
- evolucao secundaria de logging ou telemetria
- melhoria de documentacao complementar nao impeditiva

## Evidencias esperadas
A execucao deste checklist deve gerar, quando aplicavel:
- registro do status de cada item
- justificativa de itens nao aplicaveis
- riscos residuais declarados
- lista de pendencias abertas
- parecer final de release backend

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
- registrar o motivo da reprovacao
- identificar o agente ou etapa que precisa ser reaberta
- corrigir o ponto critico antes de nova avaliacao
- manter rastreabilidade da pendencia e da decisao tomada

## Anti-padroes a evitar
- aprovar release porque "parece estar funcionando"
- marcar item como nao aplicavel sem justificativa
- usar checklist como substituto de regra normativa
- ignorar risco residual relevante
- encerrar demanda sem declarar pendencia
- aprovar release sem readiness operacional real

## Checklist rapido de validacao do proprio checklist
- o objetivo do checklist esta claro?
- o momento de uso esta correto?
- os itens sao verificaveis?
- os itens bloqueantes estao bem definidos?
- o criterio de pronto esta objetivo?
- o criterio de reprovacao esta claro?
- as evidencias esperadas fazem sentido?
- o checklist ajuda decisao real de release?
- o checklist esta alinhado ao fluxo e as regras do backend?
- o checklist e operacional e nao decorativo?

## Observacoes de preenchimento
- usar pt-BR sem acentos, sem cedilha e sem espacos em nomes tecnicos quando aplicavel
- evitar item generico sem verificacao objetiva
- evitar transformar checklist em texto decorativo
- separar claramente bloqueio de pendencia
- manter alinhamento com fluxo, agentes e regras do backend