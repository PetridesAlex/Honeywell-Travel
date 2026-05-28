import {
  Building2,
  Globe,
  Landmark,
  MapPin,
  Plane,
  Shield,
  Ship,
  Sparkles,
  Umbrella,
  Users
} from 'lucide-react'
import { CORPORATE_SERVICE_CATEGORIES } from '../constants'

export const SERVICE_CATEGORY_META = {
  'DMC & Destination': {
    icon: MapPin,
    tone: 'gold',
    description: 'Destination management companies and local partners.'
  },
  'Hotel & Resort': {
    icon: Building2,
    tone: 'navy',
    description: 'Hotels, resorts, and accommodation suppliers.'
  },
  'Airline & Flights': {
    icon: Plane,
    tone: 'sky',
    description: 'Airlines, consolidators, and flight desks.'
  },
  'Transfer & Transport': {
    icon: Globe,
    tone: 'purple',
    description: 'Airport transfers, coaches, and ground transport.'
  },
  Insurance: {
    icon: Shield,
    tone: 'green',
    description: 'Travel insurance providers and policy contacts.'
  },
  'Cruise & Ferry': {
    icon: Ship,
    tone: 'teal',
    description: 'Cruise lines, ferry operators, and marine partners.'
  },
  'Excursion & Activity': {
    icon: Umbrella,
    tone: 'orange',
    description: 'Tours, excursions, and activity suppliers.'
  },
  'Corporate Client': {
    icon: Users,
    tone: 'red',
    description: 'Corporate accounts and business travel clients.'
  },
  'Government & Embassy': {
    icon: Landmark,
    tone: 'slate',
    description: 'Government offices, embassies, and official contacts.'
  },
  Other: {
    icon: Sparkles,
    tone: 'gray',
    description: 'Additional suppliers and miscellaneous services.'
  }
}

export function getServiceCategoryMeta(category) {
  return SERVICE_CATEGORY_META[category] || SERVICE_CATEGORY_META.Other
}

export function serviceCategoryBadgeClass(category) {
  const key = (category || 'other').toLowerCase().replace(/[^a-z0-9]+/g, '_')
  return `crm-svc-cat crm-svc-cat--${key}`
}

export function serviceContactInitials(contact) {
  const name = (contact.contact_name || contact.organization || '?').trim()
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export function buildServiceCategoryCounts(contacts = []) {
  const map = { all: contacts.length }
  CORPORATE_SERVICE_CATEGORIES.forEach((cat) => {
    map[cat] = contacts.filter((c) => c.category === cat).length
  })
  return map
}

export { CORPORATE_SERVICE_CATEGORIES }
