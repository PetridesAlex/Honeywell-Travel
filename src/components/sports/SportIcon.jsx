/** Recognizable sport silhouettes for browse UI (not generic lucide placeholders). */

function SvgBase({ children, size = 18, className = '', ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  )
}

export function SportIconAll({ size = 18, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.9" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.55" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.55" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.9" />
    </SvgBase>
  )
}

export function SportIconSoccer({ size = 18, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 3.5 14.8 8.2 12 12.5 9.2 8.2 12 3.5Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M12 12.5 16.5 14.2 15.2 19 12 16.8 8.8 19 7.5 14.2 12 12.5Z"
        fill="currentColor"
        opacity="0.45"
      />
      <path
        d="M12 3.5 9.2 8.2 5.5 7.2 7.2 12.5 5.5 16.8 9.2 15.8 12 20.5"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.35"
      />
    </SvgBase>
  )
}

export function SportIconTennis({ size = 18, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5.5 8.5C8 12 10 15.5 12 19c2-3.5 4-7 6.5-10.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </SvgBase>
  )
}

export function SportIconRugby({ size = 18, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <ellipse cx="12" cy="12" rx="5.5" ry="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 3v18M8.2 6.5h7.6M8.2 17.5h7.6" stroke="currentColor" strokeWidth="1.2" />
    </SvgBase>
  )
}

export function SportIconFormula1({ size = 18, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <path
        d="M4 14.5h2.2l1.2-2.2h4.1l1.1 2.2H18l1.5-3.5-1.5-3H4l-1.5 3 1.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="15" r="2" stroke="currentColor" strokeWidth="1.35" />
      <circle cx="16" cy="15" r="2" stroke="currentColor" strokeWidth="1.35" />
      <path d="M10.5 12.3h3" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </SvgBase>
  )
}

export function SportIconMotogp({ size = 18, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <circle cx="7" cy="16" r="2.3" stroke="currentColor" strokeWidth="1.35" />
      <circle cx="17.5" cy="16" r="2.3" stroke="currentColor" strokeWidth="1.35" />
      <path
        d="M9 16h3.5l2-4.5 2.5-1.5 1.5 1.5-1 3H16"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M11 11.5 13.5 8.5h2.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </SvgBase>
  )
}

export function SportIconBasketball({ size = 18, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 3.5v17M3.5 12h17" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M5.2 5.8c3.2 2.8 3.2 9.6 0 12.4M18.8 5.8c-3.2 2.8-3.2 9.6 0 12.4"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </SvgBase>
  )
}

export function SportIconNfl({ size = 18, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <path
        d="M12 4c-4.8 0-7.5 3.2-7.5 8s2.7 8 7.5 8 7.5-3.2 7.5-8-2.7-8-7.5-8Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M12 4v16M8.5 7.5c2.2 1.8 4.8 1.8 7 0M8.5 16.5c2.2-1.8 4.8-1.8 7 0" stroke="currentColor" strokeWidth="1.2" />
    </SvgBase>
  )
}

export function SportIconGolf({ size = 18, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <path d="M12 4v13.5" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
      <path d="M12 4 16.5 6.5 12 8.5V4Z" fill="currentColor" opacity="0.85" />
      <path d="M8 19.5h8" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
      <circle cx="12" cy="19.5" r="1.2" fill="currentColor" />
    </SvgBase>
  )
}

export function SportIconHorseracing({ size = 18, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <path
        d="M5 17c1.5-1 3-1.2 4.5-.3l2.2 1.3c1.4.8 3 .7 4.3-.2"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path
        d="M8.5 16.5 10 12l2-2.5 2.8-.8 1.7 1.5-1.2 2.5-2.8 1.2"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <path d="M10 12 8.5 9.5 10.5 8l1.5 2" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="7.5" cy="17.2" r="1.1" fill="currentColor" />
      <circle cx="17.2" cy="17.2" r="1.1" fill="currentColor" />
    </SvgBase>
  )
}

export function SportIconBoxing({ size = 18, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <rect x="4" y="8" width="6.5" height="8" rx="2.5" stroke="currentColor" strokeWidth="1.35" />
      <rect x="13.5" y="8" width="6.5" height="8" rx="2.5" stroke="currentColor" strokeWidth="1.35" />
      <path d="M7.2 8V6.5a1.3 1.3 0 0 1 1.3-1.3h0a1.3 1.3 0 0 1 1.3 1.3V8M16.8 8V6.5a1.3 1.3 0 0 0-1.3-1.3h0a1.3 1.3 0 0 0-1.3 1.3V8" stroke="currentColor" strokeWidth="1.2" />
    </SvgBase>
  )
}

export function SportIconCricket({ size = 18, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <path d="M6 18 16 8" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
      <path d="M14.5 8.5 17 6l1 2.5-2.5 1-1.5-1.5Z" fill="currentColor" opacity="0.85" />
      <circle cx="8.5" cy="15.5" r="2.8" stroke="currentColor" strokeWidth="1.35" />
      <path d="M8.5 13.2v4.6M6.9 15.5h3.2" stroke="currentColor" strokeWidth="0.9" />
    </SvgBase>
  )
}

export function SportIconCycling({ size = 18, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <circle cx="7" cy="15.5" r="3.2" stroke="currentColor" strokeWidth="1.35" />
      <circle cx="17" cy="15.5" r="3.2" stroke="currentColor" strokeWidth="1.35" />
      <path
        d="M10 15.5h2.5l1.5-3 2-1 1.5 2.5H17M10 15.5 8.5 12l2-2.5h2l1 2.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </SvgBase>
  )
}

export function SportIconDarts({ size = 18, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.35" />
      <circle cx="12" cy="12" r="5.2" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
      <path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </SvgBase>
  )
}

export function SportIconDefault({ size = 18, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <path
        d="M7 5h10v4c0 3.5-2.2 6.6-5 8-2.8-1.4-5-4.5-5-8V5Z"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinejoin="round"
      />
      <path d="M9 20h6" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
      <path d="M12 17v3" stroke="currentColor" strokeWidth="1.45" />
    </SvgBase>
  )
}

const SPORT_ICON_MAP = {
  soccer: SportIconSoccer,
  football: SportIconSoccer,
  tennis: SportIconTennis,
  padel: SportIconTennis,
  rugby: SportIconRugby,
  formula1: SportIconFormula1,
  motorsport: SportIconFormula1,
  dtm: SportIconFormula1,
  motogp: SportIconMotogp,
  superbike: SportIconMotogp,
  basketball: SportIconBasketball,
  nba: SportIconBasketball,
  nfl: SportIconNfl,
  mlb: SportIconNfl,
  golf: SportIconGolf,
  horseracing: SportIconHorseracing,
  boxing: SportIconBoxing,
  combatsport: SportIconBoxing,
  cricket: SportIconCricket,
  cycling: SportIconCycling,
  darts: SportIconDarts,
  icehockey: SportIconDefault,
  handball: SportIconSoccer,
  rowing: SportIconDefault,
}

export function SportIcon({ sportType, size = 18, className = '' }) {
  const key = String(sportType || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
  const Icon = SPORT_ICON_MAP[key] || SportIconDefault
  return <Icon size={size} className={className} />
}

export default SportIcon
