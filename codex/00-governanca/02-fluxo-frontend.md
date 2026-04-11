# Fluxo frontend

## Objetivo do fluxo frontend
Este fluxo define a ordem oficial de trabalho para demandas de frontend dentro da governanca documental do projeto.

Seu papel e orientar:
- como os agentes de frontend devem ser acionados
- quais entradas cada etapa precisa receber
- quais saidas cada etapa deve produzir
- quais criterios de passagem devem ser respeitados
- quando uma demanda frontend pode ser considerada aprovada e encerrada

O foco deste fluxo nao e detalhar telas isoladas. O foco e garantir coerencia entre:
- produto
- UX
- UI
- identidade visual
- design system
- responsividade
- motion
- plataforma
- performance
- qualidade de experiencia

## Quando este fluxo deve ser usado
Este fluxo deve ser usado sempre que a demanda envolver pelo menos um dos pontos abaixo:

- experiencia de usuario
- arquitetura de interface
- design system
- responsividade
- identidade visual
- motion e microinteracoes
- gamificacao
- performance de frontend
- qualidade de experiencia
- comportamento de interface
- release de frontend
- impacto visual ou operacional em fluxos de uso

Se a demanda alterar:
- regra de negocio
- contrato critico
- estado persistido
- comportamento central do dominio

o fluxo de frontend deve operar em alinhamento com o fluxo de backend, sem substituir a fonte de verdade do backend.

## Objetivos operacionais do fluxo
Este fluxo existe para garantir que toda demanda frontend:
- tenha problema de experiencia claramente enquadrado
- respeite a identidade visual e o design system do produto
- trate estados de interface de forma completa
- seja pensada para uso real em mobile, tablet e desktop
- nao avance sem avaliacao proporcional de plataforma, performance e QA
- registre dependencia com backend quando existir
- tenha criterio claro de aprovacao e encerramento
- mantenha rastreabilidade suficiente para revisao futura

## Principio de proporcionalidade
A profundidade da validacao deve ser proporcional ao risco da demanda.

Regra pratica:
- quanto maior a criticidade, maior deve ser a profundidade da avaliacao
- quanto menor o impacto, mais enxuta pode ser a passagem pelas etapas, desde que a dispensa seja justificada
- urgencia nao elimina obrigacao de validacao
- urgencia apenas altera prioridade e ritmo, nunca a necessidade de coerencia de experiencia, interface e plataforma

## Ordem oficial dos agentes frontend
Os agentes de frontend possuem uma ordem base e uma ordem condicional.

### Ordem base
1. `agente-01-produto-experiencia.md`
2. `agente-02-arquiteto-chefe-frontend.md`
3. `agente-03-arquitetura-ui.md`
4. `agente-11-identidade-visual.md`
5. `agente-04-ux-mobile-futebol.md`
6. `agente-06-lider-frontend-mobile.md`
7. `agente-08-plataforma-performance-frontend.md`
8. `agente-07-qa-ux-performance.md`

### Ordem condicional
Os agentes abaixo entram apenas quando a demanda exigir refinamento especifico:

1. `agente-05-motion-microinteracoes-futebol.md`
2. `agente-09-gamificacao.md`
3. `agente-10-especialista-performance-mobile.md`

### Regra de uso dos agentes
- a ordem base deve ser seguida por padrao
- a ordem condicional so entra quando houver necessidade real e justificativa clara
- nenhum refinamento visual, de motion ou de engajamento pode contradizer as etapas base
- demandas com impacto evidente em performance mobile podem antecipar `agente-10-especialista-performance-mobile.md`
- toda dispensa de etapa ou agente deve ser registrada

## Etapa 0 - classificacao inicial da demanda
### Objetivo
Classificar a demanda antes do enquadramento detalhado, para definir criticidade, natureza da mudanca e profundidade do fluxo.

### Agentes principais
- `agente-01-produto-experiencia.md`
- `agente-02-arquiteto-chefe-frontend.md`

### Entradas
- descricao inicial da demanda
- origem da demanda
- objetivo esperado
- tela, jornada ou modulo afetado
- urgencia percebida

### Saidas
- classificacao da demanda
- nivel de criticidade
- indicacao se a demanda e:
  - corretiva
  - evolutiva
  - refatoracao visual
  - refatoracao estrutural
  - performance
  - responsividade
  - design system
  - motion
  - gamificacao
  - release
