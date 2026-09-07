function PremiumSectionHead({
  eyebrow,
  title,
  lead,
  badge,
  actions = null,
  spaced = false,
  className = '',
}) {
  return (
    <header
      className={`st-premium-section-head${spaced ? ' st-section-header--spaced' : ''}${className ? ` ${className}` : ''}`}
    >
      <div className="st-premium-section-head__accent" aria-hidden />
      <div className="st-premium-section-head__inner">
        {eyebrow ? <p className="st-premium-section-head__eyebrow">{eyebrow}</p> : null}
        <h2 className="st-premium-section-head__title">{title}</h2>
        {lead ? <p className="st-premium-section-head__lead">{lead}</p> : null}
      </div>
      {badge || actions ? (
        <div className="st-premium-section-head__aside">
          {badge ? <span className="st-premium-section-head__badge">{badge}</span> : null}
          {actions ? <div className="st-premium-section-head__actions">{actions}</div> : null}
        </div>
      ) : null}
    </header>
  )
}

export default PremiumSectionHead
