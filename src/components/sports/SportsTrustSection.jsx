import { createElement } from 'react'
import { Globe, Headset, Lock, Users } from 'lucide-react'

const ITEMS = [
  {
    icon: Globe,
    title: 'Worldwide sporting events',
    text: 'Major leagues, grands prix and tournaments across the globe.',
  },
  {
    icon: Users,
    title: 'Travel expertise',
    text: 'Honeywell Travel specialists help you plan the full experience.',
  },
  {
    icon: Headset,
    title: 'Personal assistance',
    text: 'Dedicated support before, during and after your booking.',
  },
  {
    icon: Lock,
    title: 'Secure booking',
    text: 'Protected reservations with clear invoice settlement.',
  },
]

function SportsTrustSection() {
  return (
    <section className="st-trust" aria-labelledby="st-trust-heading">
      <h2 className="sports-tickets-subheading" id="st-trust-heading">
        Why book with Honeywell Travel?
      </h2>
      <p className="sports-tickets-section-lead" style={{ marginBottom: 0 }}>
        Premium sporting access backed by Cyprus’s trusted travel agency.
      </p>
      <div className="st-trust__grid">
        {ITEMS.map((item) => (
          <div key={item.title} className="st-trust__item">
            <span className="st-trust__icon">
              {createElement(item.icon, { size: 20, strokeWidth: 2, 'aria-hidden': true })}
            </span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default SportsTrustSection