- agentes base obrigatorios
- agentes condicionais provaveis
- profundidade de validacao esperada

### Evidencias minimas
- tipo da demanda registrado
- criticidade registrada
- jornada ou modulo afetado identificado
- agentes condicionais provaveis explicitados
- urgencia tratada sem comprometer governanca

### Regra de passagem
A demanda so avanca quando houver classificacao minima suficiente para enquadrar seu impacto.

### Tipo de saida esperada
- classificacao consolidada
- criticidade declarada
- orientacao inicial de profundidade
- agentes previstos

---

## Etapa 1 - enquadramento de produto e experiencia
### Objetivo
Definir com clareza o problema de experiencia, o contexto de uso e o escopo da demanda.

### Agentes principais
- `agente-01-produto-experiencia.md`
- `agente-02-arquiteto-chefe-frontend.md`

### Entradas
- classificacao inicial aprovada
- objetivo da demanda
- tela, fluxo ou jornada afetada
- problema de experiencia a ser resolvido
- restricoes tecnicas conhecidas
- dependencias de backend conhecidas

### Saidas
- enquadramento do problema
- definicao do escopo funcional e visual
- entendimento do impacto em mobile, tablet e desktop
- identificacao de dependencias com backend, design system ou plataforma
- definicao preliminar de prioridade da experiencia

### Evidencias minimas
- problema de experiencia descrito com clareza
- escopo funcional e visual delimitado
- viewports impactadas identificadas
- dependencia externa ou de backend registrada

### Regra de passagem
- a etapa so avanca quando o problema de experiencia estiver claramente descrito
- se a demanda ainda estiver vaga, nao seguir para UI, UX ou implementacao
- nenhuma etapa posterior pode assumir contexto que nao tenha sido enquadrado aqui

### Tipo de saida esperada
- decisao de enquadramento
- risco de experiencia identificado
- escopo visual e funcional confirmado
- dependencia relevante registrada

---

## Etapa 2 - definicao estrutural de interface
### Objetivo
Definir a estrutura da interface, seu encaixe no design system e sua coerencia com a identidade do produto.

### Agentes principais
- `agente-03-arquitetura-ui.md`
- `agente-11-identidade-visual.md`

### Entradas
- enquadramento aprovado
- componentes, modulos e fluxos impactados
- referencia visual vigente do produto
- elementos do design system aplicaveis

### Saidas
- diretriz estrutural da interface
- componentes candidatos a reutilizacao
- definicao de tokens, hierarquia e linguagem visual aplicavel
- decisao sobre o que deve ser adaptado sem reinventar identidade
- avaliacao de necessidade ou nao de novo componente

### Evidencias minimas
- estrutura visual definida
- reutilizacao ou justificativa para novo componente registrada
- tokens e hierarquia definidos
- coerencia com identidade visual confirmada

### Regra de passagem
- nenhuma tela avanca sem coerencia com a identidade visual vigente
- nenhuma proposta estrutural avanca se criar duplicidade desnecessaria de componente
- nenhum refinamento visual pode romper o design system sem justificativa explicita
- novo componente so pode nascer com justificativa estrutural clara

### Tipo de saida esperada
- decisao estrutural
- uso ou nao de componente novo
- impacto em design system
- risco de duplicidade registrado

---

## Etapa 3 - experiencia mobile e comportamento da interface
### Objetivo
Garantir que a interface funcione de forma realista e clara em contexto de uso, especialmente mobile-first.

### Agentes principais
- `agente-04-ux-mobile-futebol.md`
- `agente-06-lider-frontend-mobile.md`

### Entradas
- estrutura de interface definida
- contexto de uso em mobile, tablet e desktop
- estados de loading, erro, vazio e sucesso
- restricoes de viewport, toque e navegacao

### Saidas
- orientacao de comportamento responsivo
- definicao de prioridade visual por viewport
- tratamento dos estados de interface
- ajuste de fluxo para contexto real de uso
- orientacao sobre acao primaria, leitura, toque e navegacao

### Evidencias minimas
- comportamento mobile definido
- estados principais tratados
- responsividade real considerada
- prioridade de informacao por viewport definida

### Regra de passagem
- nenhum fluxo pode seguir sem resposta clara para loading, erro, vazio e sucesso
- nenhuma experiencia mobile pode ser tratada apenas como reducao de layout desktop
- nenhuma interface central pode ser aprovada sem considerar toque, leitura e navegacao em contexto real

