import type {
  MatchDetail,
  MatchPlayerDetail,
  MatchTeamDetail,
} from '../types/matchesContracts'

type MatchHistoryTeamsPanelProps = {
  match: MatchDetail
}

type MatchHistoryTeamCardProps = {
  team: MatchTeamDetail
}

function MatchHistoryTeamPlayer({
  player,
}: {
  player: MatchPlayerDetail
}) {
  return (
    <li className="match-history-teams-panel__player">
      <div className="match-history-teams-panel__player-main">
        <strong>{player.nome}</strong>
        {player.goleiro ? (
          <span className="match-history-teams-panel__player-role">Goleiro</span>
        ) : null}
      </div>

      <div className="match-history-teams-panel__player-stats">
        <span>{player.gols} G</span>
        <span>{player.assistencias} A</span>
      </div>
    </li>
  )
}

function MatchHistoryTeamCard({ team }: MatchHistoryTeamCardProps) {
  return (
    <article className="match-history-teams-panel__team">
      <header className="match-history-teams-panel__team-header">
        <div>
          <p className="match-history-teams-panel__team-label">
            Time {team.numeroTime}
          </p>
          <h3 className="match-history-teams-panel__captain">
            Capitao: {team.nomeCapitao}
          </h3>
        </div>
        <span className="match-history-teams-panel__team-count">
          {team.jogadores.length} jogador
          {team.jogadores.length === 1 ? '' : 'es'}
        </span>
      </header>

      {team.jogadores.length > 0 ? (
        <ul className="match-history-teams-panel__players">
          {team.jogadores.map((player) => (
            <MatchHistoryTeamPlayer key={player.idUsuario} player={player} />
          ))}
        </ul>
      ) : (
        <div className="match-history-teams-panel__empty">
          <p>O backend ainda nao devolveu jogadores para este time.</p>
        </div>
      )}
    </article>
  )
}

export function MatchHistoryTeamsPanel({
  match,
}: MatchHistoryTeamsPanelProps) {
  const teams = [match.time1, match.time2].filter(
    (team): team is MatchTeamDetail => team !== null,
  )

  if (teams.length === 0) {
    return (
      <div className="match-history-teams-panel__empty match-history-teams-panel__empty--wide">
        <h3>Times ainda nao registrados</h3>
        <p>
          Esta partida ainda nao possui times fechados no detalhe historico
          devolvido pelo backend.
        </p>
      </div>
    )
  }

  return (
    <div className="match-history-teams-panel">
      <div className="match-history-teams-panel__grid">
        {teams.map((team) => (
          <MatchHistoryTeamCard key={team.numeroTime} team={team} />
        ))}
      </div>
    </div>
  )
}
