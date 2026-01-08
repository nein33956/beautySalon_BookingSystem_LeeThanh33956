// // 'use client'

// // import { useState, useEffect } from 'react'
// // import { useRouter } from 'next/navigation'
// // import ServiceCard from './ServiceCard'
// // import ServiceModal from './ServiceModal'

// // export default function ServiceList() {
// //   const router = useRouter()
  
// //   const [services] = useState([
// //     { 
// //       id: 1, 
// //       name: "Haircut", 
// //       price: 200000, 
// //       duration: 70,
// //       image: "https://liembarbershop.com/wp-content/uploads/2024/08/z5717946217517_9d615e1acd5b32589418cb215907ad80.jpg?w=400",
// //       category: "Hair",
// //       description: "Professional haircuts for men and women with experienced stylists."
// //     },
// //     { 
// //       id: 2, 
// //       name: "Hair Coloring", 
// //       price: 500000, 
// //       duration: 120,
// //       image: "https://cdn.xaluannews.com/images/news/Image/2020/05/28/25ecfba9e29afe.jpg?w=400",
// //       category: "Hair",
// //       description: "Dye your hair in modern colors with genuine products."
// //     },
// //     { 
// //       id: 3, 
// //       name: "Hair Styling", 
// //       price: 180000, 
// //       duration: 75,
// //       image: "https://cdnmedia.webthethao.vn/uploads/img/files/images/fullsize/2020/04/24/BDQT/Neymar/Neymar-0.jpg?w=400",
// //       category: "Hair",
// //       description: "Create beautiful hairstyles for every special occasion."
// //     },
// //     { 
// //       id: 4, 
// //       name: "Nail Art", 
// //       price: 400000, 
// //       duration: 100,
// //       image: "https://images2.thanhnien.vn/uploaded/yennh/2021_08_29/7_SIDA.jpg?width=500?w=400",
// //       category: "Nails",
// //       description: "Basic nail services + custom nail designs"
// //     },
// //     { 
// //       id: 5, 
// //       name: "Manicure & Pedicure", 
// //       price: 300000, 
// //       duration: 120,
// //       image: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=400",
// //       category: "Nails",
// //       description: "Comprehensive nail and toenail care"
// //     },
// //     { 
// //       id: 6, 
// //       name: "Massage", 
// //       price: 800000, 
// //       duration: 120,
// //       image: "https://nld.mediacdn.vn/thumb_w/640/291774122806476800/2024/11/8/base64-17310363325401437531145.jpeg?w=400",
// //       category: "Spa",
// //       description: "Full body relaxation massage."
// //     }
// //   ])

// //   const [loading, setLoading] = useState(true)
// //   const [category, setCategory] = useState('all')
// //   const [searchKeyword, setSearchKeyword] = useState('')
// //   const [selectedService, setSelectedService] = useState(null)
// //   const [modalService, setModalService] = useState(null)

// //   useEffect(() => {
// //     setTimeout(() => {
// //       setLoading(false)
// //     }, 1000)
// //   }, [])

// //   const filteredByCategory = category === 'all' 
// //     ? services 
// //     : services.filter(s => s.category === category)

// //   const filteredServices = filteredByCategory.filter(service =>
// //     service.name.toLowerCase().includes(searchKeyword.toLowerCase())
// //   )

// //   const getCategoryCount = (cat) => {
// //     if (cat === 'all') return services.length
// //     return services.filter(s => s.category === cat).length
// //   }

// //   const handleCardClick = (service) => {
// //     setSelectedService(service)
// //   }

// //   const handleViewDetails = (service) => {
// //     setModalService(service)
// //   }

// //   const handleBookFromCard = (service) => {
// //     router.push(`/booking?service=${service.id}`)
// //   }

// //   const clearFilters = () => {
// //     setCategory('all')
// //     setSearchKeyword('')
// //   }

// //   if (loading) {
// //     return (
// //       <section id="services" className="services">
// //         <div className="loading-container">
// //           <div className="spinner"></div>
// //           <p>Loading service...</p>
// //         </div>
// //       </section>
// //     )
// //   }

// //   return (
// //     <section id="services" className="services">
// //       <h2>SALON SERVICE</h2>
// //       <p>Select service that suits you</p>

