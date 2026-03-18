# 09. Fluxos e Casos-Limite

## Objetivo

Registrar o comportamento esperado em fluxos reais e em situacoes de borda, para apoiar:

- testes manuais
- manutencao do backend
- validacao funcional do beta

## 1. Fluxo de Convite e Entrada no Grupo

### Fluxo feliz

1. admin convida um email
2. sistema gera codigo unico
3. convite fica `PENDENTE`
4. usuario cadastra ou entra com o mesmo email
5. usuario aceita convite
6. membership e criada como `JOGADOR`
7. convite vira `ACEITO`

### Casos-limite

- convidar email de quem ja e membro ativo do grupo
  - esperado: erro
- aceitar convite com outro email
  - esperado: erro
- aceitar convite expirado
  - esperado: convite vira `EXPIRADO` e a operacao falha
- grupo lotado
  - esperado: aceite e bloqueado
- convite antigo pendente para o mesmo email
  - esperado: convite antigo vira `CANCELADO`

## 2. Fluxo de Criacao de Partida

### Fluxo feliz

1. admin cria partida
2. sistema valida limite de vagas
3. sistema verifica se ja existe partida no mesmo dia
4. se nao houver temporada ativa, ela e criada
5. partida e gravada em estado `ABERTA`

### Casos-limite

- limite de vagas maior que o limite do grupo
  - esperado: erro
- tentativa de segunda partida nao cancelada no mesmo dia
  - esperado: erro
- usuario nao admin tentando criar
  - esperado: erro

## 3. Fluxo de Presenca

### Confirmacao

1. membro confirma presenca
2. sistema valida que a partida esta `ABERTA`
3. sistema valida lotacao
4. presenca vira `CONFIRMADO`

### Casos-limite

- confirmar duas vezes
  - esperado: erro
- confirmar em partida fechada
  - esperado: erro
- limite de vagas atingido
  - esperado: erro
- chamadas simultaneas nas ultimas vagas
  - esperado: serializacao evita overbooking

### Ausencia

1. membro marca ausencia
2. presenca vira `AUSENTE`

Casos-limite:

- marcar ausencia em partida nao aberta
  - esperado: erro
- cancelar ausencia sem estar ausente
  - esperado: erro

## 4. Fluxo de Capitao

### Inicio do ciclo

1. admin inicia ciclo
2. admin atual vira capitao atual
3. ciclo entra como `ATIVO`

Casos-limite:

- ja existe ciclo ativo
  - esperado: erro
- nao existe temporada ativa
  - esperado: erro

### Desafio

1. capitao escolhe um desafiante
2. sistema valida elegibilidade
3. desafio fica pendente

Casos-limite:

- capitao tenta desafiar a si mesmo
  - esperado: erro
- ja existe desafio pendente
  - esperado: erro
- partida com menos de 12 confirmados
  - esperado: erro
- desafiante nao confirmado na partida
  - esperado: erro
- desafiante ja bloqueado no ciclo
  - esperado: erro

### Resultado do desafio

Se capitao vence:

- desafiante entra na lista de bloqueados
- nao pode desafiar de novo no mesmo ciclo

Se desafiante vence:

- ciclo atual encerra
- novo ciclo e iniciado
- desafiante vira capitao atual

## 5. Fluxo de Montagem de Times

### Fluxo feliz

1. admin envia dois times
2. sistema valida jogadores
3. sistema valida capitaes
4. sistema limpa atribuicoes anteriores
5. sistema grava os novos times
6. partida vira `EM_ANDAMENTO`

### Casos-limite

- jogador repetido nos dois times
  - esperado: erro
- jogador nao confirmado
  - esperado: erro
- capitao nao consta no proprio time
  - esperado: erro
- partida em estado invalido
  - esperado: erro

## 6. Fluxo de Finalizacao de Partida

### Fluxo feliz

1. admin informa gols dos times
2. informa estatisticas individuais
3. sistema identifica vencedor
4. sistema cria resultado e estatisticas
5. sistema atualiza classificacao da temporada
6. sistema atualiza classificacao geral
7. partida vira `FINALIZADA`

### Casos-limite

- empate
  - esperado: erro
- times nao cadastrados
  - esperado: erro
- partida nao esta `EM_ANDAMENTO`
  - esperado: erro
- estatistica duplicada para mesmo jogador
  - esperado: erro
- estatistica para usuario fora da partida
  - esperado: erro

## 7. Fluxo de Votacao

### Abertura

1. admin abre votacao
2. sistema cria `MVP` rodada 1 aberta
3. sistema cria `BOLA_MURCHA` rodada 1 aberta

Casos-limite:

- partida nao finalizada
  - esperado: erro
- votacao ja iniciada antes
  - esperado: erro

### Voto

1. participante confirmado escolhe candidato
2. sistema valida rodada aberta
3. sistema grava voto

Casos-limite:

- usuario nao participou da partida
  - esperado: erro
- voto em si mesmo
  - esperado: erro
- voto duplicado na mesma rodada
  - esperado: erro
- voto em candidato fora da lista de desempate
  - esperado: erro

### Encerramento

Se houver vencedor unico:

- rodada vira `APURADA`

Se houver empate:

- rodada atual vira `ENCERRADA`
- nova rodada e criada com os empatados

Casos-limite:

- encerrar sem votos
  - esperado: erro
- encerrar quando nao ha votacao aberta
  - esperado: erro

### Aprovacao

1. admin aprova a rodada apurada
2. vencedor recebe premio na classificacao
3. rodada vira `APROVADA`

Casos-limite:

- nao ha resultado apurado
  - esperado: erro
- vencedor provisório ausente
  - esperado: erro

## 8. Exclusao de Partida Finalizada

### Efeito esperado

Ao excluir uma partida finalizada:

- resultado e removido
- estatisticas sao removidas
- votos e votacoes sao removidos
- pontos base da classificacao sao revertidos
- `Mvps` e `BolasMurchas` aprovados tambem sao revertidos
- nenhum contador pode ficar negativo

### Risco funcional importante

Essa e uma operacao sensivel porque mexe em historico consolidado. Toda mudanca futura nesse fluxo precisa vir acompanhada de regressao forte.

## 9. Erros Funcionais que Devem Ser Mantidos

Mensagens podem evoluir, mas o comportamento precisa continuar protegendo:

- permissao por papel
- consistencia de estado
- integridade de ranking
- unicidade de convite
- unicidade de voto por rodada
- impedimento de reabertura de votacao
- impedimento de duplicidade de presenca

## 10. Checklist de Regressao por Modulo

### Auth

- cadastrar com senha fraca falha
- redefinir senha invalida token antigo

### Group

- admin nao remove a si mesmo
- ultimo admin nao pode ser rebaixado

### Match

- nao permite overbooking
- nao permite segunda partida no mesmo dia

### Captain

- nao permite novo ciclo com ciclo ativo
- nao permite desafiante bloqueado no mesmo ciclo

### Classification

- nao permite empate na finalizacao
- exclusao reverte classificacao

### Vote

- nao reabre votacao iniciada
- desempate restringe candidatos
- aprovacao incrementa premio correto
