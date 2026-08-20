// Hotel inventory & tariffs for package 365 (ΓΙΟΡΤΙΝΗ ΑΠΟΔΡΑΣΗ ΣΤΗΝ ΣΟΦΙΑ)
const IMG = {
  amar: '/images/christmas-packages/sofia/amar-design-hotel-sofia.webp',
  abrazo: '/images/christmas-packages/sofia/abrazo-sofia-hotel.webp',
  rosslyn: '/images/christmas-packages/sofia/rosslyn-thracia-hotel-sofia.webp'
}

const amar = {
  name: 'Amar Design Hotel - Sofia',
  stars: 3,
  roomType: 'Standard Room',
  image: IMG.amar,
  location: '37 Veslets Str., Sofia, 1202, Sofia, Bulgaria',
  boardBasis: 'Bed & Breakfast',
  nights: 3
}

const abrazo = {
  name: 'Abrazo Sofia Hotel - Sofia',
  stars: 4,
  roomType: 'Standard Room',
  image: IMG.abrazo,
  location: '116, Hristo Botev bul., 1202, Sofia, Bulgaria',
  boardBasis: 'Bed & Breakfast',
  nights: 3
}

const rosslyn = {
  name: 'Rosslyn Thracia Hotel - Sofia',
  stars: 4,
  roomType: 'Standard Room',
  image: IMG.rosslyn,
  location: '30, Solunska Str., 1000, Sofia, Bulgaria',
  boardBasis: 'Bed & Breakfast',
  nights: 3
}

export const sofiaChristmasPackage365Hotels = [
  { ...amar, prices: { double: 339 }, packagePrice: 678, departureDate: '27/11' },
  { ...amar, prices: { double: 349 }, packagePrice: 698, departureDate: '04/12' },
  { ...amar, prices: { double: 329 }, packagePrice: 658, departureDate: '11/12' },
  { ...amar, prices: { double: 379 }, packagePrice: 758, departureDate: '18/12' },
  { ...abrazo, prices: { double: 339 }, packagePrice: 678, departureDate: '27/11' },
  { ...abrazo, prices: { double: 349 }, packagePrice: 698, departureDate: '04/12' },
  { ...abrazo, prices: { double: 329 }, packagePrice: 658, departureDate: '11/12' },
  { ...abrazo, prices: { double: 379 }, packagePrice: 758, departureDate: '18/12' },
  { ...rosslyn, prices: { double: 339 }, packagePrice: 678, departureDate: '27/11' },
  { ...rosslyn, prices: { double: 349 }, packagePrice: 698, departureDate: '04/12' },
  { ...rosslyn, prices: { double: 349 }, packagePrice: 698, departureDate: '11/12' },
  { ...rosslyn, prices: { double: 395 }, packagePrice: 790, departureDate: '18/12' }
]
