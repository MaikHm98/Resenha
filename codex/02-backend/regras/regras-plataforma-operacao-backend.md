# Regras plataforma-operacao-backend

## Nome da regra
Regras plataforma-operacao-backend

## Objetivo da regra
Definir o padrao normativo obrigatorio para configuracao, variaveis, secrets, observabilidade, deploy, readiness operacional e sustentacao do backend em ambiente, garantindo que a aplicacao possa ser executada, publicada e acompanhada com previsibilidade.

## Escopo de aplicacao
Backend.

Esta regra se aplica a:
- configuracao de ambiente
- variaveis e secrets
- readiness de deploy
- observabilidade
- logging
- monitoramento
- comportamento operacional da API
- impactos de release e publicacao
- diferencas entre ambientes quando afetarem o backend

Esta regra nao se aplica a:
- regra de negocio do sistema
- semantica de contrato da API
- modelagem detalhada de dados
- comportamento puramente visual do frontend

## Motivacao
Uma demanda backend nao esta pronta apenas porque o codigo foi escrito. Sem regra clara de plataforma e operacao, o projeto tende a sofrer com:
- dependencia de configuracao manual nao rastreada
- falha em ambiente por ausencia de variavel ou secret
- falta de observabilidade minima
- release imprevisivel
- comportamento divergente entre ambientes
- dificuldade de diagnostico em producao

Esta regra existe para garantir que toda evolucao do backend possa ser operada, monitorada e sustentada com criterio.

## Fonte de verdade
Esta regra e a fonte de verdade principal para padrao normativo de plataforma e operacao do backend.

### Tipo de relacao com o assunto
- [x] Esta regra e a fonte de verdade principal
- [ ] Esta regra complementa outra fonte de verdade
- [ ] Esta regra depende de documento superior

### Documento fonte relacionado
- `01-fluxo-backend.md`
- `agente-06-plataforma-cloud-devops.md`

## Regra normativa
A plataforma e a operacao do backend devem obedecer obrigatoriamente aos seguintes principios:

- toda demanda com impacto operacional deve explicitar esse impacto
- nenhuma alteracao pode depender de configuracao oculta, manual ou informal para funcionar
- variaveis, secrets e requisitos de ambiente devem ser identificados e controlados
- a aplicacao deve possuir observabilidade minima compativel com a criticidade da demanda
- o release nao pode ocorrer sem readiness operacional proporcional ao risco
- diferencas entre ambientes nao podem ser ignoradas quando afetarem comportamento do backend
- nenhuma demanda pode ser considerada pronta se nao puder ser operada ou acompanhada adequadamente

## Obrigacoes
As obrigacoes desta regra sao:

- mapear configuracoes, variaveis e secrets necessarios
- registrar impacto operacional relevante da demanda
- tratar necessidade de logging, telemetria ou observabilidade
- garantir readiness minima para deploy e release
- revisar dependencia de ambiente, configuracao e infraestrutura de execucao
- impedir publicacao de alteracao sem criterio operacional minimo

## Restricoes
As restricoes desta regra sao:

- nao depender de ajuste manual nao rastreado
- nao tratar ambiente como detalhe tardio
- nao publicar sem readiness operacional minima
- nao assumir que comportamento local representa comportamento em producao
- nao deixar observabilidade critica para depois
- nao normalizar configuracao sensivel fora de controle formal

## Excecoes permitidas
Esta regra so pode ser flexibilizada quando:
- houver restricao temporaria controlada e registrada
- existir migracao operacional em andamento formalmente assumida
- houver dependencia legada ainda nao eliminada, com risco conhecido

Toda excecao deve:
- ser justificada
- ser registrada
- nao contradizer fonte de verdade superior
- nao virar padrao informal recorrente

## Criterio de aplicacao
Esta regra deve ser aplicada quando houver:
- alteracao de backend com impacto em ambiente
- necessidade de nova variavel, secret ou configuracao
- demanda com efeito em deploy ou release
- necessidade de logging, telemetria ou monitoramento
- mudanca que afete readiness operacional
- integracao externa com impacto de ambiente ou observabilidade

