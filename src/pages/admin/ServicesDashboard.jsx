import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  ContactRound,
  ExternalLink,
  Layers,
  Mail,
  Phone,
  Plus,
  Save,
  Sparkles,
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
import { fetchServiceProfiles, upsertServiceProfile } from './api/serviceProfilesApi'
import { EMPTY_CORPORATE_SERVICE_CONTACT, EMPTY_SERVICE_PROFILE } from './constants'
import {
  buildServiceCategoryCounts,
  CORPORATE_SERVICE_CATEGORIES,
  getServiceCategoryMeta,
  serviceCategoryBadgeClass,
  serviceContactInitials
} from './utils/serviceCategories'
import './Leads.css'

function ContactAvatar({ contact, size = 'md' }) {
  const meta = getServiceCategoryMeta(contact.category)
  const Icon = meta.icon
  return (
    <span className={`crm-svc-avatar crm-svc-avatar--${size} crm-svc-avatar--${meta.tone}`} aria-hidden="true">
      <span className="crm-svc-avatar__letters">{serviceContactInitials(contact)}</span>
      <span className="crm-svc-avatar__badge">
        <Icon size={10} strokeWidth={2.5} />
      </span>
    </span>
  )
}

function ServicesHubHero({ counts, activeContacts, profilesSaved }) {
  return (
    <section className="crm-svc-hub-hero">
      <div className="crm-svc-hub-hero__intro">
        <span className="crm-svc-hub-hero__icon" aria-hidden="true">
          <Layers size={26} strokeWidth={1.85} />
        </span>
        <div>
          <p className="crm-svc-hub-hero__eyebrow">Supplier operations</p>
          <h2 className="crm-svc-hub-hero__title">Services Hub</h2>
          <p className="crm-svc-hub-hero__text">
            Browse every service category, save primary supplier details, and manage contacts in one organised workspace.
          </p>
        </div>
      </div>

      <div className="crm-svc-hub-hero__metrics">
        <article className="crm-svc-metric">
          <Layers size={18} aria-hidden />
          <div>
            <strong>{CORPORATE_SERVICE_CATEGORIES.length}</strong>
            <span>Service categories</span>
          </div>
        </article>
        <article className="crm-svc-metric crm-svc-metric--active">
          <ContactRound size={18} aria-hidden />
          <div>
            <strong>{counts.all || 0}</strong>
            <span>Total contacts</span>
          </div>
        </article>
        <article className="crm-svc-metric crm-svc-metric--cats">
          <Users size={18} aria-hidden />
          <div>
            <strong>{activeContacts}</strong>
            <span>Active suppliers</span>
          </div>
        </article>
        <article className="crm-svc-metric crm-svc-metric--saved">
          <BookOpen size={18} aria-hidden />
          <div>
            <strong>{profilesSaved}</strong>
            <span>Details saved</span>
          </div>
        </article>
      </div>
    </section>
  )
}

function profileHasSavedDetails(profile) {
  return Boolean(
    profile?.company_name || profile?.contact_name || profile?.email || profile?.phone || profile?.country
  )
}

