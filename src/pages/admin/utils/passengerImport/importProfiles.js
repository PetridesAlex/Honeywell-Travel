import { PASSENGER_FIELD_LABELS } from './passengerFields'

/** What kind of spreadsheet you are importing — controls columns, mapping, and validation. */
export const IMPORT_PROFILES = [
  {
    id: 'name_list',
    label: 'Name list',
    shortLabel: 'Names',
    description: 'Basic guest list — names, gender, and nationality only.',
    hint: 'Ideal for seating charts, manifests, or headcount.',
    icon: 'users',
    fields: ['last_name', 'first_name', 'gender', 'nationality']
  },
  {
    id: 'full_documentation',
    label: 'Full traveller documentation',
    shortLabel: 'Travel docs',
    description: 'Passport or ID, contact number, nationality, gender, and document issue/expiry dates.',
    hint: 'For airline APIS, border control, and compliance checks.',
    icon: 'id-card',
    fields: [
      'last_name',
      'first_name',
      'gender',
      'nationality',
      'passport_number',
      'national_id',
      'phone',
      'date_of_issue',
      'passport_expiry'
    ]
  },
  {
    id: 'rooming_list',
    label: 'Rooming list',
    shortLabel: 'Rooming',
    description: 'Guest names with room or cabin assignments.',
    hint: 'Hotels, cruise cabins, and group accommodation.',
    icon: 'bed',
    fields: ['last_name', 'first_name', 'gender', 'nationality', 'room_number', 'cabin_number', 'category']
  },
  {
    id: 'insurance_list',
    label: 'Insurance list',
    shortLabel: 'Insurance',
    description: 'Names, date of birth, nationality, passport, contact, and emergency details.',
    hint: 'Travel insurance registration and policy records.',
    icon: 'shield',
    fields: [
      'last_name',
      'first_name',
      'date_of_birth',
      'nationality',
      'passport_number',
      'phone',
      'email',
      'emergency_contact'
    ]
  }
]

export const DEFAULT_IMPORT_PROFILE_ID = 'name_list'

export function getImportProfile(profileId) {
  return IMPORT_PROFILES.find((p) => p.id === profileId) || IMPORT_PROFILES[0]
}

export function getProfilePreviewFields(profileId) {
  return getImportProfile(profileId).fields
}

export function getProfileFieldLabels(profileId) {
  const profile = getImportProfile(profileId)
  return profile.fields.map((field) => PASSENGER_FIELD_LABELS[field] || field)
}

export function formatProfileFieldsList(profileId) {
  return getProfileFieldLabels(profileId).join(' · ')
}
