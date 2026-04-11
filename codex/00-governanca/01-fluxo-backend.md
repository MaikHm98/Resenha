# Fluxo backend

## Objetivo do fluxo backend
Este fluxo define a ordem oficial de trabalho para demandas de backend dentro da governanca documental do projeto.

Seu papel e orientar:
- como os agentes de backend devem ser acionados
- quais entradas cada etapa precisa receber
- quais saidas cada etapa deve produzir
- quais criterios de passagem devem ser respeitados
- quando uma demanda backend pode ser considerada aprovada e encerrada

O foco deste fluxo nao e descrever implementacao de codigo. O foco e organizar:
- tomada de decisao
- validacao tecnica
- controle de qualidade documental
- rastreabilidade de impacto
- proporcionalidade de analise conforme o risco da demanda

## Quando este fluxo deve ser usado
Este fluxo deve ser usado sempre que a demanda envolver pelo menos um dos pontos abaixo:

- contrato de API
- regra de dominio
- persistencia e modelagem de dados
- migration ou alteracao de schema
- integracao externa
- seguranca de backend
- performance de backend
- confiabilidade, observabilidade ou operacao
- configuracao de ambiente
- comportamento em tempo real
- preparacao de release de backend

Se a demanda for estritamente de frontend, o fluxo oficial passa a ser o de `02-fluxo-frontend.md`.

Se a demanda for transversal, o backend deve ser tratado como fonte de verdade para:
- regra de negocio
- contratos criticos
- estados persistidos
- comportamento do sistema em nivel de dominio

## Objetivos operacionais do fluxo
Este fluxo existe para garantir que toda demanda backend:
- tenha escopo tecnico claramente delimitado
- respeite a fonte de verdade de dominio
- preserve coerencia de contrato e dados
- nao avance sem avaliacao proporcional de seguranca, confiabilidade e performance
- registre impacto operacional e risco residual
- tenha criterio claro de encerramento
- mantenha rastreabilidade suficiente para revisao futura

## Principio de proporcionalidade
A profundidade da validacao deve ser proporcional ao risco da demanda.

Regra pratica:
- quanto maior a criticidade, maior deve ser a profundidade da avaliacao
- quanto menor o impacto, mais enxuta pode ser a passagem pelas etapas, desde que a dispensa seja justificada
- urgencia nao elimina obrigacao de validacao
- urgencia apenas altera prioridade e ritmo, nunca a necessidade de coerencia tecnica

## Ordem oficial dos agentes backend
Os agentes de backend possuem uma ordem base e uma ordem condicional.

### Ordem base
1. `agente-01-arquiteto-chefe-backend.md`
2. `agente-03-lider-backend-nucleo.md`
3. `agente-09-logica-dominio.md`
4. `agente-10-experiencia-desenvolvedor-api.md`
5. `agente-04-arquitetura-dados-performance.md`
6. `agente-08-seguranca-backend.md`
7. `agente-05-qa-confiabilidade-seguranca-api.md`
8. `agente-11-performance-backend.md`
9. `agente-12-integracao-servicos-externos.md`
10. `agente-06-plataforma-cloud-devops.md`

### Ordem condicional
Os agentes abaixo entram apenas quando a natureza da demanda exigir:

1. `agente-02-arquiteto-sistemas-distribuidos.md`
2. `agente-07-sistemas-tempo-real.md`

### Regra de uso dos agentes
- a ordem base deve ser seguida por padrao
- a ordem condicional so entra quando houver justificativa tecnica clara
- pular etapa ou dispensar agente exige registro explicito da justificativa
- nenhuma demanda critica pode ignorar validacao de dominio, dados, seguranca e encerramento formal
- em demandas com impacto claro de ambiente, deploy, secrets, observabilidade ou infraestrutura, `agente-06-plataforma-cloud-devops.md` pode ser antecipado antes da etapa 5

## Etapa 0 - classificacao inicial da demanda
### Objetivo
Classificar a demanda antes do enquadramento detalhado, para definir criticidade, tipo, profundidade de analise e agentes obrigatorios.

### Agentes principais
- `agente-01-arquiteto-chefe-backend.md`
- `agente-03-lider-backend-nucleo.md`

### Entradas
- descricao inicial da demanda
- origem da demanda
- urgencia percebida
- impacto esperado
- contexto funcional disponivel

### Saidas
- classificacao da demanda
- nivel de criticidade
- indicacao se a demanda e:
  - corretiva
  - evolutiva
  - refatoracao
  - seguranca
  - performance
  - integracao
  - operacao
  - tempo real