function ServicesCategoryGrid({ counts, profiles, selectedCategory, onSelect }) {
  return (
    <section className="crm-svc-hub-grid-panel">
      <header className="crm-svc-hub-grid-panel__head">
        <div>
          <p className="crm-svc-hero__section-label">Browse by service</p>
          <h3>All service categories</h3>
        </div>
        <Link to="/admin/corporate-contacts" className="crm-btn crm-btn-ghost crm-btn--sm">
          <ExternalLink size={14} aria-hidden />
          Full contacts directory
        </Link>
      </header>

      <div className="crm-svc-hub-category-grid">
        {CORPORATE_SERVICE_CATEGORIES.map((cat) => {
          const meta = getServiceCategoryMeta(cat)
          const Icon = meta.icon
          const profile = profiles[cat]
          const hasProfile = profileHasSavedDetails(profile)

          return (
            <button
              key={cat}
              type="button"
              className={`crm-svc-hub-card crm-svc-hub-card--${meta.tone}${selectedCategory === cat ? ' crm-svc-hub-card--active' : ''}`}
              onClick={() => onSelect(cat)}
            >
              <span className="crm-svc-hub-card__accent" aria-hidden="true" />
              <span className="crm-svc-hub-card__shine" aria-hidden="true" />

              <span className="crm-svc-hub-card__top">
                <span className={`crm-svc-hub-card__icon crm-svc-hub-card__icon--${meta.tone}`}>
                  <Icon size={20} strokeWidth={2.1} />
                </span>
                <span className="crm-svc-hub-card__heading">
                  <strong>{cat}</strong>
                  <span className="crm-svc-hub-card__count">{counts[cat] || 0} contacts</span>
                </span>
                <ChevronRight className="crm-svc-hub-card__chevron" size={18} aria-hidden />
              </span>

              <p className="crm-svc-hub-card__desc">{meta.description}</p>

              <span className="crm-svc-hub-card__footer">
                {hasProfile ? <span className="crm-svc-hub-card__saved">Saved details</span> : null}
                <span className="crm-svc-hub-card__cta">Open service</span>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function ServiceCategoryDetail({
  category,
  contacts,
  profile,
  savingProfile,
  profileError,
  profileSaved,
  onBack,
  onProfileChange,
  onSaveProfile,
  onAddContact,
  onEditContact,
  onDeleteContact
}) {
  const meta = getServiceCategoryMeta(category)
  const Icon = meta.icon
  const categoryContacts = contacts.filter((c) => c.category === category)

  return (
    <section className="crm-svc-hub-detail">
      <header className="crm-svc-hub-detail__head">
        <button type="button" className="crm-btn crm-btn-ghost crm-btn--sm" onClick={onBack}>
          <ArrowLeft size={14} aria-hidden />
          All services
        </button>
        <div className="crm-svc-hub-detail__title-wrap">
          <span className={`crm-svc-category__icon crm-svc-category__icon--${meta.tone}`}>
            <Icon size={20} />
          </span>
          <div>
            <h3>{category}</h3>
            <p>{meta.description}</p>
          </div>
        </div>
        <div className="crm-svc-hub-detail__actions">
          <Link
            to="/admin/corporate-contacts"
            state={{ filter: category }}
            className="crm-btn crm-btn-ghost crm-btn--sm"
          >
            Open directory
          </Link>
          <button type="button" className="crm-btn crm-btn-primary crm-btn--sm" onClick={onAddContact}>
            <Plus size={14} aria-hidden />
            Add contact
          </button>
        </div>
      </header>

      <div className="crm-svc-hub-detail__grid">
        <article className="crm-svc-hub-profile">
          <header className="crm-svc-hub-profile__head">
            <div>
              <h4>Primary service contact</h4>
              <p>Save the main company details for this service category.</p>
            </div>
            <button
              type="button"
              className="crm-btn crm-btn-primary crm-btn--sm"
              disabled={savingProfile}
              onClick={onSaveProfile}
            >
              <Save size={14} aria-hidden />
              {savingProfile ? 'Saving…' : 'Save details'}
            </button>
          </header>

          {profileError ? <p className="crm-state crm-state-error">{profileError}</p> : null}
          {profileSaved ? <p className="crm-state crm-state-success">Service details saved.</p> : null}

          <div className="crm-svc-hub-profile__fields crm-svc-hub-profile__fields--contact">
            <label className="crm-field crm-field--full">
              <span className="crm-field__label">Company</span>
              <input
                className="crm-input"
                value={profile.company_name || ''}
                onChange={(e) => onProfileChange('company_name', e.target.value)}
                placeholder="e.g. Cyprus DMC, Hilton Nicosia"
              />
            </label>
            <label className="crm-field">
              <span className="crm-field__label">Contact name</span>
              <input
                className="crm-input"
                value={profile.contact_name || ''}
                onChange={(e) => onProfileChange('contact_name', e.target.value)}
                placeholder="Person to ask for"
              />
            </label>
            <label className="crm-field">
              <span className="crm-field__label">Country</span>
              <input
                className="crm-input"
                value={profile.country || ''}
                onChange={(e) => onProfileChange('country', e.target.value)}
                placeholder="Cyprus"
              />
            </label>
            <label className="crm-field">
              <span className="crm-field__label">Email</span>
              <input
                className="crm-input"
                type="email"
                value={profile.email || ''}
                onChange={(e) => onProfileChange('email', e.target.value)}
                placeholder="name@company.com"
              />
            </label>
            <label className="crm-field">
              <span className="crm-field__label">Phone</span>
              <input
                className="crm-input"
                type="tel"
                value={profile.phone || ''}
                onChange={(e) => onProfileChange('phone', e.target.value)}
                placeholder="+357 …"
              />
            </label>
          </div>
        </article>

        <aside className="crm-svc-hub-contacts">
          <header className="crm-svc-hub-contacts__head">
            <div>
              <h4>Contacts in this service</h4>
              <p>{categoryContacts.length} supplier{categoryContacts.length === 1 ? '' : 's'} saved</p>
            </div>
            <button type="button" className="crm-btn crm-btn-ghost crm-btn--sm" onClick={onAddContact}>
              <Plus size={14} aria-hidden />
              Add
            </button>
          </header>

          {categoryContacts.length === 0 ? (
            <div className="crm-svc-hub-contacts__empty">
              <Sparkles size={22} aria-hidden />
              <p>No contacts yet for {category}</p>
              <span>Add your first supplier so the team can find them quickly.</span>
              <button type="button" className="crm-btn crm-btn-primary crm-btn--sm" onClick={onAddContact}>
                <Plus size={14} aria-hidden />
                Add first contact
              </button>
            </div>
          ) : (
            <ul className="crm-svc-hub-contact-list">
              {categoryContacts.map((contact) => (
                <li key={contact.id} className="crm-svc-hub-contact-item">
                  <ContactAvatar contact={contact} size="sm" />
                  <div className="crm-svc-hub-contact-item__copy">
                    <strong>{contact.contact_name || contact.organization}</strong>
                    <span>{contact.organization}</span>
                    <span className={serviceCategoryBadgeClass(contact.category)}>{contact.category}</span>
                  </div>
                  <div className="crm-svc-hub-contact-item__actions">
                    {contact.email ? (
                      <a href={`mailto:${contact.email}`} className="crm-svc-list__chip" title={contact.email}>
                        <Mail size={14} aria-hidden />
                      </a>
                    ) : null}
                    {contact.phone || contact.mobile ? (
                      <a href={`tel:${contact.phone || contact.mobile}`} className="crm-svc-list__chip" title={contact.phone || contact.mobile}>
                        <Phone size={14} aria-hidden />
                      </a>
                    ) : null}
                    <ComposeEmailActions
                      to={contact.email}
                      recipientName={contact.contact_name}
                      companyName={contact.organization}
                      variant="compact"
                    />
                    <button type="button" className="crm-link-btn" onClick={() => onEditContact(contact)}>
                      Edit
                    </button>
                    <button type="button" className="crm-btn crm-btn-danger crm-btn--small" onClick={() => onDeleteContact(contact)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </section>
  )
}

function ServicesDashboard() {
  const [contacts, setContacts] = useState([])
  const [profiles, setProfiles] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [profileDraft, setProfileDraft] = useState(EMPTY_SERVICE_PROFILE)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSaved, setProfileSaved] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState(null)
  const [savingContact, setSavingContact] = useState(false)
  const [saveContactError, setSaveContactError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    const [contactsRes, profilesRes] = await Promise.all([
      fetchCorporateServiceContacts(),
      fetchServiceProfiles()
    ])

    if (contactsRes.error) {
      setError(contactsRes.error.message)
      setContacts([])
    } else {
      setContacts(contactsRes.data || [])
    }

    if (!profilesRes.error) {
      const map = {}
      ;(profilesRes.data || []).forEach((profile) => {
        map[profile.category] = profile
      })
      setProfiles(map)
    }

    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (!selectedCategory) {
      setProfileDraft(EMPTY_SERVICE_PROFILE)
      setProfileError('')
      setProfileSaved(false)
      return
    }

    const existing = profiles[selectedCategory]
    setProfileDraft({
      ...EMPTY_SERVICE_PROFILE,
      ...existing
    })
    setProfileError('')
    setProfileSaved(false)
  }, [selectedCategory, profiles])

  const counts = useMemo(() => buildServiceCategoryCounts(contacts), [contacts])
  const activeContacts = useMemo(() => contacts.filter((c) => c.status === 'Active').length, [contacts])
  const profilesSaved = useMemo(
    () => Object.values(profiles).filter((profile) => profileHasSavedDetails(profile)).length,
    [profiles]
  )

  const openCreateContact = () => {
    setSaveContactError('')
    setSelectedContact({
      ...EMPTY_CORPORATE_SERVICE_CONTACT,
      category: selectedCategory || EMPTY_CORPORATE_SERVICE_CONTACT.category
    })
    setModalOpen(true)
  }

  const openEditContact = (contact) => {
    setSaveContactError('')
    setSelectedContact(contact)
    setModalOpen(true)
  }

  const handleSaveContact = async (form) => {
    if (!form.organization?.trim()) {
      setSaveContactError('Organization name is required.')
      return
    }

    setSavingContact(true)
    setSaveContactError('')

    const { data, error: saveErr } = selectedContact?.id
      ? await updateCorporateServiceContact(selectedContact.id, form)
      : await createCorporateServiceContact(form)

    if (saveErr) {
      setSaveContactError(saveErr.message)
      setSavingContact(false)
      return
    }

    if (selectedContact?.id) {
      setContacts((prev) => prev.map((item) => (item.id === selectedContact.id ? data : item)))
    } else {
      setContacts((prev) => [...prev, data].sort((a, b) => a.organization.localeCompare(b.organization)))
      if (!selectedCategory) setSelectedCategory(form.category)
    }

    setSavingContact(false)
    setModalOpen(false)
    setSelectedContact(null)
  }

  const handleDeleteContact = async (contact) => {
    if (!window.confirm(`Remove "${contact.organization}" from this service?`)) return
    const { error: deleteError } = await deleteCorporateServiceContact(contact.id)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    setContacts((prev) => prev.filter((item) => item.id !== contact.id))
  }

  const handleProfileChange = (key, value) => {
    setProfileDraft((prev) => ({ ...prev, [key]: value }))
    setProfileSaved(false)
  }

  const handleSaveProfile = async () => {
    if (!selectedCategory) return
    setSavingProfile(true)
    setProfileError('')
    setProfileSaved(false)

    const { data, error: saveErr } = await upsertServiceProfile(selectedCategory, profileDraft)
    setSavingProfile(false)

    if (saveErr) {
      setProfileError(saveErr.message)
      return
    }

    setProfiles((prev) => ({ ...prev, [selectedCategory]: data }))
    setProfileSaved(true)
  }

  return (
    <AdminLayout
      title="Services Hub"
      subtitle="Organise suppliers by service type — save team notes, guidelines, and contacts in one place."
      actions={
        <>
          <button type="button" className="crm-btn crm-btn-ghost crm-btn--dark" onClick={load}>
            Refresh
          </button>
          <button type="button" className="crm-btn crm-btn-primary crm-btn--corporate-header" onClick={openCreateContact}>
            <Plus size={16} aria-hidden />
            Add contact
          </button>
        </>
      }
    >
      <section className="crm-workspace crm-workspace--corporate crm-workspace--services-hub">
        {loading ? <div className="crm-state">Loading services hub…</div> : null}
        {!loading && error ? <div className="crm-state crm-state-error">{error}</div> : null}

        {!loading ? (
          <>
            <ServicesHubHero
              counts={counts}
              activeContacts={activeContacts}
              profilesSaved={profilesSaved}
            />

            {!selectedCategory ? (
              <ServicesCategoryGrid
                counts={counts}
                profiles={profiles}
                selectedCategory={selectedCategory}
                onSelect={setSelectedCategory}
              />
            ) : (
              <ServiceCategoryDetail
                category={selectedCategory}
                contacts={contacts}
                profile={profileDraft}
                savingProfile={savingProfile}
                profileError={profileError}
                profileSaved={profileSaved}
                onBack={() => setSelectedCategory(null)}
                onProfileChange={handleProfileChange}
                onSaveProfile={handleSaveProfile}
                onAddContact={openCreateContact}
                onEditContact={openEditContact}
                onDeleteContact={handleDeleteContact}
              />
            )}
          </>
        ) : null}
      </section>

      <CorporateContactFormModal
        open={modalOpen}
        initialContact={selectedContact}
        onClose={() => {
          setModalOpen(false)
          setSelectedContact(null)
        }}
        onSave={handleSaveContact}
        onDelete={selectedContact?.id ? () => handleDeleteContact(selectedContact) : undefined}
        saving={savingContact}
        saveError={saveContactError}
      />
    </AdminLayout>
  )
}

export default ServicesDashboard