### Tipo de saida esperada
- comportamento responsivo definido
- estados principais tratados
- risco de usabilidade registrado
- necessidade de retorno de etapa, se existir

---

## Etapa 4 - motion, engajamento e refinamento condicional
### Objetivo
Aplicar refinamentos opcionais de percepcao, ritmo, feedback e engajamento sem comprometer clareza, performance ou consistencia.

### Agentes principais
- `agente-05-motion-microinteracoes-futebol.md`
- `agente-09-gamificacao.md`

### Entradas
- base estrutural validada
- comportamento da interface definido
- necessidade real de feedback animado ou engajamento adicional

### Saidas
- decisao sobre motion e microinteracoes
- definicao de uso ou nao de recursos de gamificacao
- limites para preservar legibilidade, performance e consistencia
- justificativa funcional do refinamento

### Evidencias minimas
- uso ou dispensa de motion registrado
- uso ou dispensa de gamificacao registrado
- impacto em clareza e performance avaliado
- justificativa funcional documentada

### Regra de passagem
- esta etapa e opcional
- ela so acontece quando houver justificativa funcional ou de experiencia
- motion nao pode mascarar falha estrutural de UX
- gamificacao nao pode desviar o foco principal do fluxo

### Tipo de saida esperada
- refinamento aprovado ou dispensado
- impacto em performance registrado
- justificativa de valor de experiencia
- limite de aplicacao definido

---

## Etapa 5 - plataforma e performance
### Objetivo
Garantir que a experiencia pretendida seja sustentavel na base tecnica e no comportamento real dos dispositivos.

### Agentes principais
- `agente-08-plataforma-performance-frontend.md`
- `agente-10-especialista-performance-mobile.md`

### Entradas
- interface e comportamento definidos
- dados sobre componentes pesados, renderizacao, assets e adaptacao por dispositivo
- dependencias de API, estado e carregamento

### Saidas
- avaliacao de custo de renderizacao
- orientacao de carregamento, particionamento e responsividade tecnica
- medidas para preservar experiencia fluida em mobile e web
- identificacao de gargalos previsiveis

### Evidencias minimas
- risco de performance registrado
- gargalos previsiveis identificados ou descartados
- medidas de mitigacao definidas quando necessario
- compatibilidade tecnica por viewport e dispositivo avaliada

### Regra de passagem
- o desempenho precisa ser compativel com a experiencia pretendida
- gargalo previsivel sem mitigacao impede encerramento da demanda
- problema de plataforma conhecido nao pode ser empurrado para release sem registro explicito

### Tipo de saida esperada
- risco de performance consolidado
- gargalo identificado
- medida de mitigacao definida
- restricao de plataforma registrada

---

## Etapa 6 - validacao final e release
### Objetivo
Consolidar a validacao final da demanda frontend e registrar aprovacao, risco residual e pendencias.

### Agentes principais
- `agente-07-qa-ux-performance.md`
- `agente-02-arquiteto-chefe-frontend.md`

### Entradas
- saidas consolidadas das etapas anteriores
- evidencias de consistencia visual e funcional
- riscos residuais
- pendencias registradas

### Saidas
- parecer final da experiencia
- validacao de consistencia entre UX, UI, performance e plataforma
- definicao do que foi aprovado
- definicao do que ficou pendente
- definicao do que precisa de acompanhamento posterior

### Evidencias minimas
- parecer final emitido
- riscos residuais declarados
- pendencias explicitadas
- justificativas de dispensa registradas

### Regra de passagem
- a demanda so encerra quando o fluxo estiver coerente do ponto de vista visual, responsivo, funcional e operacional
- ausencia de evidencia minima impede encerramento formal
- contradicao aberta com backend, design system ou plataforma impede encerramento

### Tipo de saida esperada
- parecer final
- risco residual
- pendencias abertas
- status de encerramento

---

## Entradas e saidas transversais

### Entradas transversais
- objetivo da demanda
- contexto de uso
- restricoes de plataforma
- contratos e estados consumidos da API
- referencia visual vigente
- historico da funcionalidade
- dependencia tecnica relevante

### Saidas transversais
- impacto registrado sobre experiencia e interface
- dependencia cruzada com backend identificada
- riscos residuais declarados
- pontos de validacao definidos
- decisoes estruturais registradas
- dispensa de etapa formalizada quando aplicavel

