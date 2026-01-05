'use client'

import { useRouter } from 'next/navigation'

export default function Hero() {
  const router = useRouter()

  const handleBookClick = () => {
    router.push('/booking')
  }

  return (
    <section id="home" className="hero">
      <h1>MESSI_1419 BEAUTY</h1>
      <p> "I want to be a good person more than I want to be the best player in the world" </p>
      
      <button onClick={handleBookClick}>
        BOOKING NOW
      </button>
    </section>
  )
}