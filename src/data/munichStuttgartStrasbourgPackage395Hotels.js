/** Hotel inventory & tariffs for package 395 (ΜΟΝΑΧΟ / ΣΤΟΥΤΓΑΡΔΗ / ΣΤΡΑΣΒΟΥΡΓΟ) */

const IMG = {
  hotel: '/images/christmas-packages/munich-afstriakes-alpis/munich-hotel.webp',
}

const rates = {
  prices: { double: 1059, single: 1295, child1: 485 },
  packagePrice: 2118,
}

const hotelBase = {
  name: 'Holiday Inn Munich City Centre 4* / Hampton by Hilton Stuttgart City Centre 3*',
  stars: 4,
  roomType: 'Standard Room',
  image: IMG.hotel,
  location: 'Munich / Stuttgart, Germany',
  boardBasis: 'Bed & Breakfast',
  nights: 4,
}

export const munichStuttgartStrasbourgPackage395Hotels = [
  { ...hotelBase, ...rates, departureDate: '23/12' },
  { ...hotelBase, ...rates, departureDate: '26/12' },
]
