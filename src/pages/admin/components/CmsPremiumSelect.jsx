import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

function CmsPremiumSelect({
  label,
  value,
  onChange,
  options,
  ariaLabel,
  icon: Icon
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const listId = useId()
  const labelId = useId()
  const selected = options.find((option) => option.value === value) || options[0]
  const isFiltered = value != null && value !== 'all'

  useEffect(() => {
    if (!open) return undefined

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div
      ref={rootRef}
      className={`cms-premium-select${open ? ' cms-premium-select--open' : ''}${
        isFiltered ? ' cms-premium-select--active' : ''
      }`}
    >
      {label ? (
        <span className="cms-filter-block__label" id={labelId}>
          {label}
        </span>
      ) : null}

      <button
        type="button"
        className="cms-premium-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={label ? labelId : undefined}
        aria-label={ariaLabel}
        onClick={() => setOpen((prev) => !prev)}
      >
        {Icon ? (
          <span className="cms-premium-select__icon" aria-hidden="true">
            <Icon size={15} strokeWidth={2.25} />
          </span>
        ) : null}
        <span className="cms-premium-select__value">{selected?.label || 'Select…'}</span>
        <span className="cms-premium-select__chevron" aria-hidden="true">
          <ChevronDown size={16} strokeWidth={2.4} />
        </span>
      </button>

      {open ? (
        <div className="cms-premium-select__menu" role="presentation">
          <div className="cms-premium-select__menu-glow" aria-hidden="true" />
          <ul id={listId} className="cms-premium-select__list" role="listbox" aria-label={ariaLabel}>
            {options.map((option) => {
              const active = option.value === value
              return (
                <li key={option.value} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={`cms-premium-select__option${
                      active ? ' cms-premium-select__option--active' : ''
                    }`}
                    onClick={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                  >
                    <span className="cms-premium-select__option-label">{option.label}</span>
                    {active ? (
                      <Check className="cms-premium-select__check" size={15} strokeWidth={2.6} aria-hidden />
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

export default CmsPremiumSelect
