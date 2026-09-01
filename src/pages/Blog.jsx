import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { blogPosts, getCategories } from '../data/blog'
import RevealOnScroll from '../components/RevealOnScroll'
import SEO from '../components/SEO'
import './Blog.css'

function Blog() {
  const { t } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState('All')
  const categories = ['All', ...getCategories()]

  const filteredPosts = selectedCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory)

  // Sort posts by date (newest first)
  const sortedPosts = [...filteredPosts].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  )

  return (
    <div className="blog-page">
      <SEO
        title="Travel Blog | Honeywell Travel"
        description="Read travel tips, destination guides, and inspiration from Honeywell Travel experts."
        keywords="travel blog cyprus, destination guides, travel tips, honeywell travel blog"
        url="https://www.honeywelltravel.com.cy/our-blog"
      />
      {/* Hero Section */}
      <div className="blog-hero">
        <div className="blog-hero-content">
          <h1>{t('blog.title')}</h1>
          <p className="blog-hero-subtitle">{t('blog.subtitle')}</p>
        </div>
      </div>

      <RevealOnScroll direction="up">
      <div className="blog-container">
        {/* Category Filter */}
        <div className="blog-categories">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'All' ? t('common.all') : category}
            </button>
          ))}
        </div>

        {/* Blog Grid */}
        <div className="blog-grid">
          {sortedPosts.map((post) => (
            <article key={post.id} className="blog-card">
              {post.image && (
                <div className="blog-card-image">
                  <div 
                    className="blog-image-bg"
                    style={{ backgroundImage: `url(${post.image})` }}
                  />
                  {post.featured && (
                    <span className="blog-featured-badge">{t('common.featured')}</span>
                  )}
                </div>
              )}
              <div className="blog-card-content">
                <div className="blog-card-meta">
                  <span className="blog-category">{post.category}</span>
                  <span className="blog-date">{post.formattedDate}</span>
                </div>
                <h2 className="blog-card-title">{post.title}</h2>
                <p className="blog-excerpt">{post.excerpt}</p>
                <div className="blog-card-footer">
                  <Link to={`/our-blog/${post.slug}`} className="blog-link">
                    {t('blog.readMore')}
                  </Link>
                  {post.tags && post.tags.length > 0 && (
                    <div className="blog-tags">
                      {post.tags.slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="blog-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {sortedPosts.length === 0 && (
          <div className="blog-no-posts">
            <p>{t('blog.noPosts')}</p>
          </div>
        )}
      </div>
      </RevealOnScroll>
    </div>
  )
}

export default Blog






