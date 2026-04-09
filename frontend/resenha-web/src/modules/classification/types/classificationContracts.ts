export type ClassificationEntryApiResponse = {
  posicao: number
  idUsuario: number
  nome: string
  timeCoracaoCodigo: string | null
  timeCoracaoNome: string | null
  timeCoracaoEscudoUrl: string | null
  pontos: number
  vitorias: number
  derrotas: number
  presencas: number
  gols: number
  assistencias: number
  mvps: number
  bolasMurchas: number
}

export type ClassificationRankingApiResponse = {
  classificacao: ClassificationEntryApiResponse[]
}

export type MyClassificationStatsApiResponse = {
  temporada: ClassificationEntryApiResponse | null
  geral: ClassificationEntryApiResponse | null
}

export type ClassificationEntry = {
  posicao: number
  idUsuario: number
  nome: string
  timeCoracaoCodigo: string | null
  timeCoracaoNome: string | null
  timeCoracaoEscudoUrl: string | null
  pontos: number
  vitorias: number
  derrotas: number
  presencas: number
  gols: number
  assistencias: number
  mvps: number
  bolasMurchas: number
}

export type ClassificationRanking = {
  classificacao: ClassificationEntry[]
}

export type MyClassificationStats = {
  temporada: ClassificationEntry | null
  geral: ClassificationEntry | null
}
