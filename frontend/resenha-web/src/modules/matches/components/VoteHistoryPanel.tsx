import type {
  MatchVoteRound,
  MatchVoteRoundStatus,
  MatchVoteStatus,
  MatchVoteType,
} from '../types/voteContracts'

type VoteHistoryPanelProps = {
  voteStatus: MatchVoteStatus
}

type VoteHistoryColumnProps = {
  type: MatchVoteType
  history: MatchVoteRound[]
}

const VOTE_TYPE_LABELS: Record<MatchVoteType, string> = {
  MVP: 'MVP',
  BOLA_MURCHA: 'BOLA MURCHA',
}

const VOTE_STATUS_LABELS: Record<MatchVoteRoundStatus, string> = {
  ABERTA: 'ABERTA',
  ENCERRADA: 'ENCERRADA',
  APURADA: 'APURADA',
  APROVADA: 'APROVADA',
}

function VoteHistoryColumn({ type, history }: VoteHistoryColumnProps) {
  return (
    <article className="vote-history-panel__column">
      <header className="vote-history-panel__column-header">
        <div>
          <p className="vote-history-panel__label">{VOTE_TYPE_LABELS[type]}</p>
          <h3 className="vote-history-panel__title">Historico devolvido pela API</h3>
        </div>
        <span className="vote-history-panel__badge">
          {history.length} rodada{history.length === 1 ? '' : 's'}
        </span>
      </header>

      {history.length === 0 ? (
        <div className="vote-history-panel__empty">
          <h4>Nenhuma rodada registrada no snapshot</h4>
          <p>
            O backend ainda nao devolveu historico para {VOTE_TYPE_LABELS[type]}.
          </p>
        </div>
      ) : (
        <ol className="vote-history-panel__list">
          {history.map((round) => (
            <li className="vote-history-panel__item" key={round.idVotacao}>
              <header className="vote-history-panel__item-header">
                <div>
                  <strong>Rodada {round.rodada}</strong>
                  <p className="vote-history-panel__meta">
                    Vencedor provisorio:{' '}
                    {round.nomeVencedorProvisorio ?? 'Ainda nao definido'}
                  </p>
                </div>
                <span className="vote-history-panel__badge vote-history-panel__badge--outline">
                  {VOTE_STATUS_LABELS[round.status]}
                </span>
              </header>

              {round.candidatos.length > 0 ? (
                <ul className="vote-history-panel__candidate-list">
                  {round.candidatos.map((candidate) => (
                    <li
                      className="vote-history-panel__candidate-item"
                      key={candidate.idUsuario}
                    >
                      <div>
                        <strong>{candidate.nome}</strong>
                        <p className="vote-history-panel__meta">
                          ID do usuario: {candidate.idUsuario}
                        </p>
                      </div>
                      <span className="vote-history-panel__badge vote-history-panel__badge--outline">
                        {candidate.votos} voto{candidate.votos === 1 ? '' : 's'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="vote-history-panel__empty vote-history-panel__empty--inline">
                  <h4>Sem candidatos registrados nessa rodada</h4>
                  <p>O frontend exibe apenas o historico recebido da API.</p>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </article>
  )
}

export function VoteHistoryPanel({ voteStatus }: VoteHistoryPanelProps) {
  return (
    <div className="vote-history-panel">
      <VoteHistoryColumn history={voteStatus.mvpHistorico} type="MVP" />
      <VoteHistoryColumn history={voteStatus.bolaMurchaHistorico} type="BOLA_MURCHA" />
    </div>
  )
}
