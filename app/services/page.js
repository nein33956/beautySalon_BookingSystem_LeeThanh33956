'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAllServices, getServiceCounts } from '@/lib/services'
import { useDebounce } from '@/lib/useDebounce'  // ✅ Import debounce hook
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function ServicesPage() {
  const router = useRouter()
  const [services, setServices] = useState([])
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [category, setCategory] = useState('all')
  const [searchKeyword, setSearchKeyword] = useState('')

  // ✅ DEBOUNCE search keyword - chỉ fetch sau 500ms user ngừng gõ
  const debouncedSearch = useDebounce(searchKeyword, 500)

  useEffect(() => {
    fetchInitialData()
  }, [])

  // ✅ Chỉ fetch khi debouncedSearch thay đổi (không phải searchKeyword)
  useEffect(() => {
    if (!loading) {
      fetchServices()
    }
  }, [category, debouncedSearch])  // ✅ Đổi từ searchKeyword → debouncedSearch

  async function fetchInitialData() {
    await Promise.all([
      fetchServices(),
      fetchCounts()
    ])
  }

  async function fetchServices() {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await getAllServices({
        category: category !== 'all' ? category : undefined,
        searchKeyword: debouncedSearch || undefined  // ✅ Dùng debouncedSearch
      })

      if (error) throw new Error(error)

      setServices(data || [])
    } catch (err) {
      console.error('Error fetching services:', err)
      setError('Failed to load services.')
    } finally {
      setLoading(false)
    }
  }

  async function fetchCounts() {
    try {
      const { data, error } = await getServiceCounts()
      
      if (error) throw new Error(error)
      
      setCounts(data || {})
    } catch (err) {
      console.error('Error fetching counts:', err)
    }
  }

  if (loading && services.length === 0) {  // ✅ Chỉ show loading lần đầu
    return (
      <div>
        <Navbar />
        <div className="loading-container" style={{ minHeight: '60vh' }}>
          <div className="spinner"></div>
          <p>Loading services...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="error-container" style={{ minHeight: '60vh' }}>
          <p className="error-message">{error}</p>
          <button onClick={fetchInitialData} className="retry-btn">
            Try Again
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="services-page">
      <Navbar />
      
      <main className="services-page-container">
        <div className="services-header">
          <h1>Our Services</h1>
          <p>Discover our comprehensive beauty and wellness services</p>
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search services..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}  // ✅ Update ngay nhưng không fetch ngay
            />
            {searchKeyword && (
              <button 
                className="clear-search"
                onClick={() => setSearchKeyword('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ✅ Show loading indicator khi đang search */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '10px', color: '#8B5CF6' }}>
            Searching...
          </div>
        )}

        {/* Category Filter */}
        <div className="filter-section">
          <div className="filter-buttons">
            <button 
              onClick={() => setCategory('all')}
              className={category === 'all' ? 'active' : ''}
            >
              All ({counts.all || 0})
            </button>
            <button 
              onClick={() => setCategory('Hair')}
              className={category === 'Hair' ? 'active' : ''}
            >
              Hair ({counts.Hair || 0})
            </button>
            <button 
              onClick={() => setCategory('Nails')}
              className={category === 'Nails' ? 'active' : ''}
            >
              Nails ({counts.Nails || 0})
            </button>
            <button 
              onClick={() => setCategory('Spa')}
              className={category === 'Spa' ? 'active' : ''}
            >
              Spa ({counts.Spa || 0})
            </button>
          </div>
        </div>

        {/* Results */}
        {debouncedSearch && (
          <div className="results-info">
            <p>Found <strong>{services.length}</strong> service{services.length !== 1 ? 's' : ''}</p>
          </div>
        )}

        {/* Services Grid */}
        {services.length === 0 ? (
          <div className="no-results">
            <p>No services found.</p>
            <button onClick={() => {
              setCategory('all')
              setSearchKeyword('')
            }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="services-grid">
            {services.map(service => (
              <div 
                key={service.id} 
                className="service-card-full"
                onClick={() => router.push(`/services/${service.id}`)}
              >
                <div className="service-image">
                  <img 
                    src={service.image_url || '/placeholder.jpg'} 
                    alt={service.name}
                  />
                  <span className="category-badge">{service.category}</span>
                </div>
                
                <div className="service-content">
                  <h3>{service.name}</h3>
                  <p className="description">{service.description}</p>
                  
                  <div className="service-info">
                    <span className="price">
                      {Number(service.price).toLocaleString('vi-VN')} VNĐ
                    </span>
                    <span className="duration">
                      ⏱️ {service.duration} mins
                    </span>
                  </div>
                  
                  <button 
                    className="view-detail-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/services/${service.id}`)
                    }}
                  >
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}