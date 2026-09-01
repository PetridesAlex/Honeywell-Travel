/** Canonical English category names used for routing / filtering. */
export const CATEGORY_KEYS = {
  'Destinations': 'destinations',
  'Autumn Packages': 'autumn-packages',
  'Exotic Packages': 'exotic-packages',
  'Christmas Packages': 'christmas-packages',
  'Music & Sports': 'music-and-sports',
  'Mary Specials Trips': 'mary-specials-trips',
  'Mary Special Trips': 'mary-special-trips',
  'Summer Packages': 'summer-packages',
  'Summer Packages to Greece': 'summer-packages-to-greece',
  'Easter Packages': 'easter-packages',
  'Winter Packages': 'winter-packages',
  'Green Monday Packages': 'green-monday-packages',
  'Green Monday': 'green-monday',
  'Cruises': 'cruises',
  'City Breaks': 'city-breaks',
  'Spring Packages': 'spring-packages',
  'Group Travel': 'group-travel',
  'SPORTS EVENTS & CONCERTS': 'sports-events-and-concerts',
  'Ski Packages': 'ski-packages',
  'Any': 'any',
  'Any Category': 'any-category',
  'Any Destination': 'any-destination',
}

export const categoryToSlug = (category) => {
  if (!category || category === 'Any') return null
  return category
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9-]/g, '')
}

export const getCategoryKey = (category) => {
  if (!category) return null
  return CATEGORY_KEYS[category] || categoryToSlug(category)
}

/** Display label for a category; slug/routing stays English internally. */
export const getCategoryLabel = (category, t) => {
  if (!category) return ''
  const key = getCategoryKey(category)
  if (key === 'any' || key === 'any-category') return t('categories.anyCategory')
  if (key === 'any-destination') return t('categories.anyDestination')
  const translated = t(`categories.${key}`, { defaultValue: '' })
  if (translated && translated !== `categories.${key}`) return translated
  return category
}

export const HOLIDAY_TYPE_CATEGORIES = [
  'Autumn Packages',
  'Exotic Packages',
  'Christmas Packages',
  'Music & Sports',
  'Mary Specials Trips',
  'Summer Packages',
  'Summer Packages to Greece',
  'Easter Packages',
  'Winter Packages',
  'Green Monday Packages',
  'Cruises',
  'City Breaks',
]

export const SEARCH_CATEGORIES = [
  { value: 'Any', icon: '🌍' },
  { value: 'Summer Packages', icon: '☀️' },
  { value: 'Summer Packages to Greece', icon: '🇬🇷' },
  { value: 'Winter Packages', icon: '❄️' },
  { value: 'Spring Packages', icon: '🌸' },
  { value: 'City Breaks', icon: '🏙️' },
  { value: 'Cruises', icon: '🚢' },
  { value: 'Exotic Packages', icon: '🌴' },
  { value: 'Christmas Packages', icon: '🎄' },
  { value: 'Easter Packages', icon: '🐰' },
  { value: 'Autumn Packages', icon: '🍂' },
  { value: 'Green Monday', icon: '🌿' },
  { value: 'Group Travel', icon: '👥' },
  { value: 'Mary Special Trips', icon: '✨' },
  { value: 'SPORTS EVENTS & CONCERTS', icon: '🎫' },
]

export const SEARCH_DESTINATIONS = [
  { value: 'Any', icon: '🌐' },
  { value: 'Greece', icon: '🇬🇷' },
  { value: 'Europe', icon: '🇪🇺' },
  { value: 'Asia', icon: '🌏' },
  { value: 'America', icon: '🇺🇸' },
  { value: 'Africa', icon: '🦁' },
  { value: 'Middle East', icon: '🏜️' },
]

const HONEYMOON_KEYS = {
  'Honeymoon Trips': 'header.honeymoonTrips',
  'Honeymoon Calendar': 'header.honeymoonCalendar',
  'Gift Voucher': 'header.giftVoucher',
}

export const getHoneymoonLabel = (item, t) => {
  const key = HONEYMOON_KEYS[item]
  if (key) return t(key)
  return item
}

export const getDestinationLabel = (destination, t) => {
  if (!destination || destination === 'Any') return t('destinations.any')
  const slug = destination.toLowerCase().replace(/\s+/g, '-')
  const translated = t(`destinations.${slug}`, { defaultValue: '' })
  if (translated && translated !== `destinations.${slug}`) return translated
  return destination
}
