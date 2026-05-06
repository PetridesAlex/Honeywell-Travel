export const STATUS_OPTIONS = ['New', 'Contacted', 'Quoted', 'Confirmed', 'Lost']

export const SOURCE_OPTIONS = [
  'Website',
  'Cruise Form',
  'Contact Form',
  'Package Form',
  'Book Online',
  'Instagram',
  'Facebook',
  'WhatsApp',
  'Phone Call',
  'Walk-in',
  'Referral',
  'Other'
]

export const EMPTY_LEAD = {
  full_name: '',
  phone: '',
  email: '',
  destination: '',
  travel_dates: '',
  number_of_travelers: '',
  budget: '',
  deal_value: 0,
  message: '',
  source: 'Website',
  status: 'New',
  notes: '',
  follow_up_date: '',
  assigned_agent: ''
}
