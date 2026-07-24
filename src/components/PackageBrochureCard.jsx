import { useState } from 'react'
import { Download, FileText, Loader2 } from 'lucide-react'
import { downloadPackageBrochure } from '../utils/packageBrochure'
import './PackageBrochureCard.css'

function PackageBrochureCard({ pkg, title, priceLabel, className = '' }) {
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
      setError('Could not create the PDF. Please try again.')
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
          <h3>Download brochure</h3>
          <p>Full package PDF for your PC — cover, hotels, program &amp; flights</p>
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
              Preparing PDF
              {progress?.total ? ` (${progress.current}/${progress.total})` : '…'}
            </span>
          </>
        ) : (
          <>
            <Download size={16} aria-hidden="true" />
            <span>Download PDF brochure</span>
          </>
        )}
      </button>

      {error ? (
        <p className="package-brochure-card__error" role="alert">
          {error}
        </p>
      ) : (
        <p className="package-brochure-card__hint">
          Pages are split by section so hotels, itinerary and flights stay readable when printed or saved.
        </p>
      )}
    </div>
  )
}

export default PackageBrochureCard
