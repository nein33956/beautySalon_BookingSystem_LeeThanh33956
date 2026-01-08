import './globals.css'
import './BookingPage.css'
import './DateTimeSelector.css'

export const metadata = {
  title: 'MESSI_1419 BEAUTY SALON',
  description: 'Professional beauty services with easy online booking',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}