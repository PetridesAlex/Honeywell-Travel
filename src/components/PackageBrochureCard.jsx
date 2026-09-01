import { useState } from 'react'
import { Download, FileText, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { downloadPackageBrochure } from '../utils/packageBrochure'
import './PackageBrochureCard.css'

function PackageBrochureCard({ pkg, title, priceLabel, className = '' }) {
  const { t } = useTranslation()
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState('')

  const handleDownload = async () => {
    if (!pkg || busy) return
    setBusy(true)
    setError('')
    setProgress({ current: 0, total: 1 })
    try {
      await downloadPackageBrochure(pkg, {
        title,
        priceLabel,
        onProgress: setProgress,
      })
    } catch (err) {
      console.error(err)
      setError(t('brochure.error'))
    } finally {
      setBusy(false)
      setProgress(null)
    }
  }

  return (
    <div className={`package-brochure-card ${className}`.trim()}>
      <div className="package-brochure-card__glow" aria-hidden="true" />
      <div className="package-brochure-card__header">
        <span className="package-brochure-card__emblem" aria-hidden="true">
          <FileText size={18} strokeWidth={1.75} />
        </span>
        <div className="package-brochure-card__heading">
          <h3>{t('brochure.title')}</h3>
          <p>{t('brochure.description')}</p>
        </div>
      </div>

      <button
        type="button"
        className="package-brochure-card__button"
        onClick={handleDownload}
        disabled={busy || !pkg}
      >
        {busy ? (
          <>
            <Loader2 className="package-brochure-card__spinner" size={16} aria-hidden="true" />
            <span>
              {t('brochure.preparing')}
              {progress?.total ? ` (${progress.current}/${progress.total})` : '…'}
            </span>
          </>
        ) : (
          <>
            <Download size={16} aria-hidden="true" />
            <span>{t('brochure.download')}</span>
          </>
        )}
      </button>

      {error ? (
        <p className="package-brochure-card__error" role="alert">
          {error}
        </p>
      ) : (
        <p className="package-brochure-card__hint">
          {t('brochure.hint')}
        </p>
      )}
    </div>
  )
}

export default PackageBrochureCard
