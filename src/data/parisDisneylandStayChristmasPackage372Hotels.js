// Hotel inventory & tariffs for package 372 (ΠΑΡΙΣΙ / DISNEYLAND — Christmas)
const IMG = {
  cheyenne: '/images/Paris-disneyland/paris-disney-hotel.webp',
  newport: '/images/Paris-disneyland/paris-disney-hotel-secondary.webp'
}

const cheyenne = {
  name: "Disney's Hotel Cheyenne – Disneyland® Paris",
  stars: 3,
  roomType: 'Standard Room',
  image: IMG.cheyenne,
  location: 'Rue du Bœuf Agile, Coupvray, 77700, Paris, France',
  boardBasis: 'Bed and Breakfast only in Paris Hotel',
  nights: 2
}

const newport = {
  name: "Disney's Newport Bay Club – Disneyland® Paris",
  stars: 4,
  roomType: 'Standard Room',
  image: IMG.newport,
  location: 'Avenue Robert Schuman, 77700, Paris, France',
  boardBasis: 'Bed and Breakfast only in Paris Hotel',
  nights: 2
}

export const parisDisneylandStayChristmasPackage372Hotels = [
  {
    ...cheyenne,
    prices: { double: 1595, single: 2125, triple: 1455, child1: 1085, child2: 1085 },
    packagePrice: 3190,
    departureDate: '23/12'
  },
  {
    ...newport,
    prices: { double: 1695, single: 2305, triple: 1519, child1: 1085, child2: 1085 },
    packagePrice: 3390,
    departureDate: '23/12'
  }
]
