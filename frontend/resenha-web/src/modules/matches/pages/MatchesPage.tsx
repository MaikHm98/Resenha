import { Link } from 'react-router-dom'
import { ROUTE_PATHS } from '../../../app/router/paths'
import './MatchesPage.css'

export function MatchesPage() {
  return (
    <section className="matches-page" aria-labelledby="matches-page-title">
      <header className="matches-page__hero">
        <div className="matches-page__eyebrow">Modulo de partidas</div>

        <div className="matches-page__hero-content">
          <div>
            <p className="matches-page__route">Rota base: {ROUTE_PATHS.MATCHES}</p>
            <h1 className="app-title" id="matches-page-title">
              Partidas e operacao basica
            </h1>
            <p className="app-subtitle">
              A entrada do modulo agora e real, mas o fluxo operacional continua
              ancorado por grupo. As proximas etapas vao plugar listagem,
              criacao, presenca e detalhe sem inventar uma visao global que o
              backend nao expoe.
            </p>
          </div>

          <div className="matches-page__hero-actions">
            <Link className="matches-page__link matches-page__link--primary" to={ROUTE_PATHS.GROUPS}>
              Ir para grupos
            </Link>
            <Link className="matches-page__link" to={ROUTE_PATHS.HOME}>
              Voltar para Home
            </Link>
          </div>
        </div>
      </header>

      <div className="matches-page__content">
        <section className="matches-page__panel" aria-labelledby="matches-entry-title">
          <header className="matches-page__panel-header">
            <div>
              <h2 id="matches-entry-title">Como entrar no fluxo</h2>
              <p>
                O backend lista partidas por grupo. Por isso, a navegacao
                principal do modulo segue pelo detalhe do grupo e pela rota
                ` /groups/:groupId/matches `.
              </p>
            </div>
            <span className="matches-page__badge">Entrada segura</span>
          </header>

          <div className="matches-page__steps">
            <article className="matches-page__step">
              <strong>1. Escolha um grupo</strong>
              <p>
                Entre em <code>/groups</code> e abra um grupo para acessar o
                contexto certo da operacao.
              </p>
            </article>

            <article className="matches-page__step">
              <strong>2. Abra as partidas do grupo</strong>
              <p>
                A rota por grupo ja esta preparada para receber listagem e
                criacao no proximo commit.
              </p>
            </article>

            <article className="matches-page__step">
              <strong>3. Entre no detalhe da partida</strong>
              <p>
                O detalhe do modulo tambem ja existe como shell de navegacao
                para os proximos fluxos operacionais.
              </p>
            </article>
          </div>
        </section>

        <section className="matches-page__panel" aria-labelledby="matches-scope-title">
          <header className="matches-page__panel-header">
            <div>
              <h2 id="matches-scope-title">Escopo preparado</h2>
              <p>
                As paginas base do modulo ja apontam o caminho para listagem,
                criacao, presenca, ausencia, convidado e exclusao.
              </p>
            </div>
            <span className="matches-page__badge matches-page__badge--outline">
              Scaffold
            </span>
          </header>

          <ul className="matches-page__scope-list">
            <li>Criacao de partida por grupo</li>
            <li>Listagem operacional do grupo</li>
            <li>Detalhe de partida</li>
            <li>Confirmacao, cancelamento e ausencia</li>
            <li>Convidado e exclusao quando permitido</li>
          </ul>
        </section>
      </div>
    </section>
  )
}
