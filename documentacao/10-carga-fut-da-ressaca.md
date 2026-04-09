# Carga Inicial do Grupo Fut da Ressaca

## Objetivo

Este documento registra a carga realizada no ambiente de producao para o grupo `Fut da Ressaca` (`id_grupo = 1`), com:

- criacao de usuarios
- vinculacao dos jogadores ao grupo
- historico inicial de partidas
- historico de capitao
- classificacao inicial da temporada e geral

Data da carga: `17/03/2026`

## Grupo

- Grupo: `Fut da Ressaca`
- `id_grupo`: `1`
- Administrador: `Maik`
- Email do admin: `maiksosn.23@gmail.com`
- `id_usuario` do admin: `2`
- Perfil do admin no grupo: `ADMIN`

## Ajustes de integridade executados

Antes da carga, existiam 2 vinculos orfaos na tabela `grupo_usuarios` para o grupo `1`:

- `id_usuario = 4`
- `id_usuario = 9`

Esses vinculos foram desativados para manter a consistencia do grupo.

## Temporada

- Temporada ativa: `Temporada 2026`
- `id_temporada`: `1`
- Status: `ATIVA`

## Usuarios Criados

Todos os usuarios abaixo foram criados com perfil de jogador e vinculados diretamente ao grupo `1`.

### Regras aplicadas

- nomes sem acento
- se email ja existisse, o usuario seria reaproveitado
- `goleiro = true` apenas para posicao `GOLEIRO`
- perfil no grupo: `JOGADOR`

## Lista de Usuarios

| ID | Nome | Email | Senha | Posicao Principal | Pe Dominante | Time do Coracao | Codigo Time | Goleiro |
|---|---|---|---|---|---|---|---|---|
| 16 | Gustavo | gustavo@resenha.com | Gustavo123456@ | ATACANTE | DIREITO | Santos | SAN | Nao |
| 18 | Joao | joao@resenha.com | Joao123456@ | ATACANTE | DIREITO | Santos | SAN | Nao |
| 27 | Rafa | rafa@resenha.com | Rafa123456@ | ZAGUEIRO | DIREITO | Palmeiras | PAL | Nao |
| 17 | Igor | igor@resenha.com | Igor123456@ | ATACANTE | DIREITO | Corinthians | COR | Nao |
| 12 | Casemiro | casemiro@resenha.com | Casemiro123456@ | ATACANTE | DIREITO | Palmeiras | PAL | Nao |
| 22 | Lukinha | lukinha@resenha.com | Lukinha123456@ | MEIA | DIREITO | Sao Paulo | SAO | Nao |
| 14 | Damazio | damazio@resenha.com | Damazio123456@ | ATACANTE | AMBIDESTRO | Corinthians | COR | Nao |
| 19 | Jorge | jorge@resenha.com | Jorge123456@ | ATACANTE | DIREITO | Corinthians | COR | Nao |
| 25 | Nilin | nilin@resenha.com | Nilin123456@ | GOLEIRO | DIREITO | Corinthians | COR | Sim |
| 21 | Lucas | lucas@resenha.com | Lucas123456@ | ZAGUEIRO | DIREITO | Corinthians | COR | Nao |
| 20 | Leo | leo@resenha.com | Leo123456@ | ZAGUEIRO | DIREITO | Corinthians | COR | Nao |
| 26 | Noia | noia@resenha.com | Noia123456@ | GOLEIRO | DIREITO | Corinthians | COR | Sim |
| 23 | Markin | markin@resenha.com | Markin123456@ | ZAGUEIRO | DIREITO | Flamengo | FLA | Nao |
| 24 | Matheus | matheus@resenha.com | Matheus123456@ | GOLEIRO | DIREITO | Sao Paulo | SAO | Sim |
| 15 | Greder | greder@resenha.com | Greder123456@ | MEIA | DIREITO | Corinthians | COR | Nao |
| 10 | Alceu | alceu@resenha.com | Alceu123456@ | ZAGUEIRO | DIREITO | Santos | SAN | Nao |
| 13 | Claudemir | claudemir@resenha.com | Claudemir123456@ | MEIA | DIREITO | Santos | SAN | Nao |
| 11 | Andre | andre@resenha.com | Andre123456@ | MEIA | DIREITO | Santos | SAN | Nao |

## Membros Ativos do Grupo

Total de membros ativos apos a carga: `19`

- `18` jogadores da carga
- `1` administrador (`Maik`)

## Historico de Capitao

Foram carregados 2 ciclos de capitao.

### Ciclo 1

- `id_ciclo`: `2`
- Capitao inicial: `Gustavo`
- Inicio: `08/02/2026 09:30`
- Encerramento: `08/03/2026 11:30`
- Status final: `ENCERRADO`

Desafios modelados:

1. `08/02/2026`: Gustavo x Alceu -> Gustavo manteve o posto
2. `15/02/2026`: Gustavo x Lucas -> Gustavo manteve o posto
3. `22/02/2026`: Gustavo x Andre -> Gustavo manteve o posto
4. `01/03/2026`: Gustavo x Maik -> Gustavo manteve o posto
5. `08/03/2026`: Gustavo x Lukinha -> Lukinha venceu e assumiu o posto

Bloqueados registrados no ciclo:

- Alceu
- Lucas
- Andre
- Maik

### Ciclo 2

- `id_ciclo`: `3`
- Capitao atual: `Lukinha`
- Inicio: `08/03/2026 11:31`
- Status atual: `ATIVO`

Desafio modelado:

