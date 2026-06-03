import { normalizeHeader } from './mapPassengerColumns'

/**
 * Highest-priority mapping from header label → CRM field.
 */
export function fieldFromHeaderLabel(header) {
  const n = normalizeHeader(header)
  if (!n) return null

  const rules = [
    { test: /passport.*expir|expir.*passport|date of expir|expiry date|expiration date|expires/, field: 'passport_expiry' },
    { test: /passport.*issue|date of issue|issue date|issued|doi/, field: 'date_of_issue' },
    { test: /date of birth|birth date|birthday|\bdob\b|born/, field: 'date_of_birth' },
    { test: /passport.*(no|num|#)|^passport$|travel doc|diavatirio|διαβατηριο/, field: 'passport_number' },
    { test: /^id$|national id|identity no|id card|id number|personal id/, field: 'national_id' },
    { test: /^(surname|last name|eponymo|επωνυμο|family name)$/, field: 'last_name' },
    { test: /^(name|first name|onoma|ονομα|fname|given name)$/, field: 'first_name' },
    { test: /full name|complete name|onomateponymo|ονοματεπωνυμο/, field: 'full_name' },
    { test: /nationality|citizenship|ethnikotita/, field: 'nationality' },
    { test: /^(category|type|pax type|passenger type|class)$/, field: 'category' },
    { test: /contact|phone|mobile|telephone|\btel\b/, field: 'phone' },
    { test: /e-?mail/, field: 'email' },
    { test: /^(gender|sex)$/, field: 'gender' },
    { test: /^room|room no|room number|domatio/, field: 'room_number' },
    { test: /cabin|stateroom/, field: 'cabin_number' },
    { test: /emergency|next of kin/, field: 'emergency_contact' },
    { test: /notes|comments|remarks/, field: 'notes' }
  ]

  for (const { test, field } of rules) {
    if (test.test(n)) return field
  }
  return null
}
