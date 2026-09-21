// Hotel inventory & tariffs for package 354 (ΓΙΟΡΤΙΝΗ ΑΠΟΔΡΑΣΗ ΣΤΟ ΛΟΝΔΙΝΟ) — Christmas city break.
const IMG = {
  royalNational: '/images/christmas-packages/london-christmas-pakcage/royal-national-hotel.webp',
  president: '/images/christmas-packages/london/president-hotel-london.webp',
  tavistock: '/images/christmas-packages/london-christmas-pakcage/tavistock-hotel-london.webp'
}

export const londonChristmasPackage354Hotels = [
  {
    name: 'Tavistock Hotel - London',
    stars: 3,
    roomType: 'Standard Room',
    image: IMG.tavistock,
    location: '48-55 Tavistock Square, London WC1H 9EU, United Kingdom',
    boardBasis: 'Bed & Breakfast',
    prices: { double: 529 },
    packagePrice: 1058,
    departureDate: '26/11',
    nights: 3
  },
  {
    name: 'Tavistock Hotel - London',
    stars: 3,
    roomType: 'Standard Room',
    image: IMG.tavistock,
    location: '48-55 Tavistock Square, London WC1H 9EU, United Kingdom',
    boardBasis: 'Bed & Breakfast',
    prices: { double: 679 },
    packagePrice: 1358,
    departureDate: '04/12',
    nights: 3
  },
  {
    name: 'Royal National Hotel - London',
    stars: 3,
    roomType: 'Standard Room',
    image: IMG.royalNational,
    location: '38-51 Bedford Way, Russell Square, London WC1H 0DG, United Kingdom',
    boardBasis: 'Bed & Breakfast',
    prices: { double: 539 },
    packagePrice: 1078,
    departureDate: '26/11',
    nights: 3
  },
  {
    name: 'Royal National Hotel - London',
    stars: 3,
    roomType: 'Standard Room',
    image: IMG.royalNational,
    location: '38-51 Bedford Way, Russell Square, London WC1H 0DG, United Kingdom',
    boardBasis: 'Bed & Breakfast',
    prices: { double: 729 },
    packagePrice: 1458,
    departureDate: '04/12',
    nights: 3
  },
  {
    name: 'President Hotel - London',
    stars: 3,
    roomType: 'Standard Room',
    image: IMG.president,
    location: '56-60 Guildford Street, London WC1N 1DB, United Kingdom',
    boardBasis: 'Bed & Breakfast',
    prices: { double: 539 },
    packagePrice: 1078,
    departureDate: '26/11',
    nights: 3
  },
  {
    name: 'President Hotel - London',
    stars: 3,
    roomType: 'Standard Room',
    image: IMG.president,
    location: '56-60 Guildford Street, London WC1N 1DB, United Kingdom',
    boardBasis: 'Bed & Breakfast',
    prices: { double: 689 },
    packagePrice: 1378,
    departureDate: '04/12',
    nights: 3
  }
]
