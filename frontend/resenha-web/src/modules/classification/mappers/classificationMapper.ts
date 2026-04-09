import type {
  ClassificationEntry,
  ClassificationEntryApiResponse,
  ClassificationRanking,
  ClassificationRankingApiResponse,
  MyClassificationStats,
  MyClassificationStatsApiResponse,
} from '../types/classificationContracts'

export function mapClassificationEntryApiToClassificationEntry(
  payload: ClassificationEntryApiResponse,
): ClassificationEntry {
  return {
    posicao: payload.posicao,
    idUsuario: payload.idUsuario,
    nome: payload.nome,
    timeCoracaoCodigo: payload.timeCoracaoCodigo,
    timeCoracaoNome: payload.timeCoracaoNome,
    timeCoracaoEscudoUrl: payload.timeCoracaoEscudoUrl,
    pontos: payload.pontos,
    vitorias: payload.vitorias,
    derrotas: payload.derrotas,
    presencas: payload.presencas,
    gols: payload.gols,
    assistencias: payload.assistencias,
    mvps: payload.mvps,
    bolasMurchas: payload.bolasMurchas,
  }
}

export function mapClassificationRankingApiToClassificationRanking(
  payload: ClassificationRankingApiResponse,
): ClassificationRanking {
  return {
    classificacao: payload.classificacao.map(
      mapClassificationEntryApiToClassificationEntry,
    ),
  }
}

export function mapMyClassificationStatsApiToMyClassificationStats(
  payload: MyClassificationStatsApiResponse,
): MyClassificationStats {
  return {
    temporada: payload.temporada
      ? mapClassificationEntryApiToClassificationEntry(payload.temporada)
      : null,
    geral: payload.geral
      ? mapClassificationEntryApiToClassificationEntry(payload.geral)
      : null,
  }
}
