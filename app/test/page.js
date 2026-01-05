'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestPage() {
  const [services, setServices] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchServices() {
      const { data, error } = await supabase
        .from('services')
        .select('*')

      if (error) {
        setError(error.message)
      } else {
        setServices(data || [])
      }
    }

    fetchServices()
  }, [])

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div>
      <h1>Test Supabase Connection</h1>
      <p>Services count: {services.length}</p>

      <pre>{JSON.stringify(services, null, 2)}</pre>
    </div>
  )
}
