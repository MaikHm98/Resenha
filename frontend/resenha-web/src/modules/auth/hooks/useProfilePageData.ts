import { useEffect, useState } from 'react'
import { normalizeApiError } from '../../../shared/lib/api'
import type { AuthSession } from '../types/AuthSession'
import { useAuth } from './useAuth'

type ProfileField = {
  label: string
  value: string
  hint?: string
}

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

type ProfileSummary = {
  initials: string
  name: string
  emailLabel: string
  primaryRoleLabel: string
  clubLabel: string
  sessionStatusLabel: string
  sessionStatusDescription: string
}

const POSITION_LABELS: Record<string, string> = {
  GOLEIRO: 'Goleiro',
  ZAGUEIRO: 'Zagueiro',
  LATERAL: 'Lateral',
  VOLANTE: 'Volante',
  MEIA: 'Meia',
  PONTA: 'Ponta',
  ATACANTE: 'Atacante',
}

const POSITION_OPTIONS: ProfileSelectOption[] = [
  { value: '', label: 'Nao informar' },
  { value: 'GOLEIRO', label: 'Goleiro' },
  { value: 'ZAGUEIRO', label: 'Zagueiro' },
  { value: 'LATERAL', label: 'Lateral' },
  { value: 'VOLANTE', label: 'Volante' },
  { value: 'MEIA', label: 'Meia' },
  { value: 'PONTA', label: 'Ponta' },
  { value: 'ATACANTE', label: 'Atacante' },
]

const DOMINANT_FOOT_OPTIONS: ProfileSelectOption[] = [
  { value: '', label: 'Nao informar' },
  { value: 'DIREITO', label: 'Direito' },
  { value: 'ESQUERDO', label: 'Esquerdo' },
  { value: 'AMBIDESTRO', label: 'Ambidestro' },
]

function formatNullableText(
  value: string | null,
  fallback = 'Nao informado nesta sessao',
): string {
  if (!value) {
    return fallback
  }

  const trimmedValue = value.trim()
  return trimmedValue.length > 0 ? trimmedValue : fallback
}

function formatPosition(value: string | null): string {
  if (!value) {
    return 'Nao informado nesta sessao'
  }

  return POSITION_LABELS[value] ?? value
}

function buildInitials(value: string): string {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)

  if (parts.length === 0) {
    return 'RS'
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('')
}

function buildFormValuesFromSession(
  session: AuthSession | null,
): ProfileFormValues {
  return {
    nome: session?.userName ?? '',
    goleiro: session?.goleiro ?? false,
    timeCoracaoCodigo: session?.timeCoracaoCodigo ?? '',
    posicaoPrincipal: session?.posicaoPrincipal ?? '',
    peDominante: session?.peDominante ?? '',
  }
}

function normalizeFormValues(values: ProfileFormValues): ProfileFormValues {
  return {
    nome: values.nome.trim(),
    goleiro: values.goleiro,
    timeCoracaoCodigo: values.timeCoracaoCodigo.trim(),
    posicaoPrincipal: values.posicaoPrincipal.trim(),
    peDominante: values.peDominante.trim(),
  }
}

function areFormValuesEqual(
  current: ProfileFormValues,
  next: ProfileFormValues,
): boolean {
  const currentValues = normalizeFormValues(current)
  const nextValues = normalizeFormValues(next)

  return (
    currentValues.nome === nextValues.nome &&
    currentValues.goleiro === nextValues.goleiro &&
    currentValues.timeCoracaoCodigo === nextValues.timeCoracaoCodigo &&
    currentValues.posicaoPrincipal === nextValues.posicaoPrincipal &&
    currentValues.peDominante === nextValues.peDominante
  )
}

function buildClubLabel(name: string | null, code: string | null): string {
  if (name && code) {
    return `${name} (${code})`
  }

  if (name) {
    return name
  }

  return formatNullableText(code)
}

