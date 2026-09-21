// Hotel inventory & tariffs for package 379 (ΜΑΓΕΥΤΙΚΟ ΜΟΝΑΧΟ & ΑΥΣΤΡΙΑΚΕΣ ΑΛΠΕΙΣ) — 5 Days Christmas package.
const IMG = {
  fourStarMunich: '/images/christmas-packages/munich-afstriakes-alpis/munich-hotel.webp'
}

export const munichAlpsChristmasPackage379Hotels = [
  {
    name: '4* Hotel - Munich',
    stars: 4,
    roomType: 'Standard Room',
    image: IMG.fourStarMunich,
    location: 'Munich, Germany',
    boardBasis: 'Bed & Breakfast',
    prices: { 
      double: 1125, 
      single: 1415, 
      child1: 485
    },
    packagePrice: 2250,
    departureDate: '27/12',
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
      single: 1349, 
      child1: 419
    },
    packagePrice: 2118,
    departureDate: '30/12',
    nights: 4
  }
]
