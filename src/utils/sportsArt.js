/**
 * Sport-specific visual art + icon mapping for Sports & Events UI.
 */
import SportIcon, {
  SportIconAll,
  SportIconBasketball,
  SportIconBoxing,
  SportIconCricket,
  SportIconCycling,
  SportIconDarts,
  SportIconDefault,
  SportIconFormula1,
  SportIconGolf,
  SportIconHorseracing,
  SportIconMotogp,
  SportIconNfl,
  SportIconRugby,
  SportIconSoccer,
  SportIconTennis,
} from '../components/sports/SportIcon'

export { SportIcon, SportIconAll }

/** Optional real image paths keyed by sport_type — leave empty until assets exist. */
export const SPORT_PHOTOS = {
  // soccer: '/images/sports/soccer.webp',
}

const ICON_MAP = {
  soccer: SportIconSoccer,
  football: SportIconSoccer,
  formula1: SportIconFormula1,
  motorsport: SportIconFormula1,
  motogp: SportIconMotogp,
  dtm: SportIconFormula1,
  superbike: SportIconMotogp,
  tennis: SportIconTennis,
  padel: SportIconTennis,
  rugby: SportIconRugby,
  boxing: SportIconBoxing,
  combatsport: SportIconBoxing,
  basketball: SportIconBasketball,
  nba: SportIconBasketball,
  cricket: SportIconCricket,
  golf: SportIconGolf,
  horseracing: SportIconHorseracing,
  darts: SportIconDarts,
  nfl: SportIconNfl,
  mlb: SportIconNfl,
  cycling: SportIconCycling,
  default: SportIconDefault,
}

const ART_CLASS_ALIASES = {
  football: 'soccer',
  nba: 'basketball',
  combatsport: 'boxing',
  motorsport: 'formula1',
  dtm: 'formula1',
  superbike: 'motogp',
}

export function normalizeSportKey(sportType) {
  return String(sportType || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
}

export function getSportIcon(sportType) {
  const key = normalizeSportKey(sportType)
  return ICON_MAP[key] || ICON_MAP.default
}

export function getSportArtClass(sportType) {
  const key = normalizeSportKey(sportType)
  const mapped = ART_CLASS_ALIASES[key] || key
  const known = new Set([
    'soccer',
    'formula1',
    'tennis',
    'motogp',
    'rugby',
    'boxing',
    'combatsport',
    'basketball',
    'nba',
    'golf',
    'cricket',
    'darts',
    'horseracing',
    'nfl',
    'cycling',
    'motorsport',
    'dtm',
    'superbike',
  ])
  return known.has(mapped) ? mapped : 'default'
}

export function getSportPhoto(sportType) {
  const key = normalizeSportKey(sportType)
  return SPORT_PHOTOS[key] || SPORT_PHOTOS[ART_CLASS_ALIASES[key]] || null
}
