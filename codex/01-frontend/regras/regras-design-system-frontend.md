# Regras design-system-frontend

## Nome da regra
Regras design-system-frontend

## Objetivo da regra
Definir o padrao normativo obrigatorio para estrutura visual, reutilizacao de componentes, tokens, hierarquia de interface, consistencia de UI e alinhamento com a identidade visual no frontend, garantindo unidade, previsibilidade e escalabilidade da camada visual do produto.

## Escopo de aplicacao
Frontend.

Esta regra se aplica a:
- componentes reutilizaveis
- composicao de interface
- tokens visuais e estruturais
- hierarquia de informacao
- padrao de tela e bloco visual
- consistencia estrutural de UI
- relacao entre componente, modulo e design system
- alinhamento entre estrutura visual e identidade do produto

Esta regra nao se aplica a:
- regra de negocio do backend
- definicao do problema de produto
- implementacao interna sem reflexo estrutural na interface
- comportamento funcional que nao altere estrutura, hierarquia ou consistencia visual
- refinamentos de performance sem impacto em estrutura de interface

## Motivacao
Sem uma regra clara de design system, o frontend tende a crescer com:
- componente duplicado
- variacao desnecessaria de estrutura
- inconsistencia visual entre telas
- perda de previsibilidade na interface
- dificuldade de manutencao e evolucao
- fragmentacao entre modulos e jornadas
- tela que parece pertencer a produtos diferentes
- excecao local virando padrao sem validacao

Esta regra existe para garantir que a interface do produto seja construida sobre uma base reutilizavel, coerente, reconhecivel e sustentavel.

## Fonte de verdade
Esta regra e a fonte de verdade principal para padrao normativo de design system no frontend.

### Tipo de relacao com o assunto
- [x] Esta regra e a fonte de verdade principal
- [ ] Esta regra complementa outra fonte de verdade
- [ ] Esta regra depende de documento superior

### Documento fonte relacionado
- `02-fluxo-frontend.md`
- `agente-03-arquitetura-ui.md`
- `agente-11-identidade-visual.md`

## Regra normativa
O design system do frontend deve obedecer obrigatoriamente aos seguintes principios:

- todo componente deve nascer com funcao clara e justificativa estrutural
- a reutilizacao deve ser priorizada antes da criacao de novo componente
- componentes equivalentes nao podem coexistir sem justificativa formal
- hierarquia de interface deve ser coerente com a importancia da informacao
- tokens visuais e estruturais devem ser aplicados com consistencia
- a interface nao pode crescer por acumulacao de solucoes locais desconectadas
- nenhuma tela deve romper o design system sem justificativa formal
- a estrutura da UI deve permanecer alinhada com a identidade visual do produto
- clareza de uso deve prevalecer sobre preferencia visual isolada
- nenhuma excecao local pode virar padrao sem validacao formal

## Obrigacoes
As obrigacoes desta regra sao:

- avaliar reutilizacao antes de criar novo componente
- manter consistencia estrutural entre telas e modulos
- aplicar hierarquia de informacao com criterio
- preservar padrao de composicao visual e blocos de interface
- manter alinhamento entre estrutura de UI e identidade visual
- registrar quando houver necessidade real de excecao ao design system
- garantir que a base visual possa ser mantida e expandida pelo time
- impedir fragmentacao visual ou estrutural por conveniencia local

## Restricoes
As restricoes desta regra sao:

- nao criar componente novo por conveniencia local
- nao duplicar componente com pequena variacao sem justificativa
- nao usar estrutura de tela incoerente com o restante do sistema
- nao romper tokens ou padroes estruturais por preferencia individual
- nao transformar caso isolado em novo padrao sem validacao
- nao permitir crescimento desordenado da UI
- nao aceitar incoerencia entre estrutura de interface e identidade do produto
- nao priorizar estetica acima de clareza funcional

## Excecoes permitidas
Esta regra so pode ser flexibilizada quando:
- houver necessidade estrutural real nao coberta pelo design system atual
- existir transicao controlada entre padroes antigos e novos
- houver restricao tecnica temporaria formalmente registrada
- houver necessidade comprovada de experimento controlado de interface

Toda excecao deve:
- ser justificada
- ser registrada
- nao contradizer fonte de verdade superior
- nao virar padrao informal recorrente

## Criterio de aplicacao
Esta regra deve ser aplicada quando houver:
- criacao de componente novo
- alteracao estrutural de componente existente
- nova tela ou novo bloco visual relevante
- revisao de hierarquia de interface
- necessidade de consolidar ou simplificar padrao visual
- risco de duplicidade estrutural no frontend
- conflito entre composicao de UI e identidade visual
- mudanca relevante em organizacao de tela ou fluxo visual

## Criterio de nao aplicacao
Esta regra nao deve ser aplicada quando:
- a mudanca for puramente interna e sem reflexo estrutural na UI
- o ajuste for exclusivamente de conteudo sem alterar componente, hierarquia ou composicao
- o tema pertencer somente a comportamento funcional sem efeito na estrutura de interface
- o ajuste for apenas de implementacao tecnica sem impacto visual ou estrutural

## Impacto esperado
Quando esta regra e obedecida, espera-se:
- maior consistencia de interface
- melhor reutilizacao de componentes
- menor risco de duplicidade
- frontend mais previsivel e escalavel
- menor custo de manutencao
- melhor alinhamento entre modulos do sistema
- maior unidade visual do produto
- experiencia mais clara e menos fragmentada

