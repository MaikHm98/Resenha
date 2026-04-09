import { useState, type FormEvent } from 'react'
import { Button, Input } from '../../../shared/components'
import type { CreateMatchInput } from '../types/matchesContracts'

type CreateMatchFormProps = {
  groupId: number
  isSubmitting: boolean
  onSubmit: (payload: CreateMatchInput) => Promise<boolean>
}

type CreateMatchFormFieldErrors = Partial<
  Record<'dataHoraJogo' | 'limiteVagas' | 'observacao', string>
>

function normalizeLocalDateTime(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return `${value}:00`
  }

  return value
}

export function CreateMatchForm({
  groupId,
  isSubmitting,
  onSubmit,
}: CreateMatchFormProps) {
  const [dataHoraJogo, setDataHoraJogo] = useState('')
  const [limiteVagas, setLimiteVagas] = useState('16')
  const [observacao, setObservacao] = useState('')
  const [fieldErrors, setFieldErrors] = useState<CreateMatchFormFieldErrors>({})

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: CreateMatchFormFieldErrors = {}
    const normalizedDateTime = dataHoraJogo.trim()
    const normalizedObservation = observacao.trim()
    const parsedLimit = Number.parseInt(limiteVagas, 10)

    if (normalizedDateTime.length === 0) {
      nextErrors.dataHoraJogo = 'Informe a data e hora da partida.'
    }

    if (Number.isNaN(parsedLimit) || parsedLimit < 2 || parsedLimit > 100) {
      nextErrors.limiteVagas = 'O limite de vagas deve ser entre 2 e 100.'
    }

    if (normalizedObservation.length > 255) {
      nextErrors.observacao =
        'A observacao deve ter no maximo 255 caracteres.'
    }

    setFieldErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    const didCreate = await onSubmit({
      idGrupo: groupId,
      dataHoraJogo: normalizeLocalDateTime(normalizedDateTime),
      limiteVagas: parsedLimit,
      observacao: normalizedObservation || null,
    })

    if (!didCreate) {
      return
    }

    setDataHoraJogo('')
    setLimiteVagas('16')
    setObservacao('')
    setFieldErrors({})
  }

  return (
    <form className="create-match-form" onSubmit={handleSubmit}>
      <Input
        disabled={isSubmitting}
        error={fieldErrors.dataHoraJogo}
        hint="Obrigatorio"
        label="Data e hora"
        onChange={(event) => {
          setDataHoraJogo(event.target.value)
          setFieldErrors((current) => ({
            ...current,
            dataHoraJogo: undefined,
          }))
        }}
        step={60}
        type="datetime-local"
        value={dataHoraJogo}
      />

      <Input
        disabled={isSubmitting}
        error={fieldErrors.limiteVagas}
        hint="2 a 100"
        label="Limite de vagas"
        max={100}
        min={2}
        onChange={(event) => {
          setLimiteVagas(event.target.value)
          setFieldErrors((current) => ({
            ...current,
            limiteVagas: undefined,
          }))
        }}
        type="number"
        value={limiteVagas}
      />

      <div className="create-match-form__field">
        <div className="create-match-form__field-header">
          <label className="ui-input-label" htmlFor="create-match-observation">
            Observacao
          </label>
          <span className="ui-input-hint">Opcional</span>
        </div>

        <textarea
          className={[
            'ui-input',
            'create-match-form__textarea',
            fieldErrors.observacao ? 'ui-input--invalid' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          disabled={isSubmitting}
          id="create-match-observation"
          maxLength={255}
          onChange={(event) => {
            setObservacao(event.target.value)
            setFieldErrors((current) => ({
              ...current,
              observacao: undefined,
            }))
          }}
          placeholder="Ex: Levar coletes, confirmar horario com o campo."
          rows={4}
          value={observacao}
        />

        {fieldErrors.observacao ? (
          <span className="ui-input-feedback ui-input-feedback--error">
            {fieldErrors.observacao}
          </span>
        ) : (
          <span className="ui-input-feedback">
            O backend valida permissoes e restricoes do grupo ao criar.
          </span>
        )}
      </div>

      <div className="create-match-form__actions">
        <Button fullWidth loading={isSubmitting} type="submit">
          Criar partida
        </Button>
      </div>
    </form>
  )
}
