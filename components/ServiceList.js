
 'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAllServices, getServiceCounts } from '@/lib/services'
import { useDebounce } from '@/lib/useDebounce'  // ✅ Import debounce hook
import ServiceCard from './ServiceCard'
import ServiceModal from './ServiceModal'

export default function ServiceList() {
  const router = useRouter()
  
  const [services, setServices] = useState([])
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [category, setCategory] = useState('all')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedService, setSelectedService] = useState(null)
  const [modalService, setModalService] = useState(null)

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
      setError('Failed to load services. Please try again.')
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

  const handleCardClick = (service) => {
    setSelectedService(service)
  }

  const handleViewDetails = (service) => {
    setModalService(service)
  }

  const handleBookFromCard = (service) => {
    router.push(`/booking?service=${service.id}`)
  }

  const clearFilters = () => {
    setCategory('all')
    setSearchKeyword('')
  }

  if (loading && services.length === 0) {  // ✅ Chỉ show loading lần đầu
    return (
      <section id="services" className="services">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading services...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="services" className="services">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchInitialData} className="retry-btn">
            Try Again
          </button>
        </div>
      </section>
    )
  }

  if (services.length === 0 && category === 'all' && !debouncedSearch) {
    return (
      <section id="services" className="services">
        <h2>SALON SERVICE</h2>
        <p>No services available at the moment.</p>
      </section>
    )
  }

  return (
    <section id="services" className="services">
      <h2>SALON SERVICE</h2>
      <p>Select service that suits you</p>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for services..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}  // ✅ Update ngay nhưng không fetch ngay
        />
        {searchKeyword && (
          <button 
            className="clear-search"
            onClick={() => setSearchKeyword('')}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* ✅ Show loading indicator khi đang search */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '10px', color: '#8B5CF6' }}>
          Searching...
        </div>
      )}

      {/* Filter Buttons */}
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

      {/* Results Info */}
      {debouncedSearch && (
        <div className="results-info">
          <p>Find <strong>{services.length}</strong> service{services.length !== 1 ? 's' : ''} for "{debouncedSearch}"</p>
        </div>
      )}

      {/* No Results */}
      {services.length === 0 ? (
        <div className="no-results">
          <p>No suitable services found.</p>
          <button onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="service-grid">
          {services.map(service => (
            <ServiceCard 
              key={service.id}
              service={service}
              isSelected={selectedService?.id === service.id}
              onClick={handleCardClick}
              onViewDetails={handleViewDetails}
              onBookClick={handleBookFromCard}
            />
          ))}
        </div>
      )}

      {/* Selected Summary */}
      {selectedService && (
        <div className="selected-summary">
          <h3>✔ Selected service</h3>
          <div className="summary-content">
            <div>
              <strong>{selectedService.name}</strong>
              <p>{selectedService.category}</p>
            </div>
            <div className="summary-details">
              <span className="price">
                {Number(selectedService.price).toLocaleString('vi-VN')} VNĐ
              </span>
              <span className="duration">{selectedService.duration} minutes</span>
            </div>
            <button 
              className="book-btn"
              onClick={() => handleBookFromCard(selectedService)}
            >
              Booking now
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <ServiceModal 
        service={modalService}
        onClose={() => setModalService(null)}
        onBook={(service) => {
          setModalService(null)
          handleBookFromCard(service)
        }}
      />
    </section>
  )
}