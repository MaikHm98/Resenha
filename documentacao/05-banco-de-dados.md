# 05. Banco de Dados

## Tecnologia

- PostgreSQL

## Contexto EF Core

Arquivo:

- `backend/Resenha.API/Data/ResenhaDbContext.cs`

O contexto centraliza todas as tabelas e define os principais indices unicos usados para proteger integridade de negocio.

## Entidades Principais

### Usuarios e Seguranca

- `Usuario`
- `RefreshToken`
- `TokenRecuperacaoSenha`
- `AuditoriaSeguranca`

Responsabilidades:

- identidade do usuario
- estado de ativacao
- fundacao para renovacao segura de sessao
- trilha de recuperacao de senha
- auditoria de eventos de seguranca

### Grupos

- `Grupo`
- `GrupoUsuario`
- `ConviteGrupo`
- `ConfiguracaoGrupo`

Responsabilidades:

- configuracao do grupo
- associacao usuario x grupo
- convite de entrada
- fundacao para parametrizacao futura por admin

### Temporadas e Partidas

- `Temporada`
- `Partida`
- `PresencaPartida`

Responsabilidades:

- separacao por ano/temporada
- agenda e ocorrencia de partidas
- confirmacao de presenca

### Capitao

- `CicloCapitao`
- `CicloCapitaoBloqueado`

Responsabilidades:

- ciclo vigente de capitao
- bloqueios e elegibilidade
- controle da governanca de capitania

### Times e Resultado

- `TimePartida`
- `JogadorTimePartida`
- `ResultadoPartida`
- `EstatisticaPartida`

Responsabilidades:

- composicao dos times
- distribuicao dos jogadores
- resultado consolidado
- estatisticas por partida

### Votacao

- `VotacaoPartida`
- `Voto`

Responsabilidades:

- abertura de rodada de votacao
- votos por usuario
- controle do estado da votacao

### Classificacao

- `ClassificacaoTemporada`
- `ClassificacaoGeralGrupo`

Responsabilidades:

- ranking da temporada
- ranking historico do grupo

## Integridade e Indices Unicos

Indices importantes definidos no contexto:

- `GrupoUsuario(IdGrupo, IdUsuario)`
- `PresencaPartida(IdPartida, IdUsuario)`
- `CicloCapitaoBloqueado(IdCiclo, IdUsuarioBloqueado)`
- `TimePartida(IdPartida, NumeroTime)`
- `JogadorTimePartida(IdTime, IdUsuario)`
- `ResultadoPartida(IdPartida)`
- `VotacaoPartida(IdPartida, Tipo, Rodada)`
- `Voto(IdVotacao, IdUsuarioEleitor)`
- `ClassificacaoTemporada(IdTemporada, IdUsuario)`
- `ClassificacaoGeralGrupo(IdGrupo, IdUsuario)`
- `ConviteGrupo(CodigoConvite)`
- `Usuario(Email)`
- `RefreshToken(TokenHash)`
- `TokenRecuperacaoSenha(TokenHash)`
- `Temporada(IdGrupo, Ano)`
- `ConfiguracaoGrupo(IdGrupo)`

## Implicacoes de Negocio

Esses indices impedem cenarios como:

- membro duplicado no mesmo grupo
- mesma pessoa confirmada duas vezes na mesma partida
- mesmo usuario votando duas vezes na mesma rodada
- duas classificacoes duplicadas para o mesmo usuario no mesmo contexto
- email duplicado em cadastro
- repeticao de refresh token
- repeticao de codigo de convite
- mais de uma configuracao base para o mesmo grupo

## Estrategia de Schema da Fase 0

A fundacao oficial da Fase 0 e o modelo EF Core apontando para PostgreSQL, complementado por scripts SQL versionados em `backend/Resenha.API/sql`.

Nesta fase, o script `2026-04-11_fase0_postgresql_foundation.sql` registra apenas o baseline estrutural novo para:

- refresh token
- configuracao futura por grupo

As proximas fases devem evoluir o schema por migrations ou scripts revisaveis, sempre partindo do modelo EF Core e sem aplicar alteracao destrutiva automaticamente em producao.

## Script Complementar Identificado

Scripts relevantes:

- `backend/Resenha.API/sql/2026-03-03_auth_recovery_and_club.sql`
- `backend/Resenha.API/sql/2026-04-11_fase0_postgresql_foundation.sql`

O script `2026-03-03_auth_recovery_and_club.sql` deve ser aplicado quando for necessario habilitar integralmente:

- recuperacao de senha
- informacoes de time do coracao

O script `2026-04-11_fase0_postgresql_foundation.sql` documenta a fundacao PostgreSQL para:

- `refresh_tokens`
- `configuracoes_grupo`

Ele nao substitui uma migration completa de dados produtivos.

## Recomendacoes Operacionais

- usar usuario dedicado de banco para a aplicacao
- nao expor a porta `5432` publicamente
- manter backup periodico antes de alteracoes estruturais
- versionar futuros scripts SQL por data e contexto
