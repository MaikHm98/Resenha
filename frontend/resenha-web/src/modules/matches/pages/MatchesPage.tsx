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
              O modulo de partidas ja possui fluxo web funcional, mas a entrada
              continua ancorada por grupo para respeitar a estrutura real do
              backend e evitar uma visao global que a API nao expoe.
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
                contexto certo da operacao, da governanca e do historico das
                partidas.
              </p>
            </article>

            <article className="matches-page__step">
              <strong>2. Abra as partidas do grupo</strong>
              <p>
                A rota <code>/groups/:groupId/matches</code> concentra listagem
                operacional, criacao de partida e navegacao para o detalhe.
              </p>
            </article>

            <article className="matches-page__step">
              <strong>3. Siga para o fluxo certo da partida</strong>
              <p>
                A partir da partida, o web ja cobre detalhe operacional,
                desafio, votacao e historico conforme o estado e a necessidade
                do usuario.
              </p>
            </article>
          </div>
        </section>

        <section className="matches-page__panel" aria-labelledby="matches-scope-title">
          <header className="matches-page__panel-header">
            <div>
              <h2 id="matches-scope-title">Escopo preparado</h2>
              <p>
                Esta entrada resume os fluxos ativos do modulo e ajuda a
                localizar o ponto certo de operacao sem duplicar regra de
                negocio no frontend.
              </p>
            </div>
            <span className="matches-page__badge matches-page__badge--outline">
              Fluxos ativos
            </span>
          </header>

          <ul className="matches-page__scope-list">
            <li>Criacao e listagem operacional por grupo</li>
            <li>Detalhe da partida com presenca, ausencia, convidado e exclusao</li>
            <li>Fluxo de desafio em andamento</li>
            <li>Fluxo de votacao por partida</li>
            <li>Historico por grupo e detalhe historico da partida</li>
          </ul>
        </section>
      </div>
    </section>
  )
}
