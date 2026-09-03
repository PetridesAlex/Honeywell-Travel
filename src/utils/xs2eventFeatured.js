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

/** Prefer server-side tournament_name filter when a single primary name is enough. */
export function featuredEventsQuery(featured) {
  if (!featured) return null
  if (featured.kind === 'sport') {
    return { sport_type: featured.sport_type, tickets_available: 'gt:0' }
  }
  const primary = featured.tournament_names?.[0]
  if (primary) {
    return {
      sport_type: featured.sport_type,
      tournament_name: primary,
      tickets_available: 'gt:0',
    }
  }
  return { sport_type: featured.sport_type, tickets_available: 'gt:0' }
}

/** Category options for the sports search dropdown (featured + live sports). */
export function buildSportsSearchCategories(sportsList = [], countsMap = {}) {
  const featured = FEATURED_BROWSE.map((item) => ({
    id: `featured-${item.slug}`,
    label: item.label,
    href: `/sports-tickets/featured/${encodeURIComponent(item.slug)}`,
    group: 'Popular competitions',
    blurb: item.blurb,
    sportType: item.sport_type,
  }))

  const sports = sportsList
    .map((sport) => {
      const id = sport.sport_id || sport.id
      if (!id) return null
      const total = countsMap[id]
      return {
        id: `sport-${id}`,
        label: String(id)
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        href: `/sports-tickets/${encodeURIComponent(id)}`,
        group: 'All sports',
        sportType: id,
        meta: typeof total === 'number' && total > 0 ? `${total} events` : undefined,
      }
    })
    .filter(Boolean)

  return [...featured, ...sports]
}
