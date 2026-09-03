import { createElement } from 'react'
import { Link } from 'react-router-dom'
import { getSportIcon } from '../../utils/sportsArt'
import { formatSportLabel } from '../../utils/xs2eventUi'

function SportSelector({ sports = [], activeSport = '', basePath = '/sports-tickets' }) {
  if (!sports.length) return null

  return (
    <nav className="st-sport-rail" aria-label="Sports categories">
      <Link to={basePath} className={`st-sport-pill${!activeSport ? ' is-active' : ''}`}>
        All
      </Link>
      {sports.map((sport) => {
        const id = sport.sport_id || sport.id
        if (!id) return null
        const active = String(activeSport).toLowerCase() === String(id).toLowerCase()
        return (
          <Link
            key={id}
            to={`${basePath}/${encodeURIComponent(id)}`}
            className={`st-sport-pill${active ? ' is-active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <span className="st-sport-pill__icon">
              {createElement(getSportIcon(id), { size: 16, strokeWidth: 2.1, 'aria-hidden': true })}
            </span>
            {formatSportLabel(id)}
          </Link>
        )
      })}
    </nav>
  )
}

export default SportSelector
