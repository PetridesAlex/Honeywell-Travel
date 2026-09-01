import { Navigate, useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getPackageById } from '../data/packages'
import SEO from '../components/SEO'
import './PackageDetail.css'

function PackageDetail() {
  const { id } = useParams()
  const { t } = useTranslation()
  const pkg = getPackageById(id)

  if (!pkg) {
    return (
      <div className="package-detail-page">
        <SEO
          title={`${t('packagesPage.notFoundTitle')} | Honeywell Travel`}
          description={t('packagesPage.notFoundText')}
          noindex
        />
        <div className="package-detail-container">
          <h1>{t('packagesPage.notFoundTitle')}</h1>
          <p>{t('packagesPage.notFoundText')}</p>
          <Link to="/packages" className="back-link">{t('packagesPage.backToPackages')}</Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEO
        title="Redirecting to Package Details | Honeywell Travel"
        description="Redirecting to the full package details page."
        noindex
      />
      <Navigate to={`/packages/${id}/details`} replace />
    </>
  )
}

export default PackageDetail
