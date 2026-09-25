// Hotel inventory & tariffs for package 389 (ΓΙΟΡΤΙΝΗ ΑΠΟΔΡΑΣΗ ΣΤΟ ΜΠΑΝΣΚΟ) — Christmas Markets city break
const IMG = {
  mountainView: '/images/christmas-packages/bansko-sofia-christmas/mountain-view-aparthotel-bansko.webp',
  grandRoyale: '/images/christmas-packages/bansko-sofia-christmas/grand-royale-apartment-complex-spa-bansko.webp'
}

const mountainViewBase = {
  name: 'Mountain View Aparthotel - Bansko',
  stars: 3,
  roomType: 'Standard Room',
  image: IMG.mountainView,
  location: 'кв. Грамадето, Pirin Str. 129, 2770, Bansko, Bulgaria',
  boardBasis: 'Room Only',
  nights: 3
}

const grandRoyaleBase = {
  name: 'Grand Royale Apartment Complex & Spa - Bansko',
  stars: 4,
  roomType: 'Standard Room',
  image: IMG.grandRoyale,
  location: 'Gurovitsa, ulitsa "Todorini ochi" 3, 2770, Bansko, Bulgaria',
  boardBasis: 'Bed & Breakfast',
  nights: 3
}

export const banskoChristmasPackage389Hotels = [
  {
    ...mountainViewBase,
    prices: {
      double: 419,
      single: 0,
      child1: 0
    },
    packagePrice: 838,
    departureDate: '20/11'
  },
  {
    ...mountainViewBase,
    prices: {
      double: 415,
      single: 0,
      child1: 0
    },
    packagePrice: 830,
    departureDate: '04/12'
  },
  {
    ...mountainViewBase,
    prices: {
      double: 419,
      single: 0,
      child1: 0
    },
    packagePrice: 838,
    departureDate: '11/12'
  },
  {
    ...mountainViewBase,
    prices: {
      double: 299,
      single: 0,
      child1: 0
    },
    packagePrice: 598,
    departureDate: '18/12'
  },
  {
    ...grandRoyaleBase,
    prices: {
      double: 449,
      single: 0,
      child1: 0
    },
    packagePrice: 898,
    departureDate: '20/11'
  },
  {
    ...grandRoyaleBase,
    prices: {
      double: 445,
      single: 0,
      child1: 0
    },
    packagePrice: 890,
    departureDate: '04/12'
  },
  {
    ...grandRoyaleBase,
    prices: {
      double: 459,
      single: 0,
      child1: 0
    },
    packagePrice: 918,
    departureDate: '11/12'
  },
  {
    ...grandRoyaleBase,
    prices: {
      double: 339,
      single: 0,
      child1: 0
    },
    packagePrice: 678,
    departureDate: '18/12'
  }
]
