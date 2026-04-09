import { useState, type FormEvent } from 'react'
import { Alert, Button, Input } from '../../../shared/components'
import type {
  GroupWeekday,
  UpdateGroupScheduleInput,
} from '../types/groupsContracts'

type GroupScheduleFormProps = {
  initialDayOfWeek: GroupWeekday | null
  initialFixedTime: string | null
  isSubmitting: boolean
  error: string | null
  notice: string | null
  onSubmit: (payload: UpdateGroupScheduleInput) => Promise<boolean>
  onClearFeedback: () => void
}

const WEEKDAY_OPTIONS: Array<{ value: GroupWeekday; label: string }> = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terca-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sabado' },
]

function isValidFixedTime(value: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value)
}

export function GroupScheduleForm({
  initialDayOfWeek,
  initialFixedTime,
  isSubmitting,
  error,
  notice,
  onSubmit,
  onClearFeedback,
}: GroupScheduleFormProps) {
  const [dayOfWeek, setDayOfWeek] = useState(
    initialDayOfWeek === null ? '' : String(initialDayOfWeek),
  )
  const [fixedTime, setFixedTime] = useState(initialFixedTime ?? '')
  const [fieldError, setFieldError] = useState<string | null>(null)

  const normalizedFixedTime = fixedTime.trim()
  const normalizedDayOfWeek = dayOfWeek === '' ? null : (Number(dayOfWeek) as GroupWeekday)
  const hasChanges =
    normalizedDayOfWeek !== initialDayOfWeek ||
    (normalizedFixedTime || null) !== initialFixedTime

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (
      normalizedFixedTime.length > 0 &&
      !isValidFixedTime(normalizedFixedTime)
    ) {
      setFieldError('Use o formato HH:mm para o horario fixo.')
      return
    }

    setFieldError(null)

    const didUpdate = await onSubmit({
      diaSemana: normalizedDayOfWeek,
      horarioFixo: normalizedFixedTime || null,
    })

    if (!didUpdate) {
      return
    }
  }

  return (
    <div className="group-schedule-form__stack">
      {notice ? (
        <Alert title="Agenda atualizada" variant="success">
          {notice}
        </Alert>
      ) : null}

      {error ? (
        <Alert title="Nao foi possivel atualizar a agenda" variant="warning">
          {error}
        </Alert>
      ) : null}

      <form className="group-schedule-form" onSubmit={handleSubmit}>
        <div className="group-schedule-form__row">
          <div className="group-schedule-form__field">
            <div className="group-schedule-form__field-header">
              <label className="ui-input-label" htmlFor="group-schedule-weekday">
                Dia da semana
              </label>
              <span className="ui-input-hint">Opcional</span>
            </div>

            <select
              className="group-schedule-form__select"
              disabled={isSubmitting}
              id="group-schedule-weekday"
              onChange={(event) => {
                setDayOfWeek(event.target.value)
                onClearFeedback()
              }}
              value={dayOfWeek}
            >
              <option value="">Nao definido</option>
              {WEEKDAY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            disabled={isSubmitting}
            error={fieldError ?? undefined}
            hint="Opcional"
            label="Horario fixo"
            onChange={(event) => {
              setFixedTime(event.target.value)
              setFieldError(null)
              onClearFeedback()
            }}
            type="time"
            value={fixedTime}
          />
        </div>

        <div className="group-schedule-form__actions">
          <Button
            disabled={!hasChanges}
            loading={isSubmitting}
            type="submit"
            variant="secondary"
          >
            Salvar agenda
          </Button>
        </div>
      </form>
    </div>
  )
}
