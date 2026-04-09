import type {
  MatchVoteRound,
  MatchVoteRoundStatus,
  MatchVoteStatus,
  MatchVoteType,
} from '../types/voteContracts'

type VoteStatusPanelProps = {
  voteStatus: MatchVoteStatus
}

type VoteRoundCardProps = {
  round: MatchVoteRound | null
  type: MatchVoteType
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

function VoteRoundCard({ round, type }: VoteRoundCardProps) {
  if (round === null) {
    return (
      <article className="vote-status-panel__card">
        <header className="vote-status-panel__card-header">
          <div>
            <p className="vote-status-panel__label">{VOTE_TYPE_LABELS[type]}</p>
            <h3 className="vote-status-panel__title">Votacao ainda nao iniciada</h3>
          </div>
          <span className="vote-status-panel__badge vote-status-panel__badge--outline">
            Aguardando abertura
          </span>
        </header>

        <p className="vote-status-panel__meta">
          O backend ainda nao devolveu rodada ativa ou historico atual para este tipo.
        </p>
      </article>
    )
  }

  return (
    <article className="vote-status-panel__card">
      <header className="vote-status-panel__card-header">
        <div>
          <p className="vote-status-panel__label">{VOTE_TYPE_LABELS[type]}</p>
          <h3 className="vote-status-panel__title">Rodada {round.rodada}</h3>
        </div>
        <span className="vote-status-panel__badge">
          {VOTE_STATUS_LABELS[round.status]}
        </span>
      </header>

      <dl className="vote-status-panel__details">
        <div className="vote-status-panel__detail-card">
          <dt>Candidatos</dt>
          <dd>{round.candidatos.length}</dd>
        </div>
        <div className="vote-status-panel__detail-card">
          <dt>Vencedor provisorio</dt>
          <dd>{round.nomeVencedorProvisorio ?? 'Ainda nao definido'}</dd>
        </div>
      </dl>

      {round.candidatos.length > 0 ? (
        <ul className="vote-status-panel__candidate-list">
          {round.candidatos.map((candidate) => (
            <li className="vote-status-panel__candidate-item" key={candidate.idUsuario}>
              <div>
                <strong>{candidate.nome}</strong>
                <p className="vote-status-panel__meta">
                  ID do usuario: {candidate.idUsuario}
                </p>
              </div>
              <span className="vote-status-panel__badge vote-status-panel__badge--outline">
                {candidate.votos} voto{candidate.votos === 1 ? '' : 's'}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="vote-status-panel__empty">
          <h4>Nenhum candidato retornado no snapshot atual</h4>
          <p>
            A rodada existe, mas o backend ainda nao devolveu candidatos com contagem
            para este momento.
          </p>
        </div>
      )}
    </article>
  )
}

export function VoteStatusPanel({ voteStatus }: VoteStatusPanelProps) {
  return (
    <div className="vote-status-panel">
      <VoteRoundCard round={voteStatus.mvp} type="MVP" />
      <VoteRoundCard round={voteStatus.bolaMurcha} type="BOLA_MURCHA" />
    </div>
  )
}
