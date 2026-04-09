import { Button } from '../../../shared/components'
import type { CaptainPlayerSummary } from '../types/captainContracts'

type EligibleChallengersListProps = {
  eligibleChallengers: CaptainPlayerSummary[]
  isSubmitting: boolean
  onLaunchChallenge: (challengerUserId: number) => Promise<boolean>
}

export function EligibleChallengersList({
  eligibleChallengers,
  isSubmitting,
  onLaunchChallenge,
}: EligibleChallengersListProps) {
  return (
    <ul className="eligible-challengers-list">
      {eligibleChallengers.map((player) => (
        <li className="eligible-challengers-list__item" key={player.idUsuario}>
          <div className="eligible-challengers-list__identity">
            <strong>{player.nome}</strong>
            <span>ID {player.idUsuario}</span>
          </div>

          <Button
            loading={isSubmitting}
            onClick={() => void onLaunchChallenge(player.idUsuario)}
            type="button"
          >
            Escolher desafiante
          </Button>
        </li>
      ))}
    </ul>
  )
}
