# Plano de Acao do Produto e Release

## Objetivo

Este documento organiza os proximos passos do projeto `Resenha` em um plano executavel, com foco em:

- estabilidade do app
- aderencia das regras de negocio
- evolucao de produto
- preparacao para APK
- publicacao futura na Play Store e App Store

Status de referencia deste plano:

- API publicada em `https://api.resenhaapp.com`
- dominio e HTTPS ativos
- build Android interna funcionando via EAS
- base unica React Native + Expo preparada para Android e iOS

## Visao Geral

O projeto ja esta em um ponto bom de validacao real:

- autenticacao funcionando
- grupos funcionando
- partidas, capitao e votacao funcionando
- historico de partidas implementado
- perfil do jogador evoluido com `posicao principal` e `pe dominante`

O proximo salto nao e mais "colocar no ar". O proximo salto e:

1. estabilizar comportamento entre Android e iOS
2. alinhar regras de negocio com o que aparece no app
3. melhorar a qualidade percebida do produto
4. preparar o app para distribuicao real

## Backlog Priorizado

### Alta Prioridade

#### 1. Corrigir regra oficial da classificacao

Problema atual:

- a API ainda ordena por `pontos`, `vitorias` e `gols`
- a regra de negocio definida e:
  - mais pontos
  - menos jogos
  - em empate total, manter ordem definida pelo criterio de negocio

Impacto:

- risco de ranking exibido diferente do esperado
- inconsistencia entre regra falada e regra do sistema

Acao:

- ajustar backend para retornar classificacao no criterio oficial
- revisar telas de classificacao e desempenho

#### 2. Separar partidas futuras de historico

Problema atual:

- a tela/endpoint de historico ainda pode misturar partidas futuras com partidas ja jogadas

Impacto:

- experiencia confusa
- historico perde clareza

Acao:

- criar separacao explicita entre:
  - `Proximas Partidas`
  - `Historico`
- filtrar historico para partidas finalizadas/passadas

#### 3. Fechar bug de campos no Android

Problema atual:

- inputs ainda apresentam instabilidade no Android em alguns cenarios

Impacto:

- problema critico de usabilidade
- pode bloquear login, cadastro e alteracao de senha

Acao:

- isolar telas sensiveis
- revisar `TextInput`, foco, autofill e comportamento do teclado
- validar em Expo Go e em build Android instalada

#### 4. Definir checklist de regressao manual

Acao:

- criar checklist curto para validar a cada release:
  - login
  - cadastro
  - criar grupo
  - entrar em grupo
  - criar partida
  - historico
  - capitao
  - votacao
  - perfil
  - alterar senha

### Media Prioridade

#### 5. Evoluir tela de perfil para perfil de jogador

Sugestoes:

- posicao secundaria
- nivel do jogador
- disponibilidade
- historico individual
- resumo de desempenho

#### 6. Evoluir estatisticas

Por jogador:

- gols por jogo
- assistencias por jogo
- presenca
- aproveitamento
- sequencia de vitorias

Por grupo:

- artilharia
- lider de assistencias
- MVPs
- bolas murchas
- capitaes com mais vitorias

#### 7. Melhorar experiencia do grupo

Sugestoes:

- explicacao do sistema de capitao
- explicacao da pontuacao
- convites por WhatsApp com texto melhor
- feedback visual mais forte para:
  - admin
  - capitao atual
  - MVP
  - goleiro

#### 8. Melhorar observabilidade

Acao:

- centralizar tratamento de erros da API
- padronizar mensagens amigaveis no app
- melhorar logs do backend para diagnostico

### Baixa Prioridade

#### 9. Feed ou mural do grupo

- recados
- aviso de partida
- avisos do admin

#### 10. Notificacoes push

- convite
- partida criada
- votacao aberta
- desafio de capitao

#### 11. Personalizacao visual

- avatar do jogador
- identidade visual do grupo
- capa do grupo

## Plano Tecnico de Release

### Etapa 1. Consolidar Android interno

Objetivo:

