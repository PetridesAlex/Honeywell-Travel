import { lazy, Suspense } from 'react'

const BlackHole = lazy(() => import('./BlackHole'))

const PRESETS = {
  page: {
    className: 'cms-fx__blackhole cms-fx__blackhole--page',
    speed: 0.55,
    zoom: 1.65,
    particleCount: 12,
    orbSize: 0.85,
    glow: 0.07,
    contrast: 3.1,
    mirrorSplits: 2,
    warpEnabled: true,
    distanceFade: 0.32,
    colorShiftR: -5,
    colorShiftG: -2,
    colorShiftB: -8,
    colorSpeed: 0.18,
    backgroundColor: '#050608',
    opacity: 1
  },
  sidebar: {
    className: 'cms-fx__blackhole cms-fx__blackhole--sidebar',
    speed: 0.7,
    zoom: 2.4,
    particleCount: 11,
    orbSize: 0.62,
    glow: 0.09,
    contrast: 3.2,
    mirrorSplits: 3,
    warpEnabled: true,
    distanceFade: 0.4,
    colorShiftR: -4,
    colorShiftG: -1,
    colorShiftB: -7,
    colorSpeed: 0.24,
    backgroundColor: '#06101c',
    opacity: 1
  },
  header: {
    className: 'cms-fx__blackhole cms-fx__blackhole--header',
    speed: 0.85,
    zoom: 2.15,
    particleCount: 16,
    orbSize: 0.7,
    glow: 0.1,
    contrast: 3.4,
    mirrorSplits: 3,
    warpEnabled: true,
    distanceFade: 0.42,
    colorShiftR: -4,
    colorShiftG: -1,
    colorShiftB: -7,
    colorSpeed: 0.28,
    backgroundColor: '#061522',
    opacity: 1
  }
}

function CmsBlackHoleFx({ variant = 'page', className = '' }) {
  const preset = PRESETS[variant] || PRESETS.page

  return (
    <div className={`cms-fx cms-fx--${variant}${className ? ` ${className}` : ''}`} aria-hidden="true">
      <Suspense fallback={null}>
        <BlackHole width="100%" height="100%" {...preset} />
      </Suspense>
      <div className={`cms-fx__veil cms-fx__veil--${variant}`} />
    </div>
  )
}

export default CmsBlackHoleFx
