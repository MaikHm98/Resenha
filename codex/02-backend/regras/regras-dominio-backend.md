# Regras dominio-backend

## Nome da regra
Regras dominio-backend

## Objetivo da regra
Definir o padrao normativo obrigatorio para preservacao da logica de negocio no backend, garantindo coerencia funcional, integridade de estados, transicoes validas e ausencia de semantica paralela no sistema.

## Escopo de aplicacao
Backend.

Esta regra se aplica a:
- regras de negocio do sistema
- estados e transicoes funcionais
- comportamentos persistidos no backend
- impactos em presenca, partidas, desafios, ranking, historico, grupos e usuarios
- qualquer mudanca funcional com efeito real no dominio

Esta regra nao se aplica a:
- detalhes puramente visuais do frontend
- preferencia de implementacao sem reflexo funcional
- organizacao estrutural da arquitetura que nao altere comportamento de negocio

## Motivacao
O backend deve ser a fonte de verdade das regras de negocio do sistema. Sem uma regra clara de dominio, o projeto tende a sofrer com:
- comportamentos incoerentes
- estados invalidos
- excecoes mal definidas
- contrato desalinhado do negocio
- semantica paralela entre backend e frontend
- regressao funcional dificil de detectar

Esta regra existe para proteger a integridade do comportamento do sistema e impedir que alteracoes tecnicas reescrevam o negocio de forma informal.

## Fonte de verdade
Esta regra e a fonte de verdade principal para padrao normativo de dominio no backend.

### Tipo de relacao com o assunto
- [x] Esta regra e a fonte de verdade principal
- [ ] Esta regra complementa outra fonte de verdade
- [ ] Esta regra depende de documento superior

### Documento fonte relacionado
- `01-fluxo-backend.md`
- `agente-09-logica-dominio.md`

## Regra normativa
A logica de negocio no backend deve obedecer obrigatoriamente aos seguintes principios:

- toda regra de negocio deve ser definida e validada no backend
- todo estado funcional deve possuir semantica clara
- toda transicao entre estados deve ser justificavel e rastreavel
- nenhuma mudanca funcional pode contradizer comportamento consolidado sem registro formal
- o frontend nao pode redefinir regra de negocio, contrato critico ou estado persistido
- excecao funcional nao pode virar regra sem definicao explicita
- nenhuma semantica paralela deve coexistir para o mesmo comportamento de negocio

## Obrigacoes
As obrigacoes desta regra sao:

- validar claramente a regra de negocio antes de consolidar implementacao
- manter estados e transicoes coerentes
- registrar impacto funcional de mudanca relevante
- proteger historico, ranking e comportamento persistido do sistema
- impedir que contrato ou implementacao distorcam a semantica do dominio
- garantir que o time saiba qual e a regra de verdade do comportamento

## Restricoes
As restricoes desta regra sao:

- nao criar novo comportamento funcional sem validacao de dominio
- nao introduzir estado novo sem definir suas transicoes
- nao permitir excecao funcional sem registro explicito
- nao usar contrato ou tela como fonte primaria da regra
- nao manter dois comportamentos diferentes para o mesmo conceito sem justificativa formal
- nao empurrar contradicao funcional para etapa posterior sem registro

## Excecoes permitidas
Esta regra so pode ser flexibilizada quando:
- houver transicao controlada de regra legada
- houver compatibilidade temporaria durante migracao formal
- existir necessidade operacional temporaria registrada e delimitada

Toda excecao deve:
- ser justificada
- ser registrada
- nao contradizer fonte de verdade superior
- nao virar padrao informal recorrente

## Criterio de aplicacao
Esta regra deve ser aplicada quando houver:
- criacao de funcionalidade nova
- alteracao de comportamento funcional
- mudanca de estado ou transicao
- revisao de fluxo de negocio
- impacto em ranking, presenca, partida, desafio, grupo ou usuario
- divergencia entre comportamento esperado e comportamento atual

