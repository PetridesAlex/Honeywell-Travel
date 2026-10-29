function FilterAccordion({ id, title, open, onToggle, children, count = 0 }) {
  const panelId = `${id}-panel`
  const buttonId = `${id}-button`

  return (
    <div className={`tp-accordion${open ? ' is-open' : ''}`}>
      <button
        type="button"
        id={buttonId}
        className="tp-accordion__trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className="tp-accordion__title">
          {title}
          {count > 0 ? <span className="tp-accordion__count">{count}</span> : null}
        </span>
        <span className={`tp-accordion__chevron${open ? ' is-open' : ''}`} aria-hidden="true" />
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className="tp-accordion__panel"
        hidden={!open}
      >
        {children}
      </div>
    </div>
  )
}

export default FilterAccordion
