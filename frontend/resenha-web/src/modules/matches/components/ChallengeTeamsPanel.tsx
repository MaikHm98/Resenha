import type {
  MatchChallengeStatus,
  MatchChallengeTeam,
} from '../types/challengeContracts'

type ChallengeTeamsPanelProps = {
  challenge: MatchChallengeStatus
}

function ChallengeTeamCard({
  title,
  team,
}: {
  title: string
  team: MatchChallengeTeam | null
}) {
  return (
    <section className="challenge-teams-panel__team-card">
      <header className="challenge-teams-panel__team-header">
        <div>
          <h3 className="challenge-teams-panel__team-title">{title}</h3>
          <p className="challenge-teams-panel__team-meta">
            {team ? `Capitao: ${team.nomeCapitao}` : 'Time ainda nao materializado no snapshot.'}
          </p>
        </div>
        <span className="challenge-teams-panel__team-count">
          {team?.jogadores.length ?? 0}
        </span>
      </header>

      {team && team.jogadores.length > 0 ? (
        <ul className="challenge-teams-panel__players-list">
          {team.jogadores.map((player) => (
            <li
              className="challenge-teams-panel__player-item"
              key={`${title}-${player.idUsuario}`}
            >
              <span>{player.nome}</span>
              {player.goleiro ? (
                <span className="challenge-teams-panel__player-badge">Goleiro</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <div className="challenge-teams-panel__empty">
          <p>Nenhum jogador escolhido neste time ate agora.</p>
        </div>
      )}
    </section>
  )
}

export function ChallengeTeamsPanel({
  challenge,
}: ChallengeTeamsPanelProps) {
  return (
    <div className="challenge-teams-panel">
      <ChallengeTeamCard
        team={challenge.timeCapitaoAtual}
        title="Time do capitao atual"
      />
      <ChallengeTeamCard
        team={challenge.timeDesafiante}
        title="Time do desafiante"
      />
    </div>
  )
}
