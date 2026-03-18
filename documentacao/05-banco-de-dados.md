# 05. Banco de Dados

## Tecnologia

- MySQL

## Contexto EF Core

Arquivo:

- `backend/Resenha.API/Data/ResenhaDbContext.cs`

O contexto centraliza todas as tabelas e define os principais indices unicos usados para proteger integridade de negocio.

## Entidades Principais

### Usuarios e Seguranca

- `Usuario`
- `TokenRecuperacaoSenha`
- `AuditoriaSeguranca`

Responsabilidades:

- identidade do usuario
- estado de ativacao
- trilha de recuperacao de senha
- auditoria de eventos de seguranca

### Grupos

- `Grupo`
- `GrupoUsuario`
- `ConviteGrupo`

Responsabilidades:

- configuracao do grupo
- associacao usuario x grupo
- convite de entrada

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
- `TokenRecuperacaoSenha(TokenHash)`
- `Temporada(IdGrupo, Ano)`

## Implicacoes de Negocio

Esses indices impedem cenarios como:

- membro duplicado no mesmo grupo
- mesma pessoa confirmada duas vezes na mesma partida
- mesmo usuario votando duas vezes na mesma rodada
- duas classificacoes duplicadas para o mesmo usuario no mesmo contexto
- email duplicado em cadastro
- repeticao de codigo de convite

## Script Complementar Identificado

Script relevante:

- `backend/Resenha.API/sql/2026-03-03_auth_recovery_and_club.sql`

Esse script deve ser aplicado quando for necessario habilitar integralmente:

- recuperacao de senha
- informacoes de time do coracao

## Recomendacoes Operacionais

- usar usuario dedicado de banco para a aplicacao
- nao expor a porta `3306` publicamente
- manter backup periodico antes de alteracoes estruturais
- versionar futuros scripts SQL por data e contexto
