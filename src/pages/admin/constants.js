/** Business mailbox for CRM replies (Outlook / signature). Override with VITE_CRM_FROM_EMAIL in .env */
export const CRM_SENDER_EMAIL = (
  import.meta.env.VITE_CRM_FROM_EMAIL || 'honeywelltravel1@asg.com.cy'
)
  .trim()
  .toLowerCase()

export const CRM_SENDER_NAME = (import.meta.env.VITE_CRM_SENDER_NAME || 'Honeywell Travel').trim()

/** Your Supabase admin login email (personal). Override with VITE_CRM_ADMIN_LOGIN_EMAIL */
export const CRM_ADMIN_LOGIN_EMAIL = (
  import.meta.env.VITE_CRM_ADMIN_LOGIN_EMAIL || 'honey@gmail.com'
)
  .trim()
  .toLowerCase()

export const STATUS_OPTIONS = ['New', 'Contacted', 'Quoted', 'Confirmed', 'Lost']

/** Map stored status values to a pipeline column id (case-insensitive). */
export function normalizeLeadStatus(status) {
  const value = String(status ?? 'New').trim()
  if (!value) return 'New'
  const found = STATUS_OPTIONS.find((option) => option.toLowerCase() === value.toLowerCase())
  return found || 'New'
}

/** Compare Supabase lead ids whether number or string. */
export function leadIdsMatch(a, b) {
  if (a == null || b == null) return false
  return String(a) === String(b)
}

export const TRIP_TYPE_OPTIONS = [
  'Package Holiday',
  'Cruise',
  'Honeymoon',
  'Flight Only',
  'Corporate / Groups',
  'DMC Cyprus',
  'Custom Trip',
  'Other'
]

export const PRIORITY_OPTIONS = ['Low', 'Normal', 'High', 'Urgent']

export const EMPTY_FINANCIAL_RECORD = {
  record_type: 'invoice',
  reference_no: '',
  title: '',
  sell_price: '',
  net_price: '',
  amount_received: '',
  currency: 'EUR',
  payment_status: 'pending',
  payment_method: 'Bank transfer',
  invoice_date: '',
  due_date: '',
  paid_date: '',
  supplier_name: '',
  lead_id: '',
  notes: ''
}

export const EMPTY_CLIENT = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  nationality: '',
  passport_number: '',
  date_of_issue: '',
  date_of_expiry: '',
  date_of_birth: '',
  notes: '',
  client_type: 'individual',
  corporate_group_id: ''
}

export const CORPORATE_STATUS_OPTIONS = ['Active', 'Prospect', 'On hold', 'Inactive']

export const CORPORATE_INDUSTRY_OPTIONS = [
  'Travel & Tourism',
  'Hospitality',
  'Corporate Services',
  'Education',
  'Healthcare',
  'Technology',
  'Finance',
  'Government',
  'Other'
]

export const EMPTY_CORPORATE_GROUP = {
  company_name: '',
  industry: '',
  status: 'Active',
  contact_person: '',
  contact_email: '',
  contact_phone: '',
  vat_number: '',
  website: '',
  address: '',
  city: '',
  country: 'Cyprus',
  typical_group_size: '',
  payment_terms: '',
  notes: ''
}

export const CORPORATE_SERVICE_CATEGORIES = [
  'DMC & Destination',
  'Hotel & Resort',
  'Airline & Flights',
  'Transfer & Transport',
  'Insurance',
  'Cruise & Ferry',
  'Excursion & Activity',
  'Corporate Client',
  'Government & Embassy',
  'Other'
]

export const EMPTY_CORPORATE_SERVICE_CONTACT = {
  organization: '',
  contact_name: '',
  job_title: '',
  category: 'DMC & Destination',
  status: 'Active',
  email: '',
  phone: '',
  mobile: '',
  city: '',
  country: 'Cyprus',
  website: '',
  notes: ''
}

export const EMPTY_SERVICE_PROFILE = {
  company_name: '',
  contact_name: '',
  email: '',
  phone: '',
  country: 'Cyprus'
}