1. `15/03/2026`: Lukinha x Greder -> Lukinha manteve o posto

Bloqueados registrados no ciclo:

- Greder

### Capitao Atual

- Nome: `Lukinha`
- `id_usuario`: `22`

## Partidas Inseridas

As partidas futuras nao foram alteradas. A partida futura ja existente do grupo foi preservada.

### Partida Futura Preservada

- `id_partida`: `1`
- Data: `22/03/2026 10:00`
- Status: `ABERTA`

### Partidas Historicas Inseridas

| ID Partida | Data | Status | Capitao Time 1 | Capitao Time 2 | Placar | Time Vencedor | Observacao |
|---|---|---|---|---|---|---|---|
| 3 | 08/02/2026 10:00 | FINALIZADA | Gustavo | Alceu | 6 x 4 | Time 1 | Desafio de capitao: Gustavo x Alceu |
| 4 | 15/02/2026 10:00 | FINALIZADA | Gustavo | Lucas | 5 x 3 | Time 1 | Desafio de capitao: Gustavo x Lucas |
| 5 | 22/02/2026 10:00 | FINALIZADA | Gustavo | Andre | 4 x 2 | Time 1 | Desafio de capitao: Gustavo x Andre |
| 6 | 01/03/2026 10:00 | FINALIZADA | Gustavo | Maik | 3 x 2 | Time 1 | Desafio de capitao: Gustavo x Maik |
| 7 | 08/03/2026 10:00 | FINALIZADA | Gustavo | Lukinha | 4 x 5 | Time 2 | Desafio de capitao: Gustavo x Lukinha |
| 8 | 15/03/2026 10:00 | FINALIZADA | Lukinha | Greder | 4 x 1 | Time 1 | Desafio de capitao: Lukinha x Greder |

## MVP e Bola Murcha Registrados

| Partida | MVP | Bola Murcha |
|---|---|---|
| 08/02/2026 | Gustavo | Markin |
| 15/02/2026 | Joao | Jorge |
| 22/02/2026 | Lukinha | Andre |
| 01/03/2026 | Gustavo | Jorge |
| 08/03/2026 | Lukinha | Noia |
| 15/03/2026 | Leo | Matheus |

## Classificacao Final Carregada

Critério considerado como referencia de negocio:

1. mais pontos
2. menos jogos
3. em empate completo, manter a ordem definida manualmente

Observacao tecnica:

- a API hoje ordena por `pontos`, `vitorias` e `gols`
- por isso a classificacao foi carregada de forma coerente com esse comportamento atual da API
- a ordem final exibida no sistema ficou compativel com a ordem desejada

### Ranking Final

| Posicao | Nome | Jogos | Pontos | Vitorias | Derrotas | Presencas | Gols | Assistencias | MVPs | Bolas Murchas |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | Gustavo | 6 | 21 | 5 | 1 | 6 | 8 | 4 | 2 | 0 |
| 2 | Joao | 6 | 21 | 5 | 1 | 6 | 7 | 3 | 1 | 0 |
| 3 | Rafa | 5 | 17 | 4 | 1 | 5 | 5 | 2 | 0 | 0 |
| 4 | Damazio | 6 | 15 | 3 | 3 | 6 | 4 | 4 | 0 | 0 |
| 5 | Maik | 6 | 15 | 3 | 3 | 6 | 3 | 2 | 0 | 0 |
| 6 | Igor | 5 | 14 | 3 | 2 | 5 | 6 | 1 | 0 | 0 |
| 7 | Casemiro | 5 | 14 | 3 | 2 | 5 | 5 | 3 | 0 | 0 |
| 8 | Lukinha | 5 | 14 | 3 | 2 | 5 | 4 | 5 | 2 | 0 |
| 9 | Leo | 6 | 12 | 2 | 4 | 6 | 3 | 1 | 1 | 0 |
| 10 | Noia | 6 | 12 | 2 | 4 | 6 | 1 | 0 | 0 | 1 |
| 11 | Lucas | 5 | 11 | 2 | 3 | 5 | 2 | 1 | 0 | 0 |
| 12 | Nilin | 4 | 10 | 2 | 2 | 4 | 0 | 0 | 0 | 0 |
| 13 | Jorge | 3 | 9 | 2 | 1 | 3 | 1 | 0 | 0 | 2 |
| 14 | Claudemir | 5 | 8 | 1 | 4 | 5 | 0 | 3 | 0 | 0 |
| 15 | Alceu | 4 | 7 | 1 | 3 | 4 | 2 | 0 | 0 | 0 |
| 16 | Greder | 3 | 6 | 1 | 2 | 3 | 2 | 1 | 0 | 0 |
| 17 | Markin | 2 | 5 | 1 | 1 | 2 | 1 | 0 | 0 | 1 |
| 18 | Matheus | 2 | 5 | 1 | 1 | 2 | 0 | 0 | 0 | 0 |
| 19 | Andre | 1 | 1 | 0 | 1 | 1 | 0 | 0 | 0 | 1 |

## Observacoes

- os dados de partidas, placares e estatisticas foram semeados de forma plausivel e consistente com a classificacao desejada
- a classificacao final foi tratada como referencia de negocio do grupo
- a partida futura `22/03/2026` foi preservada e nao foi alterada

## Arquivos de Apoio da Carga

- [seed_fut_ressaca_historico.sql](c:/Resenha/scripts/seed_fut_ressaca_historico.sql)
- [seed_inspecao_grupo1.sql](c:/Resenha/scripts/seed_inspecao_grupo1.sql)
