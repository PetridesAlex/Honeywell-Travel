// Hotel inventory & tariffs for package 391 (ΓΙΟΡΤΙΝΗ ΑΠΟΔΡΑΣΗ ΣΤΗ ΡΙΓΑ) — Christmas Markets city break
const IMG = {
  kristofs: '/images/christmas-packages/riga-package-christmas/boutique-hotel-kristofs-riga.webp',
  hilton: '/images/christmas-packages/riga-package-christmas/hilton-garden-inn-riga-old-town.webp'
}

const kristofsBase = {
  name: 'Boutique Hotel KRISTOFS - Riga',
  stars: 3,
  roomType: 'Standard Room',
  image: IMG.kristofs,
  location: 'Old Town, Teatra 6, Riga, Latvia',
  boardBasis: 'Bed & Breakfast',
  nights: 3
}

const hiltonBase = {
  name: 'Hilton Garden Inn Riga Old Town - Riga',
  stars: 4,
  roomType: 'Standard Room',
  image: IMG.hilton,
  location: 'Grecinieku 25, 1050, Riga, Latvia',
  boardBasis: 'Bed & Breakfast',
  nights: 3
}

export const rigaChristmasPackage391Hotels = [
  {
    ...kristofsBase,
    prices: {
      double: 419,
      single: 0,
      child1: 0
    },
    packagePrice: 838,
    departureDate: '29/11'
  },
  {
    ...kristofsBase,
    prices: {
      double: 429,
      single: 0,
      child1: 0
    },
    packagePrice: 858,
    departureDate: '06/12'
  },
  {
    ...kristofsBase,
    prices: {
      double: 439,
      single: 0,
      child1: 0
    },
    packagePrice: 878,
    departureDate: '13/12'
  },
  {
    ...hiltonBase,
    prices: {
      double: 459,
      single: 0,
      child1: 0
    },
    packagePrice: 918,
    departureDate: '29/11'
  },
  {
    ...hiltonBase,
    prices: {
      double: 429,
      single: 0,
      child1: 0
    },
    packagePrice: 858,
    departureDate: '06/12'
  },
  {
    ...hiltonBase,
    prices: {
      double: 449,
      single: 0,
      child1: 0
    },
    packagePrice: 898,
    departureDate: '13/12'
  }
]