export const EMPTY_TEAM_TASK = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'normal',
  task_type: 'general',
  assigned_to: '',
  due_date: '',
  client_id: '',
  lead_id: ''
}

export const TEAM_TASK_QUICK_TEMPLATES = [
  {
    id: 'checkin_finalize',
    task_type: 'check_in',
    title: 'Finalize check-in process',
    subtitle: 'Complete airline check-in before the client departs',
    descriptionHint: 'Airline, flight number, online check-in link, seat selection, baggage…',
    priority: 'high',
    daysOffset: 2
  },
  {
    id: 'checkin_departure',
    task_type: 'check_in',
    title: 'Customer check-in / departure',
    subtitle: 'Day-of-travel reminder for the whole team',
    descriptionHint: 'Departure time, airport, terminal, transfer details, emergency contact…',
    priority: 'normal',
    daysOffset: 0
  },
  {
    id: 'payment_balance',
    task_type: 'payment',
    title: 'Payment due — collect balance',
    subtitle: 'Chase outstanding invoice or deposit before travel',
    descriptionHint: 'Amount due, invoice ref, payment method, due date agreed with client…',
    priority: 'high',
    daysOffset: 3
  },
  {
    id: 'documents_send',
    task_type: 'documents',
    title: 'Send travel documents to client',
    subtitle: 'Tickets, vouchers, insurance, and itinerary pack',
    descriptionHint: 'E-tickets, hotel vouchers, insurance policy, day-by-day itinerary…',
    priority: 'normal',
    daysOffset: 5
  },
  {
    id: 'passport_verify',
    task_type: 'passport',
    title: 'Verify passport / ID before travel',
    subtitle: 'Confirm validity, visas, and name match on booking',
    descriptionHint: 'Passport expiry, visa requirements, name spelling vs booking, scan on file…',
    priority: 'high',
    daysOffset: 14
  }
]

export const EMPTY_TEAM_UPDATE = {
  title: '',
  body: '',
  category: 'update',
  pinned: false,
  image_url: '',
  link_url: ''
}

export const EMPTY_PACKAGE_QUOTE = {
  title: '',
  client_name: '',
  destination: '',
  trip_type: 'Package Holiday',
  pax: 2,
  currency: 'EUR',
  target_margin_percent: 15,
  notes: ''
}

export const TRAVEL_GROUP_TYPES = [
  { id: 'group_booking', label: 'Group booking' },
  { id: 'cruise', label: 'Cruise' },
  { id: 'school', label: 'School trip' },
  { id: 'corporate', label: 'Corporate travel' },
  { id: 'incentive', label: 'Incentive group' }
]

export const TRAVEL_GROUP_STATUSES = ['Planning', 'Confirmed', 'In progress', 'Completed', 'Cancelled']

export const EMPTY_TRAVEL_GROUP = {
  group_name: '',
  group_type: 'group_booking',
  departure_date: '',
  return_date: '',
  destination: '',
  supplier: '',
  status: 'Planning',
  notes: ''
}

export const ADMIN_NAV = [
  { to: '/admin/packages', label: 'Travel Packages', icon: 'packages' }
]

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

/** Website package categories — used when creating/editing CMS packages. */
export const PACKAGE_CATEGORY_OPTIONS = [
  'Summer Packages',
  'Summer Packages to Greece',
  'Autumn Packages',
  'Winter Packages',
  'Spring Packages',
  'Christmas Packages',
  'City Breaks',
  'Cruises',
  'Easter Packages',
  'Exotic Packages',
  'Exotic Destinations',
  'Green Monday',
  'Group Travel',
  'Mary Special Trips',
  'Music & Sports',
  'Sports Events & Concerts',
  'Ski Packages',
  'Destinations'
]

export const EMPTY_LEAD = {
  first_name: '',
  last_name: '',
  full_name: '',
  phone: '',
  email: '',
  destination: '',
  travel_dates: '',
  number_of_travelers: '',
  trip_type: 'Package Holiday',
  priority: 'Normal',
  package_interest: '',
  budget: '',
  deal_value: 0,
  message: '',
  source: 'Website',
  status: 'New',
  notes: '',
  follow_up_date: '',
  assigned_agent: ''
}
