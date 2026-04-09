# Documentacao do Projeto Resenha

Esta pasta concentra a documentacao oficial do projeto `Resenha`, cobrindo produto, arquitetura, backend, aplicativo mobile, infraestrutura, operacao e testes.

## Estrutura

- `01-visao-geral.md`
  Visao executiva do projeto, proposta de valor, objetivos e escopo atual.
- `02-arquitetura.md`
  Arquitetura da solucao, componentes principais, fluxo de alto nivel e decisoes tecnicas.
- `03-backend-api.md`
  Detalhamento da API ASP.NET Core, modulos de negocio, entidades, endpoints e configuracoes.
- `04-frontend-mobile.md`
  Estrutura do app Expo/React Native, navegacao, telas, contexto de autenticacao e integracao com a API.
- `05-banco-de-dados.md`
  Modelo logico da base, entidades principais, relacionamentos e pontos de integridade.
- `06-infra-deploy.md`
  Documentacao de deploy na Oracle Cloud, DNS, HTTPS, nginx, systemd e operacao do ambiente publicado.
- `07-testes-operacao.md`
  Fluxos de teste, scripts automatizados, checklist de validacao e rotina operacional.
- `08-regras-de-negocio.md`
  Regras de negocio por modulo, permissao, estados validos, restricoes e efeitos de cada fluxo.
- `09-fluxos-e-casos-limite.md`
  Fluxos ponta a ponta, cenarios de erro, bloqueios esperados e comportamento em situacoes de borda.
- `10-carga-fut-da-ressaca.md`
  Registro da carga inicial do grupo Fut da Ressaca, com usuarios, partidas, capitainia e classificacao seedada.
- `11-plano-de-acao-produto-release.md`
  Backlog priorizado, roadmap de produto e plano de preparacao para Android, Play Store, iOS e App Store.
- `12-cola-comandos-projeto.md`
  Cola operacional com comandos recorrentes de frontend, backend, SSH, banco, deploy e diagnostico.
- `13-desafio-em-andamento.md`
  Especificacao funcional e tecnica do fluxo de montagem dos times em tempo real, com regras de confirmacao, goleiros, par ou impar e permissoes.
- `14-backlog-desafio-em-andamento.md`
  Backlog tecnico detalhado da feature de montagem dos times, separado por backend, frontend, validacoes, estados e testes.

## Estado Atual do Projeto

- API publicada em producao: `https://api.resenhaapp.com`
- Dominio principal registrado: `resenhaapp.com`
- Aplicativo mobile configurado para consumir a API publica via `EXPO_PUBLIC_API_BASE_URL=https://api.resenhaapp.com`
- Build Android de testes gerada via Expo EAS

## Leitura Recomendada

Para onboarding tecnico rapido:

1. `01-visao-geral.md`
2. `02-arquitetura.md`
3. `03-backend-api.md`
4. `04-frontend-mobile.md`
5. `06-infra-deploy.md`

## Observacoes

- Esta documentacao reflete o estado atual do repositorio e do ambiente publicado.
- Segredos, senhas e chaves reais nao devem ser documentados aqui.
- Sempre que endpoints, fluxos ou infraestrutura mudarem, esta pasta deve ser atualizada junto do codigo.
