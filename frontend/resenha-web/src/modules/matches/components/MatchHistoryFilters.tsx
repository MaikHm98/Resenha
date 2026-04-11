import type { ChangeEvent } from 'react'
import { Button, Input } from '../../../shared/components'
import {
  MATCH_STATUS_VALUES,
  type MatchStatus,
} from '../types/matchesContracts'
import type { MatchHistoryStatusFilter } from '../hooks/useGroupMatchHistoryData'

type MatchHistoryFiltersProps = {
  filteredCount: number
  totalCount: number
  hasActiveFilters: boolean
  searchTerm: string
  statusFilter: MatchHistoryStatusFilter
  onSearchTermChange: (value: string) => void
  onStatusFilterChange: (value: MatchHistoryStatusFilter) => void
  onClearFilters: () => void
}

const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  ABERTA: 'ABERTA',
  EM_ANDAMENTO: 'EM ANDAMENTO',
  FINALIZADA: 'FINALIZADA',
  CANCELADA: 'CANCELADA',
}

export function MatchHistoryFilters({
  filteredCount,
  totalCount,
  hasActiveFilters,
  searchTerm,
  statusFilter,
  onSearchTermChange,
  onStatusFilterChange,
  onClearFilters,
}: MatchHistoryFiltersProps) {
  const handleStatusFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onStatusFilterChange(event.target.value as MatchHistoryStatusFilter)
  }

  return (
    <section
      className="match-history-filters"
      aria-labelledby="match-history-filters-title"
    >
      <header className="match-history-filters__header">
        <div>
          <h3 id="match-history-filters-title">Filtros locais</h3>
          <p>
            Busca e status filtram apenas a lista ja carregada nesta tela, sem
            nova chamada para a API.
          </p>
        </div>
        <span className="match-history-filters__summary">
          Exibindo {filteredCount} de {totalCount}
        </span>
      </header>

      <div className="match-history-filters__controls">
        <Input
          hint="Busca textual simples sobre os dados ja carregados."
          label="Busca"
          onChange={(event) => onSearchTermChange(event.target.value)}
          placeholder="Partida, capitao, vencedor ou texto do resumo"
          value={searchTerm}
        />

        <div className="ui-input-field">
          <div className="ui-input-field__header">
            <label
              className="ui-input-label"
              htmlFor="match-history-status-filter"
            >
              Status
            </label>
            <span className="ui-input-hint">Filtro local por status</span>
          </div>

          <select
            className="ui-input match-history-filters__select"
            id="match-history-status-filter"
            onChange={handleStatusFilterChange}
            value={statusFilter}
          >
            <option value="TODOS">Todos os status</option>
            {MATCH_STATUS_VALUES.map((status) => (
              <option key={status} value={status}>
                {MATCH_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="match-history-filters__actions">
          <Button
            disabled={!hasActiveFilters}
            onClick={onClearFilters}
            type="button"
            variant="secondary"
          >
            Limpar filtros
          </Button>
        </div>
      </div>
    </section>
  )
}
