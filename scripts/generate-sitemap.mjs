/**
 * Writes public/sitemap.xml for Google Search Console.
 * Featured pages are listed first and given the highest priority.
 */
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { blogPosts } from '../src/data/blog.js'
import { getDestinationSummaries } from '../src/data/flightTickets.js'
import { getVisiblePackages } from '../src/data/packages.js'

const ORIGIN = 'https://www.honeywelltravel.com.cy'
const LASTMOD = new Date().toISOString().slice(0, 10)
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../public/sitemap.xml')

/** Category name → the slug Packages.jsx actually understands. Cruises use /cruises. */
const CATEGORY_SLUGS = {
  'Summer Packages': 'summer-packages',
  'Summer Packages to Greece': 'summer-packages-to-greece',
  'Autumn Packages': 'autumn-packages',
  'Winter Packages': 'winter-packages',
  'Spring Packages': 'spring-packages',
  'Christmas Packages': 'christmas-packages',
  'Christmas Markets': 'christmas-markets',
  'Easter Packages': 'easter-packages',
  'Green Monday Packages': 'green-monday-packages',
  'Green Monday': 'green-monday',
  'City Breaks': 'city-breaks',
  'Exotic Packages': 'exotic-packages',
  'Mary Special Trips': 'mary-special-trips',
  'Mary Specials Trips': 'mary-special-trips',
  'Group Travel': 'group-travel',
  'Music & Sports': 'music-and-sports',
  'SPORTS EVENTS & CONCERTS': 'sports-events-and-concerts',
  'Sports Events & Concerts': 'sports-events-and-concerts',
  'Ski Packages': 'ski-packages',
}

const FEATURED = [
  ['/', 'weekly', '1.0'],
  ['/our-services', 'weekly', '0.9'],
  ['/travel-packages', 'daily', '0.9'],
  ['/build-your-trip', 'weekly', '0.9'],
  ['/honeymoon-trips', 'weekly', '0.9'],
  ['/dmc-cyprus', 'weekly', '0.9'],
  ['/cruises', 'weekly', '0.9'],
  ['/contact', 'weekly', '0.9'],
]

const SUPPORTING = [
  ['/packages', 'daily', '0.7'],
  ['/holiday-types', 'weekly', '0.7'],
  ['/honeymoon-calendar', 'monthly', '0.6'],
  ['/gift-vouchers', 'monthly', '0.6'],
  ['/book-online', 'weekly', '0.6'],
  ['/flight-tickets', 'weekly', '0.6'],
  ['/last-minute-flights/paris', 'weekly', '0.5'],
  ['/ourworld', 'monthly', '0.6'],
  ['/our-blog', 'weekly', '0.6'],
  ['/honeywell-travel-gallery', 'monthly', '0.5'],
  ['/terms-and-conditions', 'yearly', '0.3'],
]

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function locFor(path) {
  if (!path.startsWith('/')) throw new Error(`Sitemap path must start with /: ${path}`)
  return path === '/' ? `${ORIGIN}/` : `${ORIGIN}${path}`
}

const urls = []
const seen = new Set()

function add(path, changefreq, priority) {
  const loc = locFor(path)
  if (seen.has(loc)) return
  seen.add(loc)
  urls.push({ loc, changefreq, priority })
}

for (const [path, changefreq, priority] of FEATURED) add(path, changefreq, priority)
for (const [path, changefreq, priority] of SUPPORTING) add(path, changefreq, priority)

const packages = getVisiblePackages()
const categories = [...new Set(packages.map((pkg) => pkg.category).filter(Boolean))].sort()

for (const category of categories) {
  const slug = CATEGORY_SLUGS[category]
  if (!slug) continue
  add(`/tour-category/${slug}`, 'weekly', '0.7')
}

for (const pkg of [...packages].sort((a, b) => Number(a.id) - Number(b.id))) {
  if (pkg?.id == null) continue
  add(`/packages/${pkg.id}/details`, 'weekly', '0.6')
}

for (const destination of getDestinationSummaries()) {
  if (!destination?.destinationSlug) continue
  add(`/flight-tickets/${destination.destinationSlug}`, 'weekly', '0.5')
}

for (const post of blogPosts) {
  if (!post?.slug) continue
  add(`/our-blog/${post.slug}`, 'monthly', '0.5')
}

const body = urls
  .map(
    (url) => `  <url>
    <loc>${xmlEscape(url.loc)}</loc>
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`

writeFileSync(OUT, xml, 'utf8')
console.log(`Wrote ${urls.length} URLs to ${OUT}`)