- definicao preliminar dos agentes obrigatorios
- indicacao preliminar dos agentes condicionais
- profundidade de validacao esperada

### Evidencias minimas
- tipo da demanda registrado
- criticidade registrada
- agentes base definidos
- necessidade ou nao de agentes condicionais explicitada
- urgencia tratada sem comprometer governanca

### Regra de passagem
A demanda so avanca quando estiver minimamente classificada e houver entendimento inicial do impacto tecnico.

### Tipo de saida esperada
- classificacao consolidada
- criticidade declarada
- orientacao inicial de profundidade
- agentes previstos

---

## Etapa 1 - enquadramento arquitetural
### Objetivo
Delimitar o escopo tecnico do backend e definir como a demanda deve ser tratada dentro do sistema.

### Agentes principais
- `agente-01-arquiteto-chefe-backend.md`
- `agente-03-lider-backend-nucleo.md`

### Entradas
- classificacao inicial aprovada
- descricao da demanda
- contexto funcional
- impacto esperado
- limites de escopo
- dependencias conhecidas

### Saidas
- enquadramento arquitetural da demanda
- delimitacao do escopo de backend
- mapa dos modulos afetados
- riscos iniciais
- definicao dos proximos agentes necessarios

### Evidencias minimas
- escopo delimitado
- fronteiras da demanda registradas
- modulos afetados identificados
- riscos iniciais apontados

### Regra de passagem
- a etapa so avanca quando a demanda estiver claramente enquadrada
- se o escopo ainda estiver ambiguo, a etapa deve ser reaberta antes de qualquer decisao de contrato, dados ou implementacao
- nenhuma etapa posterior pode assumir impacto nao validado nesta etapa

### Tipo de saida esperada
- decisao de enquadramento
- risco inicial registrado
- escopo confirmado
- dependencia tecnica relevante identificada

---

## Etapa 2 - validacao de dominio e contrato
### Objetivo
Garantir que a demanda respeita o dominio do sistema e nao introduz quebra semantica em contratos e estados.

### Agentes principais
- `agente-09-logica-dominio.md`
- `agente-10-experiencia-desenvolvedor-api.md`

### Entradas
- enquadramento arquitetural aprovado
- fluxo funcional afetado
- estados e regras existentes
- contratos atuais da API
- consumidores impactados conhecidos

### Saidas
- validacao do impacto nas regras de negocio
- confirmacao de estados e transicoes
- avaliacao de compatibilidade de contrato
- diretriz para respostas, erros e semantica da API
- registro de impacto em consumidores

### Evidencias minimas
- regra de dominio validada
- impacto de contrato registrado
- semantica da API definida
- dependencias de consumo identificadas

### Regra de passagem
- nenhuma mudanca segue para dados ou implementacao sem validacao explicita de dominio
- qualquer alteracao de contrato deve ter impacto registrado sobre consumidores
- se surgir nova regra de negocio, o escopo arquitetural pode precisar ser reaberto

### Tipo de saida esperada
- decisao de dominio
- impacto de contrato
- consumidor afetado
- retorno de etapa, se necessario

---

## Etapa 3 - dados e modelagem
### Objetivo
Definir o impacto da demanda sobre persistencia, schema, historico, leitura, escrita e integridade dos dados.

### Agentes principais
- `agente-04-arquitetura-dados-performance.md`
- `agente-03-lider-backend-nucleo.md`

### Entradas
- dominio validado
- contrato validado
- impacto em entidades, relacionamentos e queries
- necessidade ou nao de migration
- requisitos de historico, ranking ou rastreabilidade

### Saidas
- decisao sobre schema, migration e persistencia
- avaliacao de impacto em historico, ranking e dados sensiveis
- diretriz de performance para leitura e escrita
- registro de impacto em integridade e revisabilidade

### Evidencias minimas
- confirmacao de impacto ou ausencia de impacto em dados persistidos
- decisao de schema registrada
- necessidade de migration registrada
- riscos de integridade e historico avaliados

### Regra de passagem
- nao avancar sem confirmar se ha ou nao impacto em dados persistidos
- qualquer alteracao de schema deve ser revisavel, justificada e rastreavel
- mudanca de schema relevante exige retorno ao impacto funcional e operacional

### Tipo de saida esperada
- decisao de persistencia
- necessidade ou dispensa de migration
- risco de integridade
- impacto em historico e ranking

---

## Etapa 4 - seguranca, confiabilidade e qualidade
### Objetivo
Garantir que a demanda recebeu avaliacao compativel com seu risco tecnico e operacional.

