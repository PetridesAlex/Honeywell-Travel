import { useState, useEffect } from 'react'
import SEO from '../components/SEO'
import ImageCarousel from '../components/ImageCarousel'
import CircularGallery from '../components/CircularGallery'
import SearchSection from '../components/SearchSection'
import PopularPackagesSection from '../components/PopularPackagesSection'
import TourPackagesSection from '../components/TourPackagesSection'
import CruisesSection from '../components/CruisesSection'
import StatsRewardsSection from '../components/StatsRewardsSection'
import TestimonialsSection from '../components/TestimonialsSection'
import RevealOnScroll from '../components/RevealOnScroll'
import './Home.css'

function Home() {
  const [sharedBackground, setSharedBackground] = useState('/images/destinations/main-page-sea.webp')

  useEffect(() => {
    document.documentElement.classList.add('route-home')
    return () => {
      document.documentElement.classList.remove('route-home')
    }
  }, [])

  return (
    <>
      <SEO 
        title="Honeywell Travel - Premium Travel Agency in Limassol & Nicosia, Cyprus"
        description="Award-winning travel agency in Cyprus specializing in tailor-made holidays, honeymoon packages, corporate travel, cruises, and exotic destinations. Offices in Limassol and Nicosia."
        keywords="Travel Agency Cyprus, Travel Agency Limassol, Travel Agency Nicosia, Honeymoon Packages Cyprus, Corporate Travel Cyprus, Cruises Cyprus, Holiday Packages Cyprus"
      />
      <div className="home-page">
      <ImageCarousel />
      <div style={{ position: 'relative', margin: 0 }}>
        <CircularGallery />
      </div>
      <div className="unified-sections-wrapper">
        <div className="search-tour-shared-background">
          <RevealOnScroll direction="up" delay={0}>
            <SearchSection 
              sharedBackground={sharedBackground} 
              setSharedBackground={setSharedBackground} 
            />
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={40}>
            <PopularPackagesSection />
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={80}>
            <div className="tour-packages-section-wrapper">
              <TourPackagesSection sharedBackground={sharedBackground} />
            </div>
          </RevealOnScroll>
        </div>
        <RevealOnScroll direction="up" delay={80}>
          <CruisesSection sharedBackground={sharedBackground} />
        </RevealOnScroll>
        <RevealOnScroll direction="up" delay={80}>
          <StatsRewardsSection />
        </RevealOnScroll>
        <RevealOnScroll direction="up" delay={80}>
          <TestimonialsSection sharedBackground={sharedBackground} />
        </RevealOnScroll>
      </div>
    </div>
    </>
  )
}

export default Home