## Riscos que esta regra reduz
- duplicidade de componente
- fragmentacao de UI
- hierarquia visual confusa
- crescimento local sem controle
- dificuldade de manutencao visual
- quebra de consistencia entre telas
- ruptura entre estrutura e identidade visual
- excecao visual ou estrutural virando padrao sem validacao

## Padrao minimo de design system
Toda alteracao estrutural relevante no frontend deve observar, no minimo:

### Em componentes
- funcao clara
- reutilizacao avaliada
- ausencia de duplicidade sem justificativa
- relacao clara com o design system vigente

### Em composicao
- hierarquia de informacao coerente
- relacao clara entre blocos visuais
- padrao compativel com telas semelhantes
- organizacao visual consistente com o restante do produto

### Em tokens e padroes
- aplicacao consistente de tokens
- ausencia de variacao arbitraria
- alinhamento com a base estrutural vigente
- coerencia com a identidade visual oficial

### Em clareza de interface
- prioridade visual correta
- ausencia de ruido estrutural
- consistencia entre acao principal, informacao e navegacao
- preservacao de entendimento rapido da tela

## Regra de fronteira com outras camadas
Esta regra define o padrao estrutural e visual da interface, mas nao substitui outras fontes especializadas.

### Esta regra nao substitui:
- UX, na validacao de uso real e navegacao
- produto, na definicao do problema a ser resolvido
- backend, na definicao de regra de negocio e estado persistido
- plataforma, na avaliacao de sustentacao tecnica e performance
- motion, na definicao funcional de animacao

### Regra pratica de fronteira
- design system define estrutura e consistencia
- identidade visual define linguagem estetica
- UX define clareza de uso
- plataforma valida se a experiencia se sustenta tecnicamente
- backend define regra de negocio e contratos criticos

## Sinais de violacao da regra
A regra esta sendo violada quando houver:
- componente novo sem justificativa estrutural
- duplicidade de componente ou bloco visual
- tela com hierarquia inconsistente
- uso arbitrario de padroes visuais diferentes
- excecao virando regra sem validacao
- frontend crescendo por acumulacao de solucao local
- conflito evidente entre estrutura de UI e identidade visual
- perda de unidade entre telas de uma mesma jornada

## Acao esperada em caso de violacao
Quando a regra for violada, deve-se:
- interromper aprovacao estrutural da interface
- revisar a necessidade do novo componente
- consolidar duplicidade quando aplicavel
- alinhar a composicao ao design system vigente
- corrigir ruptura entre estrutura e identidade visual
- retornar ao agente de arquitetura-ui, identidade visual ou arquitetura de frontend quando necessario

## Relacao com outros documentos
### Fluxos relacionados
- `02-fluxo-frontend.md`

### Agentes relacionados
- `agente-03-arquitetura-ui.md`
- `agente-02-arquiteto-chefe-frontend.md`
- `agente-11-identidade-visual.md`
- `agente-04-ux-mobile-futebol.md`

### Checklists relacionados
- [PREENCHER QUANDO O CHECKLIST DE UI OU RELEASE FRONTEND FOR CRIADO]

### Modelos relacionados
- `modelo-regras.md`

## Relacao com outras regras
### Regras complementares
- qualquer regra futura de UX frontend
- qualquer regra futura de performance frontend
- qualquer regra futura de motion, se existir

### Regras que nao podem contradizer esta
- qualquer documento que normalize duplicidade estrutural
- qualquer checklist que aprove excecao sem justificativa
- qualquer regra secundaria que crie padrao paralelo de UI sem validacao

## Criterios de aceite
Esta regra so pode ser considerada madura quando:
- o objetivo esta claro
- o escopo esta delimitado
- a obrigacao principal esta explicita
- as excecoes estao controladas
- o criterio de aplicacao esta objetivo
- nao ha contradicao com outra fonte de verdade
- a regra pode ser usada operacionalmente pelo time
- a fronteira entre design system, identidade e UX esta clara

## Anti-padroes a evitar
- criar componente novo por pressa
- copiar componente e mudar pouco
- tratar design system como obstaculo
- misturar estrutura sem criterio
- deixar a tela crescer sem padrao
- resolver problema estrutural com ajuste visual superficial
- aceitar incoerencia visual porque “funciona”
- criar excecao local sem registro

## Checklist rapido de validacao
- a reutilizacao foi avaliada?
- o componente novo esta justificado?
- ha duplicidade estrutural?
- a hierarquia de informacao esta coerente?
- os tokens e padroes foram respeitados?
- existe excecao nao registrada?
- a tela segue a base estrutural do sistema?
- ha conflito com identidade visual?
- esta regra pode ser aplicada sem ambiguidade?
- o design system continua coerente?
- os anti-padroes foram evitados?

## Observacoes de preenchimento
- usar pt-BR sem acentos, sem cedilha e sem espacos em nomes tecnicos quando aplicavel
- evitar transformar esta regra em catalogo de componente
- evitar duplicar regra de identidade visual ou UX nesta camada
- manter foco em estrutura, reutilizacao, hierarquia e consistencia de UI
- descrever de forma normativa e nao decorativa