import { useEffect, useMemo, useState } from 'react'
import {
  Building2,
  ContactRound,
  Globe,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Plane,
  Plus,
  Search,
  Ship,
  Shield,
  Sparkles,
  Trash2,
  Umbrella,
  Users
} from 'lucide-react'
import AdminLayout from './components/AdminLayout'
import ComposeEmailActions from './components/ComposeEmailActions'
import CorporateContactFormModal from './components/CorporateContactFormModal'
import {
  createCorporateServiceContact,
  deleteCorporateServiceContact,
  fetchCorporateServiceContacts,
  updateCorporateServiceContact
} from './api/corporateContactsApi'
import { CORPORATE_SERVICE_CATEGORIES } from './constants'
import './Leads.css'

const CATEGORY_META = {
  'DMC & Destination': { icon: MapPin, tone: 'gold' },
  'Hotel & Resort': { icon: Building2, tone: 'navy' },
  'Airline & Flights': { icon: Plane, tone: 'sky' },
  'Transfer & Transport': { icon: Globe, tone: 'purple' },
  Insurance: { icon: Shield, tone: 'green' },
  'Cruise & Ferry': { icon: Ship, tone: 'teal' },
  'Excursion & Activity': { icon: Umbrella, tone: 'orange' },
  'Corporate Client': { icon: Users, tone: 'red' },
  'Government & Embassy': { icon: Landmark, tone: 'slate' },
  Other: { icon: Sparkles, tone: 'gray' }
}

function statusBadgeClass(status) {
  const key = (status || 'Active').toLowerCase().replace(/\s+/g, '_')
  return `crm-corp-status crm-corp-status--${key}`
}

function categoryBadgeClass(category) {
  const key = (category || 'other').toLowerCase().replace(/[^a-z0-9]+/g, '_')
  return `crm-svc-cat crm-svc-cat--${key}`
}