### Agentes principais
- `agente-08-seguranca-backend.md`
- `agente-05-qa-confiabilidade-seguranca-api.md`
- `agente-11-performance-backend.md`

### Entradas
- desenho funcional aprovado
- desenho de dados aprovado
- rotas, servicos e pontos criticos afetados
- cenarios de erro, abuso, regressao e carga

### Saidas
- validacao de seguranca
- avaliacao de risco de regressao
- criterios minimos de teste
- verificacao de impacto em latencia, carga, consistencia e concorrencia

### Evidencias minimas
- risco de seguranca classificado
- criterios minimos de teste definidos
- risco de regressao registrado
- avaliacao de performance proporcional ao risco documentada

### Regra de passagem
- nao seguir para encerramento tecnico sem analise de seguranca e confiabilidade
- se houver risco alto sem mitigacao, a demanda permanece aberta
- performance nao pode ser tratada como ajuste tardio quando a demanda envolve fluxo critico, concorrencia, volumetria ou operacao sensivel

### Tipo de saida esperada
- risco classificado
- mitigacao prevista
- criterio minimo de teste
- risco residual preliminar

---

## Etapa 5 - integracao, plataforma e operacao
### Objetivo
Garantir que a demanda backend foi avaliada em seu impacto externo e operacional.

### Agentes principais
- `agente-12-integracao-servicos-externos.md`
- `agente-06-plataforma-cloud-devops.md`

### Agentes condicionais
- `agente-02-arquiteto-sistemas-distribuidos.md`
- `agente-07-sistemas-tempo-real.md`

### Entradas
- desenho funcional aprovado
- desenho de dados aprovado
- dependencias externas
- exigencias de ambiente
- necessidade de deploy, configuracao, telemetria ou observabilidade
- necessidade de distribuicao, mensageria ou tempo real

### Saidas
- avaliacao de impacto operacional
- requisitos de configuracao, secrets, ambiente e telemetria
- definicao de dependencias externas e pontos de falha
- necessidade ou dispensa justificada de arquitetura distribuida
- necessidade ou dispensa justificada de tempo real

### Evidencias minimas
- impacto operacional registrado
- dependencias externas mapeadas
- estrategia minima de configuracao e observabilidade registrada
- riscos de falha externa identificados

### Regra de passagem
- a etapa so pode ser dispensada quando a demanda nao alterar integracoes, ambiente, configuracao, observabilidade ou operacao
- dependencia externa nao mapeada bloqueia o encerramento
- demanda com tempo real ou comportamento distribuido nao pode seguir sem validacao explicita dos agentes condicionais aplicaveis

### Tipo de saida esperada
- impacto operacional consolidado
- dependencia externa registrada
- necessidade de plataforma declarada
- exigencia de observabilidade ou deploy identificada

---

## Etapa 6 - consolidacao e encerramento
### Objetivo
Consolidar a decisao final da demanda backend e registrar aprovacao, risco residual e pendencias.

### Agentes principais
- `agente-01-arquiteto-chefe-backend.md`
- `agente-05-qa-confiabilidade-seguranca-api.md`

### Entradas
- saidas consolidadas de todas as etapas aplicaveis
- evidencias minimas de cada etapa
- riscos residuais
- pendencias registradas

### Saidas
- parecer final da demanda
- registro do que foi aprovado
- registro do que ficou pendente
- registro do que exige acompanhamento posterior
- conclusao de encerramento ou manutencao em aberto

### Evidencias minimas
- parecer final emitido
- riscos residuais declarados
- pendencias explicitadas
- justificativas de dispensa registradas

### Regra de passagem
- a demanda so encerra quando houver coerencia entre escopo, dominio, contrato, dados, seguranca e operacao
- demanda com contradicao aberta entre etapas nao pode ser encerrada
- ausencia de evidencia minima impede encerramento formal

### Tipo de saida esperada
- parecer final
- risco residual
- pendencias abertas
- status de encerramento

---

## Entradas e saidas transversais

### Entradas transversais
- objetivo da demanda
- contexto de negocio
- contratos atuais
- dependencias tecnicas
- restricoes operacionais
- historico relevante da funcionalidade
- impacto esperado no usuario ou no sistema

### Saidas transversais
- impacto documentado
- risco de regressao explicitado
- pontos obrigatorios de validacao
- dependencias cruzadas identificadas
- riscos residuais declarados
- decisoes tecnicas registradas

