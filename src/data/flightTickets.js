/** Add days to a DD/MM token (assumes current travel season year). */
function addDaysToDdMm(dateStr, daysToAdd) {
  const match = String(dateStr)
    .trim()
    .match(/^(\d{1,2})\/(\d{1,2})$/)
  if (!match) return dateStr
  const day = Number(match[1])
  const month = Number(match[2])
  const year = new Date().getFullYear()
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + daysToAdd)
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}`
}

/** Expand pricing rows into individual departure rows. nightsAway = return − departure in calendar days. */
function expandDepartures(pricingRows, nightsAway, availability = '') {
  const rows = []
  for (const row of pricingRows) {
    const dates = String(row.dates || '')
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
    for (const departureDate of dates) {
      rows.push({
        departureDate,
        returnDate: addDaysToDdMm(departureDate, nightsAway),
        price: row.price,
        ...(availability ? { availability } : {}),
      })
    }
  }
  return rows
}

export const flightTicketOffers = [
  {
    id: 'paris-5-cy',
    destination: 'Paris',
    destinationSlug: 'paris',
    title: 'ΠΑΡΙΣΙ 5 ημέρες',
    duration: '5 ημέρες',
    airline: 'Cyprus Airways',
    luggage: '1 αποσκευή 23kg και μία χειραποσκευή 10kg',
    departureFlight: { route: 'Λάρνακα - Παρίσι', time: '08:00 - 11:40' },
    returnFlight: { route: 'Παρίσι - Λάρνακα', time: '12:40 - 18:00' },
    pricing: [{ dates: '01/08', price: 460 }],
    departures: expandDepartures([{ dates: '01/08', price: 460 }], 4),
  },
  {
    id: 'paris-6-cy',
    destination: 'Paris',
    destinationSlug: 'paris',
    title: 'ΠΑΡΙΣΙ 6 ημέρες',
    duration: '6 ημέρες',
    airline: 'Cyprus Airways',
    luggage: '1 αποσκευή 23kg και μία χειραποσκευή 10kg',
    departureFlight: { route: 'Λάρνακα - Παρίσι', time: '08:00 - 11:40' },
    returnFlight: { route: 'Παρίσι - Λάρνακα', time: '12:40 - 18:00' },
    pricing: [{ dates: '23/07,30/07,06/08,27/08', price: 460 }],
    departures: expandDepartures([{ dates: '23/07,30/07,06/08,27/08', price: 460 }], 5),
  },
  {
    id: 'naples-10-a3',
    destination: 'Naples',
    destinationSlug: 'naples',
    title: 'ΝΑΠΟΛΗ 10 ημέρες',
    duration: '10 ημέρες',
    airline: 'Aegean',
    luggage: '1 αποσκευή 23kg και μία χειραποσκευή 8kg',
    departureFlight: { route: 'Λάρνακα - Νάπολη', time: '05:00 - 08:50' },
    returnFlight: { route: 'Νάπολη - Λάρνακα', time: '09:40 - 17:25' },
    pricing: [{ dates: '09/08', price: 390 }],
    departures: expandDepartures([{ dates: '09/08', price: 390 }], 9),
  },
  {
    id: 'rhodes-5-cy',
    destination: 'Rhodes',
    destinationSlug: 'rhodes',
    title: 'ΡΟΔΟΣ 5 ημέρες',
    duration: '5 ημέρες',
    airline: 'Cyprus Airways',
    luggage: '1 αποσκευή 23kg και μία χειραποσκευή 10kg',
    departureFlight: { route: 'Λάρνακα - Ρόδος', time: '10:30 - 11:40' },
    returnFlight: { route: 'Ρόδος - Λάρνακα', time: '09:35 - 10:45' },
    pricing: [
      { dates: '27/07', price: 325 },
      { dates: '03/08,24/08', price: 345 },
    ],
    departures: expandDepartures(
      [
        { dates: '27/07', price: 325 },
        { dates: '03/08,24/08', price: 345 },
      ],
      4
    ),
  },
  {
    id: 'rhodes-8-a3',
    destination: 'Rhodes',
    destinationSlug: 'rhodes',
    title: 'ΡΟΔΟΣ 8 ημέρες',
    duration: '8 ημέρες',
    airline: 'Aegean Airlines',
    luggage: '1 αποσκευή 23kg και μία χειραποσκευή 8kg',
    departureFlight: { route: 'Λάρνακα - Ρόδος', time: '06:40 - 07:40' },
    returnFlight: { route: 'Ρόδος - Λάρνακα', time: '13:00 - 14:00' },
    pricing: [{ dates: '24/07', price: 250 }],
    departures: expandDepartures([{ dates: '24/07', price: 250 }], 7),
  },
  {
    id: 'skiathos-5-cy',
    destination: 'Skiathos',
    destinationSlug: 'skiathos',
    title: 'ΣΚΙΑΘΟΣ 5 ημέρες',
    duration: '5 ημέρες',
    airline: 'Cyprus Airways',
    luggage: '1 αποσκευή 23kg και μία χειραποσκευή 10kg',
    departureFlight: { route: 'Λάρνακα - Σκιάθος', time: '13:45 - 15:45' },
    returnFlight: { route: 'Σκιάθος - Λάρνακα', time: '11:00 - 12:50' },
    pricing: [{ dates: '04/08', price: 375 }],
    departures: expandDepartures([{ dates: '04/08', price: 375 }], 4),
  },
  {
    id: 'skiathos-8-tue-cy',
    destination: 'Skiathos',
    destinationSlug: 'skiathos',
    title: 'ΣΚΙΑΘΟΣ 8 ημέρες',
    duration: '8 ημέρες',
    airline: 'Cyprus Airways',
    note: 'Αναχωρήσεις κάθε Τρίτη με Cyprus Airways',
    luggage: '1 αποσκευή 23kg και μία χειραποσκευή 10kg',
    departureFlight: { route: 'Λάρνακα - Σκιάθος', time: '13:45 - 15:45' },
    returnFlight: { route: 'Σκιάθος - Λάρνακα', time: '11:00 - 12:50' },
    pricing: [
      { dates: '21/07,28/07', price: 365 },
      { dates: '04/08', price: 375 },
    ],
    departures: expandDepartures(
      [
        { dates: '21/07,28/07', price: 365 },
        { dates: '04/08', price: 375 },
      ],
      7
    ),
  },
  {
    id: 'skiathos-8-sat-cy',
    destination: 'Skiathos',
    destinationSlug: 'skiathos',
    title: 'ΣΚΙΑΘΟΣ 8 ημέρες',
    duration: '8 ημέρες',
    airline: 'Cyprus Airways',
    note: 'Αναχωρήσεις κάθε Σάββατο με Cyprus Airways',
    luggage: '1 αποσκευή 23kg και μία χειραποσκευή 10kg',
    departureFlight: { route: 'Λάρνακα - Σκιάθος', time: '13:45 - 15:45' },
    returnFlight: { route: 'Σκιάθος - Λάρνακα', time: '16:45 - 18:35' },
    pricing: [
      { dates: '25/07', price: 365 },
      { dates: '01/08', price: 375 },
    ],
    departures: expandDepartures(
      [
        { dates: '25/07', price: 365 },
        { dates: '01/08', price: 375 },
      ],
      7
    ),
  },
  {
    id: 'santorini-5-cy',
    destination: 'Santorini',
    destinationSlug: 'santorini',
    title: 'ΣΑΝΤΟΡΙΝΗ 5 ημέρες',
    duration: '5 ημέρες',
    airline: 'Cyprus Airways',
    luggage: '1 αποσκευή 23kg και μία χειραποσκευή 10kg',
    departureFlight: { route: 'Λάρνακα - Θήρα', time: '15:00 - 16:30' },
    returnFlight: { route: 'Θήρα - Λάρνακα', time: '16:40 - 18:10' },
    pricing: [
      { dates: '20/07', price: 355 },
      { dates: '03/08,17/08', price: 375 },
    ],
    departures: expandDepartures(
      [
        { dates: '20/07', price: 355 },
        { dates: '03/08,17/08', price: 375 },
      ],
      4
    ),
  },
  {
    id: 'preveza-5-cy',
    destination: 'Preveza',
    destinationSlug: 'preveza',
    title: 'ΠΡΕΒΕΖΑ 5 ημέρες',
    duration: '5 ημέρες',
    airline: 'Cyprus Airways',
    luggage: '1 αποσκευή 23kg και μία χειραποσκευή 10kg',
    departureFlight: { route: 'Λάρνακα - Πρέβεζα', time: '07:00 - 09:10' },
    returnFlight: { route: 'Πρέβεζα - Λάρνακα', time: '10:10 - 12:10' },
    pricing: [
      { dates: '19/07', price: 379 },
      { dates: '23/08', price: 395 },
    ],
    departures: expandDepartures(
      [
        { dates: '19/07', price: 379 },
        { dates: '23/08', price: 395 },
      ],
      4
    ),
  },
  {
    id: 'preveza-8-cy',
    destination: 'Preveza',
    destinationSlug: 'preveza',
    title: 'ΠΡΕΒΕΖΑ 8 ημέρες',
    duration: '8 ημέρες',
    airline: 'Cyprus Airways',
    luggage: '1 αποσκευή 23kg και μία χειραποσκευή 10kg',
    departureFlight: { route: 'Λάρνακα - Πρέβεζα', time: '07:00 - 09:10' },
    returnFlight: { route: 'Πρέβεζα - Λάρνακα', time: '10:10 - 12:10' },
    pricing: [{ dates: '19/07,23/07,26/07,30/07', price: 379 }],
    departures: expandDepartures([{ dates: '19/07,23/07,26/07,30/07', price: 379 }], 7),
  },
  {
    id: 'heraklion-5-gq',
    destination: 'Heraklion',
    destinationSlug: 'heraklion',
    title: 'ΗΡΑΚΛΕΙΟ 5 ημέρες',
    duration: '5 ημέρες',
    airline: 'Sky Express',
    luggage: '1 αποσκευή 23kg και μία χειραποσκευή 8kg',
    departureFlight: { route: 'Λάρνακα - Ηράκλειο', time: '23:05 - 00:30' },
    returnFlight: { route: 'Ηράκλειο - Λάρνακα', time: '21:00 - 23:05' },
    pricing: [{ dates: '14/08', price: 275 }],
    departures: expandDepartures([{ dates: '14/08', price: 275 }], 4),
  },
  {
    id: 'heraklion-5-cy',
    destination: 'Heraklion',
    destinationSlug: 'heraklion',
    title: 'ΗΡΑΚΛΕΙΟ 5 ημέρες',
    duration: '5 ημέρες',
    airline: 'Cyprus Airways',
    luggage: '1 αποσκευή 23kg και μία χειραποσκευή 10kg',
    departureFlight: { route: 'Λάρνακα - Ηράκλειο', time: '06:45 - 08:15' },
    returnFlight: { route: 'Ηράκλειο - Λάρνακα', time: '18:35 - 20:05' },
    pricing: [{ dates: '27/07', price: 289 }],
    departures: expandDepartures([{ dates: '27/07', price: 289 }], 4),
  },
  {
    id: 'heraklion-8-a3',
    destination: 'Heraklion',
    destinationSlug: 'heraklion',
    title: 'ΗΡΑΚΛΕΙΟ 8 ημέρες',
    duration: '8 ημέρες',
    airline: 'Aegean',
    luggage: '1 αποσκευή 23kg και μία χειραποσκευή 8kg',
    departureFlight: { route: 'Λάρνακα - Ηράκλειο', time: '17:15 - 18:40' },
    returnFlight: { route: 'Ηράκλειο - Λάρνακα', time: '15:05 - 16:25' },
    pricing: [{ dates: '25/07', price: 250 }],
    departures: expandDepartures([{ dates: '25/07', price: 250 }], 7),
  },
  {
    id: 'athens-5-cy',
    destination: 'Athens',
    destinationSlug: 'athens',
    title: 'ΑΘΗΝΑ 5 ημέρες',
    duration: '5 ημέρες',
    airline: 'Cyprus Airways',
    luggage: '1 αποσκευή 23kg και μία χειραποσκευή 10kg',
    departureFlight: { route: 'Λάρνακα - Αθήνα', time: '08:05 - 10:00' },
    returnFlight: { route: 'Αθήνα - Λάρνακα', time: '20:50 - 22:35' },
    pricing: [
      { dates: '13/08', price: 260 },
      { dates: '20/08', price: 240 },
    ],
    departures: expandDepartures(
      [
        { dates: '13/08', price: 260 },
        { dates: '20/08', price: 240 },
      ],
      4
    ),
  },
]

const destinationCardImages = {
  paris: '/images/flights-only-top-kinisis/paris-flight-only-6-days.webp',
  naples: '/images/flights-only-top-kinisis/Naples-flights-only.webp',
  rhodes: '/images/greek-packages-summer/rhodes/rhodes-summer-greece-hero.webp',
  skiathos: '/images/greek-packages-summer/skiathos/skiathos-lake-hero.webp',
  santorini: '/images/greek-packages-summer/santorini/santorini-greece-cover.webp',
  preveza: '/images/greek-packages-summer/preveza/preveza-hero.webp',
  heraklion: '/images/greek-packages-summer/crete-summer-package/crete-hero-summer-packages.webp',
  athens: '/images/destinations/athens-hero.webp',
}

/** Keep destination cards in a stable showcase order. */
const destinationOrder = [
  'paris',
  'naples',
  'rhodes',
  'skiathos',
  'santorini',
  'preveza',
  'heraklion',
  'athens',
]

export const getDestinationSummaries = () => {
  const grouped = new Map()

  flightTicketOffers.forEach((offer) => {
    const current = grouped.get(offer.destinationSlug)
    const offerMin = Math.min(...offer.pricing.map((p) => p.price))
    if (!current || offerMin < current.fromPrice) {
      grouped.set(offer.destinationSlug, {
        destination: offer.destination,
        destinationSlug: offer.destinationSlug,
        image: destinationCardImages[offer.destinationSlug] || '',
        fromPrice: offerMin,
        offersCount: (current?.offersCount || 0) + 1,
      })
    } else {
      grouped.set(offer.destinationSlug, {
        ...current,
        offersCount: current.offersCount + 1,
      })
    }
  })

  return destinationOrder
    .map((slug) => grouped.get(slug))
    .filter(Boolean)
    .concat(
      Array.from(grouped.values()).filter((item) => !destinationOrder.includes(item.destinationSlug))
    )
}

export const getOffersByDestination = (destinationSlug) => {
  return flightTicketOffers.filter((offer) => offer.destinationSlug === destinationSlug)
}
