import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './i18n/config' // Initialize i18n
import Header from './components/Header'
import Preloader from './components/Preloader'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import FloatingContactDock from './components/FloatingContactDock'
import Home from './pages/Home'
import Blog from './pages/Blog'
import Gallery from './pages/Gallery'
import Contact from './pages/Contact'
import Packages from './pages/Packages'
import AddPackage from './pages/AddPackage'
import PackageDetail from './pages/PackageDetail'
import PackageFullDetail from './pages/PackageFullDetail'
import HoneymoonCalendar from './pages/HoneymoonCalendar'
import HoneymoonTrips from './pages/HoneymoonTrips'
import GiftVoucher from './pages/GiftVoucher'
import HolidayTypes from './pages/HolidayTypes'
import Corporate from './pages/Corporate'
import DmcCyprus from './pages/DmcCyprus'
import BookOnline from './pages/BookOnline'
import BuildYourTrip from './pages/BuildYourTrip'
import ParisLastMinuteFlights from './pages/ParisLastMinuteFlights'
import Cruises from './pages/Cruises'
import OurWorld from './pages/OurWorld'
import BlogPostDetail from './pages/BlogPostDetail'
import FlightTickets from './pages/FlightTickets'
import FlightTicketsDestination from './pages/FlightTicketsDestination'
import TermsAndConditions from './pages/TermsAndConditions'
import PackagesCms from './pages/admin/PackagesCms'
import PackageCmsDetail from './pages/admin/PackageCmsDetail'
import AdminIndexRedirect from './pages/admin/components/AdminIndexRedirect'
import Login from './pages/admin/Login'
import Signup from './pages/admin/Signup'
import ForgotPassword from './pages/admin/ForgotPassword'
import AdminGuestRoute from './pages/admin/components/AdminGuestRoute'
import AdminProtectedRoute from './pages/admin/components/AdminProtectedRoute'
import { ADMIN_LOGIN_PATH, ADMIN_PACKAGES_PATH } from './lib/adminAuth'
import './App.css'
import {
  hasCompletedPreloaderThisSession,
  markPreloaderComplete,
} from './lib/preloaderSession'

/** Minimum time before revealing the app (preloader exit tied to `window` load + this delay). */
function getMinLoaderMs() {
  if (hasCompletedPreloaderThisSession()) return 0

  if (
    import.meta.env.DEV &&
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith('/admin')
  ) {
    return 400
  }

  if (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches) {
    return 3200
  }

  return 6000
}

