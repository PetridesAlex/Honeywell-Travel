// Hotel inventory & tariffs for package 382 (ΓΙΟΡΤΙΝΗ ΑΠΟΔΡΑΣΗ ΣΤΟ ΒΕΡΟΛΙΝΟ) — Christmas Markets city break
const IMG = {
  holidayInn: '/images/christmas-packages/berlin-christmas/holiday-inn-berlin.webp',
  titanic: '/images/christmas-packages/berlin-christmas/titanic-comfort-hotel.webp',
  nhPotsdamer: '/images/christmas-packages/berlin-christmas/nh-berlin-hotel.webp',
  nhCollection: '/images/christmas-packages/berlin-christmas/nh-collection-berlin.webp'
}

const holidayInnBase = {
  name: 'Holiday Inn Berlin Centre Alexanderplatz Hotel - Berlin',
  stars: 4,
  roomType: 'Standard Room',
  image: IMG.holidayInn,
  location: 'Stralauer Strasse 45, Mitte, Berlin, 10179, Germany',
  boardBasis: 'Bed & Breakfast',
  nights: 3
}

const titanicBase = {
  name: 'Titanic Comfort Mitte Hotel',
  stars: 3,
  roomType: 'Standard Room',
  image: IMG.titanic,
  location: 'Elisabeth Mara Strasse 4, 10117, Berlin, Germany',
  boardBasis: 'Bed & Breakfast',
  nights: 3
}

const nhPotsdamerBase = {
  name: 'NH Berlin Potsdamer Platz Hotel',
  stars: 4,
  roomType: 'Standard Room',
  image: IMG.nhPotsdamer,
  location: 'Stresemannstr. 47, 10963, Berlin, Germany',
  boardBasis: 'Bed & Breakfast',
  nights: 3
}

const nhCollectionBase = {
  name: 'Hotel NH Collection Berlin Mitte am Checkpoint Charlie Hotel',
  stars: 4,
  roomType: 'Standard Room',
  image: IMG.nhCollection,
  location: 'Leipziger Str. 106-111, 10117, Berlin, Germany',
  boardBasis: 'Bed & Breakfast',
  nights: 3
}

export const berlinChristmasPackage382Hotels = [
  {
    ...holidayInnBase,
    prices: { double: 699, single: 0, child1: 0 },
    packagePrice: 1398,
    departureDate: '28/11'
  },
  {
    ...holidayInnBase,
    prices: { double: 619, single: 0, child1: 0 },
    packagePrice: 1238,
    departureDate: '05/12'
  },
  {
    ...holidayInnBase,
    prices: { double: 599, single: 0, child1: 0 },
    packagePrice: 1198,
    departureDate: '12/12'
  },
  {
    ...titanicBase,
    prices: { double: 689, single: 0, child1: 0 },
    packagePrice: 1378,
    departureDate: '28/11'
  },
  {
    ...titanicBase,
    prices: { double: 599, single: 0, child1: 0 },
    packagePrice: 1198,
    departureDate: '05/12'
  },
  {
    ...titanicBase,
    prices: { double: 599, single: 0, child1: 0 },
    packagePrice: 1198,
    departureDate: '12/12'
  },
  {
    ...nhPotsdamerBase,
    prices: { double: 739, single: 0, child1: 0 },
    packagePrice: 1478,
    departureDate: '28/11'
  },
  {
    ...nhPotsdamerBase,
    prices: { double: 649, single: 0, child1: 0 },
    packagePrice: 1298,
    departureDate: '05/12'
  },
  {
    ...nhPotsdamerBase,
    prices: { double: 649, single: 0, child1: 0 },
    packagePrice: 1298,
    departureDate: '12/12'
  },
  {
    ...nhCollectionBase,
    prices: { double: 799, single: 0, child1: 0 },
    packagePrice: 1598,
    departureDate: '28/11'
  },
  {
    ...nhCollectionBase,
    prices: { double: 689, single: 0, child1: 0 },
    packagePrice: 1378,
    departureDate: '05/12'
  },
  {
    ...nhCollectionBase,
    prices: { double: 689, single: 0, child1: 0 },
    packagePrice: 1378,
    departureDate: '12/12'
  }
]
