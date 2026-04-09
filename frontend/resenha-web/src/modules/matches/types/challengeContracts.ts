import type { MatchStatus } from './matchesContracts'

export const MATCH_CHALLENGE_STATUS_VALUES = [
  'AGUARDANDO_CONFIRMACOES',
  'PRONTA_PARA_MONTAGEM',
  'PAR_IMPAR_LINHA',
  'ESCOLHA_EM_ANDAMENTO',
  'PAR_IMPAR_GOLEIROS',
  'ESCOLHA_GOLEIRO_EM_ANDAMENTO',
  'DEFINICAO_MANUAL_GOLEIRO',
  'TIMES_FECHADOS',
] as const
export type MatchChallengeStatusValue =
  (typeof MATCH_CHALLENGE_STATUS_VALUES)[number]

export const MATCH_CHALLENGE_PARITY_VALUES = ['PAR', 'IMPAR'] as const
export type MatchChallengeParity =
  (typeof MATCH_CHALLENGE_PARITY_VALUES)[number]

export type MatchChallengeCaptainApiResponse = {
  idUsuario: number
  nome: string
}

export type MatchChallengePlayerApiResponse = {
  idUsuario: number
  nome: string
  goleiro: boolean
}

export type MatchChallengeTeamApiResponse = {
  numeroTime: number
  idCapitao: number
  nomeCapitao: string
  jogadores: MatchChallengePlayerApiResponse[]
}

export type MatchChallengeStatusApiResponse = {
  idPartida: number
  idGrupo: number
  dataHoraJogo: string
  statusPartida: MatchStatus
  statusDesafio: MatchChallengeStatusValue
  totalConfirmados: number
  minimoConfirmados: number
  goleirosConfirmados: number
  maximoGoleiros: number
  horarioLimiteConfirmacao: string
  confirmacoesEncerradas: boolean
  podeIniciarMontagem: boolean
  usuarioEhCapitao: boolean
  usuarioEhCapitaoAtual: boolean
  usuarioEhDesafiante: boolean
  usuarioPodeInteragir: boolean
  usuarioPodeEscolherParidade: boolean
  usuarioPodeInformarNumero: boolean
  usuarioPodeEscolherJogadorLinha: boolean
  usuarioPodeEscolherParidadeGoleiro: boolean
  usuarioPodeInformarNumeroGoleiro: boolean
  usuarioPodeEscolherGoleiro: boolean
  possuiDesafianteDefinido: boolean
  requerDefinicaoManualGoleiro: boolean
  paridadeCapitaoAtual: MatchChallengeParity | null
  paridadeDesafiante: MatchChallengeParity | null
  capitaoAtualJaInformouNumero: boolean
  desafianteJaInformouNumero: boolean
  numeroCapitaoAtual: number | null
  numeroDesafiante: number | null
  somaParImparLinha: number | null
  paridadeCapitaoAtualGoleiro: MatchChallengeParity | null
  paridadeDesafianteGoleiro: MatchChallengeParity | null
  capitaoAtualJaInformouNumeroGoleiro: boolean
  desafianteJaInformouNumeroGoleiro: boolean
  numeroCapitaoAtualGoleiro: number | null
  numeroDesafianteGoleiro: number | null
  somaParImparGoleiro: number | null
  alertas: string[]
  bloqueios: string[]
  capitaoAtual: MatchChallengeCaptainApiResponse | null
  desafiante: MatchChallengeCaptainApiResponse | null
  vencedorParImparLinha: MatchChallengeCaptainApiResponse | null
  proximoCapitaoEscolha: MatchChallengeCaptainApiResponse | null
  vencedorParImparGoleiro: MatchChallengeCaptainApiResponse | null
  proximoCapitaoEscolhaGoleiro: MatchChallengeCaptainApiResponse | null
  timeCapitaoAtual: MatchChallengeTeamApiResponse | null
  timeDesafiante: MatchChallengeTeamApiResponse | null
  jogadoresLinhaDisponiveis: MatchChallengePlayerApiResponse[]
  goleirosDisponiveis: MatchChallengePlayerApiResponse[]
}

export type StartMatchLineDrawInput = {
  escolhaParidade: MatchChallengeParity
}

export type SubmitMatchLineDrawNumberInput = {
  numero: number
}

export type PickMatchLinePlayerInput = {
  idUsuarioJogador: number
}

export type StartMatchGoalkeeperDrawInput = {
  escolhaParidade: MatchChallengeParity
}

export type SubmitMatchGoalkeeperDrawNumberInput = {
  numero: number
}

export type PickMatchGoalkeeperInput = {
  idUsuarioGoleiro: number
}

export type MatchChallengeCaptain = {
  idUsuario: number
  nome: string
}

export type MatchChallengePlayer = {
  idUsuario: number
  nome: string
  goleiro: boolean
}

export type MatchChallengeTeam = {
  numeroTime: number
  idCapitao: number
  nomeCapitao: string
  jogadores: MatchChallengePlayer[]
}

export type MatchChallengeStatus = {
  idPartida: number
  idGrupo: number
  dataHoraJogo: string
  statusPartida: MatchStatus
  statusDesafio: MatchChallengeStatusValue
  totalConfirmados: number
  minimoConfirmados: number
  goleirosConfirmados: number
  maximoGoleiros: number
  horarioLimiteConfirmacao: string
  confirmacoesEncerradas: boolean
  podeIniciarMontagem: boolean
  usuarioEhCapitao: boolean
  usuarioEhCapitaoAtual: boolean
  usuarioEhDesafiante: boolean
  usuarioPodeInteragir: boolean
  usuarioPodeEscolherParidade: boolean
  usuarioPodeInformarNumero: boolean
  usuarioPodeEscolherJogadorLinha: boolean
  usuarioPodeEscolherParidadeGoleiro: boolean
  usuarioPodeInformarNumeroGoleiro: boolean
  usuarioPodeEscolherGoleiro: boolean
  possuiDesafianteDefinido: boolean
  requerDefinicaoManualGoleiro: boolean
  paridadeCapitaoAtual: MatchChallengeParity | null
  paridadeDesafiante: MatchChallengeParity | null
  capitaoAtualJaInformouNumero: boolean
  desafianteJaInformouNumero: boolean
  numeroCapitaoAtual: number | null
  numeroDesafiante: number | null
  somaParImparLinha: number | null
  paridadeCapitaoAtualGoleiro: MatchChallengeParity | null
  paridadeDesafianteGoleiro: MatchChallengeParity | null
  capitaoAtualJaInformouNumeroGoleiro: boolean
  desafianteJaInformouNumeroGoleiro: boolean
  numeroCapitaoAtualGoleiro: number | null
  numeroDesafianteGoleiro: number | null
  somaParImparGoleiro: number | null
  alertas: string[]
  bloqueios: string[]
  capitaoAtual: MatchChallengeCaptain | null
  desafiante: MatchChallengeCaptain | null
  vencedorParImparLinha: MatchChallengeCaptain | null
  proximoCapitaoEscolha: MatchChallengeCaptain | null
  vencedorParImparGoleiro: MatchChallengeCaptain | null
  proximoCapitaoEscolhaGoleiro: MatchChallengeCaptain | null
  timeCapitaoAtual: MatchChallengeTeam | null
  timeDesafiante: MatchChallengeTeam | null
  jogadoresLinhaDisponiveis: MatchChallengePlayer[]
  goleirosDisponiveis: MatchChallengePlayer[]
}
