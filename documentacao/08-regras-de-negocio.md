# 08. Regras de Negocio

## Objetivo

Consolidar as regras de negocio implementadas no backend, com foco em:

- permissoes
- pre-condicoes
- restricoes
- transicoes de estado
- efeitos colaterais importantes

Esta documentacao foi derivada do comportamento atual dos servicos da API.

## Convencoes Gerais

### Membro ativo

Muitas operacoes dependem de o usuario ser:

- membro do grupo
- com associacao `Ativo = true`

### Administrador

Operacoes administrativas exigem que o membro do grupo possua:

- `Perfil = ADMIN`

### Grupo ativo

Diversas consultas e operacoes so funcionam quando:

- o grupo existe
- o grupo esta `Ativo = true`

## 1. Usuario, Autenticacao e Perfil

### Cadastro

Regras:

- email e normalizado para lowercase
- nao e permitido cadastrar email ja existente
- senha precisa ser forte
- a politica atual exige:
  - minimo de 8 caracteres
  - ao menos 1 numero
  - ao menos 1 letra maiuscula
- `timeCoracaoCodigo`, quando informado, precisa existir no catalogo de clubes

Efeitos:

- cria usuario ativo
- armazena senha com hash
- gera JWT imediatamente

### Login

Regras:

- email e normalizado para lowercase
- usuario precisa existir e estar ativo
- senha precisa bater com o hash persistido

Efeitos:

- gera novo JWT

### Sessao JWT

Regras:

- token valida issuer, audience, assinatura e expiracao
- token carrega claim `pwd_at`
- `pwd_at` e comparado com o timestamp de ultima atualizacao de senha

Implicacao:

- trocar a senha invalida tokens antigos

### Recuperacao de senha

Regras de protecao:

- limite de 20 solicitacoes por IP a cada 15 minutos
- limite de 5 solicitacoes por usuario a cada 15 minutos
- token expira em 15 minutos
- token possui hash no banco
- token so pode ser usado uma vez
- mais de 5 tentativas de validacao bloqueiam o token

Comportamento:

- se o email nao existir, a operacao nao revela isso como falha funcional
- eventos sao auditados
- ao redefinir senha, tokens antigos de recuperacao do mesmo usuario sao invalidados

### Atualizacao de perfil

Regras:

- usuario precisa existir e estar ativo
- nome, quando enviado, precisa ter pelo menos 2 caracteres
- `timeCoracaoCodigo` em branco remove o clube favorito
- `timeCoracaoCodigo` preenchido precisa existir no catalogo

## 2. Grupos

### Criacao de grupo

Regras:

- qualquer usuario autenticado pode criar grupo

Efeitos:

- grupo e criado
- criador entra automaticamente como `ADMIN`
- total inicial de membros = 1

### Listagem dos meus grupos

Regras:

- retorna apenas grupos ativos
- retorna apenas associacoes de grupo com membro ativo

### Convite de usuario

Quem pode:

- apenas `ADMIN`

Regras:

- admin precisa ser membro ativo do grupo
- se o email informado ja pertencer a um membro ativo do grupo, o convite e bloqueado
- convites pendentes anteriores para o mesmo email e grupo sao cancelados
- o codigo de convite e unico
- convite expira em 7 dias

Efeitos:

- cria convite pendente
- pode disparar envio de email

### Entrada no grupo por codigo

Regras:

- usuario precisa existir
- codigo precisa existir
- convite precisa estar `PENDENTE`
- convite nao pode estar expirado
- email do convite precisa coincidir com o email do usuario autenticado
- usuario nao pode ja ser membro ativo do grupo
- grupo precisa estar ativo
- grupo nao pode ter atingido o limite de jogadores

Efeitos:

- cria ou reativa membership do usuario como `JOGADOR`
- convite vira `ACEITO`

### Aceitar convite pendente da propria conta

Regras:

- convite precisa existir
- convite precisa estar `PENDENTE`
- convite nao pode estar expirado
- email do convite precisa coincidir com o email do usuario
- usuario nao pode ja ser membro ativo
- grupo nao pode estar lotado

Efeitos:

- cria ou reativa membership
- perfil final sempre fica como `JOGADOR`
- convite vira `ACEITO`

### Rejeitar convite

Regras:

- convite precisa estar `PENDENTE`
- convite precisa pertencer ao email do usuario

Efeito:

- convite vira `CANCELADO`

### Atualizar agenda do grupo

Quem pode:

- apenas `ADMIN`

Campos:

- `DiaSemana`
- `HorarioFixo`

### Ver membros do grupo

Quem pode:

- qualquer membro ativo do grupo

### Adicionar membro por email

Quem pode:

- apenas `ADMIN`

Regras:

