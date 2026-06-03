export const PASSENGER_FIELD_KEYS = [
  'first_name',
  'last_name',
  'full_name',
  'category',
  'passport_number',
  'national_id',
  'date_of_issue',
  'passport_expiry',
  'date_of_birth',
  'nationality',
  'gender',
  'phone',
  'email',
  'room_number',
  'cabin_number',
  'emergency_contact',
  'notes'
]

export const PASSENGER_FIELD_LABELS = {
  first_name: 'Name',
  last_name: 'Surname',
  full_name: 'Full name',
  category: 'Category',
  passport_number: 'Passport',
  national_id: 'ID no.',
  date_of_issue: 'Date of issue',
  passport_expiry: 'Date of expiry',
  date_of_birth: 'Date of birth',
  nationality: 'Nationality',
  gender: 'Gender',
  phone: 'Contact number',
  email: 'Email',
  room_number: 'Room',
  cabin_number: 'Cabin',
  emergency_contact: 'Emergency contact',
  notes: 'Notes'
}

/** Standard column order: surname, name, then travel documents */
export const PASSENGER_ROSTER_FIELD_ORDER = [
  'last_name',
  'first_name',
  'gender',
  'nationality',
  'passport_number',
  'national_id',
  'date_of_issue',
  'passport_expiry'
]

/** Columns shown in the main import preview table */
export const PASSENGER_PREVIEW_FIELDS = PASSENGER_ROSTER_FIELD_ORDER

export const COLUMN_SYNONYMS = {
  first_name: [
    'first name',
    'firstname',
    'first',
    'given name',
    'forename',
    'fname',
    'onoma',
    'ονομα',
    'όνομα',
    'christian name',
    'name en'
  ],
  last_name: [
    'last name',
    'lastname',
    'surname',
    'family name',
    'second name',
    'lname',
    'eponymo',
    'επωνυμο',
    'επώνυμο',
    'family'
  ],
  full_name: [
    'full name',
    'passenger name',
    'complete name',
    'onomateponymo',
    'ονοματεπωνυμο',
    'name and surname',
    'traveller name'
  ],
  category: [
    'category',
    'type',
    'pax type',
    'passenger type',
    'traveler type',
    'group type',
    'katigoria',
    'κατηγορια',
    'class',
    'title'
  ],
  passport_number: [
    'passport number',
    'passport no',
    'passport #',
    'passport',
    'travel document',
    'passport id',
    'pass no',
    'diavatirio',
    'διαβατηριο',
    'διαβατήριο',
    'passport nr'
  ],
  national_id: [
    'identity card number',
    'id card number',
    'id number',
    'id no',
    'national id',
    'identity number',
    'id card',
    'personal id',
    'cyprus id',
    'id #',
    'identity'
  ],
  date_of_issue: [
    'date of issue',
    'passport issue',
    'issue date',
    'issued',
    'passport issued',
    'date issued',
    'doi'
  ],
  passport_expiry: [
    'passport expiry',
    'passport expiration',
    'expiry date',
    'expiration date',
    'passport exp',
    'valid until',
    'date of expiry',
    'expires',
    'exp date'
  ],
  date_of_birth: [
    'date of birth',
    'dob',
    'birth date',
    'birthday',
    'born',
    'birth'
  ],
  nationality: [
    'nationality',
    'citizenship',
    'nation',
    'country of birth',
    'ethnikotita',
    'εθνικοτητα'
  ],
  gender: ['gender', 'sex', 'm/f', 'male female'],
  phone: [
    'phone',
    'mobile',
    'telephone',
    'tel',
    'contact number',
    'contact no',
    'cell',
    'contact',
    'phone number',
    'mobile number'
  ],
  email: ['email', 'e-mail', 'mail', 'email address'],
  room_number: ['room', 'room number', 'room no', 'hotel room', 'domatio', 'δωματιο', 'δωμάτιο'],
  cabin_number: ['cabin', 'cabin number', 'cabin no', 'stateroom'],
  emergency_contact: ['emergency contact', 'emergency', 'next of kin', 'nok', 'ice'],
  notes: ['notes', 'comments', 'remarks', 'special requests', 'dietary']
}

export function emptyPassengerRow() {
  return {
    _id: crypto.randomUUID(),
    first_name: '',
    last_name: '',
    full_name: '',
    category: '',
    passport_number: '',
    national_id: '',
    date_of_issue: '',
    passport_expiry: '',
    date_of_birth: '',
    nationality: '',
    gender: '',
    phone: '',
    email: '',
    room_number: '',
    cabin_number: '',
    emergency_contact: '',
    notes: '',
    _warnings: [],
    _selected: true
  }
}
