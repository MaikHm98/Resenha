# 14. Backlog Tecnico - Desafio em Andamento

## Objetivo

Quebrar a especificacao funcional da feature `Desafio em andamento` em tarefas tecnicas executaveis, com prioridade e dependencia, para orientar a implementacao no backend e no app.

Este backlog considera:

- regras documentadas em `13-desafio-em-andamento.md`
- arquitetura atual da API ASP.NET Core
- arquitetura atual do app Expo/React Native

## Visao Geral da Entrega

A implementacao da feature deve permitir:

- validar se uma partida esta pronta para montagem
- liberar a montagem so para os capitaes
- permitir que os demais acompanhem em modo leitura
- executar `par ou impar`
- montar os times por picks alternados
- tratar goleiros separadamente
- tratar ausencia e reposicao

## Fase 1. Fundacao de Dominio e Estados

### Backend

1. Definir os estados do fluxo da montagem
- criar representacao de estados da montagem
- estados previstos:
  - `AGUARDANDO_CONFIRMACOES`
  - `PRONTA_PARA_MONTAGEM`
  - `PAR_IMPAR_LINHA`
  - `ESCOLHA_EM_ANDAMENTO`
  - `PAR_IMPAR_GOLEIROS`
  - `DEFINICAO_MANUAL_GOLEIRO`
  - `TIMES_FECHADOS`

2. Persistir o estado atual da montagem
- decidir se o estado ficara:
  - na tabela `partidas`
  - ou em tabela nova de apoio
- recomendacao:
  - usar tabela dedicada para manter historico e simplificar auditoria

3. Persistir os dois capitaes da partida
- confirmar origem dos capitaes no fluxo atual
- garantir que a partida tenha referencia explicita de:
  - capitao atual
  - desafiante

4. Criar objeto de consulta do desafio
- endpoint de leitura consolidada do estado atual do desafio
- esse endpoint deve servir tanto para o modo capitao quanto para o modo espectador

### Frontend

5. Definir estrutura da tela `Desafio em andamento`
- criar modelo de dados da tela
- separar blocos visuais:
  - cabecalho
  - resumo
  - capitaes
  - disponiveis
  - times em construcao
  - alertas

6. Definir comportamento por perfil
- modo `capitao`
- modo `espectador`
- modo `admin` somente leitura por enquanto

## Fase 2. Regras de Liberacao da Montagem

### Backend

7. Validar quantidade minima de confirmados
- impedir inicio da montagem com menos de `12 confirmados`

8. Validar janela de confirmacao
- permitir confirmacao de presenca ate `20 minutos antes` da partida
- bloquear novas confirmacoes abaixo desse prazo

9. Validar limite de goleiros
- impedir terceiro goleiro confirmado
- bloquear montagem com `0 goleiros`
- liberar com `1 goleiro` e retornar alerta
- liberar com `2 goleiros` normalmente

10. Expor alertas da partida
- o backend deve retornar lista de alertas ativos
- exemplos:
  - `Faltam jogadores para iniciar a montagem`
  - `A partida possui apenas 1 goleiro confirmado`
  - `A janela de confirmacao foi encerrada`

### Frontend

11. Exibir status de liberacao
- mostrar claramente se a partida esta:
  - bloqueada
  - pronta para montagem
  - em andamento

12. Exibir alertas de negocio
- cards ou faixas visuais com mensagens claras

## Fase 3. Par ou Impar dos Jogadores de Linha

### Backend

13. Criar endpoint para iniciar `par ou impar`
- validar permissao de capitao
- validar estado correto da partida

14. Criar endpoint para registrar a opcao do capitao atual
- `PAR` ou `IMPAR`

15. Criar endpoint para registrar os numeros dos dois capitaes
- validar intervalo `0` a `10`

16. Calcular vencedor do `par ou impar`
- registrar:
  - opcao escolhida
  - numeros
  - soma
  - vencedor

17. Persistir historico do `par ou impar`
- manter auditoria da rodada de linha

### Frontend

18. Criar modal ou etapa visual de `Par ou impar`
- mostrar capitao atual
- mostrar desafiante
- mostrar escolha de `PAR` ou `IMPAR`
- mostrar escolha dos numeros
- mostrar vencedor

19. Tratar acesso so dos capitaes
- somente capitaes visualizam botoes
- espectadores apenas acompanham

## Fase 4. Escolha dos Jogadores de Linha

### Backend

20. Criar lista de jogadores disponiveis para escolha
- excluir capitaes
- excluir ja escolhidos
- excluir goleiros da etapa inicial

21. Criar endpoint de pick de jogador
- validar:
  - permissao
  - turno do capitao
  - disponibilidade do jogador

22. Registrar ordem das escolhas
- salvar numero da pick
- horario
- capitao que escolheu
- jogador escolhido

23. Alternar turno entre capitaes
- apos cada escolha, atualizar vez do proximo capitao

24. Detectar fim da etapa de linha
- quando restarem apenas goleiros, transicionar o estado da montagem