// //       <div className="search-bar">
// //         <input
// //           type="text"
// //           placeholder="Search for services..."
// //           value={searchKeyword}
// //           onChange={(e) => setSearchKeyword(e.target.value)}
// //         />
// //         {searchKeyword && (
// //           <button 
// //             className="clear-search"
// //             onClick={() => setSearchKeyword('')}
// //             aria-label="Clear search"
// //           >
// //             ✕
// //           </button>
// //         )}
// //       </div>

// //       <div className="filter-buttons">
// //         <button 
// //           onClick={() => setCategory('all')}
// //           className={category === 'all' ? 'active' : ''}
// //         >
// //           All ({getCategoryCount('all')})
// //         </button>
// //         <button 
// //           onClick={() => setCategory('Hair')}
// //           className={category === 'Hair' ? 'active' : ''}
// //         >
// //           Hair ({getCategoryCount('Hair')})
// //         </button>
// //         <button 
// //           onClick={() => setCategory('Nails')}
// //           className={category === 'Nails' ? 'active' : ''}
// //         >
// //           Nails ({getCategoryCount('Nails')})
// //         </button>
// //         <button 
// //           onClick={() => setCategory('Spa')}
// //           className={category === 'Spa' ? 'active' : ''}
// //         >
// //           Spa ({getCategoryCount('Spa')})
// //         </button>
// //       </div>

// //       {searchKeyword && (
// //         <div className="results-info">
// //           <p>Find <strong>{filteredServices.length}</strong> service for "{searchKeyword}"</p>
// //         </div>
// //       )}

// //       {filteredServices.length === 0 ? (
// //         <div className="no-results">
// //           <p>No suitable services found.</p>
// //           <button onClick={clearFilters}>
// //             Clear filters
// //           </button>
// //         </div>
// //       ) : (
// //         <div className="service-grid">
// //           {filteredServices.map(service => (
// //             <ServiceCard 
// //               key={service.id}
// //               service={service}
// //               isSelected={selectedService?.id === service.id}
// //               onClick={handleCardClick}
// //               onViewDetails={handleViewDetails}
// //               onBookClick={handleBookFromCard}
// //             />
// //           ))}
// //         </div>
// //       )}

// //       {selectedService && (
// //         <div className="selected-summary">
// //           <h3>✓ Selected service</h3>
// //           <div className="summary-content">
// //             <div>
// //               <strong>{selectedService.name}</strong>
// //               <p>{selectedService.category}</p>
// //             </div>
// //             <div className="summary-details">
// //               <span className="price">
// //                 {selectedService.price.toLocaleString('vi-VN')} VNĐ
// //               </span>
// //               <span className="duration">{selectedService.duration} minutes</span>
// //             </div>
// //             <button 
// //               className="book-btn"
// //               onClick={() => handleBookFromCard(selectedService)}
// //             >
// //               Booking now
// //             </button>
// //           </div>
// //         </div>
// //       )}

// //       <ServiceModal 
// //         service={modalService}
// //         onClose={() => setModalService(null)}
// //         onBook={(service) => {
// //           setModalService(null)
// //           handleBookFromCard(service)
// //         }}
// //       />
// //     </section>
// //   )
// // }

// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { getAllServices, getServiceCounts } from '@/lib/services'
// import ServiceCard from './ServiceCard'
// import ServiceModal from './ServiceModal'

// export default function ServiceList() {
//   const router = useRouter()
  
//   const [services, setServices] = useState([])
//   const [counts, setCounts] = useState({})
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [category, setCategory] = useState('all')
//   const [searchKeyword, setSearchKeyword] = useState('')
//   const [selectedService, setSelectedService] = useState(null)
//   const [modalService, setModalService] = useState(null)

//   useEffect(() => {
//     fetchInitialData()
//   }, [])

//   useEffect(() => {
//     if (!loading) {
//       fetchServices()
//     }
//   }, [category, searchKeyword])

//   async function fetchInitialData() {
//     await Promise.all([
//       fetchServices(),
//       fetchCounts()
//     ])
//   }

//   async function fetchServices() {
//     try {
//       setLoading(true)
//       setError(null)

//       const { data, error } = await getAllServices({
//         category: category !== 'all' ? category : undefined,
//         searchKeyword: searchKeyword || undefined
//       })

//       if (error) throw new Error(error)

//       setServices(data || [])
//     } catch (err) {
//       console.error('Error fetching services:', err)
//       setError('Failed to load services. Please try again.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   async function fetchCounts() {
//     try {
//       const { data, error } = await getServiceCounts()
      
//       if (error) throw new Error(error)
      