## Regras de passagem entre etapas
- nenhuma etapa pode contradizer a identidade visual vigente sem decisao explicita
- nenhuma etapa pode ignorar impacto em responsividade
- qualquer dependencia de API ou estado compartilhado deve ser validada com a fonte de verdade do backend
- refinamento visual nao pode introduzir novo comportamento funcional sem alinhamento previo
- gargalo de performance conhecido bloqueia encerramento quando comprometer a experiencia real
- falta de evidencia minima impede aprovacao formal
- dispensa de etapa exige justificativa documentada

## Criterios de dispensa de etapa
Uma etapa so pode ser dispensada quando todos os pontos abaixo forem verdadeiros:

- nao houver impacto real na responsabilidade daquela etapa
- a dispensa estiver explicitamente registrada
- a ausencia da etapa nao comprometer rastreabilidade
- nao houver risco oculto relevante
- a dispensa nao contradisser regra anterior do fluxo

Dispensa por pressa, conveniencia ou preferencia subjetiva nao e valida.

## Regra para demandas transversais com backend
Quando a demanda impactar frontend e backend ao mesmo tempo:

- o backend define a fonte de verdade de dominio, contrato e persistencia
- o frontend define experiencia, navegacao, hierarquia e apresentacao
- nenhuma decisao de frontend pode consolidar semantica paralela sem validacao explicita
- qualquer divergencia precisa ser registrada e justificada
- contrato e estado persistido nao podem ser redefinidos pelo frontend

## Criterio de aprovacao
Uma demanda frontend so pode ser aprovada quando todos os pontos abaixo forem verdadeiros:

- o problema de experiencia foi corretamente enquadrado
- a interface respeita a identidade visual do produto
- a solucao e coerente em mobile, tablet e desktop
- os componentes e estados de interface estao consistentes
- performance e plataforma receberam avaliacao compativel com o risco
- QA de experiencia validou os fluxos principais
- dependencias de backend, quando existirem, foram respeitadas
- os riscos residuais estao claros
- as dispensas de etapa, se existirem, estao justificadas

## Pontos de controle de qualidade
- coerencia com a identidade visual vigente
- consistencia de componentes, tokens e hierarquia
- clareza dos estados de loading, erro, vazio e sucesso
- responsividade real, nao apenas adaptacao superficial
- performance suficiente para navegacao fluida
- ausencia de contradicao com contrato ou estado do backend
- clareza do fluxo principal e dos fluxos de excecao
- previsibilidade de comportamento entre viewports

## Papel de UX, UI, performance, motion, QA e plataforma

### UX
Valida se o fluxo atende o contexto real de uso, reduz atrito e preserva clareza operacional para o usuario.

### UI
Valida a estrutura visual, a consistencia dos componentes, a hierarquia da informacao e o alinhamento com a identidade oficial.

### Performance
Valida custo de renderizacao, carregamento, responsividade tecnica e previsibilidade de uso em dispositivos menos potentes.

### Motion
Valida feedback visual e transicoes apenas quando agregarem entendimento, ritmo e contexto de uso.

### QA
Valida os fluxos prioritarios, os estados de interface e o risco de regressao perceptivel ou funcional.

### Plataforma
Valida compatibilidade com a base tecnica, comportamento por viewport, integracao com a API e impacto operacional de release.

## Criterio de encerramento de uma demanda frontend
Uma demanda frontend esta encerrada quando:

- todas as etapas aplicaveis foram concluidas ou justificadamente dispensadas
- as evidencias minimas foram registradas
- a interface esta coerente com a identidade vigente
- os estados principais foram tratados
- a responsividade foi considerada de forma realista
- os riscos residuais foram declarados
- nao existe contradicao aberta com backend, plataforma ou design system
- nao existe dependencia critica sem validacao ou sem dono definido

## Anti-padroes a evitar
- redesenhar interface sem passar pelo enquadramento de experiencia
- criar componente novo sem verificar reutilizacao possivel
- tratar mobile como derivacao tardia do desktop
- usar motion para compensar problema estrutural de UX
- aprovar tela visualmente coerente, mas com estados de erro e vazio indefinidos
- desconsiderar custo de renderizacao em fluxos centrais
- encerrar demanda sem validar impacto em responsividade e integracao
- pular etapa sem justificativa formal
- considerar "a tela esta bonita" como criterio suficiente de aprovacao
- encerrar demanda sem declarar o que ficou pendente