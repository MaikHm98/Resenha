type ProfileSummaryCardProps = {
  initials: string
  name: string
  emailLabel: string
  primaryRoleLabel: string
  clubLabel: string
  sessionStatusLabel: string
  sessionStatusDescription: string
}

export function ProfileSummaryCard({
  initials,
  name,
  emailLabel,
  primaryRoleLabel,
  clubLabel,
  sessionStatusLabel,
  sessionStatusDescription,
}: ProfileSummaryCardProps) {
  const statusVariantClass = sessionStatusLabel.toLowerCase().includes('parcial')
    ? 'profile-summary-card__status-badge--partial'
    : 'profile-summary-card__status-badge--complete'

  return (
    <article className="profile-summary-card">
      <header className="profile-summary-card__header">
        <div className="profile-summary-card__identity">
          <span className="profile-summary-card__avatar" aria-hidden="true">
            {initials}
          </span>

          <div>
            <p className="profile-summary-card__eyebrow">Jogador autenticado</p>
            <h3 className="profile-summary-card__name">{name}</h3>
          </div>
        </div>

        <div className="profile-summary-card__status">
          <span
            className={[
              'profile-summary-card__status-badge',
              statusVariantClass,
            ].join(' ')}
          >
            {sessionStatusLabel}
          </span>
        </div>
      </header>

      <p className="profile-summary-card__description">
        {sessionStatusDescription}
      </p>

      <div className="profile-summary-card__meta">
        <div className="profile-summary-card__meta-item">
          <p className="profile-summary-card__eyebrow">Email</p>
          <strong>{emailLabel}</strong>
        </div>

        <div className="profile-summary-card__meta-item">
          <p className="profile-summary-card__eyebrow">Posicao principal</p>
          <strong>{primaryRoleLabel}</strong>
        </div>
      </div>

      <div className="profile-summary-card__highlights">
        <div className="profile-summary-card__meta-item">
          <p className="profile-summary-card__eyebrow">Time do coracao</p>
          <strong>{clubLabel}</strong>
        </div>

        <div className="profile-summary-card__meta-item">
          <p className="profile-summary-card__eyebrow">Conta</p>
          <strong>Email protegido</strong>
        </div>
      </div>
    </article>
  )
}
