'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function ServicesManagement() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    price: '',
    category: '',
    image_url: '',
    is_active: true
  })
  
  const categories = [
    'Hair',
    'Nails',
    'Spa',
    'Facial',
    'Massage',
    'Waxing',
    'Makeup'
  ]
  
  const durations = [30, 45, 60, 90, 120, 150, 180, 200]
  
  const supabase = createClient()
  
  // Get category counts
  const getCategoryCounts = () => {
    const counts = {}
    categories.forEach(cat => {
      counts[cat] = services.filter(s => s.category === cat).length
    })
    return counts
  }
  
  // Filter services
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (service.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory
    return matchesSearch && matchesCategory
  })
  
  useEffect(() => {
    fetchServices()
  }, [])
  
  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
      alert('Failed to fetch services')
    } finally {
      setLoading(false)
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const serviceData = {
        name: formData.name,
        description: formData.description,
        duration: parseInt(formData.duration),
        price: parseFloat(formData.price),
        category: formData.category,
        image_url: formData.image_url || null,
        is_active: formData.is_active
      }
      
      if (editingService) {
        // Update existing service
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id)
        
        if (error) throw error
        alert('Service updated successfully!')
      } else {
        // Create new service
        const { error } = await supabase
          .from('services')
          .insert([serviceData])
        
        if (error) throw error
        alert('Service created successfully!')
      }
      
      // Reset form and refresh
      setShowModal(false)
      setEditingService(null)
      setFormData({
        name: '',
        description: '',
        duration: '',
        price: '',
        category: '',
        image_url: '',
        is_active: true
      })
      fetchServices()
      
    } catch (error) {
      console.error('Error saving service:', error)
      alert('Failed to save service: ' + error.message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleEdit = (service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description || '',
      duration: service.duration.toString(),
      price: service.price.toString(),
      category: service.category || '',
      image_url: service.image_url || '',
      is_active: service.is_active
    })
    setShowModal(true)
  }
  
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this service?')) return
    
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      alert('Service deleted successfully!')
      fetchServices()
      
    } catch (error) {
      console.error('Error deleting service:', error)
      alert('Failed to delete service')
    }
  }
  
  const handleToggleActive = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !currentStatus })
        .eq('id', id)
      
      if (error) throw error
      fetchServices()
      
    } catch (error) {
      console.error('Error toggling service status:', error)
      alert('Failed to update service status')
    }
  }
  
  if (loading && services.length === 0) {
    return (
      <div className="loading-container">
        <p>Loading services...</p>
      </div>
    )
  }
  
  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Services Management</h1>
          <p className="dashboard-subtitle">Manage your salon services</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => {
            setEditingService(null)
            setFormData({
              name: '',
              description: '',
              duration: '',
              price: '',
              category: '',
              image_url: '',
              is_active: true
            })
            setShowModal(true)
          }}
        >
          ➕ Add New Service
        </button>
      </div>
      
      {/* Search & Filter */}
      <div className="search-filter-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search for services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="category-filters">
          <button
            className={`filter-btn ${selectedCategory === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('All')}
          >
            All ({services.length})
          </button>
          {categories.map(cat => {
            const count = getCategoryCounts()[cat] || 0
            return (
              <button
                key={cat}
                className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat} ({count})
              </button>
            )
          })}
        </div>
      </div>
      
      <div className="dashboard-section">
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Duration</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    {searchTerm || selectedCategory !== 'All' 
                      ? 'No services found matching your filters.'
                      : 'No services yet. Click "Add New Service" to create one.'}
                  </td>
                </tr>
              ) : (
                filteredServices.map((service) => (
                  <tr key={service.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {service.image_url && (
                          <img 
                            src={service.image_url} 
                            alt={service.name}
                            style={{ 
                              width: '50px', 
                              height: '50px', 
                              objectFit: 'cover', 
                              borderRadius: '8px',
                              border: '2px solid #e2e8f0'
                            }}
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        )}
                        <div>
                          <strong>{service.name}</strong>
                          {service.description && (
                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                              {service.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{service.category || 'N/A'}</td>
                    <td>{service.duration} mins</td>
                    <td>${parseFloat(service.price).toFixed(2)}</td>
                    <td>
                      <button
                        onClick={() => handleToggleActive(service.id, service.is_active)}
                        className={`status-badge ${service.is_active ? 'status-confirmed' : 'status-cancelled'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                      >
                        {service.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEdit(service)}
                          className="btn-action btn-edit"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="btn-action btn-delete"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingService ? 'Edit Service' : 'Add New Service'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Service Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Haircut"
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Service description..."
                  rows="3"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Duration (minutes) *</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                  >
                    <option value="">Select duration</option>
                    {durations.map(dur => (
                      <option key={dur} value={dur}>{dur} minutes</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min="0"
                    placeholder="25.00"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image_url && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <img 
                      src={formData.image_url} 
                      alt="Preview"
                      style={{ 
                        maxWidth: '200px', 
                        maxHeight: '150px', 
                        borderRadius: '8px',
                        border: '2px solid #e2e8f0'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'block'
                      }}
                    />
                    <div style={{ display: 'none', color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                      ⚠️ Invalid image URL
                    </div>
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  Active (visible to customers)
                </label>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }
        
        .search-filter-section {
          background: white;
          padding: 1.5rem;
          border-radius: 16px;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }
        
        .search-box {
          position: relative;
          margin-bottom: 1.25rem;
        }
        
        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.25rem;
          pointer-events: none;
        }
        
        .search-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.2s;
          background: #f8fafc;
        }
        
        .search-input:focus {
          outline: none;
          border-color: #667eea;
          background: white;
        }
        
        .category-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        
        .filter-btn {
          padding: 0.75rem 1.5rem;
          border: 2px solid #e2e8f0;
          background: white;
          border-radius: 50px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          color: #475569;
        }
        
        .filter-btn:hover {
          border-color: #cbd5e1;
          background: #f8fafc;
        }
        
        .filter-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: transparent;
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        
        .btn-primary {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        .btn-action {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-edit {
          background: #dbeafe;
          color: #1e40af;
        }
        
        .btn-edit:hover {
          background: #bfdbfe;
        }
        
        .btn-delete {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .btn-delete:hover {
          background: #fecaca;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
        }
        
        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
        }
        
        .modal-close {
          background: #f1f5f9;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          font-size: 1.25rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .modal-close:hover {
          background: #e2e8f0;
        }
        
        form {
          padding: 1.5rem;
        }
        
        .form-group {
          margin-bottom: 1.25rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #334155;
        }
        
        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
          background: white;
        }
        
        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #667eea;
        }
        
        .form-group select {
          cursor: pointer;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e2e8f0;
        }
        
        .btn-secondary {
          padding: 0.75rem 1.5rem;
          background: #f1f5f9;
          color: #334155;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-secondary:hover {
          background: #e2e8f0;
        }
      `}</style>
    </div>
  )
}