import { ArrowRight } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import './TestimonialsSection.css'

function TestimonialsSection() {
  const reviews = [
    {
      id: 'stephanie-michael',
      name: 'Stephanie Michael',
      text: 'Thank you for this amazing experience! Special thanks to Anna Rupina for helping us plan our Honeymoon to Japan, Bali and Dubai. Our travel agent planned such a romantic, well organized and wonderful trip for us, everything was absolutely perfect!',
      rating: 5,
      date: '2 months ago',
      verified: true
    },
    {
      id: 'stavros-anastasiou',
      name: 'Stavros Anastasiou',
      text: 'Super professional, punctual and assistive on anything we asked for! Highly recommended travel agency!',
      rating: 5,
      date: '3 months ago',
      verified: true
    },
    {
      id: 'anthi-theocharous',
      name: 'Anthi Theocharous',
      text: 'A travel agency true to their mission!!! they do make you fall in love with travel. I have just returned from a trip to Tuscany area and the whole excursion was greatly organised, excellent guide and a super journey.',
      rating: 5,
      date: '1 month ago',
      verified: true
    },
    {
      id: 'maria-christodoulou',
      name: 'Maria Christodoulou',
      text: 'My husband and I could not have been happier with our trip to Bali with this travel agency. Our agent assisted us in designing an absolutely spectacular itinerary for our 10day trip. We felt safe and well cared for.',
      rating: 5,
      date: '4 months ago',
      verified: true
    },
    {
      id: 'andreas-georgiou',
      name: 'Andreas Georgiou',
      text: 'Excellent service! They helped us plan our family vacation to Greece. Everything was perfectly organized, from flights to hotels. The team is very knowledgeable and responsive. Will definitely use them again!',
      rating: 5,
      date: '5 months ago',
      verified: true
    },
    {
      id: 'elpida-evripidou',
      name: 'Elpida Evripidou',
      text: "We visited Japan with Honeywell's guided tours. Everything was programmed to the last detail. All transfers, guides and anything you might need. Our journey was very smooth thanks to Mary and her team. Highly recommend! Thank you very much.",
      rating: 5,
      date: '5 months ago',
      verified: true
    },
    {
      id: 'maria-kontoloucas',
      name: 'Maria Kontoloucas',
      text: 'We had the most amazing, wonderful, magical experience in Lapland at Apukka Resort thanks to Honeywell Travel. We could not have had a better time. I thoroughly recommend both the resort and the travel agency. Thank you again.',
      rating: 5,
      date: '3 months ago',
      verified: true
    },
    {
      id: 'andreas-triaros',
      name: 'Andreas Triaros',
      text: 'We had the pleasure of working with Honeywell Travel for our corporate trip to Dubai, and the entire experience was truly exceptional. From start to finish, the organization was flawless. The itinerary was well planned, striking a perfect balance between business activities and leisure time. The desert safari was an unforgettable adventure, a unique blend of excitement, culture and authentic entertainment. The meal at the Atlantis hotel stood out for its outstanding quality and luxurious atmosphere. Our guided tour of Dubai was also exemplary, covering all the major highlights with perfect coordination and insightful narration. We wholeheartedly recommend Honeywell Travel to any business or traveler looking for a well-organized, reliable and memorable travel experience.',
      rating: 5,
      date: '9 months ago',
      verified: true
    },
    {
      id: 'rima-adjadj',
      name: 'Rima Adjadj',
      text: 'Our Japan experience was a dream. We got to visit all the sites within every city, and it was a very well organized trip from start till end. The Honeywell Travel experience at its best. Thank you to all the team and especially to Mary.',
      rating: 5,
      date: '5 months ago',
      verified: true
    },
    {
      id: 'xenia-petrou-vorka',
      name: 'Xenia Petrou Vorka',
      text: 'I had an incredible experience with this travel agency, and I cannot thank Mrs. Mary enough for her exceptional care and attention to detail. As someone with celiac disease, food safety is always a concern for me when traveling, and Mary went above and beyond to ensure all my meals were gluten-free and safe. She made sure my dietary needs were fully met, allowing me to relax and enjoy my trip without worries. She also organized everything perfectly. We learned about the rich traditions and history of the places we visited, and every detail was meticulously planned. We were always on time and we managed to do everything promised in the itinerary. I highly recommend Mrs. Mary and this agency for a personalized, stress-free and enriching travel experience.',
      rating: 5,
      date: 'a year ago',
      verified: true
    },
    {
      id: 'naatsha-groen',
      name: 'Naatsha Groen',
      text: 'This was the most convenient way ever to travel. Everything was taken care of and they provided us with an amazing, well organized trip. We visited lots of nice places, had a perfect hotel, and most importantly we were treated very kindly. Every request we had was taken into consideration and I am excited to book again through Honeywell Travel CY. I can recommend it to anyone, families, couples, friends or companies. Thank you so much.',
      rating: 5,
      date: 'a year ago',
      verified: true
    },
    {
      id: 'marilena-palazi',
      name: 'Marilena Palazi',
      text: 'An unforgettable journey to Konstantinoupoli prepared for Trust Insurance Cyprus, traveling with 40 people with Honeywell Travel.',
      rating: 5,
      date: 'a year ago',
      verified: true
    },
    {
      id: 'despina-georgiou',
      name: 'Despina Georgiou',
      text: 'One of the best trips I have done to Istanbul. The trip was well planned and organized, and the tour guide was well mannered, educated, interactive and engaging with us. Thank you for the amazing experience.',
      rating: 5,
      date: 'a year ago',
      verified: true
    },
    {
      id: 'pola-r',
      name: 'Pola R.',
      text: 'We went to Honeywell Travel and Vasso helped us tremendously. Excellent service, very knowledgeable and courteous. She issued our tickets right away even with the busy travel season. I would not hesitate to use this travel agency again. Thank you for your great service.',
      rating: 5,
      date: '3 years ago',
      verified: true
    }
  ]

  const columns = useMemo(() => {
    const grouped = [[], [], []]
    reviews.forEach((review, index) => {
      grouped[index % 3].push(review)
    })
    return grouped
  }, [reviews])

  const sectionRef = useRef(null)
  const mobileMarqueeRef = useRef(null)
  const marqueeCol1Ref = useRef(null)
  const marqueeCol2Ref = useRef(null)
  const marqueeCol3Ref = useRef(null)
  const animationRef = useRef(0)

  const getInitials = (fullName) => {
    const names = fullName.split(' ').filter(Boolean)
    return names.slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase()
  }

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const mobileQuery = window.matchMedia('(max-width: 768px)')
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Mobile: no JS marquee — continuous transforms steal frames from page scroll.
    if (mobileQuery.matches || reducedMotionQuery.matches) {
      return undefined
    }

    const columnRefs = [marqueeCol1Ref, marqueeCol2Ref, marqueeCol3Ref]
    const offsets = [0, 0, 0]
    const directions = [1, 1, 1]
    const speeds = [0.42, 0.5, 0.38]
    let isInView = false
    let running = false

    const animate = () => {
      if (!isInView) {
        running = false
        return
      }

      columnRefs.forEach((ref, index) => {
        const element = ref.current
        if (!element || !element.parentElement) return
        const maxOffset = Math.max(0, element.scrollHeight - element.parentElement.clientHeight)
        if (maxOffset <= 0) return

        offsets[index] += speeds[index] * directions[index]
        if (offsets[index] >= maxOffset) {
          offsets[index] = maxOffset
          directions[index] = -1
        } else if (offsets[index] <= 0) {
          offsets[index] = 0
          directions[index] = 1
        }
        element.style.transform = `translateY(-${offsets[index]}px)`
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    const start = () => {
      if (running || !isInView) return
      running = true
      animationRef.current = requestAnimationFrame(animate)
    }

    const stop = () => {
      running = false
      cancelAnimationFrame(animationRef.current)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInView = entry.isIntersecting
        if (isInView) start()
        else stop()
      },
      { threshold: 0.12, rootMargin: '80px 0px' },
    )

    observer.observe(section)

    return () => {
      observer.disconnect()
      stop()
    }
  }, [])

  return (
    <section ref={sectionRef} className="testimonials-section">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <span className="testimonials-kicker">Trusted By Travelers</span>
          <h2 className="section-title">Clients Review</h2>
          <p className="testimonials-subtitle">
            Real feedback from travelers who booked unforgettable journeys with Honeywell Travel.
          </p>
          <a href="/packages" className="testimonials-wall-link">
            Explore Packages <ArrowRight size={16} />
          </a>
        </div>

        <div className="testimonials-mobile-wall">
          <div className="testimonials-marquee-viewport">
            <div ref={mobileMarqueeRef} className="testimonials-marquee-track">
              {reviews.map((review, index) => (
                <article
                  className={`review-card review-card--accent-${(index % 3) + 1}`}
                  key={`mobile-${review.id}`}
                >
                  <p className="review-text">&ldquo;{review.text}&rdquo;</p>
                  <div className="review-meta">
                    <div className="reviewer-avatar">{getInitials(review.name)}</div>
                    <div className="reviewer-info">
                      <div className="reviewer-name-row">
                        <h3 className="reviewer-name">{review.name}</h3>
                        {review.verified ? <span className="verified-pill">Verified</span> : null}
                      </div>
                      <p className="review-date">{review.date}</p>
                    </div>
                  </div>
                  <div className="review-stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                </article>
              ))}
            </div>
          </div>
          <div className="testimonials-fade fade-top" />
          <div className="testimonials-fade fade-bottom" />
        </div>

        <div className="testimonials-desktop-wall">
          {columns.map((column, columnIndex) => (
            <div className="testimonials-marquee-viewport" key={`col-${columnIndex}`}>
              <div
                ref={columnIndex === 0 ? marqueeCol1Ref : columnIndex === 1 ? marqueeCol2Ref : marqueeCol3Ref}
                className="testimonials-marquee-track"
              >
                {column.map((review, reviewIndex) => (
                  <article
                    className={`review-card review-card--accent-${((columnIndex + reviewIndex) % 3) + 1}`}
                    key={`col-${columnIndex}-${review.id}`}
                  >
                    <p className="review-text">&ldquo;{review.text}&rdquo;</p>
                    <div className="review-meta">
                      <div className="reviewer-avatar">{getInitials(review.name)}</div>
                      <div className="reviewer-info">
                        <div className="reviewer-name-row">
                          <h3 className="reviewer-name">{review.name}</h3>
                          {review.verified ? <span className="verified-pill">Verified</span> : null}
                        </div>
                        <p className="review-date">{review.date}</p>
                      </div>
                    </div>
                    <div className="review-stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                  </article>
                ))}
              </div>
              <div className="testimonials-fade fade-top" />
              <div className="testimonials-fade fade-bottom" />
            </div>
          ))}
        </div>

        <div className="testimonials-summary-row">
          <div className="summary-chip rating-chip">
            <strong>4.8/5</strong>
            <span>Average rating</span>
          </div>
          <div className="summary-chip reviews-chip">
            <strong>200+</strong>
            <span>Featured reviews</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection





