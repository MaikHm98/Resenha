# Regras api-backend

## Nome da regra
Regras api-backend

## Objetivo da regra
Definir o padrao normativo obrigatorio para contratos, respostas, erros, semantica, consistencia e previsibilidade da API do backend, garantindo que os consumidores tenham integracao clara, estavel e alinhada ao dominio do sistema.

## Escopo de aplicacao
Backend.

Esta regra se aplica a:
- endpoints do backend
- contratos de entrada e saida
- respostas de sucesso
- respostas de erro
- semantica de API
- comportamento exposto para frontend ou outros consumidores

Esta regra nao se aplica a:
- detalhes internos de implementacao que nao afetam contrato
- documentacao tecnica ampla de arquitetura
- comportamento de UI ou experiencia visual do frontend

## Motivacao
A API do backend e a principal interface de comunicacao entre o sistema e seus consumidores. Sem padrao claro, a tendencia e surgir:
- contrato inconsistente
- resposta imprevisivel
- erro mal tratado
- quebra silenciosa para consumidores
- duplicidade semantica entre endpoints
- atrito de integracao entre backend e frontend

Esta regra existe para reduzir ambiguidade, proteger estabilidade contratual e reforcar o backend como fonte de verdade para comportamento exposto do sistema.

## Fonte de verdade
Esta regra e a fonte de verdade principal para padrao normativo de API no backend.

### Tipo de relacao com o assunto
- [x] Esta regra e a fonte de verdade principal
- [ ] Esta regra complementa outra fonte de verdade
- [ ] Esta regra depende de documento superior

### Documento fonte relacionado
- `01-fluxo-backend.md`
- `agente-10-experiencia-desenvolvedor-api.md`

## Regra normativa
A API do backend deve obedecer obrigatoriamente aos seguintes principios:

- toda resposta deve ser semanticamente coerente com a regra de negocio validada
- todo endpoint deve possuir comportamento previsivel para sucesso, erro e excecao controlada
- alteracao de contrato exige avaliacao de impacto sobre consumidores
- nenhuma resposta deve obrigar o consumidor a adivinhar estado, resultado ou semantica
- nenhum endpoint deve expor estrutura inconsistente em relacao a endpoints equivalentes
- o backend e a fonte de verdade para contratos criticos e estados persistidos
- a API nao pode criar semantica paralela para acomodar conveniencia de implementacao ou interface

## Obrigacoes
As obrigacoes desta regra sao:

- manter consistencia entre nome, intencao e comportamento do endpoint
- manter respostas e erros com significado claro
- registrar impacto contratual em mudancas relevantes
- preservar coerencia entre regra de negocio e contrato exposto
- evitar quebra silenciosa de consumidores
- garantir que o padrao da API possa ser entendido e mantido pelo time

## Restricoes
As restricoes desta regra sao:

- nao criar endpoint com semantica ambigua
- nao mudar contrato sem avaliacao de impacto
- nao expor dado desnecessario no payload
- nao retornar erro tecnico bruto sem tratamento adequado
- nao permitir que dois endpoints equivalentes tenham comportamentos contraditorios sem justificativa formal
- nao usar resposta vaga para esconder indefinicao de dominio

## Excecoes permitidas
Esta regra so pode ser flexibilizada quando:
- houver exigencia tecnica comprovada de compatibilidade
- houver restricao temporaria de migracao controlada
- existir dependencia legada ainda em transicao formal

Toda excecao deve:
- ser justificada
- ser registrada
- nao contradizer fonte de verdade superior
- nao virar padrao informal recorrente

## Criterio de aplicacao
Esta regra deve ser aplicada quando houver:
- criacao de endpoint novo
- alteracao de contrato existente
- revisao de respostas ou erros
- mudanca funcional com impacto em consumo da API
- integracao nova entre backend e frontend
- revisao de compatibilidade entre contrato e dominio

