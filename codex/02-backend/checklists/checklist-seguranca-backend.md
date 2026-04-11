# Checklist seguranca-backend

## Nome do checklist
Checklist seguranca-backend

## Objetivo do checklist
Validar se a demanda backend atende os criterios minimos de seguranca para autenticacao, autorizacao, protecao de dados e reducao de superficie de risco.

## Escopo de aplicacao
Backend.

Este checklist deve ser usado quando:
- houver novo endpoint
- houver alteracao em endpoint protegido
- houver acesso a dado sensivel
- houver alteracao de permissao, papel ou escopo
- houver integracao com impacto de seguranca

Este checklist nao deve ser usado quando:
- a mudanca nao tiver impacto em acesso, dados ou risco
- o ajuste for estritamente interno e sem superficie de exposicao

## Momento de uso
Este checklist deve ser aplicado:
- durante validacao de seguranca da demanda
- antes do aceite tecnico de alteracoes sensiveis
- antes de release de demanda com risco relevante

## Responsavel pela verificacao
Pode ser executado por:
- `agente-08-seguranca-backend.md`
- responsavel tecnico do backend

Deve ser validado por:
- responsavel de seguranca ou responsavel tecnico designado
- QA tecnico, quando aplicavel

## Relacao com outros documentos
### Fluxos relacionados
- `01-fluxo-backend.md`

### Agentes relacionados
- `agente-08-seguranca-backend.md`
- `agente-05-qa-confiabilidade-seguranca-api.md`
- `agente-10-experiencia-desenvolvedor-api.md`

### Regras relacionadas
- `regras-seguranca-backend.md`
- `regras-api-backend.md`

### Modelos relacionados
- `modelo-checklist.md`

## Itens de verificacao
Marcar cada item como:
- conforme
- nao conforme
- nao aplicavel

### Bloco 1 - autenticacao e autorizacao
- [ ] A autenticacao foi tratada quando aplicavel
- [ ] A autorizacao esta adequada ao comportamento exposto
- [ ] Nao ha confianca indevida em dado vindo do cliente
- [ ] O escopo de acesso esta proporcional ao comportamento exigido
- [ ] Nao existe permissao ampla demais sem justificativa

### Bloco 2 - protecao de dados
- [ ] O payload expoe apenas o necessario
- [ ] Nao ha dado sensivel indevidamente exposto
- [ ] Nao ha retorno de detalhe tecnico sensivel em erro
- [ ] O contrato foi revisado sob a perspectiva de seguranca
- [ ] O uso de dados criticos foi tratado de forma controlada

### Bloco 3 - risco e integracao
- [ ] O risco da demanda foi avaliado
- [ ] Integracoes externas com impacto de seguranca foram revisadas
- [ ] Variaveis, credenciais ou secrets envolvidos foram considerados
- [ ] Nao ha vulnerabilidade evidente aberta sem tratamento
- [ ] Qualquer risco residual relevante foi registrado

## Criterio de pronto
Este checklist so pode ser considerado concluido quando:
- nao houver item bloqueante nao conforme
- autenticacao e autorizacao estiverem corretas quando aplicavel
- dados sensiveis estiverem protegidos
- risco residual relevante estiver declarado

## Criterio de reprovacao
O checklist deve ser considerado reprovado quando:
- houver exposicao indevida de dado
- a autorizacao estiver insuficiente
- existir vulnerabilidade evidente sem mitigacao
- a demanda depender de comportamento inseguro para funcionar

## Itens que bloqueiam aprovacao
- autenticacao ou autorizacao inadequada
- dado sensivel indevidamente exposto
- erro com vazamento de informacao relevante
- risco critico sem mitigacao
- permissao ampla demais sem controle

## Itens que podem gerar pendencia
- melhoria futura de endurecimento de observabilidade de seguranca
- ajuste complementar de logging seguro
- refinamento nao bloqueante de rastreabilidade

## Evidencias esperadas
- registro de validacao de seguranca
- status dos itens bloqueantes
- riscos residuais declarados
- justificativas de itens nao aplicaveis

## Registro de resultado
### Status final
- [ ] aprovado
- [ ] aprovado com pendencias
- [ ] reprovado
- [ ] nao aplicavel

### Observacoes
[REGISTRAR RISCO, FALHA, MITIGACAO, PENDENCIA E EVENTUAL RETORNO DE ETAPA]

## Acao esperada em caso de falha
Quando houver item nao conforme, deve-se:
- interromper aprovacao da demanda
- corrigir autenticacao, autorizacao, payload ou erro
- registrar mitigacao ou excecao formal
- reavaliar a demanda antes de nova aprovacao

## Anti-padroes a evitar
- confiar no cliente para controlar acesso
- expor mais dado do que o necessario
- empurrar seguranca para depois
- tratar ausencia de incidente como prova de seguranca
- aprovar por pressa

## Checklist rapido de validacao do proprio checklist
- os itens sao verificaveis?
- os bloqueios estao claros?
- ha foco real em risco?
- o checklist e operacional?

## Observacoes de preenchimento
- usar pt-BR sem acentos, sem cedilha e sem espacos em nomes tecnicos quando aplicavel
- manter foco em acesso, dados, resposta e risco
- evitar item subjetivo