import { Button, Input, Alert } from '../../../shared/components'
import { ProfileClubField } from './ProfileClubField'

type ProfileSelectOption = {
  value: string
  label: string
}

type ProfileFormValues = {
  nome: string
  goleiro: boolean
  timeCoracaoCodigo: string
  posicaoPrincipal: string
  peDominante: string
}

type ProfileFormProps = {
  formValues: ProfileFormValues
  positionOptions: ProfileSelectOption[]
  dominantFootOptions: ProfileSelectOption[]
  clubOptions: ProfileSelectOption[]
  isClubOptionsLoading: boolean
  clubOptionsError: string | null
  isSaving: boolean
  saveError: string | null
  saveSuccess: string | null
  hasPendingChanges: boolean
  onNameChange: (value: string) => void
  onGoleiroChange: (value: boolean) => void
  onTimeCoracaoCodigoChange: (value: string) => void
  onPosicaoPrincipalChange: (value: string) => void
  onPeDominanteChange: (value: string) => void
  onSubmit: () => void
}

type SelectFieldProps = {
  label: string
  hint: string
  value: string
  options: ProfileSelectOption[]
  disabled?: boolean
  onChange: (value: string) => void
}

function SelectField({
  label,
  hint,
  value,
  options,
  disabled = false,
  onChange,
}: SelectFieldProps) {
  return (
    <label className="profile-form__select-field">
      <span className="profile-form__field-label">{label}</span>
      <span className="profile-form__field-hint">{hint}</span>
      <select
        className="ui-input profile-form__select"
        disabled={disabled}
        onChange={(event) => onChange(event.currentTarget.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={`${label}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function ProfileForm({
  formValues,
  positionOptions,
  dominantFootOptions,
  clubOptions,
  isClubOptionsLoading,
  clubOptionsError,
  isSaving,
  saveError,
  saveSuccess,
  hasPendingChanges,
  onNameChange,
  onGoleiroChange,
  onTimeCoracaoCodigoChange,
  onPosicaoPrincipalChange,
  onPeDominanteChange,
  onSubmit,
}: ProfileFormProps) {
  return (
    <form
      className="profile-form"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <p className="profile-form__intro">
        O email continua somente em leitura. Os demais campos ajudam a deixar o seu perfil alinhado com a resenha.
      </p>

      <div className="profile-form__status-stack" aria-live="polite">
        {clubOptionsError ? (
          <Alert title="Nao foi possivel atualizar as opcoes de clube" variant="warning">
            {clubOptionsError}
          </Alert>
        ) : null}

        {saveError ? (
          <Alert title="Nao foi possivel atualizar o perfil" variant="error">
            {saveError}
          </Alert>
        ) : null}

        {saveSuccess ? (
          <Alert title="Perfil atualizado" variant="success">
            {saveSuccess}
          </Alert>
        ) : null}
      </div>

      <section className="profile-form__section" aria-labelledby="profile-form-account-fields">
        <div className="profile-form__section-header">
          <div>
            <h3 id="profile-form-account-fields">Dados principais</h3>
            <p>Edite os campos principais da sua conta sem sair do perfil.</p>
          </div>
          <span className="profile-form__readonly-chip">Email somente leitura</span>
        </div>

        <div className="profile-form__grid">
          <Input
            autoComplete="name"
            disabled={isSaving}
            hint="Use o nome que voce quer ver nas telas da resenha."
            label="Nome"
            onChange={(event) => onNameChange(event.currentTarget.value)}
            placeholder="Seu nome"
            value={formValues.nome}
          />

          <div className="profile-form__field">
            <span className="profile-form__field-label">Email</span>
            <span className="profile-form__field-hint">
              Mantido em leitura nesta fase de perfil e conta.
            </span>
            <div className="profile-form__readonly-chip">Nao editavel aqui</div>
          </div>
        </div>
      </section>

      <section className="profile-form__section" aria-labelledby="profile-form-sports-fields">
        <div className="profile-form__section-header">
          <div>
            <h3 id="profile-form-sports-fields">Dados esportivos</h3>
            <p>
              Complete os dados esportivos para deixar seu perfil mais fiel ao app.
            </p>
          </div>
          <span className="profile-form__section-badge">Perfil esportivo</span>
        </div>

        <div className="profile-form__toggle">
          <input
            checked={formValues.goleiro}
            disabled={isSaving}
            id="profile-form-goleiro"
            onChange={(event) => onGoleiroChange(event.currentTarget.checked)}
            type="checkbox"
          />

          <label className="profile-form__toggle-copy" htmlFor="profile-form-goleiro">
            <strong>Joga como goleiro</strong>
            <p>
              Marque esta opcao quando voce tambem joga no gol.
            </p>
          </label>
        </div>

        <div className="profile-form__grid">
          <SelectField
            disabled={isSaving}
            hint="Opcional. Deixe em branco se preferir nao informar."
            label="Posicao principal"
            onChange={onPosicaoPrincipalChange}
            options={positionOptions}
            value={formValues.posicaoPrincipal}
          />

          <SelectField
            disabled={isSaving}
            hint="Opcional. Escolha o pe que voce mais usa."
            label="Pe dominante"
            onChange={onPeDominanteChange}
            options={dominantFootOptions}
            value={formValues.peDominante}
          />
        </div>

        <ProfileClubField
          disabled={isSaving}
          isLoading={isClubOptionsLoading}
          loadError={clubOptionsError}
          onChange={onTimeCoracaoCodigoChange}
          options={clubOptions}
          value={formValues.timeCoracaoCodigo}
        />
      </section>

      <div className="profile-form__footer">
        <span className="profile-form__status-note">
          {hasPendingChanges ? 'Alteracoes pendentes' : 'Sem alteracoes pendentes'}
        </span>

        <div className="profile-form__actions">
          <Button
            disabled={!hasPendingChanges}
            loading={isSaving}
            type="submit"
          >
            Salvar perfil
          </Button>
        </div>
      </div>
    </form>
  )
}
