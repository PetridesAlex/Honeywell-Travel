/** Hotel inventory & tariffs for package 392 (ΧΡΙΣΤΟΥΓΕΝΝΑ ΣΤΗΝ ΑΘΗΝΑ) — Top Kinisis Christmas 2026 */

const IMG = {
  alassia: '/images/christmas-packages/athens-christmas/the-alassia-hotel.webp',
  stanley: '/images/christmas-packages/athens-christmas/the-stanley-hotel.webp',
  cypria: '/images/christmas-packages/athens-christmas/athens-cypria-hotel.webp',
  central: '/images/christmas-packages/athens-christmas/central-hotel.webp',
  metis: '/images/christmas-packages/athens-christmas/metis-urbane-living.webp',
  amalia: '/images/christmas-packages/athens-christmas/amalia-hotel.webp',
  electraRhythm: '/images/christmas-packages/athens-christmas/electra-rhythm-hotel.webp',
  eliaErmou: '/images/christmas-packages/athens-christmas/elia-ermou-hotel.webp',
  newHotel: '/images/christmas-packages/athens-christmas/new-hotel.webp',
  electraMetropolis: '/images/christmas-packages/athens-christmas/electra-metropolis-hotel.webp',
}

const alassiaBase = {
  name: 'The Alassia Hotel - Athens',
  stars: 3,
  roomType: 'Standard Room',
  image: IMG.alassia,
  location: '50, Socratous Str, 10431, Athens, Greece',
  boardBasis: 'Bed & Breakfast',
  nights: 3,
}

const stanleyBase = {
  name: 'The Stanley Hotel - Athens',
  stars: 4,
  roomType: 'Standard Room',
  image: IMG.stanley,
  location: 'Odysseos 1- Karaiskaki Sq, Metaxourgeio, 10437, Athens, Greece',
  boardBasis: 'Bed & Breakfast',
  nights: 3,
}

const athensCypriaBase = {
  name: 'Athens Cypria Hotel - Athens',
  stars: 4,
  roomType: 'Standard Room',
  image: IMG.cypria,
  location: '5 Diomias Street, Syntagma Sq, 10563, Athens, Greece',
  boardBasis: 'Bed & Breakfast',
  nights: 3,
}

const centralBase = {
  name: 'Central Hotel - Athens',
  stars: 3,
  roomType: 'Standard Room',
  image: IMG.central,
  location: 'Apollonos 21, Plaka, 10557, Athens, Greece',
  boardBasis: 'Bed & Breakfast',
  nights: 3,
}

const metisBase = {
  name: 'Metis Urbane Living Spaces - Athens',
  stars: 4,
  roomType: 'Standard Room',
  image: IMG.metis,
  location: 'Diomeias 8, Athina, 105 63, Athens, Greece',
  boardBasis: 'Bed & Breakfast',
  nights: 3,
}

const amaliaBase = {
  name: 'Amalia Hotel - Athens',
  stars: 4,
  roomType: 'Standard Room',
  image: IMG.amalia,
  location: '10, Amalias ave., 10557, Athens, Greece',
  boardBasis: 'Bed & Breakfast',
  nights: 3,
}

const electraRhythmBase = {
  name: 'Electra Rhythm Hotel - Athens',
  stars: 4,
  roomType: 'Standard Room',
  image: IMG.electraRhythm,
  location: '5 Ermou Street, 10563, Athens, Greece',
  boardBasis: 'Bed & Breakfast',
  nights: 3,
}

const eliaErmouBase = {
  name: 'Elia Ermou Hotel - Athens',
  stars: 4,
  roomType: 'Standard Room',
  image: IMG.eliaErmou,
  location: 'Ermou 15, Athens, 10563, Athens, Greece',
  boardBasis: 'Bed & Breakfast',
  nights: 3,
}

const newHotelBase = {
  name: 'New Hotel - Athens',
  stars: 5,
  roomType: 'Standard Room',
  image: IMG.newHotel,
  location: '16, Filellinon Str, 10557, Athens, Greece',
  boardBasis: 'Bed & Breakfast',
  nights: 3,
}

const electraMetropolisBase = {
  name: 'Electra Metropolis Hotel - Athens',
  stars: 5,
  roomType: 'Standard Room',
  image: IMG.electraMetropolis,
  location: '15, Mitropoleos Str, 10557, Athens, Greece',
  boardBasis: 'Bed & Breakfast',
  nights: 3,
}

export const athensChristmasPackage392Hotels = [
  {
    ...alassiaBase,
    prices: { double: 469, single: 569, triple: 439, child1: 409, child2: 409 },
    packagePrice: 938,
    departureDate: '26/12',
  },
  {
    ...stanleyBase,
    prices: { double: 539, single: 699, triple: 479, child1: 459, child2: 459 },
    packagePrice: 1078,
    departureDate: '26/12',
  },
  {
    ...athensCypriaBase,
    prices: { double: 565, single: 759, child1: 399 },
    packagePrice: 1130,
    departureDate: '26/12',
  },
  {
    ...centralBase,
    prices: { double: 569, single: 819 },
    packagePrice: 1138,
    departureDate: '26/12',
  },
  {
    ...metisBase,
    prices: { double: 569, single: 719 },
    packagePrice: 1138,
    departureDate: '26/12',
  },
  {
    ...amaliaBase,
    prices: { double: 589, single: 759, triple: 519, child1: 399 },
    packagePrice: 1178,
    departureDate: '26/12',
  },
  {
    ...electraRhythmBase,
    prices: { double: 629, single: 859, triple: 669 },
    packagePrice: 1258,
    departureDate: '26/12',
  },
  {
    ...eliaErmouBase,
    prices: { double: 655, single: 955, child1: 399 },
    packagePrice: 1310,
    departureDate: '26/12',
  },
  {
    ...newHotelBase,
    prices: { double: 739, single: 1119, triple: 699, child1: 429 },
    packagePrice: 1478,
    departureDate: '26/12',
  },
  {
    ...electraMetropolisBase,
    prices: { double: 749, single: 1129, triple: 689, child1: 579 },
    packagePrice: 1498,
    departureDate: '26/12',
  },
]
