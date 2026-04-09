# 13. Desafio em Andamento

## Objetivo

Definir o fluxo funcional e tecnico da tela `Desafio em andamento`, responsavel pela montagem dos times de uma partida por meio da escolha alternada dos jogadores pelos capitaes.

Esta especificacao deve servir como base para:

- implementacao no backend
- implementacao no app mobile
- testes funcionais
- validacao das regras de negocio

## 1. Conceito Geral

O fluxo `Desafio em andamento` representa a etapa em que uma partida ja possui jogadores suficientes confirmados e os dois capitaes iniciam a montagem dos times.

Somente os dois capitaes podem executar acoes de escolha.

Todos os demais usuarios do grupo, inclusive jogadores confirmados, visualizam apenas o andamento da montagem em modo leitura.

## 2. Regras de Confirmacao de Presenca

### 2.1 Janela de confirmacao

- o jogador pode confirmar presenca ate `20 minutos antes` do horario da partida
- a confirmacao so e permitida se ainda houver vaga na lista
- faltando menos de `20 minutos`, novas confirmacoes ficam bloqueadas

Exemplo:

- partida marcada para `10:00`
- confirmacoes abertas ate `09:40`

### 2.2 Apos inicio da montagem

- se a montagem dos times ja tiver comecado, novas confirmacoes nao entram automaticamente na escolha
- novos confirmados passam a depender da regra de reposicao por ausencia

## 3. Regras Minimas para Liberar a Montagem

### 3.1 Quantidade minima de confirmados

- a montagem dos times so pode comecar quando houver no minimo `12 jogadores confirmados` no total da lista da partida

### 3.2 Bloqueio por quantidade insuficiente

- com menos de `12 confirmados`, a tela deve permanecer bloqueada para inicio da montagem
- o sistema deve exibir alerta claro informando o motivo do bloqueio

## 4. Regras de Goleiros

### 4.1 Limite de goleiros confirmados

- o sistema nao deve permitir a confirmacao de `3 goleiros` na mesma partida
- o limite maximo permitido e de `2 goleiros confirmados`

### 4.2 Comportamento por quantidade

- `0 goleiros confirmados`
  - bloquear o inicio da montagem
- `1 goleiro confirmado`
  - permitir o inicio da montagem
  - exibir alerta para administradores e capitaes informando insuficiencia de goleiros
- `2 goleiros confirmados`
  - seguir fluxo normal

### 4.3 Tentativa de confirmar terceiro goleiro

- se ja existirem `2 goleiros confirmados`, qualquer novo jogador marcado como goleiro que tentar confirmar deve receber erro explicito
- mensagem esperada:
  - `O limite de goleiros confirmados para esta partida ja foi atingido.`

## 5. Regra de Permissao

### 5.1 Usuarios com acao

Somente os dois capitaes podem:

- iniciar o fluxo de `par ou impar`
- escolher jogadores de linha
- participar da etapa final de escolha dos goleiros

### 5.2 Usuarios em modo leitura

Jogadores nao capitaes e demais espectadores:

- visualizam os times sendo montados em tempo real
- visualizam de quem e a vez
- visualizam quem ja foi escolhido
- nao visualizam botoes de acao

### 5.3 Administradores

- administradores podem visualizar todo o fluxo
- administradores nao participam da escolha, salvo regra futura de intervencao manual

## 6. Fluxo de Par ou Impar dos Jogadores de Linha

### 6.1 Participantes

- apenas os dois capitaes participam

### 6.2 Escolha de par ou impar

- o capitao atual escolhe `PAR` ou `IMPAR`
- o desafiante recebe automaticamente a opcao restante

### 6.3 Escolha dos numeros

- cada capitao informa um numero inteiro entre `0` e `10`

### 6.4 Resultado

- o sistema soma os dois numeros
- o resultado define o vencedor conforme a opcao assumida pelo capitao atual
- o vencedor realiza a primeira escolha de jogador de linha

### 6.5 Validacoes

- nao permitir numeros fora do intervalo `0` a `10`
- nao permitir que os dois capitaes usem a mesma opcao entre `PAR` e `IMPAR`
- nao permitir execucao sem os dois capitaes definidos

## 7. Regra de Escolha dos Jogadores de Linha

### 7.1 Ordem

- o vencedor do `par ou impar` faz a primeira escolha
- depois disso, a escolha segue de forma alternada entre os capitaes

### 7.2 Pool de escolha

- os capitaes nao entram na lista de jogadores disponiveis
- a lista disponivel inclui apenas os jogadores confirmados ainda nao alocados em nenhum time

### 7.3 Quantidade impar de jogadores

- se houver quantidade impar de jogadores disponiveis, um dos capitaes pode terminar com `1 jogador a mais`

### 7.4 Validacoes

- nao permitir escolha fora da vez
- nao permitir escolher jogador ja escolhido
- registrar ordem e horario de cada escolha

## 8. Regra dos Goleiros

### 8.1 Separacao dos goleiros

- os goleiros ficam separados da escolha inicial dos jogadores de linha

### 8.2 Quando restarem apenas os goleiros

