# Checklist pronto-para-migration-backend

## Nome do checklist
Checklist pronto-para-migration-backend

## Objetivo do checklist
Validar se uma alteracao de dados backend esta pronta para gerar ou aplicar migration com seguranca estrutural, rastreabilidade e coerencia com dominio e operacao.

## Escopo de aplicacao
Backend.

Este checklist deve ser usado quando:
- houver alteracao de schema
- houver criacao de migration
- houver mudanca estrutural em entidade ou relacionamento
- houver impacto persistente relevante em dados

Este checklist nao deve ser usado quando:
- nao houver alteracao em schema
- a mudanca for puramente comportamental e sem impacto persistente

## Momento de uso
Este checklist deve ser aplicado:
- antes de consolidar migration
- antes do aceite tecnico de alteracao estrutural em dados
- antes de release de demanda com impacto em schema

## Responsavel pela verificacao
Pode ser executado por:
- `agente-04-arquitetura-dados-performance.md`
- lider tecnico do backend

Deve ser validado por:
- responsavel tecnico do backend
- agente de plataforma ou release, quando aplicavel

## Relacao com outros documentos
### Fluxos relacionados
- `01-fluxo-backend.md`

### Agentes relacionados
- `agente-04-arquitetura-dados-performance.md`
- `agente-03-lider-backend-nucleo.md`
- `agente-06-plataforma-cloud-devops.md`

### Regras relacionadas
- `regras-dominio-backend.md`
- `regras-plataforma-operacao-backend.md`

### Modelos relacionados
- `modelo-checklist.md`

## Itens de verificacao
Marcar cada item como:
- conforme
- nao conforme
- nao aplicavel

### Bloco 1 - validacao de impacto
- [ ] O impacto em dados persistidos foi avaliado
- [ ] A alteracao de schema esta claramente justificada
- [ ] O impacto funcional foi considerado
- [ ] Historico, ranking ou rastreabilidade foram avaliados quando aplicavel
- [ ] Nao existe contradicao entre dominio e estrutura persistida

### Bloco 2 - validacao estrutural
- [ ] A migration e realmente necessaria
- [ ] O desenho da alteracao esta coerente com a modelagem
- [ ] Nao ha sobreposicao estrutural indevida
- [ ] A alteracao e revisavel e rastreavel
- [ ] O risco de integridade foi avaliado

### Bloco 3 - validacao operacional
- [ ] O impacto operacional da migration foi considerado
- [ ] Nao ha dependencia oculta de ambiente ou release
- [ ] O risco de falha ou rollback foi pensado quando aplicavel
- [ ] A readiness minima para publicacao da alteracao existe
- [ ] Qualquer risco residual relevante foi registrado

## Criterio de pronto
Este checklist so pode ser considerado concluido quando:
- nao houver item bloqueante nao conforme
- a necessidade da migration estiver clara
- a alteracao estrutural estiver justificada
- impacto funcional e operacional estiver tratado
- risco residual relevante estiver declarado

## Criterio de reprovacao
O checklist deve ser considerado reprovado quando:
- a migration nao tiver justificativa clara
- houver risco de integridade sem avaliacao
- a alteracao estrutural contradisser o dominio
- existir impacto operacional relevante sem tratamento

## Itens que bloqueiam aprovacao
- schema alterado sem justificativa
- risco de integridade sem avaliacao
- contradicao entre dominio e persistencia
- readiness operacional inexistente
- migration sem rastreabilidade minima

## Itens que podem gerar pendencia
- melhoria futura de observabilidade da alteracao estrutural
- refinamento nao bloqueante de documentacao tecnica
- ajuste complementar de rollout operacional

## Evidencias esperadas
- justificativa da migration
- leitura de impacto em dados
- riscos residuais registrados
- status dos itens bloqueantes
- observacoes de readiness operacional

## Registro de resultado
### Status final
- [ ] aprovado
- [ ] aprovado com pendencias
- [ ] reprovado
- [ ] nao aplicavel

### Observacoes
[REGISTRAR IMPACTO, RISCO, PENDENCIA, NECESSIDADE DE RETORNO E DECISAO TOMADA]

## Acao esperada em caso de falha
Quando houver item nao conforme, deve-se:
- interromper aprovacao da migration
- revisar impacto estrutural
- alinhar com dominio, dados ou plataforma
- corrigir readiness operacional
- reavaliar antes de nova aprovacao

## Anti-padroes a evitar
- criar migration por impulso
- tratar schema como detalhe sem impacto funcional
- ignorar historico ou ranking
- publicar alteracao estrutural sem readiness
- aprovar migration sem rastreabilidade
- deixar integridade para ser verificada depois

## Checklist rapido de validacao do proprio checklist
- a necessidade da migration esta clara?
- os itens bloqueantes estao objetivos?
- ha foco em integridade, dominio e operacao?
- o checklist e operacional?

## Observacoes de preenchimento
- usar pt-BR sem acentos, sem cedilha e sem espacos em nomes tecnicos quando aplicavel
- manter foco em impacto estrutural, integridade e readiness
- evitar item subjetivo