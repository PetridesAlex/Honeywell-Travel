/**
 * Sport-specific visual art + lucide icon mapping for Sports & Events UI.
 * Drop real photos into SPORT_PHOTOS later (e.g. soccer: '/images/sports/soccer.webp').
 */
import {
  Bike,
  CircleDot,
  Flag,
  Flame,
  Footprints,
  Gauge,
  Goal,
  Sailboat,
  Shield,
  Swords,
  Target,
  Trophy,
} from 'lucide-react'

/** Optional real image paths keyed by sport_type — leave empty until assets exist. */
export const SPORT_PHOTOS = {
  // soccer: '/images/sports/soccer.webp',
}

const ICON_MAP = {
  soccer: Goal,
  football: Goal,
  formula1: Gauge,
  motorsport: Gauge,
  motogp: Bike,
  dtm: Gauge,
  superbike: Bike,
  tennis: CircleDot,
  padel: CircleDot,
  rugby: Shield,
  boxing: Swords,
  combatsport: Swords,
  basketball: CircleDot,
  nba: CircleDot,
  cricket: Target,
  golf: Flag,
  horseracing: Footprints,
  darts: Target,
  icehockey: Flame,
  nfl: Shield,
  mlb: CircleDot,
  handball: CircleDot,
  cycling: Bike,
  rowing: Sailboat,
  default: Trophy,
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
    'icehockey',
    'nfl',
    'mlb',
    'padel',
    'handball',
    'cycling',
    'rowing',
    'dtm',
    'superbike',
    'motorsport',
  ])
  return known.has(mapped) ? mapped : 'default'
}

export function getSportPhoto(sportType) {
  const key = normalizeSportKey(sportType)
  return SPORT_PHOTOS[key] || SPORT_PHOTOS[ART_CLASS_ALIASES[key]] || null
}
