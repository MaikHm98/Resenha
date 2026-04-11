# 01. Visao Geral

## Resumo

O `Resenha` e uma plataforma para organizacao de peladas e grupos de futebol, com foco em:

- criacao e participacao em grupos
- agendamento e confirmacao de partidas
- controle de presenca e ausencia
- sorteio e desafio de capitao
- formacao de times e encerramento de partidas
- classificacao por temporada e historico geral
- votacao para resolucao de empates e validacao de etapas
- autenticacao segura, recuperacao de senha e gestao basica de perfil

O projeto esta dividido em duas frentes:

- `backend`: API ASP.NET Core com Entity Framework Core e PostgreSQL
- `frontend`: web React/Vite mobile-first e aplicativo mobile Expo/React Native legado

## Objetivo do Produto

Resolver a dor de grupos informais de futebol que hoje dependem de mensagens soltas em WhatsApp, planilhas e acordos verbais para organizar:

- quem participa
- quem confirmou a presenca
- quem faltou
- quem sera capitao
- quais foram os times
- qual foi o resultado da partida
- como a classificacao deve ser atualizada

## Escopo Atual

### Ja implementado

- cadastro e login com JWT
- recuperacao de senha
- escolha de time do coracao no perfil
- criacao de grupo
- convite para entrada em grupo
- aceite e rejeicao de convites
- controle de membros e papeis
- criacao e remocao de partidas
- confirmacao e cancelamento de presenca
- registro de ausencia
- sorteio de capitao
- desafio de capitao
- definicao de resultado do desafio
- montagem de times
- finalizacao de partida
- classificacao da temporada
- classificacao geral do grupo
- votacao por partida
- deploy produtivo da API com dominio e HTTPS
- build Android interna via Expo EAS

### Fora do escopo atual

- app iOS publicado
- publicacao em Play Store
- painel web administrativo
- notificacoes push
- observabilidade estruturada com logs centralizados
- CI/CD completo
- multitenancy real por cliente/empresa

## Publico-Alvo

- grupos amadores de futebol
- organizadores de peladas recorrentes
- liderancas de grupos que precisam historico e governanca minima
- jogadores que querem acompanhar desempenho, classificacao e rotina do grupo

## Proposta de Valor

- menos dependencia de mensagens informais
- historico centralizado do grupo
- regras explicitas de governanca
- experiencia mobile simples para uso recorrente
- base tecnica que permite evolucao para novos modulos

## Estado Atual de Publicacao

### API

- URL publica: `https://api.resenhaapp.com`
- ambiente hospedado em VM Oracle Cloud
- acesso externo validado com HTTPS

### Aplicativo Android

- build interna gerada via Expo EAS
- distribuicao prevista por APK para testes fechados

## Repositorio

Estrutura principal:

```text
backend/
frontend/
documentacao/
scripts/
```

## Principais Riscos de Produto

- regras de negocio do futebol amador podem variar entre grupos
- classificacao e votacao exigem consistencia transacional e validacao de estado
- deploy self-hosted exige disciplina operacional
- beta fechado ainda precisa validacao real com usuarios

## Proximos Passos Naturais

- teste beta com grupo real
- refinamento de UX com feedback de campo
- estabilizacao de regras de pontuacao e capitania
- endurecimento operacional e automacao de deploy
- preparar versao para distribuicao publica
