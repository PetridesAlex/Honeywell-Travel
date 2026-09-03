import { createElement } from 'react'
import { getSportArtClass, getSportIcon, getSportPhoto } from '../../utils/sportsArt'

function SportArt({ sportType, className = '', iconSize = 42 }) {
  const artClass = getSportArtClass(sportType)
  const photo = getSportPhoto(sportType)

  return (
    <div className={`st-sport-art st-sport-art--${artClass} ${className}`.trim()} aria-hidden>
      <div className="st-sport-art__mesh" />
      {photo ? (
        <img className="st-sport-art__photo" src={photo} alt="" loading="lazy" decoding="async" />
      ) : null}
      <span className="st-sport-art__icon">
        {createElement(getSportIcon(sportType), { size: iconSize, strokeWidth: 1.6 })}
      </span>
    </div>
  )
}

export default SportArt
