

import Sidebar from '@/components/admin/Sidebar'
import AdminNavbar from '@/components/admin/AdminNavbar'
import './admin.css'

export default function AdminLayout({ children }) {
  return (
    <div className="admin-container">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="admin-main">
        {/* Top Navbar */}
        <AdminNavbar />
        
        {/* Page Content */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  )
}