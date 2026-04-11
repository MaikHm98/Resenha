# Regras observabilidade-backend

## Nome da regra
Regras observabilidade-backend

## Objetivo da regra
Definir o padrao normativo obrigatorio para logging, telemetria, rastreabilidade e visibilidade operacional do backend, garantindo capacidade minima de diagnostico, acompanhamento e investigacao de falhas ou degradacoes.

## Escopo de aplicacao
Backend.

Esta regra se aplica a:
- logging
- telemetria
- rastreabilidade operacional
- diagnostico de erro
- acompanhamento de comportamento em ambiente
- leitura minima de falha, degradacao ou anomalia
- fluxos criticos que exijam visibilidade

Esta regra nao se aplica a:
- interface visual de monitoramento em si
- regra de negocio do sistema
- implementacao detalhada de infraestrutura externa de observabilidade
- log decorativo sem valor operacional

## Motivacao
Sem observabilidade minima, o backend pode ate funcionar, mas fica dificil de sustentar. A ausencia de regra clara tende a gerar:
- falta de diagnostico em producao
- logs ruidosos e pouco uteis
- falhas sem rastreabilidade
- dificuldade de diferenciar erro, degradacao e comportamento esperado
- dependencia de conhecimento informal para entender incidentes

Esta regra existe para garantir que o sistema tenha visibilidade minima compativel com sua criticidade operacional.

## Fonte de verdade
Esta regra e a fonte de verdade principal para padrao normativo de observabilidade no backend.

### Tipo de relacao com o assunto
- [x] Esta regra e a fonte de verdade principal
- [ ] Esta regra complementa outra fonte de verdade
- [ ] Esta regra depende de documento superior

### Documento fonte relacionado
- `01-fluxo-backend.md`
- `agente-06-plataforma-cloud-devops.md`

## Regra normativa
A observabilidade do backend deve obedecer obrigatoriamente aos seguintes principios:

- toda demanda com impacto operacional relevante deve considerar observabilidade minima
- logs devem existir para apoiar diagnostico, e nao apenas por costume
- nao se deve registrar ruido desnecessario que dificulte leitura operacional
- nenhuma falha relevante deve ser invisivel quando ha expectativa real de acompanhamento
- a visibilidade do sistema deve ser proporcional a criticidade do fluxo
- informacoes registradas devem apoiar rastreabilidade, nao apenas volume de saida
- observabilidade nao pode ser tratada como opcional em fluxo critico

## Obrigacoes
As obrigacoes desta regra sao:

- avaliar necessidade de logging ou telemetria em demandas com impacto operacional
- garantir visibilidade minima de falhas relevantes
- registrar eventos e erros de forma util para diagnostico
- evitar log inutil ou excessivamente ruidoso
- preservar capacidade de rastrear o comportamento da demanda em ambiente
- tratar observabilidade como parte da readiness operacional

## Restricoes
As restricoes desta regra sao:

- nao criar log apenas para "ter log"
- nao deixar fluxo critico sem visibilidade minima
- nao registrar informacao sensivel de forma inadequada
- nao depender de reproduzir localmente para entender toda falha relevante
- nao normalizar ausencia de rastreabilidade operacional
- nao aprovar demanda operacionalmente cega

## Excecoes permitidas
Esta regra so pode ser flexibilizada quando:
- a demanda nao tiver impacto operacional relevante
- houver limitacao temporaria formalmente registrada
- existir fase de transicao tecnica controlada e rastreavel

Toda excecao deve:
- ser justificada
- ser registrada
- nao contradizer fonte de verdade superior
- nao virar padrao informal recorrente

## Criterio de aplicacao
Esta regra deve ser aplicada quando houver:
- fluxo critico de backend
- comportamento relevante em producao
- falha que precise ser diagnosticavel
- integracao com risco operacional
- alteracao com efeito em release, suporte ou sustentacao
- necessidade de rastrear erro, degradacao ou anomalia

## Criterio de nao aplicacao
Esta regra nao deve ser aplicada quando:
- a mudanca for estritamente interna e sem impacto operacional
- nao houver relevancia real de diagnostico ou acompanhamento
- o fluxo nao exigir visibilidade adicional sob criterio tecnico proporcional