function AppContent() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  if (isAdminRoute) {
    return (
      <main className="main-content">
        <Routes>
          <Route
            path="/admin/login"
            element={
              <AdminGuestRoute>
                <Login />
              </AdminGuestRoute>
            }
          />
          <Route
            path="/admin/signup"
            element={
              <AdminGuestRoute>
                <Signup />
              </AdminGuestRoute>
            }
          />
          <Route
            path="/admin/forgot-password"
            element={
              <AdminGuestRoute>
                <ForgotPassword />
              </AdminGuestRoute>
            }
          />
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin/packages" element={<PackagesCms />} />
            <Route path="/admin/packages/:id" element={<PackageCmsDetail />} />
            <Route path="/admin" element={<AdminIndexRedirect />} />
            <Route path="/admin/dashboard" element={<Navigate to={ADMIN_PACKAGES_PATH} replace />} />
            <Route path="/admin/*" element={<Navigate to={ADMIN_PACKAGES_PATH} replace />} />
          </Route>
          <Route path="/admin/*" element={<Navigate to={ADMIN_LOGIN_PATH} replace />} />
        </Routes>
      </main>
    )
  }

  return (
    <>
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/our-blog" element={<Blog />} />
          <Route path="/our-blog/" element={<Blog />} />
          <Route path="/our-blog/:slug" element={<BlogPostDetail />} />
          <Route path="/honeywell-travel-gallery" element={<Gallery />} />
          <Route path="/honeywell-travel-gallery/" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/contact/" element={<Contact />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/tour-category/cruises" element={<Cruises />} />
          <Route path="/tour-category/cruises/" element={<Cruises />} />
          <Route path="/tour-category/:slug" element={<Packages />} />
          <Route path="/tour-category/:slug/" element={<Packages />} />
          <Route path="/packages/:id" element={<PackageDetail />} />
          <Route path="/packages/:id/details" element={<PackageFullDetail />} />
          <Route path="/cruises" element={<Cruises />} />
          <Route path="/add-package" element={<AddPackage />} />
          <Route path="/gift-vouchers" element={<GiftVoucher />} />
          <Route path="/holiday-types" element={<HolidayTypes />} />
          <Route path="/honeymoon-trips" element={<HoneymoonTrips />} />
          <Route path="/honeymoon-calendar" element={<HoneymoonCalendar />} />
          <Route path="/ourworld" element={<OurWorld />} />
          <Route path="/ourworld/" element={<OurWorld />} />
          <Route path="/our-services" element={<Corporate />} />
          <Route path="/our-services/" element={<Corporate />} />
          <Route path="/dmc-cyprus" element={<DmcCyprus />} />
          <Route path="/dmc-cyprus/" element={<DmcCyprus />} />
          <Route path="/book-online" element={<BookOnline />} />
          <Route path="/flight-tickets" element={<FlightTickets />} />
          <Route path="/flight-tickets/" element={<FlightTickets />} />
          <Route path="/flight-tickets/:destination" element={<FlightTicketsDestination />} />
          <Route path="/build-your-trip" element={<BuildYourTrip />} />
          <Route path="/build-your-trip/" element={<BuildYourTrip />} />
          <Route path="/last-minute-flights/paris" element={<ParisLastMinuteFlights />} />
          <Route path="/last-minute-flights/paris/" element={<ParisLastMinuteFlights />} />
          <Route path="/car-hire" element={<div className="page-placeholder"><h1>Car Hire</h1><p>Coming soon...</p></div>} />
          <Route path="/insurance" element={<div className="page-placeholder"><h1>Insurance</h1><p>Coming soon...</p></div>} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/terms-and-conditions/" element={<TermsAndConditions />} />
        </Routes>
        <Footer />
      </main>
    </>
  )
}

function App() {
  const [loading, setLoading] = useState(() => !hasCompletedPreloaderThisSession())

  useEffect(() => {
    // Safety cleanup in case old cursor styling class remains after HMR.
    document.documentElement.classList.remove('cursor-accent-enabled')
    document.body.classList.remove('cursor-accent-enabled')
  }, [])

  useEffect(() => {
    const handlePageShow = (event) => {
      if (!event.persisted) return
      markPreloaderComplete()
      setLoading(false)
    }

    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])

  useEffect(() => {
    let isMounted = true
    let minDurationDone = false
    let pageReady = document.readyState === 'complete'
    const minLoaderMs = getMinLoaderMs()

    const maybeStartExit = () => {
      if (!isMounted || !minDurationDone || !pageReady) return
      markPreloaderComplete()
      setLoading(false)
    }

    if (minLoaderMs <= 0) {
      minDurationDone = true
      if (pageReady) {
        markPreloaderComplete()
        setLoading(false)
        return undefined
      }
    }

    const minDurationTimer = setTimeout(() => {
      minDurationDone = true
      maybeStartExit()
    }, minLoaderMs)

    const handleReady = () => {
      pageReady = true
      maybeStartExit()
    }

    if (!pageReady) {
      window.addEventListener('load', handleReady, { once: true })
    } else {
      handleReady()
    }

    return () => {
      isMounted = false
      clearTimeout(minDurationTimer)
      window.removeEventListener('load', handleReady)
    }
  }, [])

  return (
    <Router>
      <ScrollToTop />
      <Preloader
        loading={loading}
        variant="stairs"
        duration={6000}
        loadingLines={['Honeywell Travel', '#Live the Experience']}
        position="fixed"
      >
        <div className="app">
          <AppContent />
          <FloatingContactDock />
        </div>
      </Preloader>
    </Router>
  )
}

export default App
