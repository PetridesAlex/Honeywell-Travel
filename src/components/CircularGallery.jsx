import ParallaxCards from './ParallaxCards'
import './CircularGallery.css'

function CircularGallery() {
  const images = [
    { id: 1, src: '/images/destinations/iceland.webp', title: 'Iceland' },
    { id: 2, src: '/images/destinations/thailand.webp', title: 'Thailand' },
    { id: 3, src: '/images/destinations/australia.webp', title: 'Australia' },
    { id: 4, src: '/images/destinations/capetown.webp', title: 'South Africa' },
    { id: 5, src: '/images/destinations/dubai.webp', title: 'Dubai' },
    { id: 6, src: '/images/destinations/brazil.webp', title: 'Brazil' },
    { id: 7, src: '/images/destinations/canada.webp', title: 'Canada' },
    { id: 8, src: '/images/destinations/maldives.webp', title: 'Maldives' },
    { id: 9, src: '/images/destinations/japan.webp', title: 'Japan' },
    { id: 10, src: '/images/destinations/netherlands.webp', title: 'Netherlands' }
  ]

  return (
    <div className="circular-gallery">
      <div className="circular-gallery-topline">Explore Worldwide</div>
      <h2 className="circular-gallery-title">Signature Destinations</h2>
      <p className="circular-gallery-subtitle">
        Move your cursor through the gallery and click a card to focus on each destination.
      </p>

      <ParallaxCards
        images={images}
        cardCount={10}
        perspective={2200}
        mouseSensitivity={3.8}
        animationDuration={1}
        enableDepthFog={false}
        enableMagneticAttraction
        magneticStrength={54}
      />
    </div>
  )
}

export default CircularGallery

