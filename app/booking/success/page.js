// app/booking/success/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function BookingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('id');
  
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!bookingId) {
      router.push('/booking');
      return;
    }
    
    fetchBookingDetails();
  }, [bookingId]);

  // Optional: Auto redirect countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const fetchBookingDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/bookings/${bookingId}`);
      const data = await response.json();
      
      if (data.success) {
        setBooking(data.booking);
      } else {
        setError('Không tìm thấy booking');
      }
    } catch (err) {
      setError('Lỗi tải thông tin booking');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{error}</h1>
          <Link 
            href="/booking"
            className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 inline-block"
          >
            Đặt lịch mới
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = booking?.booking_date 
    ? format(new Date(booking.booking_date), 'EEEE, dd/MM/yyyy', { locale: vi })
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-block">
            <div className="relative">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="absolute top-0 left-0 w-24 h-24 bg-green-400 rounded-full animate-ping opacity-20"></div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Đặt lịch thành công! 🎉
          </h1>
          <p className="text-gray-600 text-lg">
            Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm">Mã đặt lịch</p>
                <p className="text-2xl font-bold">#{bookingId}</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-4 py-2 bg-yellow-400 text-yellow-900 rounded-full text-sm font-semibold">
                  ⏳ Chờ xác nhận
                </span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Service */}
            <div className="border-b pb-4">
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Dịch vụ</p>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{booking?.service?.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    ⏱️ {booking?.service?.duration} phút
                  </p>
                </div>
                <p className="text-2xl font-bold text-pink-600">
                  {booking?.total_price?.toLocaleString('vi-VN')}₫
                </p>
              </div>
            </div>

            {/* Date & Time */}
            <div className="border-b pb-4">
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Thời gian</p>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📅</span>
                  <div>
                    <p className="font-semibold text-gray-900">{formattedDate}</p>
                    <p className="text-gray-600">
                      {booking?.start_time} - {booking?.end_time}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Staff */}
            <div className="border-b pb-4">
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Nhân viên</p>
              {booking?.staff ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl">
                    👤
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{booking.staff.name}</p>
                    <p className="text-sm text-gray-600">{booking.staff.specialization}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">🎲 Nhân viên bất kỳ có sẵn</p>
              )}
            </div>

            {/* Customer Info */}
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Thông tin khách hàng</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">👤</span>
                  <span>{booking?.customer?.full_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">📱</span>
                  <span>{booking?.customer?.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-6">
          <div className="flex items-start gap-3">
            <span className="text-3xl">ℹ️</span>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Bước tiếp theo</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>✓ Chúng tôi sẽ xác nhận lịch hẹn trong vòng 30 phút</li>
                <li>✓ Bạn sẽ nhận được thông báo qua email/SMS</li>
                <li>✓ Vui lòng đến đúng giờ để được phục vụ tốt nhất</li>
                <li>✓ Bạn có thể hủy lịch trước 2 giờ nếu có việc đột xuất</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/my-bookings"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            <span>📋</span>
            Xem lịch hẹn của tôi
          </Link>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            <span>🏠</span>
            Về trang chủ
          </Link>
        </div>

        {/* Auto redirect notice */}
        {/* <div className="text-center mt-6 text-sm text-gray-500">
          Tự động chuyển đến "Lịch hẹn của tôi" sau {countdown}s...
        </div> */}
      </div>
    </div>
  );
}