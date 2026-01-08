import { supabase } from './supabase'
/**
 * Fetch all active services
 * @param {Object} options - Filter options
 * @param {string} options.category - Filter by category (optional)
 * @param {string} options.searchKeyword - Search in name/description (optional)
 * @returns {Promise<Array>} Array of services
 */
export async function getAllServices(options = {}) {
  try {
    let query = supabase
      .from('services')
      .select('*')
      .eq('is_active', true)

    // Filter by category
    if (options.category && options.category !== 'all') {
      query = query.eq('category', options.category)
    }
    // Search
    if (options.searchKeyword) {
      query = query.or(
        `name.ilike.%${options.searchKeyword}%,description.ilike.%${options.searchKeyword}%`
      )
    }
    // Order
    query = query.order('category', { ascending: true })
                 .order('name', { ascending: true })

    const { data, error } = await query

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error fetching services:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Fetch single service by ID
 * @param {string} serviceId - Service UUID
 * @returns {Promise<Object>} Service object
 */
export async function getServiceById(serviceId) {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .eq('is_active', true)
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error fetching service:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Get services by category
 * @param {string} category - Category name
 * @returns {Promise<Array>} Array of services
 */
export async function getServicesByCategory(category) {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .eq('category', category)
      .order('name', { ascending: true })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error fetching services by category:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Get all unique categories
 * @returns {Promise<Array>} Array of category names
 */
export async function getServiceCategories() {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('category')
      .eq('is_active', true)

    if (error) throw error

    // Get unique categories
    const categories = [...new Set(data.map(s => s.category))].filter(Boolean)

    return { data: categories, error: null }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Get service count by category
 * @returns {Promise<Object>} Object with category counts
 */
export async function getServiceCounts() {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('category')
      .eq('is_active', true)

    if (error) throw error

    const counts = data.reduce((acc, service) => {
      acc[service.category] = (acc[service.category] || 0) + 1
      return acc
    }, {})

    counts.all = data.length

    return { data: counts, error: null }
  } catch (error) {
    console.error('Error counting services:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Search services
 * @param {string} keyword - Search keyword
 * @returns {Promise<Array>} Array of matching services
 */
export async function searchServices(keyword) {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`)
      .order('name', { ascending: true })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error searching services:', error)
    return { data: null, error: error.message }
  }
}