import type {
  MatchChallengeCaptain,
  MatchChallengeParity,
  MatchChallengeStatus,
  MatchChallengeStatusValue,
} from '../types/challengeContracts'
import type { MatchStatus } from '../types/matchesContracts'

type ChallengeStatusPanelProps = {
  challenge: MatchChallengeStatus
}

const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  ABERTA: 'ABERTA',
  EM_ANDAMENTO: 'EM ANDAMENTO',
  FINALIZADA: 'FINALIZADA',
  CANCELADA: 'CANCELADA',
}

const CHALLENGE_STATUS_LABELS: Record<MatchChallengeStatusValue, string> = {
  AGUARDANDO_CONFIRMACOES: 'AGUARDANDO CONFIRMACOES',
  PRONTA_PARA_MONTAGEM: 'PRONTA PARA MONTAGEM',
  PAR_IMPAR_LINHA: 'PAR OU IMPAR DA LINHA',
  ESCOLHA_EM_ANDAMENTO: 'ESCOLHA EM ANDAMENTO',
  PAR_IMPAR_GOLEIROS: 'PAR OU IMPAR DOS GOLEIROS',
  ESCOLHA_GOLEIRO_EM_ANDAMENTO: 'ESCOLHA DE GOLEIRO EM ANDAMENTO',
  DEFINICAO_MANUAL_GOLEIRO: 'DEFINICAO MANUAL DE GOLEIRO',
  TIMES_FECHADOS: 'TIMES FECHADOS',
}

function formatDateTime(value: string): string {
  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsedDate)
}

function formatTime(value: string): string {
  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsedDate)
}

function formatCaptainName(captain: MatchChallengeCaptain | null): string {
  if (captain === null) {
    return 'Ainda nao definido'
  }

  return captain.nome
}

function formatParity(value: MatchChallengeParity | null): string {
  if (value === null) {
    return 'Ainda nao definido'
  }

  return value
}

function getCurrentCaptainTurn(
  challenge: MatchChallengeStatus,
): { captain: MatchChallengeCaptain | null; scope: string } {
  if (challenge.proximoCapitaoEscolhaGoleiro !== null) {
    return {
      captain: challenge.proximoCapitaoEscolhaGoleiro,
      scope: 'Goleiros',
    }
  }

  if (challenge.proximoCapitaoEscolha !== null) {
    return {
      captain: challenge.proximoCapitaoEscolha,
      scope: 'Linha',
    }
  }

  return {
    captain: null,
    scope: 'Aguardando definicao do backend',
  }
}

export function ChallengeStatusPanel({
  challenge,
}: ChallengeStatusPanelProps) {
  const currentCaptainTurn = getCurrentCaptainTurn(challenge)

  return (
    <div className="challenge-status-panel">
      <header className="challenge-status-panel__header">
        <div>
          <h3 className="challenge-status-panel__title">
            Partida #{challenge.idPartida}
          </h3>
          <p className="challenge-status-panel__description">
            {formatDateTime(challenge.dataHoraJogo)}
          </p>
        </div>

        <div className="challenge-status-panel__status-stack">
          <span className="challenge-status-panel__status">
            {CHALLENGE_STATUS_LABELS[challenge.statusDesafio]}
          </span>
          <span className="challenge-status-panel__status challenge-status-panel__status--outline">
            {MATCH_STATUS_LABELS[challenge.statusPartida]}
          </span>
        </div>
      </header>

      <div className="challenge-status-panel__highlight-grid">
        <article className="challenge-status-panel__card">
          <p className="challenge-status-panel__label">Capitao atual</p>
          <strong className="challenge-status-panel__name">
            {formatCaptainName(challenge.capitaoAtual)}
          </strong>
        </article>

        <article className="challenge-status-panel__card">
          <p className="challenge-status-panel__label">Desafiante</p>
          <strong className="challenge-status-panel__name">
            {formatCaptainName(challenge.desafiante)}
          </strong>
        </article>

        <article className="challenge-status-panel__card">
          <p className="challenge-status-panel__label">Capitao da vez</p>
          <strong className="challenge-status-panel__name">
            {formatCaptainName(currentCaptainTurn.captain)}
          </strong>
          <p className="challenge-status-panel__meta">{currentCaptainTurn.scope}</p>
        </article>

        <article className="challenge-status-panel__card">
          <p className="challenge-status-panel__label">Confirmacoes</p>
          <strong className="challenge-status-panel__name">
            {challenge.totalConfirmados}/{challenge.minimoConfirmados}
          </strong>
          <p className="challenge-status-panel__meta">
            Goleiros: {challenge.goleirosConfirmados}/{challenge.maximoGoleiros}
          </p>
        </article>
      </div>

      <dl className="challenge-status-panel__details">
        <div className="challenge-status-panel__detail-card">
          <dt>Interacao do usuario</dt>
          <dd>{challenge.usuarioPodeInteragir ? 'Pode interagir' : 'Somente leitura'}</dd>
        </div>

        <div className="challenge-status-panel__detail-card">
          <dt>Montagem liberada</dt>
          <dd>{challenge.podeIniciarMontagem ? 'Sim' : 'Nao'}</dd>
        </div>

        <div className="challenge-status-panel__detail-card">
          <dt>Confirmacoes encerradas</dt>
          <dd>{challenge.confirmacoesEncerradas ? 'Sim' : 'Nao'}</dd>
        </div>

        <div className="challenge-status-panel__detail-card">
          <dt>Horario limite</dt>
          <dd>{formatTime(challenge.horarioLimiteConfirmacao)}</dd>
        </div>

        <div className="challenge-status-panel__detail-card">
          <dt>Paridade da linha</dt>
          <dd>
            {formatParity(challenge.paridadeCapitaoAtual)} /{' '}
            {formatParity(challenge.paridadeDesafiante)}
          </dd>
        </div>

        <div className="challenge-status-panel__detail-card">
          <dt>Numeros da linha</dt>
          <dd>
            {challenge.numeroCapitaoAtual ?? '-'} / {challenge.numeroDesafiante ?? '-'}
          </dd>
        </div>

        <div className="challenge-status-panel__detail-card">
          <dt>Paridade dos goleiros</dt>
          <dd>
            {formatParity(challenge.paridadeCapitaoAtualGoleiro)} /{' '}
            {formatParity(challenge.paridadeDesafianteGoleiro)}
          </dd>
        </div>

        <div className="challenge-status-panel__detail-card">
          <dt>Numeros dos goleiros</dt>
          <dd>
            {challenge.numeroCapitaoAtualGoleiro ?? '-'} /{' '}
            {challenge.numeroDesafianteGoleiro ?? '-'}
          </dd>
        </div>
      </dl>
    </div>
  )
}
