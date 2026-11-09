/** Hotel inventory & tariffs for package 394 (ΒΙΕΝΝΗ / ΒΟΥΔΑΠΕΣΤΗ / ΚΡΟΥΑΖΙΕΡΑ ΔΟΥΝΑΒΗ) */

const citadinesBase = {
  name: 'Citadines South Vienna 4* ή παρόμοιο',
  stars: 4,
  roomType: 'Standard Room',
  image: '/images/christmas-packages/vienna-budapest-danube/citadines-south-vienna.webp',
  location: 'Vienna, Austria',
  boardBasis: 'Bed & Breakfast',
  nights: 4,
}

const rates = {
  prices: { double: 959, single: 1179, triple: 959, child1: 809, child2: 809 },
  packagePrice: 1918,
}

export const viennaBudapestDanubePackage394Hotels = [
  { ...citadinesBase, ...rates, departureDate: '23/12' },
  { ...citadinesBase, ...rates, departureDate: '26/12' },
  { ...citadinesBase, ...rates, departureDate: '30/12' },
  { ...citadinesBase, ...rates, departureDate: '02/01/2027' },
]
