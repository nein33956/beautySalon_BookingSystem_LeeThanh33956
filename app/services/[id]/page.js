'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getServiceById } from '@/lib/services'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { useParams } from 'next/navigation'


export default function ServiceDetailPage({ params }) {
  const router = useRouter()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { id } = useParams()


  // useEffect(() => {
  //   const fetchService = async () => {
  //     if (!params?.id) {
  //       setError('Invalid service ID')
  //       setLoading(false)
  //       return
  //     }

  //     try {
  //       setLoading(true)
  //       setError(null)

  //       console.log('Fetching service with ID:', params.id)

  //       const { data, error } = await getServiceById(params.id)

  //       if (error) {
  //         console.error('Error from API:', error)
  //         throw new Error(error)
  //       }

  //       if (!data) {
  //         setError('Service not found')
  //       } else {
  //         console.log('Service loaded:', data)
  //         setService(data)
  //       }
  //     } catch (err) {
  //       console.error('Error fetching service:', err)
  //       setError('Failed to load service details.')
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  //   fetchService()
  // }, [.id])
  useEffect(() => {
    if (!id) return

    const fetchService = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await getServiceById(id)

        if (error || !data) {
          setError('Service not found')
        } else {
          setService(data)
        }
      } catch {
        setError('Failed to load service details.')
      } finally {
        setLoading(false)
      }
    }
    fetchService()
  }, [id])


  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading-container" style={{ minHeight: '60vh' }}>
          <div className="spinner"></div>
          <p>Loading service details...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !service) {
    return (
      <div>
        <Navbar />
        <div className="error-container" style={{ minHeight: '60vh' }}>
          <p className="error-message">{error || 'Service not found'}</p>
          <Link href="/services" className="retry-btn">
            Back to Services
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      
      <main className="service-detail-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span> / </span>
          <Link href="/services">Services</Link>
          <span> / </span>
          <span>{service.name}</span>
        </div>

        <div className="service-detail-grid">
          {/* Left - Image */}
          <div className="service-detail-image">
            <img 
              src={service.image_url || '/placeholder.jpg'} 
              alt={service.name}
              onError={(e) => {
                e.target.src = '/placeholder.jpg'
              }}
            />
            <span className="category-badge-large">{service.category}</span>
          </div>

          {/* Right - Details */}
          <div className="service-detail-content">
            <h1>{service.name}</h1>
            
            <p className="service-description">{service.description}</p>

            <div className="service-detail-info">
              <div className="info-row">
                <span className="info-label">💰 Price:</span>
                <span className="info-value price-large">
                  {Number(service.price).toLocaleString('vi-VN')} VNĐ
                </span>
              </div>

              <div className="info-row">
                <span className="info-label">⏱️ Duration:</span>
                <span className="info-value">
                  {service.duration} minutes
                </span>
              </div>

              <div className="info-row">
                <span className="info-label">📋 Category:</span>
                <span className="info-value">
                  {service.category}
                </span>
              </div>
            </div>

            {/* What's Included */}
            <div className="service-includes">
              <h3>What's Included:</h3>
              <ul>
                <li>✓ Professional service</li>
                <li>✓ Premium products</li>
                <li>✓ Experienced staff</li>
                <li>✓ Comfortable environment</li>
                <li>✓ Consultation included</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="service-actions">
              <button 
                className="book-now-btn-large"
                onClick={() => router.push(`/booking?service=${service.id}`)}
              >
                Book Now
              </button>
              <Link href="/services" className="back-to-services-btn">
                ← Back to Services
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="service-additional-info">
          <h2>Service Details</h2>
          <div className="additional-content">
            <p>
              {service.description || 'Experience our professional beauty services with skilled specialists and premium products. We ensure the highest quality service to make you look and feel your best.'}
            </p>
            <p>
              Our team of experienced professionals uses only the finest products and latest techniques to deliver exceptional results. Book your appointment today!
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}