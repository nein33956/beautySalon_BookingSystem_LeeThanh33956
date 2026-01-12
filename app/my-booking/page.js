// app/my-bookings/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const STATUS_CONFIG = {
  pending: {
    label: 'Chờ xác nhận',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: '⏳'
  },
  confirmed: {
    label: 'Đã xác nhận',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: '✓'
  },
  completed: {
    label: 'Hoàn thành',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: '✓✓'
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: '✗'
  }
};

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, past
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filter === 'upcoming') {
        params.append('upcoming', 'true');
      }
      
      const response = await fetch(`/api/bookings?${params}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bookings');
      }
      
      if (data.success) {
        let filteredBookings = data.bookings || [];
        
        // Client-side filtering for past bookings
        if (filter === 'past') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          filteredBookings = filteredBookings.filter(b => 
            new Date(b.booking_date) < today
          );
        }
        
        setBookings(filteredBookings);
      }
    } catch (err) {
      setError(err.message);
      console.error('Fetch bookings error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Bạn có chắc muốn hủy lịch hẹn này?')) return;
    
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cancel_reason: 'Khách hàng hủy'
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel booking');
      }
      
      alert('Hủy lịch thành công!');
      fetchBookings(); // Refresh list
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const canCancelBooking = (booking) => {
    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      return false;
    }
    
    // Check if booking is at least 2 hours away
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}`);
    const now = new Date();
    const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);
    
    return hoursUntilBooking > 2;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải lịch hẹn...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Lịch hẹn của tôi 📅
          </h1>
          <p className="text-gray-600">
            Quản lý tất cả các lịch hẹn của bạn
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filter === 'upcoming'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sắp tới
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filter === 'past'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Đã qua
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Chưa có lịch hẹn nào
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn chưa có lịch hẹn nào. Đặt lịch ngay để trải nghiệm dịch vụ của chúng tôi!
            </p>
            <Link
              href="/booking"
              className="inline-block px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              Đặt lịch ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
              const formattedDate = format(new Date(booking.booking_date), 'EEEE, dd/MM/yyyy', { locale: vi });
              
              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            {booking.service?.name}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
                            {statusConfig.icon} {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">Mã: #{booking.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-pink-600">
                          {booking.total_price?.toLocaleString('vi-VN')}₫
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {/* Date & Time */}
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📅</span>
                        <div>
                          <p className="text-sm text-gray-500">Ngày & Giờ</p>
                          <p className="font-semibold text-gray-900">{formattedDate}</p>
                          <p className="text-sm text-gray-600">
                            {booking.start_time} - {booking.end_time}
                          </p>
                        </div>
                      </div>

                      {/* Staff */}
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">👤</span>
                        <div>
                          <p className="text-sm text-gray-500">Nhân viên</p>
                          <p className="font-semibold text-gray-900">
                            {booking.staff?.name || 'Bất kỳ'}
                          </p>
                          {booking.staff?.specialization && (
                            <p className="text-sm text-gray-600">{booking.staff.specialization}</p>
                          )}
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">⏱️</span>
                        <div>
                          <p className="text-sm text-gray-500">Thời lượng</p>
                          <p className="font-semibold text-gray-900">
                            {booking.service?.duration} phút
                          </p>
                          <p className="text-sm text-gray-600">{booking.service?.category}</p>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {booking.notes && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-500 mb-1">💬 Ghi chú:</p>
                        <p className="text-gray-700">{booking.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                      <Link
                        href={`/my-bookings/${booking.id}`}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-center font-medium hover:bg-gray-200 transition-colors"
                      >
                        Xem chi tiết
                      </Link>
                      
                      {canCancelBooking(booking) && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
                        >
                          Hủy lịch
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Book New Button */}
        <div className="mt-8 text-center">
          <Link
            href="/booking"
            className="inline-block px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            + Đặt lịch mới
          </Link>
        </div>
      </div>
    </div>
  );
}