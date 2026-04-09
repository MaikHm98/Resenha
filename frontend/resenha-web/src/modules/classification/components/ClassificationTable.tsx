import type { ClassificationEntry } from '../types/classificationContracts'

type ClassificationTableProps = {
  entries: ClassificationEntry[]
}

export function ClassificationTable({ entries }: ClassificationTableProps) {
  if (entries.length === 0) {
    return (
      <div className="classification-table__empty">
        <h3>Temporada sem classificados</h3>
        <p>
          O backend nao devolveu jogadores classificados para esta temporada
          no momento.
        </p>
      </div>
    )
  }

  return (
    <div className="classification-table">
      <div className="classification-table__wrapper">
        <table className="classification-table__table">
          <thead>
            <tr>
              <th>Posicao</th>
              <th>Jogador</th>
              <th>Pontos</th>
              <th>Vitorias</th>
              <th>Derrotas</th>
              <th>Presencas</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.idUsuario}>
                <td>{entry.posicao}</td>
                <td>
                  <div className="classification-table__identity">
                    <strong>{entry.nome}</strong>
                    {entry.timeCoracaoNome ? (
                      <span>{entry.timeCoracaoNome}</span>
                    ) : null}
                  </div>
                </td>
                <td>{entry.pontos}</td>
                <td>{entry.vitorias}</td>
                <td>{entry.derrotas}</td>
                <td>{entry.presencas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="classification-table__footnote">
        A ordem e a posicao abaixo sao exibidas exatamente como vieram do
        backend.
      </p>
    </div>
  )
}
