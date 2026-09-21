// Hotel inventory & tariffs for package 377 (ΜΑΓΙΚΑ ΧΡΙΣΤΟΥΓΕΝΝΑ ΣΕ ΒΑΡΣΟΒΙΑ & ΚΡΑΚΟΒΙΑ) — 6 Days Christmas package.
const IMG = {
  fourStarKrakowWarsaw: '/images/christmas-packages/waw-krakow/warsaw-krakow-hotel.webp'
}

export const warsawKrakowChristmasPackage377Hotels = [
  {
    name: '4* Hotels Krakow / Warsaw',
    stars: 4,
    roomType: 'Standard Room',
    image: IMG.fourStarKrakowWarsaw,
    location: 'Krakow / Warsaw, Poland',
    boardBasis: 'Bed & Breakfast',
    prices: { 
      double: 995, 
      single: 1229, 
      child1: 939
    },
    packagePrice: 1990,
    departureDate: '23/12',
    nights: 5
  }
]
