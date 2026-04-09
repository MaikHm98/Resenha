import { useState, type FormEvent } from 'react'
import { Button, Input } from '../../../shared/components'
import type {
  CreateGroupInput,
  GroupWeekday,
} from '../types/groupsContracts'

type CreateGroupFormProps = {
  isSubmitting: boolean
  onSubmit: (payload: CreateGroupInput) => Promise<boolean>
}

type CreateGroupFormFieldErrors = Partial<
  Record<'nome' | 'limiteJogadores' | 'horarioFixo', string>
>

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

export function CreateGroupForm({
  isSubmitting,
  onSubmit,
}: CreateGroupFormProps) {
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [limiteJogadores, setLimiteJogadores] = useState('24')
  const [diaSemana, setDiaSemana] = useState('')
  const [horarioFixo, setHorarioFixo] = useState('')
  const [fieldErrors, setFieldErrors] = useState<CreateGroupFormFieldErrors>({})

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: CreateGroupFormFieldErrors = {}
    const normalizedName = nome.trim()
    const normalizedDescription = descricao.trim()
    const normalizedFixedTime = horarioFixo.trim()
    const parsedPlayerLimit = Number.parseInt(limiteJogadores, 10)

    if (normalizedName.length === 0) {
      nextErrors.nome = 'Informe o nome do grupo.'
    } else if (normalizedName.length < 2) {
      nextErrors.nome = 'Nome deve ter pelo menos 2 caracteres.'
    }

    if (
      Number.isNaN(parsedPlayerLimit) ||
      parsedPlayerLimit < 2 ||
      parsedPlayerLimit > 100
    ) {
      nextErrors.limiteJogadores =
        'O limite de jogadores deve ser entre 2 e 100.'
    }

    if (
      normalizedFixedTime.length > 0 &&
      !isValidFixedTime(normalizedFixedTime)
    ) {
      nextErrors.horarioFixo = 'Use o formato HH:mm.'
    }

    setFieldErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    const didCreate = await onSubmit({
      nome: normalizedName,
      descricao: normalizedDescription || null,
      limiteJogadores: parsedPlayerLimit,
      diaSemana:
        diaSemana === '' ? null : (Number(diaSemana) as GroupWeekday),
      horarioFixo: normalizedFixedTime || null,
    })

    if (!didCreate) {
      return
    }

    setNome('')
    setDescricao('')
    setLimiteJogadores('24')
    setDiaSemana('')
    setHorarioFixo('')
    setFieldErrors({})
  }

  return (
    <form className="create-group-form" onSubmit={handleSubmit}>
      <Input
        autoComplete="off"
        disabled={isSubmitting}
        error={fieldErrors.nome}
        hint="Obrigatorio"
        label="Nome do grupo"
        maxLength={120}
        onChange={(event) => {
          setNome(event.target.value)
          setFieldErrors((current) => ({ ...current, nome: undefined }))
        }}
        placeholder="Ex: Resenha da Vila"
        value={nome}
      />

      <Input
        autoComplete="off"
        disabled={isSubmitting}
        hint="Opcional"
        label="Descricao"
        maxLength={255}
        onChange={(event) => {
          setDescricao(event.target.value)
        }}
        placeholder="Resumo curto para identificar o grupo"
        value={descricao}
      />

      <div className="create-group-form__row">
        <Input
          disabled={isSubmitting}
          error={fieldErrors.limiteJogadores}
          hint="2 a 100"
          label="Limite de jogadores"
          max={100}
          min={2}
          onChange={(event) => {
            setLimiteJogadores(event.target.value)
            setFieldErrors((current) => ({
              ...current,
              limiteJogadores: undefined,
            }))
          }}
          type="number"
          value={limiteJogadores}
        />

        <div className="create-group-form__field">
          <div className="create-group-form__field-header">
            <label className="ui-input-label" htmlFor="create-group-weekday">
              Dia fixo
            </label>
            <span className="ui-input-hint">Opcional</span>
          </div>

          <select
            className="create-group-form__select"
            disabled={isSubmitting}
            id="create-group-weekday"
            onChange={(event) => {
              setDiaSemana(event.target.value)
            }}
            value={diaSemana}
          >
            <option value="">Nao definido</option>
            {WEEKDAY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Input
        disabled={isSubmitting}
        error={fieldErrors.horarioFixo}
        hint="Opcional"
        label="Horario fixo"
        onChange={(event) => {
          setHorarioFixo(event.target.value)
          setFieldErrors((current) => ({ ...current, horarioFixo: undefined }))
        }}
        type="time"
        value={horarioFixo}
      />

      <div className="create-group-form__actions">
        <Button fullWidth loading={isSubmitting} type="submit">
          Criar grupo
        </Button>
      </div>
    </form>
  )
}