- ter um APK realmente estavel para beta fechado

Checklist:

- corrigir bug dos campos no Android
- revisar fluxo de login, cadastro e perfil
- gerar novo APK `preview`
- testar em aparelhos reais

Saida esperada:

- APK interno confiavel para testers

### Etapa 2. Preparar Android para Play Store

Objetivo:

- sair de APK interno para release publica Android

Checklist:

- gerar `AAB` com perfil `production`
- revisar nome final do app
- revisar icone e splash final
- criar screenshots
- preparar descricao curta e longa
- definir categoria
- criar politica de privacidade publica
- validar versao e versionCode

Saida esperada:

- build pronta para submissao na Play Store

### Etapa 3. Preparar iOS

Objetivo:

- deixar o app pronto para build e distribuicao em ambiente Apple

Hoje falta:

- `bundleIdentifier` no iOS
- estrategia de `buildNumber`
- perfil de build iOS no EAS

Checklist:

- configurar `ios.bundleIdentifier`
- configurar `ios.buildNumber`
- adicionar perfil de build iOS em `eas.json`
- gerar build iOS
- validar no iPhone
- preparar TestFlight

Saida esperada:

- primeira build iOS instalada por TestFlight

### Etapa 4. Publicacao nas Lojas

#### Play Store

Necessario:

- conta Google Play Console
- AAB de producao
- icone e screenshots
- descricao do app
- politica de privacidade
- classificacao etaria
- email de suporte

#### Apple App Store

Necessario:

- conta Apple Developer
- build via TestFlight
- App Privacy preenchido
- screenshots iPhone
- descricao do app
- politicas e metadados

## Compatibilidade Android e iOS

Sim, o projeto e plenamente viavel como base unica para Android e iOS.

### Estrategia recomendada

- manter uma unica base Expo/React Native
- tratar diferencas especificas so quando necessario
- validar sempre:
  - Android em build instalada
  - iOS em Expo Go/TestFlight

### Ponto de atencao

O maior risco atual nao e a arquitetura multiplataforma.
O maior risco atual e qualidade de comportamento nos formularios e consistencia de regra de negocio.

## Roadmap Recomendado

### Fase 1. Estabilidade

1. corrigir classificacao oficial
2. separar historico de partidas futuras
3. fechar bug de inputs no Android
4. criar checklist de regressao

### Fase 2. Beta Fechado

1. gerar novo APK
2. testar com grupo pequeno de usuarios reais
3. coletar bugs
4. corrigir fluxo critico

### Fase 3. Pronto para Loja

1. revisar identidade visual final
2. melhorar onboarding e mensagens
3. preparar politica de privacidade
4. configurar release Android e iOS

### Fase 4. Publicacao

1. publicar Android
2. validar operacao
3. subir iOS por TestFlight
4. publicar iOS

## Entregas Recomendadas nas Proximas Sprints

### Sprint 1

- corrigir regra da classificacao
- corrigir historico vs proximas partidas
- fechar bug Android inputs
- criar checklist de regressao

### Sprint 2

- novo APK beta
- testes reais com usuarios
- ajustes de UX
- endurecimento de erros da API

### Sprint 3

- preparar Google Play
- preparar iOS config
- gerar build TestFlight

### Sprint 4

- publicacao Android
- validacao pos-publicacao
- finalizacao de submissao iOS

## Decisoes Estrategicas

### O que manter

- uma unica base para Android e iOS
- backend centralizado na Oracle
- deploy simples sem servicos pagos extras
- crescimento incremental guiado por uso real

### O que evitar agora

- features sociais grandes antes de estabilizar o nucleo
- refatoracao visual ampla antes de fechar bugs criticos
- publicacao nas lojas sem beta fechado real

## Proximo Passo Recomendado

Ordem imediata de execucao:

1. corrigir a classificacao oficial
2. corrigir historico para nao misturar partidas futuras
3. fechar definitivamente o bug dos inputs Android
4. gerar novo APK interno
5. testar com usuarios reais

