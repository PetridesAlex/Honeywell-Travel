import { BedDouble, IdCard, Shield, Users } from 'lucide-react'
import { IMPORT_PROFILES, formatProfileFieldsList } from '../../utils/passengerImport/importProfiles'

const ICONS = {
  users: Users,
  'id-card': IdCard,
  bed: BedDouble,
  shield: Shield
}

function ImportProfileSelector({ value, onSelect, onContinue }) {
  return (
    <div className="crm-import-profiles">
      <div className="crm-import-profiles__intro">
        <p className="crm-import-profiles__eyebrow">Step 1</p>
        <h4 className="crm-import-profiles__title">What are you importing?</h4>
        <p className="crm-import-profiles__subtitle">
          Choose the list type that matches your Excel file. We will only map and preview the columns you need.
        </p>
      </div>
      <div className="crm-import-profiles__grid" role="listbox" aria-label="Import list type">
        {IMPORT_PROFILES.map((profile) => {
          const Icon = ICONS[profile.icon] || Users
          const selected = value === profile.id
          return (
            <button
              key={profile.id}
              type="button"
              role="option"
              aria-selected={selected}
              className={`crm-import-profile-card${selected ? ' crm-import-profile-card--selected' : ''}`}
              onClick={() => onSelect(profile.id)}
            >
              <span className="crm-import-profile-card__icon" aria-hidden="true">
                <Icon size={22} />
              </span>
              <span className="crm-import-profile-card__body">
                <strong>{profile.label}</strong>
                <span className="crm-import-profile-card__desc">{profile.description}</span>
                <span className="crm-import-profile-card__fields">{formatProfileFieldsList(profile.id)}</span>
              </span>
              {selected ? <span className="crm-import-profile-card__check" aria-hidden="true">✓</span> : null}
            </button>
          )
        })}
      </div>
      {onContinue ? (
        <div className="crm-import-profiles__footer">
          <button type="button" className="crm-btn crm-btn-primary" onClick={onContinue}>
            Continue to upload
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default ImportProfileSelector
