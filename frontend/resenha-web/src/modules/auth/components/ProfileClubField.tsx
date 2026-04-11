import { Spinner } from '../../../shared/components'

type ProfileClubOption = {
  value: string
  label: string
}

type ProfileClubFieldProps = {
  value: string
  options: ProfileClubOption[]
  isLoading: boolean
  loadError: string | null
  disabled?: boolean
  onChange: (value: string) => void
}

export function ProfileClubField({
  value,
  options,
  isLoading,
  loadError,
  disabled = false,
  onChange,
}: ProfileClubFieldProps) {
  return (
    <label className="profile-club-field">
      <div className="profile-club-field__header">
        <div className="profile-form__field-header">
          <span className="profile-form__field-label">Time do coracao</span>
          <span className="profile-form__field-hint">
            As opcoes sao carregadas pelo endpoint ja existente de clubes.
          </span>
        </div>

        {isLoading ? (
          <span className="profile-club-field__status">
            <Spinner label={null} size="sm" />
            Carregando clubes...
          </span>
        ) : null}
      </div>

      <select
        className="ui-input profile-form__select"
        disabled={disabled || isLoading}
        onChange={(event) => onChange(event.currentTarget.value)}
        value={value}
      >
        <option value="">Nao informar</option>
        {options.map((option) => (
          <option key={`club-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <p className="profile-club-field__hint">
        {loadError
          ? 'As opcoes completas de clube nao foram carregadas agora. Voce ainda pode salvar os demais campos.'
          : 'Se nao quiser associar um clube, mantenha o campo em branco.'}
      </p>
    </label>
  )
}