## Impacto esperado
Quando esta regra e obedecida, espera-se:
- melhor capacidade de diagnostico
- menor dependencia de conhecimento informal
- mais clareza em caso de incidente
- menos ruido inutil
- maior capacidade de sustentacao em ambiente
- maior maturidade operacional do backend

## Riscos que esta regra reduz
- falha sem rastreabilidade
- incidente dificil de diagnosticar
- log ruidoso sem valor
- backend operacionalmente cego
- suporte reativo sem contexto
- baixa previsibilidade de comportamento em ambiente

## Padrao minimo de observabilidade
Toda demanda com impacto relevante deve observar, no minimo:

### Em logging
- registro util para diagnostico
- ausencia de ruido desnecessario
- preservacao de clareza operacional

### Em falha
- visibilidade minima do erro relevante
- capacidade de rastrear o ponto de quebra
- informacao suficiente para investigar sem vazar dado sensivel

### Em comportamento operacional
- leitura minima do que ocorreu
- capacidade de identificar degradacao ou anomalia quando relevante
- coerencia com a criticidade do fluxo

## Sinais de violacao da regra
A regra esta sendo violada quando houver:
- fluxo critico sem visibilidade minima
- log inutil, confuso ou excessivamente ruidoso
- falha relevante sem capacidade de diagnostico
- informacao importante invisivel em producao
- registro de dado sensivel sem controle
- ausencia total de criterio para observar a demanda em ambiente

## Acao esperada em caso de violacao
Quando a regra for violada, deve-se:
- interromper readiness operacional da demanda
- revisar necessidade de logging ou telemetria
- corrigir ruido ou ausencia de visibilidade
- ajustar o nivel de rastreabilidade conforme a criticidade
- retornar ao agente de plataforma, seguranca ou integracao quando necessario

## Relacao com outros documentos
### Fluxos relacionados
- `01-fluxo-backend.md`

### Agentes relacionados
- `agente-06-plataforma-cloud-devops.md`
- `agente-12-integracao-servicos-externos.md`
- `agente-05-qa-confiabilidade-seguranca-api.md`

### Checklists relacionados
- [PREENCHER QUANDO O CHECKLIST DE RELEASE OU OPERACAO FOR CRIADO]

### Modelos relacionados
- `modelo-regras.md`

## Relacao com outras regras
### Regras complementares
- `regras-plataforma-operacao-backend.md`
- `regras-seguranca-backend.md`

### Regras que nao podem contradizer esta
- qualquer checklist que aprove release sem visibilidade minima quando necessaria
- qualquer documento que normalize cegueira operacional em fluxo critico

## Criterios de aceite
Esta regra so pode ser considerada madura quando:
- o objetivo esta claro
- o escopo esta delimitado
- a obrigacao principal esta explicita
- as excecoes estao controladas
- o criterio de aplicacao esta objetivo
- nao ha contradicao com outra fonte de verdade
- a regra pode ser usada operacionalmente pelo time

## Anti-padroes a evitar
- gerar log demais sem valor
- nao registrar nada relevante
- tratar observabilidade como luxo
- depender apenas de reproducao local para diagnosticar
- normalizar falta de visibilidade em producao
- registrar informacao sensivel sem controle

## Checklist rapido de validacao
- a demanda tem impacto operacional relevante?
- existe necessidade de logging ou telemetria?
- ha visibilidade minima de falha relevante?
- o log ajuda diagnostico real?
- existe ruido excessivo?
- ha risco de ausencia de rastreabilidade?
- o fluxo em ambiente pode ser acompanhado minimamente?
- ha exposicao indevida de dado em observabilidade?
- esta regra pode ser aplicada sem ambiguidade?
- os anti-padroes foram evitados?

## Observacoes de preenchimento
- usar pt-BR sem acentos, sem cedilha e sem espacos em nomes tecnicos quando aplicavel
- evitar transformar esta regra em manual de ferramenta especifica
- evitar duplicar regra de seguranca ou deploy nesta camada
- manter foco em visibilidade, rastreabilidade e diagnostico operacional
- descrever de forma normativa e nao decorativa