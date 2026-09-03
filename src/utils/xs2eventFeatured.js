/**
 * Featured browse tiles aligned with XS2Event portal categories.
 * Tournament filters use names (resolved against live TEST/prod inventory).
 * Champions League is included even when TEST inventory has none — UI explains the gap.
 */

export const FEATURED_BROWSE = [
  {
    slug: 'formula1',
    label: 'Formula 1',
    kind: 'sport',
    sport_type: 'formula1',
    blurb: 'Grand Prix weekends',
  },
  {
    slug: 'champions-league',
    label: 'Champions League',
    kind: 'tournament',
    sport_type: 'soccer',
    tournament_names: ['Champions League', 'UEFA Champions League', 'UEFA Champions League Final', 'UCL'],
    blurb: 'UEFA club competition',
  },
  {
    slug: 'premier-league',
    label: 'Premier League',
    kind: 'tournament',
    sport_type: 'soccer',
    tournament_names: ['Premier League', 'premier league'],
    blurb: 'English top flight',
  },
  {
    slug: 'la-liga',
    label: 'La Liga',
    kind: 'tournament',
    sport_type: 'soccer',
    tournament_names: ['La Liga'],
    blurb: 'Spanish top flight',
  },
  {
    slug: 'bundesliga',
    label: 'Bundesliga',
    kind: 'tournament',
    sport_type: 'soccer',
    tournament_names: ['Bundesliga', 'Bundesliga AT'],
    blurb: 'German & Austrian leagues',
  },
  {
    slug: 'serie-a',
    label: 'Serie A',
    kind: 'tournament',
    sport_type: 'soccer',
    tournament_names: ['Serie A'],
    blurb: 'Italian top flight',
  },
  {
    slug: 'motogp',
    label: 'MotoGP',
    kind: 'tournament',
    sport_type: 'motogp',
    tournament_names: ['MotoGP'],
    blurb: 'Motorcycle Grand Prix',
  },
  {
    slug: 'tennis',
    label: 'Tennis',
    kind: 'sport',
    sport_type: 'tennis',
    blurb: 'ATP / WTA / majors',
  },
  {
    slug: 'ligue-1',
    label: 'Ligue 1',
    kind: 'tournament',
    sport_type: 'soccer',
    tournament_names: ['Ligue 1'],
    blurb: 'French top flight',
  },
  {
    slug: 'eredivisie',
    label: 'Eredivisie',
    kind: 'tournament',
    sport_type: 'soccer',
    tournament_names: ['Eredivisie'],
    blurb: 'Dutch top flight',
  },
]

export function getFeaturedBySlug(slug) {
  const key = String(slug || '').trim().toLowerCase()
  return FEATURED_BROWSE.find((item) => item.slug === key) || null
}

export function eventMatchesTournamentNames(event, tournamentNames = []) {
  const name = String(event?.tournament_name || '').trim().toLowerCase()
  if (!name) return false
  return tournamentNames.some((candidate) => {
    const c = String(candidate || '').trim().toLowerCase()
    return c && (name === c || name.includes(c) || c.includes(name))
  })
}