- usuario alvo, se existir e ja for membro ativo, bloqueia a operacao
- convites pendentes anteriores para o mesmo email no grupo sao cancelados
- novo convite expira em 7 dias

Efeitos:

- cria convite
- tenta enviar email
- retorna link de convite mesmo se o email falhar

### Remover membro

Quem pode:

- apenas `ADMIN`

Restricoes:

- admin nao pode remover a si mesmo
- nao e permitido remover outro admin
- membro precisa estar ativo no grupo

Efeito:

- membership fica `Ativo = false`

### Alterar papel de membro

Quem pode:

- apenas `ADMIN`

Perfis validos:

- `ADMIN`
- `JOGADOR`

Restricoes:

- nao e permitido definir perfil invalido
- nao e permitido manter o mesmo perfil
- nao e permitido rebaixar o ultimo admin do grupo

### Excluir grupo

Quem pode:

- apenas `ADMIN`

Efeitos:

- grupo vira inativo
- todos os membros ativos sao inativados
- todos os convites pendentes sao cancelados

## 3. Partidas

### Criar partida

Quem pode:

- apenas `ADMIN`

Regras:

- grupo precisa existir e estar ativo
- admin precisa ser membro ativo do grupo
- `LimiteVagas` nao pode ser maior que o `LimiteJogadores` do grupo
- so pode existir uma partida nao cancelada por dia no grupo
- se nao existir temporada ativa, uma temporada e criada automaticamente

Efeitos:

- cria partida vinculada a temporada ativa

### Confirmar presenca

Quem pode:

- membro ativo do grupo

Regras:

- partida precisa existir
- partida precisa estar `ABERTA`
- usuario nao pode ter presenca ja `CONFIRMADO`
- confirmacoes respeitam o limite de vagas
- a verificacao usa transacao serializable para evitar overbooking concorrente

Efeitos:

- cria ou atualiza presenca para `CONFIRMADO`

### Cancelar presenca

Regras:

- partida precisa existir
- partida precisa estar `ABERTA`
- usuario precisa estar `CONFIRMADO`

Efeito:

- status da presenca vira `CANCELADO`

### Marcar ausencia

Regras:

- partida precisa existir
- partida precisa estar `ABERTA`
- usuario precisa ser membro ativo do grupo

Efeitos:

- cria ou atualiza presenca para `AUSENTE`

### Cancelar ausencia

Regras:

- partida precisa existir
- usuario precisa estar com status `AUSENTE`

Efeito:

- status vira `CANCELADO`

### Excluir partida

Quem pode:

- apenas `ADMIN`

Efeitos:

- remove votos, votacoes, times, jogadores dos times, presencas, resultados e estatisticas da partida
- se a partida estava `FINALIZADA`, a classificacao e revertida antes da exclusao

## 4. Capitao

### Iniciar ciclo de capitao

Quem pode:

- apenas `ADMIN`

Regras:

- nao pode haver ciclo ativo
- precisa existir temporada ativa no grupo

Efeitos:

- admin vira automaticamente o capitao atual
- ciclo nasce com status `ATIVO`

### Consultar status do capitao

Quem pode:

- qualquer membro ativo do grupo

Regra:

- se nao houver ciclo ativo, a consulta falha

### Lançar desafio

Quem pode:

- apenas o capitao atual

Regras:

- precisa haver ciclo ativo
- nao pode haver desafiante pendente
- capitao nao pode desafiar a si mesmo
- partida precisa pertencer ao grupo
- partida precisa ter pelo menos 12 confirmados
- desafiante precisa estar confirmado na partida
- desafiante nao pode estar bloqueado no ciclo

Efeito:

- `IdDesafianteAtual` e preenchido

### Elegiveis para desafiante

Regras:

- apenas membros ativos podem consultar
- retornam apenas confirmados da partida
- exclui capitao atual
- exclui jogadores bloqueados no ciclo

### Registrar resultado do desafio

Quem pode:

- apenas `ADMIN`

Resultados validos:

- `CAPITAO`
- `DESAFIANTE`

Regras:

- precisa haver ciclo ativo
- precisa haver desafio pendente

Efeitos se `CAPITAO` vencer:

- desafiante e adicionado aos bloqueados do ciclo
- desafio pendente e limpo

Efeitos se `DESAFIANTE` vencer:

- ciclo atual e encerrado
- novo ciclo e criado
- desafiante passa a ser o novo capitao

## 5. Times, Resultado e Classificacao

### Atribuir times

Quem pode:

- apenas `ADMIN`

Estados permitidos da partida:

- `ABERTA`
- `EM_ANDAMENTO`

Regras:

