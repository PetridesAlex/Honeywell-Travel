// Hotel inventory & tariffs for package 374 (ΧΡΙΣΤΟΥΓΕΝΝΑ ΣΤΟ ΜΟΝΑΧΟ - ΣΑΛΤΣΜΠΟΥΡΓΚ) — 5 Days Christmas package.
const IMG = {
  fourStarMunich: '/images/christmas-packages/munich/4-star-hotel-munich.webp'
}

export const munichSalzburgChristmasPackage374Hotels = [
  {
    name: '4* Hotel - Munich',
    stars: 4,
    roomType: 'Standard Room',
    image: IMG.fourStarMunich,
    location: 'Munich, Germany',
    boardBasis: 'Bed & Breakfast',
    prices: { 
      double: 989, 
      single: 1229, 
      child1: 419
    },
    packagePrice: 1978,
    departureDate: '23/12',
    nights: 4
  },
  {
    name: '4* Hotel - Munich',
    stars: 4,
    roomType: 'Standard Room',
    image: IMG.fourStarMunich,
    location: 'Munich, Germany',
    boardBasis: 'Bed & Breakfast',
    prices: { 
      double: 1059, 
      single: 1295, 
      child1: 485
    },
    packagePrice: 2118,
    departureDate: '26/12',
    nights: 4
  }
]
