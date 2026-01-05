'use client'

import { useState } from 'react'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill in all the information!')
      return
    }

    alert(`Thanks ${formData.name}! We will contact you via ${formData.phone}`)
    
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: ''
    })
  }

  return (
    <section id="contact" className="contact">
      <h2>CONTACT</h2>
      <p>Leave your information and we will contact you as soon as possible.</p>
      
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          name="name"
          placeholder="Full name" 
          value={formData.name}
          onChange={handleChange}
          required
        />
        
        <input 
          type="email" 
          name="email"
          placeholder="Email" 
          value={formData.email}
          onChange={handleChange}
          required
        />
        
        <input 
          type="tel" 
          name="phone"
          placeholder="Phone number" 
          value={formData.phone}
          onChange={handleChange}
          required
        />
        
        <textarea 
          name="message"
          placeholder="Message"
          value={formData.message}
          onChange={handleChange}
        />
        
        <button type="submit">Submit</button>
      </form>
    </section>
  )
}