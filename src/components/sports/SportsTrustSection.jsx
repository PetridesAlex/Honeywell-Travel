import { createElement } from 'react'
import { Globe, Headset, Lock, Users } from 'lucide-react'

const ITEMS = [
  {
    icon: Globe,
    title: 'Worldwide sporting events',
    text: 'Major leagues, grands prix and tournaments across the globe — curated for Honeywell travellers.',
  },
  {
    icon: Users,
    title: 'Travel expertise',
    text: 'Specialists who understand both the fixture and the journey, so your trip feels effortless.',
  },
  {
    icon: Headset,
    title: 'Personal assistance',
    text: 'Dedicated support before, during and after your booking — by phone, email or in branch.',
  },
  {
    icon: Lock,
    title: 'Secure booking',
    text: 'Protected reservations with clear invoice settlement and transparent Honeywell pricing.',
  },
]

function SportsTrustSection() {
  return (
    <section className="st-trust" aria-labelledby="st-trust-heading">
      <div className="st-trust__glow" aria-hidden />
      <div className="st-trust__inner">
        <header className="st-trust__header">
          <p className="st-trust__eyebrow">
            <span className="st-trust__eyebrow-mark" aria-hidden />
            Honeywell Travel
          </p>
          <h2 className="st-trust__title" id="st-trust-heading">
            Why book with Honeywell Travel?
          </h2>
          <p className="st-trust__lead">
            Premium sporting access, backed by Cyprus’s trusted travel agency — from first enquiry to
            match day.
          </p>
        </header>

        <div className="st-trust__grid">
          {ITEMS.map((item, index) => (
            <article
              key={item.title}
              className="st-trust__item"
              style={{ '--st-trust-i': index }}
            >
              <span className="st-trust__icon">
                {createElement(item.icon, { size: 26, strokeWidth: 2, 'aria-hidden': true })}
              </span>
              <h3 className="st-trust__item-title">{item.title}</h3>
              <p className="st-trust__item-text">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SportsTrustSection