function contactInitials(contact) {
  const name = (contact.contact_name || contact.organization || '?').trim()
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function ContactAvatar({ contact, size = 'md' }) {
  const meta = CATEGORY_META[contact.category] || CATEGORY_META.Other
  const Icon = meta.icon
  return (
    <span className={`crm-svc-avatar crm-svc-avatar--${size} crm-svc-avatar--${meta.tone}`} aria-hidden="true">
      <span className="crm-svc-avatar__letters">{contactInitials(contact)}</span>
      <span className="crm-svc-avatar__badge">
        <Icon size={10} strokeWidth={2.5} />
      </span>
    </span>
  )
}

function CorpContactsHero({ contacts, counts, filter, onFilter, onAdd, onOpenContact, onDelete }) {
  const activeCount = contacts.filter((c) => c.status === 'Active').length
  const preview = contacts.slice(0, 6)

  return (
    <section className="crm-svc-hero">
      <div className="crm-svc-hero__header">
        <div className="crm-svc-hero__intro">
          <span className="crm-svc-hero__logo" aria-hidden="true">
            <ContactRound size={26} strokeWidth={1.75} />
          </span>
          <div>
            <p className="crm-svc-hero__eyebrow">Team directory</p>
            <h2 className="crm-svc-hero__title">Corporate Services List of Contacts</h2>
            <p className="crm-svc-hero__text">
              DMCs, hotels, airlines, transfers, and supplier contacts — organised for quick team access.
            </p>
          </div>
        </div>

        <div className="crm-svc-hero__metrics">
          <article className="crm-svc-metric">
            <ContactRound size={18} aria-hidden />
            <div>
              <strong>{counts.all || 0}</strong>
              <span>Total contacts</span>
            </div>
          </article>
          <article className="crm-svc-metric crm-svc-metric--active">
            <Users size={18} aria-hidden />
            <div>
              <strong>{activeCount}</strong>
              <span>Active</span>
            </div>
          </article>
          <article className="crm-svc-metric crm-svc-metric--cats">
            <Sparkles size={18} aria-hidden />
            <div>
              <strong>{CORPORATE_SERVICE_CATEGORIES.filter((c) => (counts[c] || 0) > 0).length}</strong>
              <span>Categories used</span>
            </div>
          </article>
        </div>
      </div>

      <div className="crm-svc-hero__body">
        <div className="crm-svc-hero__categories">
          <p className="crm-svc-hero__section-label">Browse by service</p>
          <div className="crm-svc-category-grid">
            <button
              type="button"
              className={`crm-svc-category${filter === 'all' ? ' crm-svc-category--active' : ''}`}
              onClick={() => onFilter('all')}
            >
              <span className="crm-svc-category__icon crm-svc-category__icon--all">
                <ContactRound size={16} />
              </span>
              <span className="crm-svc-category__copy">
                <strong>All contacts</strong>
                <span>{counts.all || 0} entries</span>
              </span>
            </button>
            {CORPORATE_SERVICE_CATEGORIES.map((cat) => {
              const meta = CATEGORY_META[cat] || CATEGORY_META.Other
              const Icon = meta.icon
              return (
                <button
                  key={cat}
                  type="button"
                  className={`crm-svc-category crm-svc-category--${meta.tone}${filter === cat ? ' crm-svc-category--active' : ''}`}
                  onClick={() => onFilter(cat)}
                >
                  <span className={`crm-svc-category__icon crm-svc-category__icon--${meta.tone}`}>
                    <Icon size={16} />
                  </span>
                  <span className="crm-svc-category__copy">
                    <strong>{cat}</strong>
                    <span>{counts[cat] || 0} contacts</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <aside className="crm-svc-hero__preview">
          <div className="crm-svc-hero__preview-head">
            <h3>Team quick access</h3>
            <button type="button" className="crm-btn crm-btn-primary crm-btn--sm crm-btn--svc-add" onClick={onAdd}>
              <Plus size={14} aria-hidden />
              Add
            </button>
          </div>

          {preview.length === 0 ? (
            <div className="crm-svc-hero__preview-empty">
              <div className="crm-svc-avatar-stack" aria-hidden="true">
                {['DMC', 'HTL', 'AIR', 'TRF'].map((label, i) => (
                  <span key={label} className={`crm-svc-avatar crm-svc-avatar--sm crm-svc-avatar--placeholder-${i + 1}`}>
                    {label.slice(0, 2)}
                  </span>
                ))}
              </div>
              <p>No contacts yet</p>
              <span>Add your first supplier or DMC contact to populate the directory.</span>
              <button type="button" className="crm-btn crm-btn-primary crm-btn--svc-add" onClick={onAdd}>
                <Plus size={14} aria-hidden />
                Add first contact
              </button>
            </div>
          ) : (
            <ul className="crm-svc-preview-list">
              {preview.map((contact) => (
                <li key={contact.id} className="crm-svc-preview-row">
                  <button type="button" className="crm-svc-preview-item" onClick={() => onOpenContact(contact)}>
                    <ContactAvatar contact={contact} size="sm" />
                    <span className="crm-svc-preview-item__copy">
                      <strong>{contact.contact_name || contact.organization}</strong>
                      <span>{contact.organization}</span>
                    </span>
                    <span className={categoryBadgeClass(contact.category)}>{contact.category.split(' ')[0]}</span>
                  </button>
                  <button
                    type="button"
                    className="crm-svc-preview-item__delete"
                    onClick={() => onDelete(contact)}
                    aria-label={`Delete ${contact.organization}`}
                    title="Delete contact"
                  >
                    <Trash2 size={14} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </section>
  )
}

function CorporateServiceContacts() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [view, setView] = useState('list')

  const load = async () => {
    setLoading(true)
    setError('')
    const { data, error: queryError } = await fetchCorporateServiceContacts()
    if (queryError) {
      setError(queryError.message)
      setContacts([])
    } else {
      setContacts(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const counts = useMemo(() => {
    const map = { all: contacts.length }
    CORPORATE_SERVICE_CATEGORIES.forEach((cat) => {
      map[cat] = contacts.filter((c) => c.category === cat).length
    })
    return map
  }, [contacts])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return contacts.filter((contact) => {
      if (filter !== 'all' && contact.category !== filter) return false
      if (!term) return true
      return [
        contact.organization,
        contact.contact_name,
        contact.job_title,
        contact.category,
        contact.email,
        contact.phone,
        contact.mobile,
        contact.city,
        contact.country,
        contact.notes
      ].some((value) => (value || '').toLowerCase().includes(term))
    })
  }, [contacts, search, filter])

  const openCreate = () => {
    setSaveError('')
    setSelected(null)
    setModalOpen(true)
  }

  const openEdit = (contact) => {
    setSaveError('')
    setSelected(contact)
    setModalOpen(true)
  }

  const handleSave = async (form) => {
    if (!form.organization?.trim()) {
      setSaveError('Organization name is required.')
      return
    }

    setSaving(true)
    setSaveError('')

    const { data, error: saveErr } = selected?.id
      ? await updateCorporateServiceContact(selected.id, form)
      : await createCorporateServiceContact(form)

    if (saveErr) {
      setSaveError(saveErr.message)
      setSaving(false)
      return
    }

    if (selected?.id) {
      setContacts((prev) => prev.map((item) => (item.id === selected.id ? data : item)))
    } else {
      setContacts((prev) => [...prev, data].sort((a, b) => a.organization.localeCompare(b.organization)))
    }

    setSaving(false)
    setModalOpen(false)
    setSelected(null)
  }

  const handleDelete = async (contact) => {
    if (!window.confirm(`Remove "${contact.organization}" from the directory?`)) return
    const { error: deleteError } = await deleteCorporateServiceContact(contact.id)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    setContacts((prev) => prev.filter((item) => item.id !== contact.id))
    if (selected?.id === contact.id) {
      setModalOpen(false)
      setSelected(null)
    }
  }

  return (
    <AdminLayout
      title="Corporate Services List of Contacts"
      subtitle="Directory of suppliers, DMCs, hotels, and corporate services contacts — easy for the team to find."
      actions={
        <>
          <button type="button" className="crm-btn crm-btn-ghost crm-btn--dark" onClick={load}>
            Refresh
          </button>
          <button type="button" className="crm-btn crm-btn-primary crm-btn--corporate-header" onClick={openCreate}>
            <Plus size={16} aria-hidden />
            Add contact
          </button>
        </>
      }
    >
      <section className="crm-workspace crm-workspace--corporate crm-workspace--corp-contacts">
        <CorpContactsHero
          contacts={contacts}
          counts={counts}
          filter={filter}
          onFilter={setFilter}
          onAdd={openCreate}
          onOpenContact={openEdit}
          onDelete={handleDelete}
        />

        <div className="crm-svc-toolbar">
          <label className="crm-filter-field crm-filter-field--search crm-filter-field--search-icon crm-svc-search">
            <Search size={16} aria-hidden />
            <input
              type="search"
              placeholder="Search name, company, phone, email, category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search contacts"
            />
          </label>
          <div className="crm-svc-toolbar__meta">
            <span>{filtered.length} contact{filtered.length === 1 ? '' : 's'}</span>
            <div className="crm-corp-view-toggle">
              <button
                type="button"
                className={view === 'list' ? 'crm-corp-view-toggle__btn--active' : ''}
                onClick={() => setView('list')}
              >
                List
              </button>
              <button
                type="button"
                className={view === 'cards' ? 'crm-corp-view-toggle__btn--active' : ''}
                onClick={() => setView('cards')}
              >
                Cards
              </button>
              <button
                type="button"
                className={view === 'table' ? 'crm-corp-view-toggle__btn--active' : ''}
                onClick={() => setView('table')}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {loading ? <div className="crm-state">Loading contacts…</div> : null}
        {!loading && error ? <div className="crm-state crm-state-error">{error}</div> : null}

        {!loading && !error && filtered.length === 0 ? (
          <div className="crm-svc-empty">
            <div className="crm-svc-avatar-stack crm-svc-avatar-stack--lg" aria-hidden="true">
              {['DM', 'HT', 'AL', 'TR', 'IN', 'CR'].map((label, i) => (
                <span key={label} className={`crm-svc-avatar crm-svc-avatar--md crm-svc-avatar--placeholder-${(i % 4) + 1}`}>
                  {label}
                </span>
              ))}
            </div>
            <h3>Build your corporate services directory</h3>
            <p>Add DMCs, hotels, airlines, and supplier contacts so the whole team can find them instantly.</p>
            <button type="button" className="crm-btn crm-btn-primary crm-btn--corporate-header" onClick={openCreate}>
              <Plus size={16} aria-hidden />
              Add first contact
            </button>
          </div>
        ) : null}

        {!loading && !error && filtered.length > 0 && view === 'list' ? (
          <ul className="crm-svc-list">
            {filtered.map((contact) => {
              const meta = CATEGORY_META[contact.category] || CATEGORY_META.Other
              const CatIcon = meta.icon
              return (
                <li key={contact.id} className="crm-svc-list__item">
                  <ContactAvatar contact={contact} size="lg" />
                  <div className="crm-svc-list__main">
                    <div className="crm-svc-list__title-row">
                      <strong>{contact.contact_name || contact.organization}</strong>
                      <span className={statusBadgeClass(contact.status)}>{contact.status || 'Active'}</span>
                    </div>
                    <p className="crm-svc-list__org">{contact.organization}</p>
                    {contact.job_title ? <p className="crm-svc-list__role">{contact.job_title}</p> : null}
                    <div className="crm-svc-list__tags">
                      <span className={`crm-svc-list__cat crm-svc-list__cat--${meta.tone}`}>
                        <CatIcon size={12} aria-hidden />
                        {contact.category}
                      </span>
                      {[contact.city, contact.country].filter(Boolean).length ? (
                        <span className="crm-svc-list__loc">
                          <MapPin size={12} aria-hidden />
                          {[contact.city, contact.country].filter(Boolean).join(', ')}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="crm-svc-list__contact">
                    {contact.email ? (
                      <a href={`mailto:${contact.email}`} className="crm-svc-list__chip">
                        <Mail size={14} aria-hidden />
                        {contact.email}
                      </a>
                    ) : null}
                    {contact.phone || contact.mobile ? (
                      <a href={`tel:${contact.phone || contact.mobile}`} className="crm-svc-list__chip">
                        <Phone size={14} aria-hidden />
                        {contact.phone || contact.mobile}
                      </a>
                    ) : null}
                  </div>
                  <div className="crm-svc-list__actions">
                    <ComposeEmailActions
                      to={contact.email}
                      recipientName={contact.contact_name}
                      companyName={contact.organization}
                      variant="compact"
                    />
                    <button type="button" className="crm-link-btn" onClick={() => openEdit(contact)}>
                      Edit
                    </button>
                    <button type="button" className="crm-btn crm-btn-danger crm-btn--small" onClick={() => handleDelete(contact)}>
                      Delete
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : null}

        {!loading && !error && filtered.length > 0 && view === 'cards' ? (
          <div className="crm-corp-grid">
            {filtered.map((contact) => (
              <article key={contact.id} className="crm-corp-card crm-corp-card--contact">
                <div className="crm-corp-card__head">
                  <ContactAvatar contact={contact} size="md" />
                  <div className="crm-corp-card__title-wrap">
                    <h3 className="crm-corp-card__name">{contact.organization}</h3>
                    <p className="crm-corp-card__industry">
                      {contact.contact_name || 'No named contact'}
                      {contact.job_title ? ` · ${contact.job_title}` : ''}
                    </p>
                  </div>
                  <span className={categoryBadgeClass(contact.category)}>{contact.category}</span>
                </div>
                <dl className="crm-corp-card__details">
                  <div>
                    <dt><Mail size={13} aria-hidden /> Email</dt>
                    <dd>{contact.email || '—'}</dd>
                  </div>
                  <div>
                    <dt><Phone size={13} aria-hidden /> Phone</dt>
                    <dd>{contact.phone || contact.mobile || '—'}</dd>
                  </div>
                  <div>
                    <dt><MapPin size={13} aria-hidden /> Location</dt>
                    <dd>{[contact.city, contact.country].filter(Boolean).join(', ') || '—'}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd><span className={statusBadgeClass(contact.status)}>{contact.status || 'Active'}</span></dd>
                  </div>
                </dl>
                {contact.notes ? <p className="crm-corp-card__notes">{contact.notes}</p> : null}
                <div className="crm-corp-card__actions">
                  <ComposeEmailActions
                    to={contact.email}
                    recipientName={contact.contact_name}
                    companyName={contact.organization}
                    variant="compact"
                  />
                  {contact.phone ? (
                    <a href={`tel:${contact.phone}`} className="crm-link-btn">Call</a>
                  ) : null}
                  <button type="button" className="crm-link-btn" onClick={() => openEdit(contact)}>Edit</button>
                  <button type="button" className="crm-btn crm-btn-danger" onClick={() => handleDelete(contact)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {!loading && !error && filtered.length > 0 && view === 'table' ? (
          <div className="crm-table-wrap">
            <table className="crm-table crm-table--corporate">
              <thead>
                <tr>
                  <th>Contact</th>
                  <th>Organization</th>
                  <th>Category</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((contact) => (
                  <tr key={contact.id}>
                    <td>
                      <div className="crm-svc-table-contact">
                        <ContactAvatar contact={contact} size="sm" />
                        <div>
                          <strong>{contact.contact_name || '—'}</strong>
                          {contact.job_title ? <span className="crm-fin-supplier">{contact.job_title}</span> : null}
                        </div>
                      </div>
                    </td>
                    <td>{contact.organization}</td>
                    <td><span className={categoryBadgeClass(contact.category)}>{contact.category}</span></td>
                    <td>{contact.email || '—'}</td>
                    <td>{contact.phone || contact.mobile || '—'}</td>
                    <td>{[contact.city, contact.country].filter(Boolean).join(', ') || '—'}</td>
                    <td>
                      <div className="crm-action-buttons">
                        <ComposeEmailActions
                          to={contact.email}
                          recipientName={contact.contact_name}
                          companyName={contact.organization}
                          variant="compact"
                        />
                        <button type="button" className="crm-link-btn" onClick={() => openEdit(contact)}>Edit</button>
                        <button type="button" className="crm-btn crm-btn-danger" onClick={() => handleDelete(contact)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <CorporateContactFormModal
        open={modalOpen}
        initialContact={selected}
        onClose={() => {
          setModalOpen(false)
          setSelected(null)
        }}
        onSave={handleSave}
        onDelete={selected?.id ? () => handleDelete(selected) : undefined}
        saving={saving}
        saveError={saveError}
      />
    </AdminLayout>
  )
}

export default CorporateServiceContacts
