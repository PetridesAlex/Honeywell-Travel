import './FloatingContactDock.css'

const CONTACT_ACTIONS = [
  {
    id: 'phone',
    label: 'Phone',
    title: '+357 25 828848',
    href: 'tel:+35725828848',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6.62 10.79a15.46 15.46 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1-.24c1.12.37 2.33.56 3.59.56a1 1 0 0 1 1 1V21a1 1 0 0 1-1 1C10.3 22 2 13.7 2 3a1 1 0 0 1 1-1h4.5a1 1 0 0 1 1 1c0 1.26.19 2.47.56 3.59a1 1 0 0 1-.24 1l-2.2 2.2Z" />
      </svg>
    ),
  },
  {
    id: 'email',
    label: 'Email',
    ariaLabel: 'Email limassol@honeywelltravel.com.cy',
    title: 'limassol@honeywelltravel.com.cy',
    href: 'mailto:limassol@honeywelltravel.com.cy?subject=Honeywell%20Travel%20Inquiry',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v.35l-9 5.4-9-5.4V5Zm18 3.27V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8.27l8.48 5.09a1 1 0 0 0 1.04 0L21 8.27Z" />
      </svg>
    ),
  },
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com/honeywell_travel/',
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5Zm4.25 3.1a5.1 5.1 0 1 1 0 10.2 5.1 5.1 0 0 1 0-10.2Zm0 1.8a3.3 3.3 0 1 0 0 6.6 3.3 3.3 0 0 0 0-6.6Zm5.35-.95a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z" />
      </svg>
    ),
  },
  {
    id: 'facebook',
    label: 'Facebook',
    href: 'https://www.facebook.com/honeywelltravel',
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13.5 22v-8.2h2.8l.42-3.3H13.5V8.4c0-.95.26-1.6 1.62-1.6h1.73V3.85A23.2 23.2 0 0 0 14.34 3C11.86 3 10.16 4.5 10.16 7.26v3.25H7.5v3.3h2.66V22h3.34Z" />
      </svg>
    ),
  },
]

function FloatingContactDock() {
  return (
    <nav className="floating-contact-dock" aria-label="Quick contact links">
      <div className="floating-contact-dock__glow" aria-hidden="true" />
      <div className="floating-contact-dock__label">Connect with Honeywell Travel</div>
      <div className="floating-contact-dock__actions">
        {CONTACT_ACTIONS.map((action) => (
          <a
            key={action.id}
            href={action.href}
            className="floating-contact-dock__action"
            target={action.external ? '_blank' : undefined}
            rel={action.external ? 'noopener noreferrer' : undefined}
            aria-label={action.ariaLabel ?? action.label}
            title={action.title ?? action.label}
          >
            {action.icon}
            <span>{action.label}</span>
          </a>
        ))}
      </div>
    </nav>
  )
}

export default FloatingContactDock
