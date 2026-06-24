export const PARIS_LAST_MINUTE_OFFER = {
  destination: 'Paris',
  destinationFull: 'Paris, France',
  route: 'Larnaca (LCA) → Paris (CDG)',
  airline: 'Cyprus Airways',
  price: 460,
  currency: 'EUR',
  priceLabel: '€460',
  priceNote: 'per person',
  year: 2026,
  departures: [
    { id: '04-07', label: '04 Jul', shortLabel: '04/07', month: 'July' },
    { id: '16-07', label: '16 Jul', shortLabel: '16/07', month: 'July' },
    { id: '23-07', label: '23 Jul', shortLabel: '23/07', month: 'July' },
    { id: '25-07', label: '25 Jul', shortLabel: '25/07', month: 'July' },
    { id: '30-07', label: '30 Jul', shortLabel: '30/07', month: 'July' },
    { id: '01-08', label: '01 Aug', shortLabel: '01/08', month: 'August' },
    { id: '06-08', label: '06 Aug', shortLabel: '06/08', month: 'August' },
    { id: '27-08', label: '27 Aug', shortLabel: '27/08', month: 'August' },
    { id: '29-08', label: '29 Aug', shortLabel: '29/08', month: 'August' },
  ],
  inclusions: [
  {
    id: 'airline',
    title: 'Flight airline',
    detail: 'Cyprus Airways',
    icon: '✈',
  },
  {
    id: 'checked',
    title: '1 checked baggage',
    detail: 'Up to 23 kg',
    icon: '🧳',
  },
  {
    id: 'cabin',
    title: '1 cabin baggage',
    detail: 'Up to 10 kg',
    icon: '👜',
  },
  ],
  highlights: [
    'Limited seats on selected summer departures',
    'Direct access to the City of Light',
    'Ideal for a romantic getaway or city break',
    'Book now — availability is subject to change',
  ],
  images: {
    hero: '/images/last-minute/low-angle-shot-eiffel-tower-paris-france.jpg',
    gallery: [
      {
        src: '/images/last-minute/low-angle-shot-eiffel-tower-paris-france.jpg',
        alt: 'Eiffel Tower at golden hour, Paris',
        layout: 'feature',
      },
      {
        src: '/images/last-minute/close-up-glass-window.jpg',
        alt: 'Sacré-Cœur view from a Paris balcony',
        layout: 'tall',
      },
      {
        src: '/images/last-minute/paris-rooftop-view-skyline-eiffel-tower-france.jpg',
        alt: 'Paris rooftop skyline with the Eiffel Tower',
        layout: 'wide',
      },
      {
        src: '/images/last-minute/high-angle-shot-docked-yacht-river-with-eiffel-tower.jpg',
        alt: 'Seine river boats with the Eiffel Tower in the distance',
        layout: 'standard',
      },
      {
        src: '/images/last-minute/panoramic-view-arc-de-triomphe-paris-france.jpg',
        alt: 'Panoramic view of the Arc de Triomphe, Paris',
        layout: 'standard',
      },
      {
        src: '/images/last-minute/full-shot-smiley-woman-taking-selfie.jpg',
        alt: 'Parisian café terrace in the heart of the city',
        layout: 'standard',
      },
      {
        src: '/images/last-minute/young-tanned-woman-beautiful-swimsuit-with-straw-hat-stands-rests-tropical-beach-with-sand-looks-sunset-sea-selective-focus-vacation-concept-by-sea.jpg',
        alt: 'Sunset by the sea — your perfect getaway awaits',
        layout: 'standard',
      },
    ],
  },
}

export const PARIS_LAST_MINUTE_PATH = '/last-minute-flights/paris'

/** Nearest upcoming departure (end of that day) for limited-offer countdown. */
export function getParisOfferCountdownTarget(offer, now = new Date()) {
  const upcoming = offer.departures
    .map((departure) => {
      const [day, month] = departure.shortLabel.split('/').map(Number)
      return new Date(offer.year, month - 1, day, 23, 59, 59)
    })
    .filter((date) => date > now)
    .sort((a, b) => a - b)

  return upcoming[0] ?? null
}

export function getParisOfferCountdownRemaining(targetDate, now = new Date()) {
  if (!targetDate) return null

  const diffMs = targetDate.getTime() - now.getTime()
  if (diffMs <= 0) return null

  const totalSeconds = Math.floor(diffMs / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}
