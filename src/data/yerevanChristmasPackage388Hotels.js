// Hotel inventory & tariffs for package 388 (ΓΙΟΡΤΙΝΗ ΑΠΟΔΡΑΣΗ ΣΤΟ ΓΙΕΡΕΒΑΝ) — Christmas Markets city break
const IMG = {
  kantar: '/images/christmas-packages/yerevan-christmas/kantar-hotel-yerevan.webp',
  holidayInn: '/images/christmas-packages/yerevan-christmas/holiday-inn-yerevan-republic-square.webp'
}

const kantarBase = {
  name: 'Kantar Hotel - Yerevan',
  stars: 3,
  roomType: 'Standard Room',
  image: IMG.kantar,
  location: '10 Deghatan St, 0010, Yerevan, Armenia',
  boardBasis: 'Bed & Breakfast',
  nights: 3
}

const holidayInnBase = {
  name: 'Holiday Inn Yerevan - Republic Square by IHG Hotel - Yerevan',
  stars: 4,
  roomType: 'Standard Room',
  image: IMG.holidayInn,
  location: 'Amiryan Str. 2, 0010, Yerevan, Armenia',
  boardBasis: 'Bed & Breakfast',
  nights: 3
}

export const yerevanChristmasPackage388Hotels = [
  {
    ...kantarBase,
    prices: {
      double: 259,
      single: 0,
      child1: 0
    },
    packagePrice: 518,
    departureDate: '20/11'
  },
  {
    ...kantarBase,
    prices: {
      double: 289,
      single: 0,
      child1: 0
    },
    packagePrice: 578,
    departureDate: '04/12'
  },
  {
    ...kantarBase,
    prices: {
      double: 289,
      single: 0,
      child1: 0
    },
    packagePrice: 578,
    departureDate: '18/12'
  },
  {
    ...holidayInnBase,
    prices: {
      double: 399,
      single: 0,
      child1: 0
    },
    packagePrice: 798,
    departureDate: '20/11'
  },
  {
    ...holidayInnBase,
    prices: {
      double: 399,
      single: 0,
      child1: 0
    },
    packagePrice: 798,
    departureDate: '04/12'
  },
  {
    ...holidayInnBase,
    prices: {
      double: 399,
      single: 0,
      child1: 0
    },
    packagePrice: 798,
    departureDate: '18/12'
  }
]
