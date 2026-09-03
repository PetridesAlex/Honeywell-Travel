import { createElement, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Search } from 'lucide-react'
import { getSportIcon } from '../../utils/sportsArt'

function SportsSearch({
  value,
  onChange,
  categories = [],
  placeholder = 'Search teams, events, competitions or destinations…',
  plain = false,
  id = 'sports-search',
}) {
  const navigate = useNavigate()
  const rootRef = useRef(null)
  const inputRef = useRef(null)
  const panelRef = useRef(null)
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [panelStyle, setPanelStyle] = useState(null)

  const query = String(value || '').trim().toLowerCase()

  const filtered = useMemo(() => {
    if (!query) return categories
    return categories.filter((item) => {
      const hay = [item.label, item.blurb, item.meta, item.sportType]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(query)
    })
  }, [categories, query])

  const groups = useMemo(() => {
    const map = new Map()
    for (const item of filtered) {
      const key = item.group || 'Categories'
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(item)
    }
    return [...map.entries()]
  }, [filtered])

  const flatItems = filtered
  const showPanel = open && categories.length > 0
  const highlightIndex =
    flatItems.length === 0 ? 0 : Math.min(activeIndex, flatItems.length - 1)

  const updatePanelPosition = () => {
    const el = inputRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const gutter = 8
    const maxHeight = Math.min(420, Math.max(220, window.innerHeight - rect.bottom - gutter - 12))
    setPanelStyle({
      position: 'fixed',
      top: Math.round(rect.bottom) - 1,
      left: Math.round(rect.left),
      width: Math.round(rect.width),
      maxHeight,
      zIndex: 10050,
    })
  }

  useLayoutEffect(() => {
    if (!showPanel) return undefined

    const frame = requestAnimationFrame(() => {
      updatePanelPosition()
    })
    const onReposition = () => updatePanelPosition()
    window.addEventListener('resize', onReposition)
    window.addEventListener('scroll', onReposition, true)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onReposition)
      window.removeEventListener('scroll', onReposition, true)
    }
  }, [showPanel, categories.length, value])

  useEffect(() => {
    if (!open) return undefined

    const onPointerDown = (event) => {
      const target = event.target
      if (rootRef.current?.contains(target)) return
      if (panelRef.current?.contains(target)) return
      setOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const openPanel = () => {
    setActiveIndex(0)
    setOpen(true)
  }

  const selectCategory = (item) => {
    if (!item?.href) return
    setOpen(false)
    onChange?.('')
    navigate(item.href)
  }

  const onInputChange = (event) => {
    setActiveIndex(0)
    onChange?.(event.target.value)
  }

  const onKeyDown = (event) => {
    if (!open && (event.key === 'ArrowDown' || event.key === 'Enter')) {
      if (categories.length) openPanel()
      return
    }
    if (!open || !flatItems.length) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((i) => (i + 1) % flatItems.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((i) => (i - 1 + flatItems.length) % flatItems.length)
    } else if (event.key === 'Enter') {
      const item = flatItems[highlightIndex]
      if (item) {
        event.preventDefault()
        selectCategory(item)
      }
    }
  }

  const panel = showPanel && panelStyle
    ? createPortal(
      <div
        ref={panelRef}
        className="st-search-panel st-search-panel--portal"
        id={listId}
        role="listbox"
        aria-label="Browse categories"
        style={panelStyle}
      >
        {flatItems.length === 0 ? (
          <p className="st-search-panel__empty">No matching categories. Keep typing to search events.</p>
        ) : (
          groups.map(([groupName, items]) => (
            <div key={groupName} className="st-search-panel__group">
              <p className="st-search-panel__label">{groupName}</p>
              <ul className="st-search-panel__list">
                {items.map((item) => {
                  const flatIdx = flatItems.indexOf(item)
                  const active = flatIdx === highlightIndex
                  const Icon = getSportIcon(item.sportType || item.id)
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        className={`st-search-panel__option${active ? ' is-active' : ''}`}
                        onMouseEnter={() => setActiveIndex(flatIdx)}
                        onClick={() => selectCategory(item)}
                      >
                        <span className="st-search-panel__option-icon">
                          {createElement(Icon, { size: 17, strokeWidth: 2.1, 'aria-hidden': true })}
                        </span>
                        <span className="st-search-panel__option-text">
                          <span className="st-search-panel__option-title">{item.label}</span>
                          {item.blurb || item.meta ? (
                            <span className="st-search-panel__option-meta">
                              {item.blurb || item.meta}
                            </span>
                          ) : null}
                        </span>
                        <ChevronRight
                          className="st-search-panel__option-chevron"
                          size={16}
                          strokeWidth={2}
                          aria-hidden
                        />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))
        )}
        <p className="st-search-panel__hint">Select a category or keep typing to filter events</p>
      </div>,
      document.body,
    )
    : null

  return (
    <div
      ref={rootRef}
      className={`st-search${plain ? ' st-search--plain' : ''}${showPanel ? ' is-open' : ''}`}
    >
      <Search className="st-search__icon" size={18} strokeWidth={2.2} aria-hidden />
      <label htmlFor={id} className="visually-hidden">
        Search sporting events
      </label>
      <input
        ref={inputRef}
        id={id}
        className="st-search__input"
        type="search"
        value={value}
        onChange={onInputChange}
        onFocus={openPanel}
        onClick={openPanel}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={listId}
        aria-autocomplete="list"
      />
      {panel}
    </div>
  )
}

export default SportsSearch