export function useProfilePageData() {
  const { session, getClubOptions, updateProfile } = useAuth()
  const [formValues, setFormValues] = useState<ProfileFormValues>(() =>
    buildFormValuesFromSession(session),
  )
  const [clubOptions, setClubOptions] = useState<ProfileSelectOption[]>([])
  const [isClubOptionsLoading, setIsClubOptionsLoading] = useState(false)
  const [clubOptionsError, setClubOptionsError] = useState<string | null>(null)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  useEffect(() => {
    setFormValues(buildFormValuesFromSession(session))
  }, [session])

  useEffect(() => {
    let isCancelled = false

    async function loadClubOptions() {
      setIsClubOptionsLoading(true)
      setClubOptionsError(null)

      try {
        const response = await getClubOptions()
        if (isCancelled) {
          return
        }

        setClubOptions(
          response.map((club) => ({
            value: club.codigo,
            label: `${club.nome} (${club.codigo})`,
          })),
        )
      } catch (error: unknown) {
        if (isCancelled) {
          return
        }

        const normalizedError = normalizeApiError(error)
        setClubOptionsError(
          normalizedError.message ||
            'Nao foi possivel carregar as opcoes de clube agora.',
        )
      } finally {
        if (!isCancelled) {
          setIsClubOptionsLoading(false)
        }
      }
    }

    void loadClubOptions()

    return () => {
      isCancelled = true
    }
  }, [getClubOptions])

  const hasPartialSnapshot =
    session?.userEmail === null || session?.goleiro === null

  const userName = formatNullableText(session?.userName ?? null, 'Usuario Resenha')
  const emailLabel = formatNullableText(
    session?.userEmail ?? null,
    'Nao disponivel nesta sessao',
  )
  const primaryRoleLabel = formatPosition(session?.posicaoPrincipal ?? null)
  const clubLabel = buildClubLabel(
    session?.timeCoracaoNome ?? null,
    session?.timeCoracaoCodigo ?? null,
  )

  const summary: ProfileSummary = {
    initials: buildInitials(userName),
    name: userName,
    emailLabel,
    primaryRoleLabel,
    clubLabel,
    sessionStatusLabel: hasPartialSnapshot ? 'Snapshot parcial' : 'Snapshot pronto',
    sessionStatusDescription: hasPartialSnapshot
      ? 'Alguns metadados ainda nao estao persistidos nesta sessao da web.'
      : 'A sessao atual ja traz os dados necessarios para os proximos fluxos de perfil e conta.',
  }

  const accountFields: ProfileField[] = [
    {
      label: 'Nome',
      value: userName,
      hint: 'Nome visivel no snapshot autenticado atual.',
    },
    {
      label: 'Email',
      value: emailLabel,
      hint: 'Mantido em leitura nesta fase.',
    },
    {
      label: 'Id do usuario',
      value: session?.userId ?? 'Nao disponivel nesta sessao',
      hint: 'Identificador autenticado da sessao atual.',
    },
    {
      label: 'Estado do snapshot',
      value: summary.sessionStatusLabel,
      hint: summary.sessionStatusDescription,
    },
  ]

  const mergedClubOptions = [...clubOptions]

  if (
    session?.timeCoracaoCodigo &&
    !mergedClubOptions.some((option) => option.value === session.timeCoracaoCodigo)
  ) {
    mergedClubOptions.unshift({
      value: session.timeCoracaoCodigo,
      label: buildClubLabel(
        session.timeCoracaoNome,
        session.timeCoracaoCodigo,
      ),
    })
  }

  const hasPendingChanges = !areFormValuesEqual(
    formValues,
    buildFormValuesFromSession(session),
  )

  function clearFeedback() {
    if (saveError !== null) {
      setSaveError(null)
    }

    if (saveSuccess !== null) {
      setSaveSuccess(null)
    }
  }

  function setName(value: string) {
    clearFeedback()
    setFormValues((current) => ({ ...current, nome: value }))
  }

  function setGoleiro(value: boolean) {
    clearFeedback()
    setFormValues((current) => ({ ...current, goleiro: value }))
  }

  function setTimeCoracaoCodigo(value: string) {
    clearFeedback()
    setFormValues((current) => ({ ...current, timeCoracaoCodigo: value }))
  }

  function setPosicaoPrincipal(value: string) {
    clearFeedback()
    setFormValues((current) => ({ ...current, posicaoPrincipal: value }))
  }

  function setPeDominante(value: string) {
    clearFeedback()
    setFormValues((current) => ({ ...current, peDominante: value }))
  }

  async function submitProfile() {
    if (!session) {
      setSaveSuccess(null)
      setSaveError('Snapshot do perfil indisponivel para salvar agora.')
      return
    }

    if (!hasPendingChanges) {
      setSaveError(null)
      setSaveSuccess('Nenhuma alteracao pendente no perfil.')
      return
    }

    const normalizedName = formValues.nome.trim()
    if (!normalizedName) {
      setSaveSuccess(null)
      setSaveError('Informe seu nome para atualizar o perfil.')
      return
    }

    setIsSavingProfile(true)
    setSaveError(null)
    setSaveSuccess(null)

    try {
      const nextSession = await updateProfile({
        nome: normalizedName,
        goleiro: formValues.goleiro,
        timeCoracaoCodigo:
          formValues.timeCoracaoCodigo.trim().length > 0
            ? formValues.timeCoracaoCodigo
            : null,
        posicaoPrincipal:
          formValues.posicaoPrincipal.trim().length > 0
            ? formValues.posicaoPrincipal
            : null,
        peDominante:
          formValues.peDominante.trim().length > 0
            ? formValues.peDominante
            : null,
      })

      setFormValues(buildFormValuesFromSession(nextSession))
      setSaveSuccess('Perfil atualizado com sucesso.')
    } catch (error: unknown) {
      const normalizedError = normalizeApiError(error)
      setSaveError(
        normalizedError.message ||
          'Nao foi possivel atualizar o perfil. Tente novamente.',
      )
    } finally {
      setIsSavingProfile(false)
    }
  }

  return {
    session,
    hasPartialSnapshot,
    summary,
    accountFields,
    formValues,
    positionOptions: POSITION_OPTIONS,
    dominantFootOptions: DOMINANT_FOOT_OPTIONS,
    clubOptions: mergedClubOptions,
    isClubOptionsLoading,
    clubOptionsError,
    isSavingProfile,
    saveError,
    saveSuccess,
    hasPendingChanges,
    setName,
    setGoleiro,
    setTimeCoracaoCodigo,
    setPosicaoPrincipal,
    setPeDominante,
    submitProfile,
  }
}
