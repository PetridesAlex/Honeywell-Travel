/** Hotel inventory & tariffs for package 396 (ΓΙΟΡΤΙΝΗ ΑΠΟΔΡΑΣΗ ΣΤΟ ΒΡΟΤΣΛΑΒ) */

const IMG = {
  wyndham: '/images/christmas-packages/wroclaw-christmas/wyndham-wroclaw-old-town.webp',
  doubleTree: '/images/christmas-packages/wroclaw-christmas/doubletree-hilton-wroclaw.webp',
}

const wyndhamBase = {
  name: 'Wyndham Wroclaw Old Town 4*',
  stars: 4,
  roomType: 'Standard Room',
  image: IMG.wyndham,
  location: 'Swietego Mikolaja 67, 50127, Wroclaw, Poland',
  boardBasis: 'Bed & Breakfast',
  nights: 3,
}

const doubleTreeBase = {
  name: 'DoubleTree by Hilton Wroclaw Hotel 5*',
  stars: 5,
  roomType: 'Standard Room',
  image: IMG.doubleTree,
  location: 'Ul. Podwale 84, 50-414, Wroclaw, Poland',
  boardBasis: 'Bed & Breakfast',
  nights: 3,
}

export const wroclawChristmasPackage396Hotels = [
  {
    ...wyndhamBase,
    prices: { double: 519 },
    packagePrice: 1038,
    departureDate: '05/12',
  },
  {
    ...wyndhamBase,
    prices: { double: 459 },
    packagePrice: 918,
    departureDate: '19/12',
  },
  {
    ...wyndhamBase,
    prices: { double: 489 },
    packagePrice: 978,
    departureDate: '02/01/2027',
  },
  {
    ...doubleTreeBase,
    prices: { double: 529 },
    packagePrice: 1058,
    departureDate: '05/12',
  },
  {
    ...doubleTreeBase,
    prices: { double: 519 },
    packagePrice: 1038,
    departureDate: '19/12',
  },
  {
    ...doubleTreeBase,
    prices: { double: 619 },
    packagePrice: 1238,
    departureDate: '02/01/2027',
  },
]
