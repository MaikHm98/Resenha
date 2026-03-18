# 03. Backend API

## Stack

- .NET 6
- ASP.NET Core Web API
- Entity Framework Core
- MySQL
- JWT Bearer Authentication
- Swagger em desenvolvimento

Projeto:

- `backend/Resenha.API/Resenha.API.csproj`

Arquivo principal de bootstrap:

- `backend/Resenha.API/Program.cs`

## Responsabilidades do Backend

- cadastro e autenticacao de usuarios
- recuperacao e redefinicao de senha
- consulta e atualizacao de perfil
- criacao e administracao de grupos
- convite e entrada em grupos
- gerenciamento de partidas
- controle de presenca e ausencia
- sorteio e desafio de capitao
- definicao e consolidacao de resultados
- atualizacao de classificacoes
- votacao de apoio a fluxos de partida

## Configuracao da Aplicacao

### Banco

A API usa a connection string `DefaultConnection`. No bootstrap, a string e normalizada para desabilitar SSL local quando necessario.

### JWT

Configuracoes esperadas:

- `JwtSettings:SecretKey`
- `JwtSettings:Issuer`
- `JwtSettings:Audience`
- `JwtSettings:ExpirationMinutes`

Validacoes importantes:

- chave com no minimo 32 caracteres
- validacao de emissor, audiencia, expiracao e assinatura
- validacao adicional da claim `pwd_at` contra o timestamp de atualizacao da senha do usuario

### CORS

Politica registrada: `AppCors`

- em desenvolvimento: `AllowAnyOrigin`
- em producao: depende de `CorsSettings:AllowedOrigins`

### Forwarded Headers

O backend confia em `X-Forwarded-For` e `X-Forwarded-Proto`, o que e necessario para o cenario com `nginx`.

## Servicos Registrados

Servicos principais:

- `AuthService`
- `InviteEmailService`
- `GroupService`
- `MatchService`
- `CaptainService`
- `ClassificationService`
- `VoteService`

## Modulos

### Autenticacao e Usuario

Controller:

- `UserController.cs`

Responsabilidades:

- cadastro
- login
- recuperacao de senha
- validacao de token de reset
- redefinicao de senha
- listagem de clubes
- atualizacao de perfil

Endpoints:

- `POST /api/users/register`
- `POST /api/users/login`
- `POST /api/users/forgot-password`
- `GET /api/users/reset-password/validate`
- `POST /api/users/reset-password`
- `GET /api/users/clubs`
- `GET /api/users/clubs/logo`
- `PATCH /api/users/profile`

### Grupos

Controller:

- `GroupController.cs`

Responsabilidades:

- criar grupo
- listar grupos do usuario
- gerar e consumir convites
- gerenciar membros
- ajustar agenda/configuracao
- remover grupo

Endpoints:

- `POST /api/groups`
- `GET /api/groups/me`
- `POST /api/groups/{id}/invite`
- `POST /api/groups/join`
- `GET /api/groups/invites/pending`
- `POST /api/groups/invites/{inviteId}/accept`
- `POST /api/groups/invites/{inviteId}/reject`
- `PATCH /api/groups/{id}/schedule`
- `GET /api/groups/{id}/members`
- `GET /api/groups/{id}/invites/pending`
- `POST /api/groups/{id}/members`
- `DELETE /api/groups/{id}/members/{memberUserId}`
- `PATCH /api/groups/{id}/members/{memberUserId}/role`
- `DELETE /api/groups/{id}`

### Partidas

Controller:

- `MatchController.cs`

Responsabilidades:

- criar partida
- listar partidas por grupo
- confirmar presenca
- cancelar confirmacao
- marcar ausencia
- remover ausencia
- apagar partida

Endpoints:

- `POST /api/matches`
- `GET /api/groups/{groupId}/matches`
- `POST /api/matches/{id}/confirm`
- `DELETE /api/matches/{id}/confirm`
- `POST /api/matches/{id}/absent`
- `DELETE /api/matches/{id}/absent`
- `DELETE /api/matches/{id}`

### Capitao

Controller:

- `CaptainController.cs`

Responsabilidades:

- sortear capitao
- consultar estado do ciclo atual
- registrar desafio
- listar elegiveis para capitao
- informar resultado do desafio

Endpoints:

- `POST /api/groups/{groupId}/captain/draw`
- `GET /api/groups/{groupId}/captain`
- `POST /api/groups/{groupId}/captain/challenge`
- `GET /api/groups/{groupId}/captain/eligible/{matchId}`
- `POST /api/groups/{groupId}/captain/result`

### Classificacao e Fechamento

Controller:

- `ClassificationController.cs`

Responsabilidades:

- registrar times da partida
- finalizar partida
- consultar classificacao da temporada
- consultar classificacao historica
- consultar classificacao individual do usuario

Endpoints:

- `POST /api/matches/{id}/teams`
- `POST /api/matches/{id}/finalize`
- `GET /api/groups/{groupId}/classification`
- `GET /api/groups/{groupId}/classification/all-time`
- `GET /api/groups/{groupId}/classification/me`

### Votacao

Controller:

- `VoteController.cs`

Responsabilidades:

- abrir votacao
- registrar voto
- fechar votacao
- aprovar votacao
- consultar estado atual

Endpoints:

- `POST /api/matches/{id}/vote/open`
- `POST /api/matches/{id}/vote`
- `POST /api/matches/{id}/vote/close`
- `POST /api/matches/{id}/vote/approve`
- `GET /api/matches/{id}/vote`

## Seguranca

### Autenticacao

- JWT Bearer
- `Authorization: Bearer <token>`

### Expiracao de Sessao por Senha

Quando a senha muda, a claim `pwd_at` do token deixa de bater com o valor atual persistido, invalidando a sessao.

### Validacao de ModelState

O projeto configura uma resposta padrao para dados invalidos:

- HTTP 400
- objeto com campo `mensagem`

### Swagger

- habilitado apenas em desenvolvimento
- desabilitado em producao

## Arquivos Relevantes

- `backend/Resenha.API/Program.cs`
- `backend/Resenha.API/Data/ResenhaDbContext.cs`
- `backend/Resenha.API/Controllers/*.cs`
- `backend/Resenha.API/Services/*.cs`
- `backend/Resenha.API/Entities/*.cs`
- `backend/Resenha.API/sql/2026-03-03_auth_recovery_and_club.sql`

## Scripts e Publicacao

O projeto suporta publicacao Linux para deploy na VM Oracle. No ambiente atual, a API publicada em producao esta sendo executada como binario self-contained atras de `nginx`.

## Observacoes Operacionais

- a porta interna da API em producao foi padronizada para `127.0.0.1:5000`
- os templates de deploy em `backend/deploy/linux` usam `127.0.0.1:5276` como base e devem ser ajustados conforme a estrategia de publicacao adotada