### Frontend

25. Renderizar lista clicavel de disponiveis
- modo capitao:
  - botao ou card clicavel
- modo espectador:
  - somente leitura

26. Renderizar times em construcao
- os jogadores devem aparecer em tempo real nos dois lados

27. Exibir indicador de vez
- `Vez de Gustavo`
- `Vez de Lukinha`

28. Exibir bloqueio quando nao for a vez do capitao logado

## Fase 5. Etapa dos Goleiros

### Backend

29. Criar segundo `par ou impar` para os goleiros
- fluxo proprio
- auditoria propria

30. Criar endpoint de escolha de goleiro
- com `2 goleiros`, o vencedor escolhe primeiro e o outro recebe o restante

31. Tratar caso de `1 goleiro`
- mover partida para estado `DEFINICAO_MANUAL_GOLEIRO`
- permitir decisao manual conforme regra futura de UX

### Frontend

32. Criar etapa visual especifica dos goleiros
- separar visualmente da etapa dos jogadores de linha

33. Exibir fluxo de definicao manual se houver apenas `1 goleiro`

## Fase 6. Fechamento dos Times

### Backend

34. Consolidar formacao final dos times
- persistir jogadores dos dois times
- marcar que a montagem foi concluida

35. Mudar estado para `TIMES_FECHADOS`

36. Expor resumo final
- capitaes
- jogadores de cada time
- goleiros
- ordem das escolhas

### Frontend

37. Exibir tela final dos times fechados
- layout limpo dos dois times
- resumo da escolha

38. Exibir timeline resumida da montagem
- opcional nesta fase, mas recomendado

## Fase 7. Ausencia e Reposicao

### Backend

39. Registrar ausencia apos jogador escolhido
- marcar jogador como ausente apos montagem

40. Detectar desequilibrio por ausencia
- identificar qual capitao perdeu jogador

41. Tratar novo confirmado apos ausencia
- permitir ao capitao prejudicado escolher primeiro o novo disponivel

42. Manter time desfalcado quando nao houver reposicao

43. Auditar eventos de ausencia e reposicao

### Frontend

44. Exibir alerta de time desfalcado

45. Exibir nova acao de reposicao quando houver novo jogador disponivel

46. Atualizar os dois times visualmente apos reposicao

## Fase 8. Tempo Real e Sincronizacao

### Backend

47. Definir estrategia de atualizacao em tempo real
- polling simples na primeira versao
- SignalR ou websocket em fase futura

48. Criar endpoint leve de refresh do estado atual

### Frontend

49. Atualizar tela periodicamente durante a montagem
- recomendacao inicial:
  - polling curto

50. Mostrar transicoes claras sem recarregar toda a tela

## Fase 9. Validacoes e Seguranca

### Backend

51. Garantir que so capitaes possam executar mutacoes

52. Garantir que apenas membros do grupo possam visualizar o desafio

53. Impedir execucao fora do estado esperado

54. Impedir dupla escolha do mesmo jogador em chamadas simultaneas

55. Garantir consistencia transacional nas picks

### Frontend

56. Esconder acoes para usuarios sem permissao

57. Tratar mensagens de erro de negocio com clareza

## Fase 10. Testes

### Backend

58. Criar testes de servico para:
- bloqueio com menos de `12`
- bloqueio com `0 goleiros`
- alerta com `1 goleiro`
- bloqueio do terceiro goleiro
- par ou impar
- picks alternados
- transicao para goleiros
- fechamento dos times
- ausencia e reposicao

### Frontend

59. Criar checklist manual para:
- modo capitao
- modo espectador
- bloqueios
- alerts
- etapa dos goleiros
- time desfalcado

## Prioridade Recomendada

### Alta

- itens `1` a `28`

Esses itens entregam:

- estados
- permissao
- liberacao da montagem
- `par ou impar`
- escolha dos jogadores de linha

### Media

- itens `29` a `38`

Esses itens entregam:

- goleiros
- fechamento completo dos times

### Media/Baixa

- itens `39` a `50`

Esses itens entregam:

- reposicao
- experiencia mais completa
- atualizacao em tempo real mais refinada

### Transversal

- itens `51` a `59`

Esses itens devem acompanhar todas as fases

## Dependencias Tecnicas

- revisar modelagem atual de `partidas`, `times_partida`, `jogadores_time_partida`, `presencas_partida` e `ciclos de capitao`
- verificar se o fluxo atual de capitao ja fornece todas as referencias necessarias para a montagem
- alinhar navegacao do app para incluir a nova tela a partir do dashboard da partida ou do grupo

## Resultado Esperado da Primeira Entrega

Ao final da primeira entrega da feature, o sistema deve permitir:

- liberar a montagem apenas quando as regras forem atendidas
- executar `par ou impar`
- permitir picks alternados so para capitaes
- exibir times sendo montados
- manter os demais jogadores acompanhando em tempo real, sem interacao