//       setCounts(data || {})
//     } catch (err) {
//       console.error('Error fetching counts:', err)
//     }
//   }

//   const handleCardClick = (service) => {
//     setSelectedService(service)
//   }

//   const handleViewDetails = (service) => {
//     setModalService(service)
//   }

//   const handleBookFromCard = (service) => {
//     router.push(`/booking?service=${service.id}`)
//   }

//   const clearFilters = () => {
//     setCategory('all')
//     setSearchKeyword('')
//   }

//   if (loading) {
//     return (
//       <section id="services" className="services">
//         <div className="loading-container">
//           <div className="spinner"></div>
//           <p>Loading services...</p>
//         </div>
//       </section>
//     )
//   }

//   if (error) {
//     return (
//       <section id="services" className="services">
//         <div className="error-container">
//           <p className="error-message">{error}</p>
//           <button onClick={fetchInitialData} className="retry-btn">
//             Try Again
//           </button>
//         </div>
//       </section>
//     )
//   }

//   if (services.length === 0 && category === 'all' && !searchKeyword) {
//     return (
//       <section id="services" className="services">
//         <h2>SALON SERVICE</h2>
//         <p>No services available at the moment.</p>
//       </section>
//     )
//   }

//   return (
//     <section id="services" className="services">
//       <h2>SALON SERVICE</h2>
//       <p>Select service that suits you</p>

//       {/* Search Bar */}
//       <div className="search-bar">
//         <input
//           type="text"
//           placeholder="Search for services..."
//           value={searchKeyword}
//           onChange={(e) => setSearchKeyword(e.target.value)}
//         />
//         {searchKeyword && (
//           <button 
//             className="clear-search"
//             onClick={() => setSearchKeyword('')}
//             aria-label="Clear search"
//           >
//             ✕
//           </button>
//         )}
//       </div>

//       {/* Filter Buttons */}
//       <div className="filter-buttons">
//         <button 
//           onClick={() => setCategory('all')}
//           className={category === 'all' ? 'active' : ''}
//         >
//           All ({counts.all || 0})
//         </button>
//         <button 
//           onClick={() => setCategory('Hair')}
//           className={category === 'Hair' ? 'active' : ''}
//         >
//           Hair ({counts.Hair || 0})
//         </button>
//         <button 
//           onClick={() => setCategory('Nails')}
//           className={category === 'Nails' ? 'active' : ''}
//         >
//           Nails ({counts.Nails || 0})
//         </button>
//         <button 
//           onClick={() => setCategory('Spa')}
//           className={category === 'Spa' ? 'active' : ''}
//         >
//           Spa ({counts.Spa || 0})
//         </button>
//       </div>

//       {/* Results Info */}
//       {searchKeyword && (
//         <div className="results-info">
//           <p>Find <strong>{services.length}</strong> service{services.length !== 1 ? 's' : ''} for "{searchKeyword}"</p>
//         </div>
//       )}

//       {/* No Results */}
//       {services.length === 0 ? (
//         <div className="no-results">
//           <p>No suitable services found.</p>
//           <button onClick={clearFilters}>
//             Clear filters
//           </button>
//         </div>
//       ) : (
//         <div className="service-grid">
//           {services.map(service => (
//             <ServiceCard 
//               key={service.id}
//               service={service}
//               isSelected={selectedService?.id === service.id}
//               onClick={handleCardClick}
//               onViewDetails={handleViewDetails}
//               onBookClick={handleBookFromCard}
//             />
//           ))}
//         </div>
//       )}

//       {/* Selected Summary */}
//       {selectedService && (
//         <div className="selected-summary">
//           <h3>✓ Selected service</h3>
//           <div className="summary-content">
//             <div>
//               <strong>{selectedService.name}</strong>
//               <p>{selectedService.category}</p>
//             </div>
//             <div className="summary-details">
//               <span className="price">
//                 {Number(selectedService.price).toLocaleString('vi-VN')} VNĐ
//               </span>
//               <span className="duration">{selectedService.duration} minutes</span>
//             </div>
//             <button 
//               className="book-btn"
//               onClick={() => handleBookFromCard(selectedService)}
//             >
//               Booking now
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Modal */}
//       <ServiceModal 
//         service={modalService}
//         onClose={() => setModalService(null)}
//         onBook={(service) => {
//           setModalService(null)
//           handleBookFromCard(service)
//         }}
//       />
//     </section>
//   )
// }
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