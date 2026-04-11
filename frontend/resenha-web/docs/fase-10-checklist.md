# Checklist - Fase 10 (Perfil e Conta)

Objetivo: registrar de forma objetiva o que foi entregue na Fase 10 do fluxo de perfil e conta no `resenha-web`.

## Escopo minimo entregue na fase 10

- [x] Expansao do snapshot autenticado da web
- [x] Compatibilidade com sessoes antigas mantida
- [x] Integracao de `getClubOptions`
- [x] Integracao de `updateProfile`
- [x] Integracao de `changePassword`
- [x] Tela funcional de perfil em `/profile`
- [x] Leitura segura da conta e dos dados esportivos
- [x] Formulario funcional de edicao de perfil
- [x] Email mantido somente em leitura
- [x] Tela funcional de seguranca da conta em `/profile/change-password`
- [x] Fluxo visual de troca de senha com sessao ativa
- [x] Mensagens claras de loading, sucesso e erro

## Endpoints consumidos na fase 10

- [x] `GET /api/users/clubs`
- [x] `PATCH /api/users/profile`
- [x] `PATCH /api/users/change-password`

## Comportamento entregue no fluxo de perfil

- [x] A rota `/profile` deixou de ser placeholder
- [x] A pagina de perfil mostra o snapshot autenticado atual
- [x] A pagina continua segura quando metadados vierem nulos por sessao antiga
- [x] O formulario permite editar apenas:
  - [x] `nome`
  - [x] `goleiro`
  - [x] `timeCoracaoCodigo`
  - [x] `posicaoPrincipal`
  - [x] `peDominante`
- [x] O email permanece visivel apenas para leitura
- [x] O carregamento de clubes usa o endpoint ja existente
- [x] O salvamento usa `PATCH /api/users/profile`
- [x] O snapshot local e atualizado imediatamente apos sucesso

## Comportamento entregue no fluxo de seguranca da conta

- [x] A rota `/profile/change-password` foi adicionada
- [x] O fluxo fica ligado ao perfil por navegacao direta
- [x] O formulario envia `PATCH /api/users/change-password`
- [x] O novo token retornado pelo backend e persistido imediatamente
- [x] Os metadados retornados seguem o mesmo merge seguro da sessao
- [x] A sessao continua valida apos o sucesso
- [x] Nao ha logout automatico apos troca de senha bem-sucedida

## Decisoes de implementacao mantidas simples

- [x] O backend permanece como fonte de verdade de perfil e conta
- [x] O frontend nao cria campos fora do contrato atual
- [x] O frontend nao altera email pelo web
- [x] O token atual nao e sobrescrito com string vazia no update de perfil
- [x] O novo token e persistido apenas quando `changePassword` devolver valor valido
- [x] Ajustes visuais ficam isolados ao fluxo de perfil e conta

## Estados de tela tratados

- [x] Sessao parcial no perfil
- [x] Sessao indisponivel na troca de senha
- [x] Loading no envio do perfil
- [x] Loading no envio da troca de senha
- [x] Sucesso no salvamento do perfil
- [x] Sucesso na troca de senha
- [x] Erro no salvamento do perfil
- [x] Erro na troca de senha
- [x] Falha ao carregar opcoes de clube sem derrubar o formulario

## Acabamento e responsividade da fase

- [x] Leitura refinada em mobile, tablet e desktop
- [x] Consistencia visual entre perfil e seguranca da conta
- [x] Clareza dos estados de sucesso, erro e loading
- [x] Ajustes visuais mantidos dentro do fluxo de perfil e conta

## Fora de escopo da fase 10

- [ ] Alteracao de backend
- [ ] Alteracao de contrato da API
- [ ] Edicao de email
- [ ] Logout apos troca de senha
- [ ] Testes automatizados especificos do fluxo de perfil e conta

## Validacao tecnica da fase 10

- [x] Sem alteracao de backend
- [x] Sem alteracao de contrato da API
- [x] Snapshot de sessao ampliado sem quebrar sessoes antigas
- [x] `npm run lint` funcionando nos commits da fase
- [x] `npm run build` funcionando nos commits da fase
