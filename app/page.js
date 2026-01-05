import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import ServiceList from '@/components/ServiceList'
import ContactForm from '@/components/ContactForm'
import Footer from '@/components/Footer'

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <ServiceList />
      <ContactForm />
      <Footer />
    </main>
  )
}