## Regras de passagem entre etapas
- nenhuma etapa pode contradizer decisao consolidada da etapa anterior sem reabrir a discussao
- uma etapa nao pode assumir informacao que ainda nao foi formalizada pela etapa anterior
- mudanca de contrato exige retorno ao dominio e ao enquadramento
- mudanca de schema exige retorno a validacao de impacto funcional e operacional
- risco de seguranca alto bloqueia o encerramento
- dependencia externa nao mapeada bloqueia o encerramento
- justificativa de dispensa de etapa deve ser documentada
- falta de evidencia minima impede aprovacao formal

## Criterios de dispensa de etapa
Uma etapa so pode ser dispensada quando todos os pontos abaixo forem verdadeiros:

- nao houver impacto real na responsabilidade daquela etapa
- a dispensa estiver explicitamente registrada
- a ausencia da etapa nao comprometer rastreabilidade
- nao houver risco oculto relevante
- a dispensa nao contradisser regra anterior do fluxo

Dispensa por conveniencia, pressa ou falta de tempo nao e valida.

## Regra para demandas transversais com frontend
Quando a demanda impactar frontend e backend ao mesmo tempo:

- o backend define a fonte de verdade de dominio, contrato e persistencia
- o frontend pode adaptar experiencia, navegacao e apresentacao
- nenhuma decisao de frontend pode consolidar semantica paralela sem validacao explicita
- qualquer divergencia precisa ser registrada e justificada
- contratos e estados persistidos nao podem ser redefinidos pelo frontend

## Criterio de aprovacao
Uma demanda backend so pode ser aprovada quando todos os pontos abaixo forem verdadeiros:

- o escopo esta claramente delimitado
- as regras de dominio foram validadas
- o contrato da API esta coerente com os consumidores
- o impacto em dados foi tratado de forma revisavel
- seguranca, confiabilidade e performance receberam avaliacao compativel com o risco
- o impacto operacional foi registrado quando aplicavel
- as integracoes externas foram mapeadas quando aplicavel
- os riscos residuais estao claros
- as dispensas de etapa, se existirem, estao justificadas

## Pontos de controle de qualidade
- consistencia de nomenclatura entre dominio, contrato e dados
- previsibilidade de respostas e erros
- preservacao de historico e integridade funcional
- ausencia de alteracao silenciosa em contrato critico
- validacao compativel com a criticidade da demanda
- rastreabilidade do impacto em ambiente, integracoes e operacao
- coerencia entre escopo aprovado e impacto efetivo
- clareza sobre o que foi decidido, validado, dispensado e pendente

## Papel de seguranca, performance, dominio, integracao, QA e devops

### Dominio
Valida se a demanda preserva as regras centrais do sistema e se nao introduz estados, transicoes ou excecoes incompativeis com o produto.

### Seguranca
Valida autenticacao, autorizacao, exposicao de dados, tratamento de erro, abuso de endpoint, superficie de risco e qualquer desvio que aumente vulnerabilidade.

### Performance
Valida impacto em consultas, escrita, concorrencia, volumetria, latencia e comportamento sob carga.

### Integracao
Valida dependencia externa, contrato entre servicos, tolerancia a falha, contingencia, timeout e consistencia de integracao.

### QA e confiabilidade
Valida risco de regressao, cobertura minima de cenarios, previsibilidade dos fluxos, comportamento em falha e clareza de criterios de aceite.

### Devops e plataforma
Valida configuracao, ambiente, observabilidade, deploy, variaveis, secrets e implicacoes operacionais.

## Criterio de encerramento de uma demanda backend
Uma demanda backend esta encerrada quando:

- todas as etapas aplicaveis foram concluidas ou justificadamente dispensadas
- as evidencias minimas foram registradas
- o impacto foi registrado de forma objetiva
- os riscos residuais foram declarados
- as validacoes minimas ficaram definidas ou executadas
- nao existe contradicao aberta entre arquitetura, dominio, dados e operacao
- nao existe dependencia critica sem dono ou sem tratamento definido

## Anti-padroes a evitar
- alterar contrato antes de validar dominio
- alterar schema sem justificativa revisavel
- tratar performance como ajuste tardio em fluxo critico
- deixar seguranca para o fim quando a demanda envolve autenticacao, autorizacao ou dado sensivel
- aprovar integracao externa sem mapear falha, timeout e configuracao
- encerrar demanda com risco conhecido sem registrar mitigacao ou pendencia
- usar checklist como substituto de regra normativa
- pular etapa sem justificativa formal
- considerar "nao vimos problema" como evidencia suficiente
- encerrar demanda sem declarar o que ficou pendente