## Criterio de nao aplicacao
Esta regra nao deve ser aplicada quando:
- a mudanca for puramente interna e sem efeito funcional
- o ajuste for exclusivamente tecnico sem reflexo no dominio
- o assunto pertencer somente a camada visual sem impacto em estado ou regra persistida

## Impacto esperado
Quando esta regra e obedecida, espera-se:
- backend coerente com o negocio
- estados e transicoes previsiveis
- menor risco de regressao funcional
- menor conflito entre frontend e backend
- historico e ranking preservados com integridade
- facilidade de manutencao do comportamento do sistema

## Riscos que esta regra reduz
- comportamento funcional incoerente
- contrato desalinhado do negocio
- estado invalido ou mal definido
- excecao tratada como comportamento comum
- semantica paralela entre camadas
- regressao dificil de rastrear

## Padrao minimo de dominio
Toda mudanca funcional relevante no backend deve observar, no minimo:

### Em regra de negocio
- clareza do comportamento esperado
- validacao do impacto em regras existentes
- ausencia de contradicao com o dominio atual

### Em estados e transicoes
- estado com significado claro
- transicao definida
- excecao mapeada quando houver

### Em impacto funcional
- registro do efeito sobre usuarios, grupos, partidas, historico ou ranking
- avaliacao de compatibilidade com comportamentos existentes
- retorno de etapa quando o dominio for alterado de forma relevante

## Sinais de violacao da regra
A regra esta sendo violada quando houver:
- estado novo sem transicao clara
- comportamento novo sem justificativa de dominio
- contrato sugerindo semantica diferente da regra funcional
- frontend compensando lacuna do backend com regra propria
- excecao funcional sendo tratada como caso normal
- duas interpretacoes diferentes para o mesmo comportamento de negocio

## Acao esperada em caso de violacao
Quando a regra for violada, deve-se:
- interromper aprovacao funcional
- revisar a regra de negocio
- redefinir estado ou transicao de forma explicita
- alinhar contrato e implementacao com o dominio correto
- retornar ao agente de dominio, arquitetura ou API quando necessario

## Relacao com outros documentos
### Fluxos relacionados
- `01-fluxo-backend.md`

### Agentes relacionados
- `agente-09-logica-dominio.md`
- `agente-01-arquiteto-chefe-backend.md`
- `agente-10-experiencia-desenvolvedor-api.md`

### Checklists relacionados
- [PREENCHER QUANDO O CHECKLIST DE VALIDACAO FUNCIONAL FOR CRIADO]

### Modelos relacionados
- `modelo-regras.md`

## Relacao com outras regras
### Regras complementares
- `regras-api-backend.md`
- `regras-arquitetura-dados-backend.md`
- `regras-seguranca-backend.md`

### Regras que nao podem contradizer esta
- qualquer regra secundaria que defina comportamento de negocio
- qualquer checklist que tente substituir regra funcional
- qualquer documento de frontend que tente redefinir regra persistida

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
- criar regra nova para encaixar implementacao pronta
- alterar comportamento funcional sem revisar impacto
- definir estado sem transicao
- deixar excecao sem registro formal
- tratar frontend como fonte de verdade do negocio
- usar contrato para mascarar indefinicao de dominio

## Checklist rapido de validacao
- a regra de negocio esta clara?
- os estados envolvidos foram definidos?
- as transicoes foram consideradas?
- ha impacto em historico, ranking, presenca, partida ou desafio?
- existe contradicao com comportamento consolidado?
- o contrato esta coerente com a regra funcional?
- ha excecao funcional nao tratada?
- existe semantica paralela entre camadas?
- esta regra pode ser aplicada sem ambiguidade?
- os anti-padroes foram evitados?

## Observacoes de preenchimento
- usar pt-BR sem acentos, sem cedilha e sem espacos em nomes tecnicos quando aplicavel
- evitar transformar esta regra em descricao de implementacao
- evitar duplicar regra contratual ou estrutural nesta camada
- manter foco em comportamento de negocio, estado e semantica funcional
- descrever de forma normativa e nao decorativa