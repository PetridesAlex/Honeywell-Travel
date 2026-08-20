// Hotel inventory & tariffs for package 366 (ΓΙΟΡΤΙΝΗ ΑΠΟΔΡΑΣΗ ΣΤΟ ΒΟΥΚΟΥΡΕΣΤΙ)
const IMG = {
  zeus: '/images/christmas-packages/bucharest/zeus-essence-bucharest.webp',
  mercure: '/images/christmas-packages/bucharest/mercure-bucharest-city-center.webp',
  novotel: '/images/christmas-packages/bucharest/novotel-city-centre-bucharest.webp'
}

const zeus = {
  name: 'Zeus Essence Bucharest, Trademark Collection by Wyndham - Bucharest',
  stars: 3,
  roomType: 'Standard Room',
  image: IMG.zeus,
  location: '13 Brezoianu St, 030167, Bucharest, Romania',
  boardBasis: 'Bed & Breakfast',
  nights: 3
}

const mercure = {
  name: 'Mercure Bucharest City Center - Bucharest',
  stars: 4,
  roomType: 'Standard Room',
  image: IMG.mercure,
  location: '17A George Enescu Street, 010302, Bucharest, Romania',
  boardBasis: 'Bed & Breakfast',
  nights: 3
}

const novotel = {
  name: 'Novotel City Centre Hotel - Bucharest',
  stars: 4,
  roomType: 'Standard Room',
  image: IMG.novotel,
  location: 'Calea Victoriei, 37B, Sector 1, 010061, Bucharest, Romania',
  boardBasis: 'Bed & Breakfast',
  nights: 3
}

export const bucharestChristmasPackage366Hotels = [
  { ...zeus, prices: { double: 355 }, packagePrice: 710, departureDate: '27/11' },
  { ...zeus, prices: { double: 369 }, packagePrice: 738, departureDate: '04/12' },
  { ...zeus, prices: { double: 359 }, packagePrice: 718, departureDate: '11/12' },
  { ...zeus, prices: { double: 415 }, packagePrice: 830, departureDate: '18/12' },
  { ...mercure, prices: { double: 399 }, packagePrice: 798, departureDate: '27/11' },
  { ...mercure, prices: { double: 415 }, packagePrice: 830, departureDate: '04/12' },
  { ...mercure, prices: { double: 399 }, packagePrice: 798, departureDate: '11/12' },
  { ...mercure, prices: { double: 439 }, packagePrice: 878, departureDate: '18/12' },
  { ...novotel, prices: { double: 415 }, packagePrice: 830, departureDate: '27/11' },
  { ...novotel, prices: { double: 455 }, packagePrice: 910, departureDate: '04/12' },
  { ...novotel, prices: { double: 429 }, packagePrice: 858, departureDate: '11/12' },
  { ...novotel, prices: { double: 439 }, packagePrice: 878, departureDate: '18/12' }
]
