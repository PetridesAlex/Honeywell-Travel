/** Hotel inventory for package 407 (ΚΑΪΡΟ & ΑΛΕΞΑΝΔΡΕΙΑ – ΣΤΑ ΙΧΝΗ ΤΩΝ ΦΑΡΑΩ) */

const hotel4 = {
  name: '4* Hotel - Cairo',
  stars: 4,
  roomType: 'Standard Room',
  boardBasis: 'Bed & Breakfast',
  location: 'Cairo, Egypt',
  image: '/images/spring-packages/cairo-alexandria-spring/cairo-4star-hotel.webp',
  nights: 3,
  packagePrice: 2178,
  prices: { double: 1089, single: 1235 },
}

const hotel5 = {
  name: '5* Hotel - Cairo',
  stars: 5,
  roomType: 'Standard Room',
  boardBasis: 'Bed & Breakfast',
  location: 'Cairo, Egypt',
  image: '/images/spring-packages/cairo-alexandria-spring/cairo-5star-hotel.webp',
  nights: 3,
  packagePrice: 2438,
  prices: { double: 1219, single: 1475 },
}

export const cairoAlexandriaSpringPackage407Hotels = [
  { ...hotel4, departureDate: '12/03' },
  { ...hotel4, departureDate: '25/03' },
  { ...hotel4, departureDate: '01/04' },
  { ...hotel5, departureDate: '12/03' },
  { ...hotel5, departureDate: '25/03' },
  { ...hotel5, departureDate: '01/04' },
]