- cada time precisa ter pelo menos 1 jogador
- um jogador nao pode estar nos dois times
- todo jogador precisa ser membro ativo do grupo
- todo jogador precisa ter presenca `CONFIRMADO`
- capitao do time precisa estar listado no proprio time

Efeitos:

- remove atribuicoes anteriores, se houver
- recria os times do zero
- partida passa para `EM_ANDAMENTO`

### Finalizar partida

Quem pode:

- apenas `ADMIN`

Pre-condicoes:

- partida precisa estar `EM_ANDAMENTO`
- precisa haver times registrados
- nao e permitido empate

Regras sobre estatisticas:

- nao pode haver estatisticas duplicadas para o mesmo usuario
- todo usuario com estatistica precisa participar da partida

Pontuacao base:

- jogador do time vencedor: `+4 pontos`
- jogador do time perdedor: `+1 ponto`
- todos os jogadores da partida recebem:
  - `+1 presenca`
  - gols e assistencias conforme estatisticas enviadas
- vencedores recebem `+1 vitoria`
- perdedores recebem `+1 derrota`

Efeitos:

- cria `ResultadoPartida`
- grava `EstatisticaPartida`
- atualiza `ClassificacaoTemporada`
- atualiza `ClassificacaoGeralGrupo`
- partida vira `FINALIZADA`

### Critérios de ordenacao da classificacao

Tanto na temporada quanto no historico geral:

1. pontos descrescente
2. vitorias descrescente
3. gols descrescente

### Excluir partida finalizada

Ao excluir uma partida finalizada:

- pontuacao base e revertida
- presencas, vitorias, derrotas, gols e assistencias sao revertidos
- premios de votacao aprovados tambem sao revertidos
- nenhum contador pode ficar negativo

## 6. Votacao

### Abrir votacao

Quem pode:

- apenas `ADMIN`

Regras:

- partida precisa estar `FINALIZADA`
- votacao da partida nao pode ter sido iniciada antes

Efeitos:

- cria uma votacao `MVP` rodada 1 aberta
- cria uma votacao `BOLA_MURCHA` rodada 1 aberta

### Votar

Quem pode:

- apenas jogador com presenca `CONFIRMADO`

Regras:

- tipo deve ser `MVP` ou `BOLA_MURCHA`
- partida precisa estar `FINALIZADA`
- precisa existir votacao aberta do tipo
- usuario nao pode votar em si mesmo
- usuario nao pode votar duas vezes na mesma rodada

Rodada 1:

- candidato votado precisa estar confirmado na partida

Rodadas de desempate:

- candidato votado precisa estar na lista restrita de empatados

### Encerrar votacao

Quem pode:

- apenas `ADMIN`

Regras:

- precisa existir votacao aberta do tipo
- precisa haver pelo menos um voto

Comportamento:

- se houver vencedor unico:
  - votacao vira `APURADA`
  - vencedor provisório e definido
- se houver empate:
  - rodada atual vira `ENCERRADA`
  - nova rodada e aberta
  - apenas os empatados seguem como candidatos

### Aprovar votacao

Quem pode:

- apenas `ADMIN`

Regras:

- precisa existir votacao `APURADA`
- precisa existir vencedor provisório

Efeitos:

- votacao vira `APROVADA`
- premio e gravado na classificacao:
  - `MVP` incrementa `Mvps`
  - `BOLA_MURCHA` incrementa `BolasMurchas`

### Reabertura de votacao

Regra importante:

- a votacao de uma partida nao pode ser reaberta apos iniciada

## 7. Estados Importantes

### ConviteGrupo

Estados observados:

- `PENDENTE`
- `ACEITO`
- `CANCELADO`
- `EXPIRADO`

### Partida

Estados observados:

- `ABERTA`
- `EM_ANDAMENTO`
- `FINALIZADA`
- `CANCELADA` (considerado em validacoes de duplicidade por dia)

### CicloCapitao

Estados observados:

- `ATIVO`
- `ENCERRADO`

### VotacaoPartida

Estados observados:

- `ABERTA`
- `ENCERRADA`
- `APURADA`
- `APROVADA`

## 8. Resumo de Permissoes

### Qualquer usuario autenticado

- cadastrar grupo
- listar grupos proprios
- atualizar proprio perfil

### Membro ativo

- ver grupos e dados relacionados
- confirmar presenca
- marcar ausencia
- votar
- consultar classificacao
- consultar status de capitao

### Admin

- convidar usuario
- atualizar agenda do grupo
- gerenciar membros
- excluir grupo
- criar partida
- excluir partida
- atribuir times
- finalizar partida
- iniciar ciclo de capitao
- registrar resultado de desafio
- abrir, encerrar e aprovar votacoes

### Capitao atual

- escolher desafiante do ciclo