- o sistema executa um novo `par ou impar` entre os capitaes
- o vencedor escolhe primeiro o goleiro do seu time
- o outro capitao fica automaticamente com o goleiro restante

### 8.3 Caso de apenas um goleiro confirmado

- se houver apenas `1 goleiro confirmado`, a definicao de qual time ficara com ele deve ser manual
- esta definicao fica a cargo do fluxo administrativo ou da interacao dos capitaes, conforme implementacao da fase seguinte
- o sistema deve exibir alerta claro:
  - `Ha apenas 1 goleiro confirmado. Defina manualmente para qual time ele sera atribuido.`

## 9. Regra de Ausencia Apos a Montagem

### 9.1 Desistencia de jogador escolhido

- se um jogador desistir da partida depois de ja ter sido escolhido, o time dele perde esse atleta

### 9.2 Entrada de novo confirmado

- se outro jogador confirmar presenca depois da desistencia, o capitao que perdeu o jogador ganha o direito de escolher primeiro esse novo jogador disponivel

### 9.3 Sem reposicao

- se nao houver novo confirmado, o time permanece desfalcado

## 10. Estados da Partida para o Fluxo

Os estados recomendados para este fluxo sao:

1. `AGUARDANDO_CONFIRMACOES`
2. `PRONTA_PARA_MONTAGEM`
3. `PAR_IMPAR_LINHA`
4. `ESCOLHA_EM_ANDAMENTO`
5. `PAR_IMPAR_GOLEIROS`
6. `DEFINICAO_MANUAL_GOLEIRO`
7. `TIMES_FECHADOS`
8. `PARTIDA_FINALIZADA`

## 11. Estrutura Recomendada da Tela

### 11.1 Cabecalho

- titulo `Desafio em andamento`
- data e hora da partida
- nome do grupo
- status atual do fluxo

Exemplo:

- `Desafio em andamento`
- `22 de marco - 10:00`

### 11.2 Resumo da partida

- total de confirmados
- quantidade de goleiros confirmados
- horario limite de confirmacao
- alertas de bloqueio ou liberacao

### 11.3 Bloco dos capitaes

- capitao atual
- desafiante
- resultado do `par ou impar`
- indicador de quem escolhe agora

### 11.4 Lista de disponiveis

- jogadores de linha disponiveis
- goleiros disponiveis
- no modo capitao: cards clicaveis
- no modo espectador: somente leitura

### 11.5 Times em construcao

- Time do Capitao A
- Time do Capitao B
- exibicao em tempo real conforme as escolhas ocorrem

### 11.6 Rodape de acao

Modo capitao:

- botoes de escolha
- acao de `par ou impar`
- mensagens de bloqueio quando nao for a vez

Modo espectador:

- apenas status do andamento
- sem botoes de acao

## 12. Validacoes Obrigatorias no Sistema

- nao permitir iniciar a montagem com menos de `12 confirmados`
- nao permitir iniciar a montagem com `0 goleiros`
- nao permitir mais de `2 goleiros confirmados`
- nao permitir `par ou impar` sem dois capitaes definidos
- nao permitir numero fora de `0 a 10`
- nao permitir escolha fora da vez
- nao permitir escolha duplicada
- exibir alertas claros para bloqueios e situacoes especiais

## 13. Registros e Auditoria

O backend deve registrar:

- quem venceu cada `par ou impar`
- numeros escolhidos pelos capitaes
- opcao `PAR` ou `IMPAR`
- ordem das escolhas
- horario de cada pick
- alteracoes por ausencia e reposicao

## 14. Proposta de Implementacao

### 14.1 Backend

Criar ou adaptar endpoints para:

- iniciar montagem
- executar `par ou impar`
- escolher jogador
- escolher goleiro
- registrar ausencia apos escolha
- registrar reposicao
- consultar estado atual do desafio

### 14.2 Frontend

Criar ou adaptar a tela `Desafio em andamento` para:

- alternar comportamento entre `capitao` e `espectador`
- exibir listas de disponiveis
- exibir os times em tempo real
- exibir alertas e bloqueios
- exibir a etapa de goleiros

### 14.3 Ordem sugerida

1. estados e permissao
2. par ou impar dos jogadores de linha
3. picks alternados
4. etapa dos goleiros
5. fluxo de ausencia e reposicao
6. polimento visual e feedback em tempo real

## 15. Decisoes Validadas

As decisoes de negocio validadas ate aqui sao:

- minimo de `12` confirmados para iniciar montagem
- confirmacao permitida ate `20 minutos antes` da partida
- `0 goleiros` bloqueia
- `1 goleiro` permite com alerta
- `2 goleiros` segue normal
- `3 goleiro` deve ser bloqueado
- somente os capitaes podem escolher
- os demais usuarios apenas acompanham
- o capitao atual escolhe `PAR` ou `IMPAR`
- o desafiante recebe a outra opcao
- se houver quantidade impar de jogadores, um capitao pode terminar com `1 jogador a mais`
- se um jogador desistir apos a escolha e nao houver reposicao, o time permanece desfalcado
