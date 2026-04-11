# Regras seguranca-backend

## Nome da regra
Regras seguranca-backend

## Objetivo da regra
Definir o padrao normativo obrigatorio para autenticacao, autorizacao, protecao de dados, exposicao de informacao e superficie de risco no backend, garantindo que o sistema opere com seguranca compativel com sua criticidade.

## Escopo de aplicacao
Backend.

Esta regra se aplica a:
- autenticacao
- autorizacao
- exposicao de dados
- tratamento de erro sob perspectiva de seguranca
- contratos com dados sensiveis
- endpoints com risco de abuso
- integracoes com impacto de seguranca
- secrets, credenciais e configuracoes sensiveis

Esta regra nao se aplica a:
- preferencia de implementacao sem impacto em risco
- detalhamento de infraestrutura fora do escopo do backend
- regra de negocio que nao altere seguranca, acesso ou dados protegidos

## Motivacao
Seguranca nao pode ser tratada como detalhe de ultima etapa. Sem uma regra clara, o sistema tende a sofrer com:
- exposicao indevida de dados
- autorizacao insuficiente
- comportamento inseguro em contratos
- erro com vazamento de informacao
- endpoints suscetiveis a abuso
- configuracao fragil de credenciais e acesso

Esta regra existe para garantir que a seguranca seja tratada como parte obrigatoria do desenho e da validacao do backend.

## Fonte de verdade
Esta regra e a fonte de verdade principal para padrao normativo de seguranca no backend.

### Tipo de relacao com o assunto
- [x] Esta regra e a fonte de verdade principal
- [ ] Esta regra complementa outra fonte de verdade
- [ ] Esta regra depende de documento superior

### Documento fonte relacionado
- `01-fluxo-backend.md`
- `agente-08-seguranca-backend.md`

## Regra normativa
A seguranca do backend deve obedecer obrigatoriamente aos seguintes principios:

- toda demanda deve ser avaliada sob a perspectiva de autenticacao e autorizacao quando aplicavel
- nenhum endpoint deve expor dado sensivel alem do necessario
- todo acesso deve respeitar escopo, papel ou permissao compativel com o comportamento solicitado
- erros nao podem vazar informacao sensivel ou detalhe tecnico desnecessario
- integracoes externas nao podem ampliar superficie de risco sem tratamento correspondente
- nenhuma conveniencia tecnica justifica enfraquecimento de protecao
- secrets, credenciais e configuracoes sensiveis devem ser tratados de forma controlada e rastreavel

## Obrigacoes
As obrigacoes desta regra sao:

- validar autenticacao e autorizacao quando houver acesso protegido
- limitar exposicao de dados ao estritamente necessario
- revisar respostas e erros sob a perspectiva de risco
- tratar impacto de seguranca em integracoes e dependencias externas
- proteger secrets, credenciais e configuracoes sensiveis
- registrar risco e mitigacao quando a demanda envolver superficie de ataque relevante

## Restricoes
As restricoes desta regra sao:

- nao confiar no cliente para definir permissao
- nao expor dados sensiveis sem necessidade legitima
- nao vazar detalhe tecnico relevante em erro ou log exposto
- nao flexibilizar autorizacao por conveniencia
- nao usar configuracao insegura como atalho operacional
- nao aprovar endpoint com risco evidente sem mitigacao ou registro formal

## Excecoes permitidas
Esta regra so pode ser flexibilizada quando:
- houver exigencia tecnica formal de compatibilidade temporaria
- existir migracao controlada com mitigacao registrada
- houver restricao legada formalmente assumida e rastreada

Toda excecao deve:
- ser justificada
- ser registrada
- nao contradizer fonte de verdade superior
- nao virar padrao informal recorrente

## Criterio de aplicacao
Esta regra deve ser aplicada quando houver:
- novo endpoint
- alteracao de endpoint existente
- acesso a dado sensivel
- mudanca de autenticacao ou autorizacao
- nova integracao externa
- alteracao de contrato com impacto de seguranca
- necessidade de validar superficie de risco da demanda

## Criterio de nao aplicacao
Esta regra nao deve ser aplicada quando:
- a mudanca for puramente interna e sem impacto em autenticacao, autorizacao, dados ou contrato exposto
- o ajuste nao alterar risco, acesso, resposta ou dependencia relevante
- o assunto pertencer exclusivamente a comportamento visual sem reflexo no backend

