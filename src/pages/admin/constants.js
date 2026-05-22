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
  notes: ''
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
    task_type: 'check_in',
    title: 'Finalize check-in process',
    priority: 'high'
  },
  {
    task_type: 'check_in',
    title: 'Customer check-in / departure',
    priority: 'normal'
  },
  {
    task_type: 'payment',
    title: 'Payment due — collect balance',
    priority: 'high'
  },
  {
    task_type: 'documents',
    title: 'Send travel documents to client',
    priority: 'normal'
  },
  {
    task_type: 'passport',
    title: 'Verify passport / ID before travel',
    priority: 'high'
  }
]

export const EMPTY_TEAM_UPDATE = {
  title: '',
  body: '',
  category: 'update',
  pinned: false
}

export const ADMIN_NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/admin/team', label: 'Team hub', icon: 'team', badgeKey: 'teamTasks' },
  { to: '/admin/corporate-groups', label: 'Corporate', icon: 'corporate', highlight: true },
  { to: '/admin/clients', label: 'Clients', icon: 'clients' },
  { to: '/admin/leads', label: 'Leads', icon: 'leads' },
  { to: '/admin/pipeline', label: 'Pipeline', icon: 'pipeline' },
  { to: '/admin/follow-ups', label: 'Follow-ups', icon: 'followups', badgeKey: 'followUps' },
  { to: '/admin/reports', label: 'Reports', icon: 'reports' }
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
