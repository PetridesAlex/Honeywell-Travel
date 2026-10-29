import PackageCard from './PackageCard'

function PackageGrid({ packages, view = 'grid' }) {
  return (
    <div className={`tp-grid tp-grid--${view}`} role="list">
      {(packages || []).map((pkg) => (
        <div key={pkg.id} className="tp-grid__item" role="listitem">
          <PackageCard pkg={pkg} view={view} />
        </div>
      ))}
    </div>
  )
}

export default PackageGrid
