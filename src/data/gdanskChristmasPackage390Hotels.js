// Hotel inventory & tariffs for package 390 (ΓΙΟΡΤΙΝΗ ΑΠΟΔΡΑΣΗ ΣΤΟ ΓΚΝΤΑΝΣΚ) — Christmas Markets city break
const IMG = {
  bbOldTown: '/images/christmas-packages/gdansk-poland-christmas/bb-hotel-gdansk-old-town.webp',
  holidayInn: '/images/christmas-packages/gdansk-poland-christmas/holiday-inn-gdansk-city-centre.webp'
}

const bbOldTownBase = {
  name: 'B&B HOTEL Gdańsk Old Town',
  stars: 4,
  roomType: 'Standard Room',
  image: IMG.bbOldTown,
  location: 'Długi Targ 14/16, 80-828, Gdańsk, Poland',
  boardBasis: 'Room Only',
  nights: 4
}

const holidayInnBase = {
  name: 'Holiday Inn Gdansk - City Centre by IHG',
  stars: 4,
  roomType: 'Standard Room',
  image: IMG.holidayInn,
  location: 'Chmielna 1, Gdańsk, 80-750, Poland',
  boardBasis: 'Bed & Breakfast',
  nights: 4
}

export const gdanskChristmasPackage390Hotels = [
  {
    ...bbOldTownBase,
    prices: {
      double: 429,
      single: 0,
      child1: 0
    },
    packagePrice: 858,
    departureDate: '30/11'
  },
  {
    ...bbOldTownBase,
    prices: {
      double: 419,
      single: 0,
      child1: 0
    },
    packagePrice: 838,
    departureDate: '07/12'
  },
  {
    ...bbOldTownBase,
    prices: {
      double: 379,
      single: 0,
      child1: 0
    },
    packagePrice: 758,
    departureDate: '14/12'
  },
  {
    ...bbOldTownBase,
    prices: {
      double: 459,
      single: 0,
      child1: 0
    },
    packagePrice: 918,
    departureDate: '21/12'
  },
  {
    ...holidayInnBase,
    prices: {
      double: 499,
      single: 0,
      child1: 0
    },
    packagePrice: 998,
    departureDate: '30/11'
  },
  {
    ...holidayInnBase,
    prices: {
      double: 469,
      single: 0,
      child1: 0
    },
    packagePrice: 938,
    departureDate: '07/12'
  },
  {
    ...holidayInnBase,
    prices: {
      double: 439,
      single: 0,
      child1: 0
    },
    packagePrice: 878,
    departureDate: '14/12'
  },
  {
    ...holidayInnBase,
    prices: {
      double: 519,
      single: 0,
      child1: 0
    },
    packagePrice: 1038,
    departureDate: '21/12'
  }
]
