import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addPackage } from '../data/packages'
import RevealOnScroll from '../components/RevealOnScroll'
import SEO from '../components/SEO'
import './AddPackage.css'

// Helper function to convert category name to URL-friendly slug
const categoryToSlug = (category) => {
  if (category === 'Any') return null
  return category
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9-]/g, '')
}

function AddPackage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    destination: 'Any',
    category: 'Any',
    price: '',
    duration: '',
    description: '',
    image: '✈️',
    featured: false
  })

  const categories = [
    'Autumn Packages',
    'Christmas Packages',
    'Christmas Markets',
    'City Breaks',
    'Cruises',
    'Easter Packages',
    'Exotic Destinations',
    'Exotic Packages',
    'Green Monday',
    'Group Travel',
    'Mary Special Trips',
    'SPORTS EVENTS & CONCERTS',
    'Summer Packages',
    'Summer Packages to Greece',
    'Winter Packages'
  ]

  const destinations = [
    'Africa',
    'America',
    'Asia',
    'Europe',
    'Greece',
    'Middle East'
  ]

  const emojis = ['✈️', '🏖️', '🏔️', '🏛️', '🌴', '🏜️', '🌊', '🗼', '🏰', '🌉', '🦁', '🐘', '🇺🇸', '🇬🇷', '🇫🇷', '🇹🇭', '🇮🇹', '🇪🇸']

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.title || !formData.destination || !formData.category || !formData.price || !formData.duration) {
      alert('Please fill in all required fields')
      return
    }

    // Convert price to number
    const packageData = {
      ...formData,
      price: parseFloat(formData.price)
    }

    // Add package to data
    const newPackage = addPackage(packageData)
    
    alert(`Package "${newPackage.title}" added successfully!`)
    
    // Reset form
    setFormData({
      title: '',
      destination: 'Any',
      category: 'Any',
      price: '',
      duration: '',
      description: '',
      image: '✈️',
      featured: false
    })

    // Navigate to packages page with filters
    const categorySlug = categoryToSlug(formData.category)
    if (categorySlug) {
      navigate(`/tour-category/${categorySlug}/`)
    } else {
      const params = new URLSearchParams()
      if (formData.destination !== 'Any') params.set('destination', formData.destination)
      navigate(`/packages?${params.toString()}`)
    }
  }

  return (
    <div className="add-package-page">
      <SEO
        title="Add Package | Honeywell Travel"
        description="Internal package creation page."
        url="https://www.honeywelltravel.com.cy/add-package"
        noindex
      />
      <RevealOnScroll direction="up">
      <div className="add-package-container">
        <h1>Add New Travel Package</h1>
        <p className="subtitle">Create a new travel package and assign it to a category and destination</p>

        <form className="package-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Package Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Amazing New York City Break"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price (€) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g., 1299"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="destination">Destination *</label>
              <select
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                required
              >
                <option value="Any">Select Destination</option>
                {destinations.map((dest) => (
                  <option key={dest} value={dest}>{dest}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="Any">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="duration">Duration *</label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g., 5 days, 1 week"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="image">Icon/Emoji</label>
              <select
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
              >
                {emojis.map((emoji) => (
                  <option key={emoji} value={emoji}>{emoji}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Describe the travel package..."
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
              />
              <span>Featured Package</span>
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">Add Package</button>
            <button type="button" className="cancel-btn" onClick={() => navigate('/packages')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
      </RevealOnScroll>
    </div>
  )
}

export default AddPackage