## Criterio de nao aplicacao
Esta regra nao deve ser aplicada quando:
- a mudanca for estritamente interna e sem impacto operacional
- nao houver alteracao de ambiente, configuracao, observabilidade ou release
- o tema pertencer exclusivamente a regra funcional sem reflexo em operacao

## Impacto esperado
Quando esta regra e obedecida, espera-se:
- backend mais previsivel em ambiente
- menor risco de falha por configuracao ausente
- release mais controlado
- melhor diagnostico de incidente
- menor dependencia de conhecimento informal
- maior sustentabilidade operacional do sistema

## Riscos que esta regra reduz
- falha de deploy
- erro por variavel ou secret ausente
- falta de visibilidade em producao
- comportamento diferente entre ambientes sem explicacao
- release sem readiness minima
- operacao reativa por ausencia de criterio

## Padrao minimo de operacao
Toda demanda backend com impacto operacional deve observar, no minimo:

### Em configuracao
- variaveis identificadas
- secrets identificados
- necessidade de ambiente registrada
- ausencia de dependencia manual informal

### Em observabilidade
- logging compativel com o risco
- rastreabilidade minima para diagnostico
- telemetria quando a criticidade justificar

### Em deploy e release
- readiness minima definida
- impacto operacional conhecido
- comportamento esperado em ambiente entendido

### Em diferencas de ambiente
- divergencia relevante mapeada
- risco operacional registrado
- ausencia de suposicao de equivalencia automatica entre ambientes

## Sinais de violacao da regra
A regra esta sendo violada quando houver:
- demanda que precisa de variavel ou secret e isso nao foi registrado
- alteracao que depende de configuracao manual nao formalizada
- release sem readiness operacional minima
- ausencia de logging ou monitoramento em fluxo critico
- comportamento divergente entre ambientes ignorado
- producao sendo tratada como extensao direta do ambiente local

## Acao esperada em caso de violacao
Quando a regra for violada, deve-se:
- interromper readiness de release
- registrar configuracao e impacto operacional ausentes
- revisar necessidade de observabilidade
- corrigir dependencia de ambiente nao tratada
- retornar ao agente de plataforma, integracao, seguranca ou arquitetura quando necessario

## Relacao com outros documentos
### Fluxos relacionados
- `01-fluxo-backend.md`

### Agentes relacionados
- `agente-06-plataforma-cloud-devops.md`
- `agente-12-integracao-servicos-externos.md`
- `agente-08-seguranca-backend.md`

### Checklists relacionados
- [PREENCHER QUANDO O CHECKLIST DE RELEASE OU OPERACAO FOR CRIADO]

### Modelos relacionados
- `modelo-regras.md`

## Relacao com outras regras
### Regras complementares
- `regras-seguranca-backend.md`
- `regras-api-backend.md`

### Regras que nao podem contradizer esta
- qualquer documento que normalize configuracao informal
- qualquer checklist que aprove release sem readiness minima
- qualquer fluxo secundario que ignore impacto operacional relevante

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
- tratar operacao como detalhe de ultima hora
- depender de variavel manual nao rastreada
- subir alteracao sem observabilidade minima
- assumir que local, homologacao e producao sao equivalentes
- considerar deploy concluido como prova de readiness
- deixar conhecimento operacional critico fora da documentacao

## Checklist rapido de validacao
- ha impacto operacional?
- existem variaveis ou secrets novos?
- a configuracao foi mapeada?
- ha observabilidade minima?
- a readiness de release foi tratada?
- existe diferenca relevante entre ambientes?
- o comportamento em producao esta compreendido?
- ha dependencia manual nao formalizada?
- esta regra pode ser aplicada sem ambiguidade?
- os anti-padroes foram evitados?

## Observacoes de preenchimento
- usar pt-BR sem acentos, sem cedilha e sem espacos em nomes tecnicos quando aplicavel
- evitar transformar esta regra em manual de deploy detalhado
- evitar duplicar regra de seguranca ou integracao nesta camada
- manter foco em ambiente, readiness, observabilidade e operacao
- descrever de forma normativa e nao decorativa