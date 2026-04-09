import { Button, EmptyState } from '../../../shared/components'

type CaptainCycleEmptyStateProps = {
  isAdmin: boolean
  isSubmitting: boolean
  onOpenCycle: () => Promise<boolean>
}

export function CaptainCycleEmptyState({
  isAdmin,
  isSubmitting,
  onOpenCycle,
}: CaptainCycleEmptyStateProps) {
  return (
    <div className="captain-empty-state">
      <EmptyState
        title="Nenhum ciclo ativo"
        description="O backend informou que este grupo ainda nao possui capitao ativo neste momento."
        action={
          isAdmin ? (
            <Button
              loading={isSubmitting}
              onClick={() => void onOpenCycle()}
              type="button"
            >
              Iniciar ciclo de capitao
            </Button>
          ) : null
        }
      />

      <p className="captain-empty-state__hint">
        {isAdmin
          ? 'Ao iniciar, o backend valida a permissao e define o admin atual como capitao do novo ciclo.'
          : 'Apenas administradores podem iniciar um novo ciclo de capitao.'}
      </p>
    </div>
  )
}
