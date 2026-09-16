// Hotel inventory & tariffs for package 375 (ΠΡΩΤΟΧΡΟΝΙΑ ΣΤΗ ΧΑΪΔΕΛΒΕΡΓΗ – ΣΤΡΑΣΒΟΥΡΓΟ & ΚΟΛΜΑΡ) — 5 Days New Year package.
const IMG = {
  fourStarHeidelberg: '/images/christmas-packages/heidelberg/4-star-hotel-heidelberg.webp'
}

export const heidelbergStrasbourgChristmasPackage375Hotels = [
  {
    name: '4* Hotel - Heidelberg',
    stars: 4,
    roomType: 'Standard Room',
    image: IMG.fourStarHeidelberg,
    location: 'Heidelberg, Germany',
    boardBasis: 'Bed and Breakfast',
    prices: { 
      double: 995, 
      single: 1229, 
      child1: 895
    },
    packagePrice: 1990,
    departureDate: '29/12',
    nights: 4
  }
]