## Criterio de nao aplicacao
Esta regra nao deve ser aplicada quando:
- a alteracao for puramente interna e nao afetar comportamento exposto
- a mudanca estiver restrita a implementacao sem reflexo contratual
- o tema pertencer exclusivamente a modelagem interna sem consumo externo

## Impacto esperado
Quando esta regra e obedecida, espera-se:
- API previsivel
- menor atrito entre backend e consumidores
- menor risco de quebra silenciosa
- maior coerencia entre contrato e dominio
- facilidade de manutencao e evolucao da API

## Riscos que esta regra reduz
- quebra de frontend por alteracao contratual nao tratada
- erro mal interpretado por consumidores
- semantica divergente entre endpoints
- payload inconsistente
- contrato desalinhado da regra de negocio
- dificuldade de manutencao da API no medio prazo

## Padrao minimo de contrato
Toda API do backend deve observar, no minimo:

### Em respostas de sucesso
- estrutura coerente com a semantica do endpoint
- dados suficientes para o consumidor executar o fluxo
- ausencia de ruido desnecessario
- consistencia com endpoints do mesmo tipo

### Em respostas de erro
- mensagem compreensivel para o contexto tecnico
- sem exposicao indevida de detalhe sensivel
- coerencia com a falha ocorrida
- previsibilidade de tratamento para o consumidor

### Em mudancas de contrato
- avaliacao de impacto registrada
- identificacao de consumidores afetados
- justificativa da mudanca
- preservacao de consistencia com o dominio

## Sinais de violacao da regra
A regra esta sendo violada quando houver:
- endpoint com resposta diferente do padrao sem justificativa
- erro generico ou tecnico sem significado claro
- mudanca contratual nao comunicada
- payload com campo inutil ou sem semantica definida
- frontend precisando inferir comportamento sem apoio claro do contrato
- comportamento contraditorio entre endpoints equivalentes

## Acao esperada em caso de violacao
Quando a regra for violada, deve-se:
- interromper aprovacao contratual
- revisar a semantica do endpoint
- reavaliar impacto sobre consumidores
- corrigir resposta, erro ou estrutura do payload
- retornar ao agente de dominio, arquitetura ou experiencia de API quando necessario

## Relacao com outros documentos
### Fluxos relacionados
- `01-fluxo-backend.md`

### Agentes relacionados
- `agente-10-experiencia-desenvolvedor-api.md`
- `agente-09-logica-dominio.md`
- `agente-05-qa-confiabilidade-seguranca-api.md`

### Checklists relacionados
- [PREENCHER QUANDO O CHECKLIST DE API OU RELEASE FOR CRIADO]

### Modelos relacionados
- `modelo-regras.md`

## Relacao com outras regras
### Regras complementares
- `regras-seguranca-backend.md`
- `regras-dominio-backend.md`

### Regras que nao podem contradizer esta
- qualquer regra secundaria que defina comportamento contratual de API
- qualquer checklist que tente substituir o padrao normativo da API

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
- criar endpoint porque e mais facil no frontend
- alterar contrato sem revisar impacto
- usar payload para compensar falta de regra de negocio clara
- tratar erro tecnico bruto como resposta aceitavel
- duplicar semantica de endpoint em variacoes contraditorias
- misturar regra contratual com preferencia subjetiva de implementacao

## Checklist rapido de validacao
- o endpoint representa corretamente a regra de negocio?
- a resposta esta semanticamente clara?
- o erro esta previsivel e tratavel?
- ha impacto em consumidor?
- a mudanca de contrato foi registrada?
- o payload esta coerente com endpoints semelhantes?
- existe quebra silenciosa sendo introduzida?
- ha dado desnecessario sendo exposto?
- esta regra pode ser aplicada sem ambiguidade?
- os anti-padroes foram evitados?

## Observacoes de preenchimento
- usar pt-BR sem acentos, sem cedilha e sem espacos em nomes tecnicos quando aplicavel
- evitar transformar esta regra em manual de implementacao
- evitar duplicar regra de dominio nesta camada
- manter foco em contrato, semantica, resposta e previsibilidade da API
- descrever de forma normativa e nao decorativa