## Impacto esperado
Quando esta regra e obedecida, espera-se:
- menor risco de exposicao indevida
- autorizacao coerente com a criticidade da demanda
- erros mais seguros
- integracoes externas com risco melhor controlado
- maior previsibilidade de protecao no backend
- melhor rastreabilidade de risco e mitigacao

## Riscos que esta regra reduz
- acesso indevido
- elevacao de privilegio
- exposicao de dado sensivel
- vazamento de informacao por erro ou contrato
- falha de seguranca em integracao
- uso inadequado de credenciais ou secrets
- enfraquecimento de protecao por conveniencia tecnica

## Padrao minimo de seguranca
Toda demanda de backend deve observar, no minimo:

### Em autenticacao e autorizacao
- definicao clara de quem pode acessar
- validacao do escopo adequado
- ausencia de confianca indevida no cliente

### Em exposicao de dados
- retorno apenas do necessario
- avaliacao do risco do payload
- coerencia entre necessidade funcional e visibilidade do dado

### Em erros e comportamento de falha
- erro compreensivel sem vazamento sensivel
- rastreabilidade interna quando necessario
- ausencia de detalhe tecnico desnecessario na resposta exposta

### Em secrets e configuracoes
- uso controlado
- registro formal da necessidade
- ausencia de dependencia insegura em ambiente

## Sinais de violacao da regra
A regra esta sendo violada quando houver:
- endpoint sem validacao adequada de permissao
- retorno de dado sensivel sem justificativa
- erro expondo stack, detalhe interno ou identificador sensivel
- integracao externa sem leitura de risco de seguranca
- uso fragil de credenciais, token ou configuracao
- contrato ampliando superficie de risco sem tratamento
- permissao mais ampla do que o necessario

## Acao esperada em caso de violacao
Quando a regra for violada, deve-se:
- interromper aprovacao da demanda
- revisar autenticacao, autorizacao ou payload
- corrigir resposta, erro ou configuracao insegura
- reavaliar risco da integracao
- registrar mitigacao, excecao ou pendencia formal
- retornar ao agente de seguranca, arquitetura ou API quando necessario

## Relacao com outros documentos
### Fluxos relacionados
- `01-fluxo-backend.md`

### Agentes relacionados
- `agente-08-seguranca-backend.md`
- `agente-10-experiencia-desenvolvedor-api.md`
- `agente-05-qa-confiabilidade-seguranca-api.md`

### Checklists relacionados
- [PREENCHER QUANDO O CHECKLIST DE SEGURANCA OU RELEASE FOR CRIADO]

### Modelos relacionados
- `modelo-regras.md`

## Relacao com outras regras
### Regras complementares
- `regras-api-backend.md`
- `regras-dominio-backend.md`
- `regras-plataforma-operacao-backend.md`

### Regras que nao podem contradizer esta
- qualquer regra secundaria que normalize comportamento inseguro
- qualquer checklist que substitua exigencia normativa de seguranca
- qualquer documento de frontend que pressione reducao de seguranca sem validacao formal

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
- confiar em validacao do cliente para controlar acesso
- expor mais dado do que o necessario
- tratar seguranca como revisao tardia
- normalizar erro tecnico bruto em resposta exposta
- usar configuracao insegura por pressa operacional
- considerar ausencia de incidente como prova de seguranca

## Checklist rapido de validacao
- a demanda toca autenticacao ou autorizacao?
- ha dado sensivel envolvido?
- o payload expoe apenas o necessario?
- o erro esta seguro?
- existe impacto de integracao externa?
- ha secret, credencial ou configuracao sensivel envolvida?
- a superficie de risco foi tratada?
- existe permissao ampla demais?
- esta regra pode ser aplicada sem ambiguidade?
- os anti-padroes foram evitados?

## Observacoes de preenchimento
- usar pt-BR sem acentos, sem cedilha e sem espacos em nomes tecnicos quando aplicavel
- evitar transformar esta regra em manual de infraestrutura
- evitar duplicar regra de contrato ou dominio nesta camada
- manter foco em autenticacao, autorizacao, exposicao de dados e risco
- descrever de forma normativa e nao decorativa