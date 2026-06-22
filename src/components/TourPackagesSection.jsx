import TourCategoryPackageRow from './TourCategoryPackageRow'
import './TourPackagesSection.css'

const CATEGORY_ROWS = [
  {
    slug: 'summer-packages',
    category: 'Summer Packages',
    title: 'Summer Packages',
    description: 'Curated European and worldwide escapes for the summer season.'
  },
  {
    slug: 'summer-packages-to-greece',
    category: 'Summer Packages to Greece',
    title: 'Summer Packages to Greece',
    description: 'Island and mainland holidays across Greece, crafted for sun-filled getaways.'
  },
  {
    slug: 'exotic-packages',
    category: 'Exotic Packages',
    title: 'Exotic Packages',
    description: 'Tropical paradises and far-flung destinations for unforgettable adventures.'
  },
  {
    slug: 'cruises',
    category: 'Cruises',
    title: 'Cruises',
    description: 'Luxury sailing experiences to iconic ports and scenic coastlines.'
  },
  {
    slug: 'autumn-packages',
    category: 'Autumn Packages',
    title: 'Autumn Packages',
    description: 'Golden-season travel across Europe and beyond.'
  },
  {
    slug: 'winter-packages',
    category: 'Winter Packages',
    title: 'Winter Packages',
    description: 'Cozy winter escapes and seasonal city experiences.'
  },
  {
    slug: 'christmas-packages',
    category: 'Christmas Packages',
    title: 'Christmas Packages',
    description: 'Festive holidays and magical Christmas market itineraries.'
  },
  {
    slug: 'ski-packages',
    category: 'Ski Packages',
    title: 'Ski Packages',
    description: 'Alpine adventures at world-class ski resorts.'
  },
  {
    slug: 'music-sports',
    category: 'Music & Sports',
    title: 'Music & Sports',
    description: 'Live events, concerts, and sporting experiences abroad.'
  }
]

function TourPackagesSection() {
  return (
    <section className="tour-packages-section" aria-labelledby="tour-packages-heading">
      <div className="tour-packages-container">
        <header className="section-header">
          <h2 id="tour-packages-heading" className="section-title">
            Tour Packages
          </h2>
          <p className="section-subtitle">
            Browse by category — each collection features handpicked packages that rotate as you explore.
          </p>
        </header>

        <div className="tour-category-rows">
          {CATEGORY_ROWS.map((row) => (
            <TourCategoryPackageRow key={row.slug} {...row} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default TourPackagesSection
