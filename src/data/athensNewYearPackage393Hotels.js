/** Hotel inventory & tariffs for package 393 (ΠΡΩΤΟΧΡΟΝΙΑ ΣΤΗΝ ΑΘΗΝΑ) — Top Kinisis Christmas 2026 */

const IMG = {
  titania: '/images/christmas-packages/athens-new-year/titania-hotel.webp',
  arethusa: '/images/christmas-packages/athens-new-year/arethusa-hotel.webp',
  metis: '/images/christmas-packages/athens-new-year/metis-urbane-living.webp',
  central: '/images/christmas-packages/athens-new-year/central-hotel.webp',
  classicPrime: '/images/christmas-packages/athens-new-year/classic-athens-prime.webp',
  eliaErmou: '/images/christmas-packages/athens-new-year/elia-ermou-hotel.webp',
  athensCapital: '/images/christmas-packages/athens-new-year/athens-capital-center.webp',
}

const titaniaBase = {
  name: 'Titania Hotel - Athens',
  stars: 4,
  roomType: 'Standard Room',
  image: IMG.titania,
  location: 'Panepistimiou 52, 10678, Athens, Greece',
  boardBasis: 'Bed & Breakfast',
  nights: 4,
}

const arethusaBase = {
  name: 'Arethusa Hotel - Athens',
  stars: 3,
  roomType: 'Standard Room',
  image: IMG.arethusa,
  location: '6-8, Mitropoleos Str. & 12, Nikis Str., 10563, Athens, Greece',
  boardBasis: 'Bed & Breakfast',
  nights: 4,
}

const metisBase = {
  name: 'Metis Urbane Living Spaces - Athens',
  stars: 4,
  roomType: 'Standard Room',
  image: IMG.metis,
  location: 'Diomeias 8, Athina, 105 63, Athens, Greece',
  boardBasis: 'Bed & Breakfast',
  nights: 4,
}

const centralBase = {
  name: 'Central Hotel - Athens',
  stars: 3,
  roomType: 'Standard Room',
  image: IMG.central,
  location: 'Apollonos 21, Plaka, 10557, Athens, Greece',
  boardBasis: 'Bed & Breakfast',
  nights: 4,
}

const classicPrimeBase = {
  name: 'Classic by Athens Prime Hotel - Athens',
  stars: 4,
  roomType: 'Standard Room',
  image: IMG.classicPrime,
  location: '7, Chavriou str, Athens, 10562, Athens, Greece',
  boardBasis: 'Bed & Breakfast',
  nights: 4,
}

const eliaErmouBase = {
  name: 'Elia Ermou Hotel - Athens',
  stars: 4,
  roomType: 'Standard Room',
  image: IMG.eliaErmou,
  location: 'Ermou 15, Athens, 10563, Athens, Greece',
  boardBasis: 'Bed & Breakfast',
  nights: 4,
}

const athensCapitalClassicalBase = {
  name: 'Athens Capital Center Hotel - Athens',
  stars: 5,
  roomType: 'Classical Room',
  image: IMG.athensCapital,
  location: '4 Eleftheriou Venizelou Avenue and 2 Kriezotou street Syntagma Square, 10564, Athens, Greece',
  boardBasis: 'Bed & Breakfast',
  nights: 4,
}

const athensCapitalSuperiorBase = {
  name: 'Athens Capital Center Hotel - Athens',
  stars: 5,
  roomType: 'Superior Room',
  image: IMG.athensCapital,
  location: '4 Eleftheriou Venizelou Avenue and 2 Kriezotou street Syntagma Square, 10564, Athens, Greece',
  boardBasis: 'Bed & Breakfast',
  nights: 4,
}

export const athensNewYearPackage393Hotels = [
  {
    ...titaniaBase,
    prices: { double: 529, single: 819, triple: 495, child1: 349 },
    packagePrice: 1058,
    departureDate: '30/12',
  },
  {
    ...arethusaBase,
    prices: { double: 549, single: 829, triple: 559 },
    packagePrice: 1098,
    departureDate: '30/12',
  },
  {
    ...metisBase,
    prices: { double: 559, single: 839 },
    packagePrice: 1118,
    departureDate: '30/12',
  },
  {
    ...centralBase,
    prices: { double: 599, single: 919, triple: 549, child1: 369 },
    packagePrice: 1198,
    departureDate: '30/12',
  },
  {
    ...classicPrimeBase,
    prices: { double: 709, single: 1125 },
    packagePrice: 1418,
    departureDate: '30/12',
  },
  {
    ...eliaErmouBase,
    prices: { double: 759, single: 1209, triple: 689, child1: 549 },
    packagePrice: 1518,
    departureDate: '30/12',
  },
  {
    ...athensCapitalClassicalBase,
    prices: { double: 839, single: 1289 },
    packagePrice: 1678,
    departureDate: '30/12',
  },
  {
    ...athensCapitalSuperiorBase,
    prices: { double: 909, single: 1419, triple: 799, child1: 589 },
    packagePrice: 1818,
    departureDate: '30/12',
  },
]
